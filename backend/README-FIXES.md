# CareerOS Backend — Bug Fixes

I ran your actual backend (not a rebuild — your real code) and traced the
"Failed to fetch" / ERR_CONNECTION_REFUSED error to its root cause, then
kept testing past it until the whole auth flow worked end-to-end.

## Bug 1 — server crashes on startup (this is your reported error)

**Symptom:** `ERR_CONNECTION_REFUSED` on every request, because nothing is
actually listening on port 8000 — the server dies before it binds.

**Cause:** `app/schemas/__init__.py` uses `EmailStr`, which requires the
`email-validator` package. `requirements.txt` lists plain `pydantic`, not
`pydantic[email]`, so it's missing.

**Fix:** in `requirements.txt`, change:
```
pydantic==2.9.2
```
to:
```
pydantic[email]==2.9.2
```
Then reinstall: `pip install -r requirements.txt`

## Bug 2 — registration crashes with a 500 once Bug 1 is fixed

**Symptom:** `ValueError: password cannot be longer than 72 bytes...`

**Cause:** `passlib==1.7.4` (2020) is incompatible with newer `bcrypt`
releases. Nothing pins `bcrypt`'s version, so pip installs the latest
(5.0.0 as of this test), which breaks passlib's internals.

**Fix:** add this line to `requirements.txt`:
```
bcrypt==4.0.1
```
Then reinstall.

## Bug 3 — login and every authenticated endpoint are broken

This one wouldn't have shown up as a fetch error — it would have looked
like "login always fails" or "I'm logged in but every request 401s."
Confirmed both parts independently:

**3a — `/login` expects query params, not JSON.**
`app/api/v1/auth.py` declared:
```python
async def login(email: str, password: str, db: AsyncSession = Depends(get_db)):
```
Since `email`/`password` are plain scalar params (not a Pydantic model),
FastAPI reads them from the URL query string. Your extension's
`shared/api.ts` sends a JSON body, so login always failed with a 422
"field required" error — I reproduced this exactly with curl.

**3b — the auth dependency ignores the token entirely.**
```python
async def get_current_user(
    token: str = Depends(lambda: None),
    ...
```
`Depends(lambda: None)` always resolves to `None` — it never actually reads
the `Authorization` header. I proved this by generating a genuinely valid,
freshly issued JWT and calling `/me` with it: it still failed with
"Could not validate credentials." No authenticated endpoint could ever
have worked, for any user, with any token.

**Fix for both**, applied in the attached `auth.py`:
- Added a `UserLogin` Pydantic schema (`email`, `password`) in
  `app/schemas/__init__.py`, and changed `/login` to accept it as a JSON
  body instead of loose query params.
- Replaced `Depends(lambda: None)` with FastAPI's actual bearer-token
  extractor: `oauth2_scheme = OAuth2PasswordBearer(tokenUrl=...)`, used as
  `token: str = Depends(oauth2_scheme)`.

## How to apply

1. Replace `backend/requirements.txt` with the one in this folder.
2. Replace `backend/app/api/v1/auth.py` with the one in this folder.
3. Replace `backend/app/schemas/__init__.py` with the one in this folder
   (only the `UserLogin` class was added — nothing else changed).
4. Replace `extension/src/shared/api.ts` with the one in this folder
   (`extension-src-shared/api.ts` in this zip) — **important:** this
   project has two copies of `api.ts` (one at the top level in `shared/`,
   one inside `extension/src/shared/`), and they've drifted apart. The
   extension actually imports and bundles the one inside `extension/src/`,
   not the top-level one — make sure you're editing that exact path.
5. Reinstall dependencies:
   ```
   pip install -r requirements.txt
   ```
6. Delete the old `careeros.db` if one exists (schema hasn't changed, but
   it's good practice after touching auth) and restart:
   ```
   uvicorn app.main:app --reload
   ```
7. Rebuild the extension so it picks up the updated file:
   ```
   cd extension
   npm run build
   ```
   Then go to `chrome://extensions`, click the reload icon on CareerOS,
   and close/reopen the popup or sidebar (don't just refresh — Chrome
   extension contexts can hold onto stale JS until fully reloaded).

## Bug 4 — frontend shows "[object Object]" instead of the real error

**Symptom:** validation errors (like a malformed email) display as the
literal text `[object Object]` instead of a readable message.

**Cause:** FastAPI's error `detail` field isn't always a string. Plain
errors (401, 400, 404 — e.g. "Incorrect email or password") send a string.
But Pydantic validation errors (422 — anything caught by `EmailStr`,
`min_length`, etc.) send an **array** of objects like
`{ type, loc, msg, ctx }`. Your `shared/api.ts` did:
```typescript
throw new Error(error.detail || `HTTP error ${response.status}`);
```
Passing an array into `new Error(...)` silently coerces it to a string —
`Array.prototype.toString()` calls `.toString()` on each element, and
plain objects have no meaningful `toString()`, so you get exactly
`[object Object]`. I reproduced this exact behavior with the exact
payload from your screenshot before fixing it.

**Fix:** added an `extractErrorMessage()` helper in `shared/api.ts` that
checks whether `detail` is a string (use it directly) or an array (map
each item's `.msg`, prefixed with its field name when available, and join
them). Verified against three cases: the real 422 payload from your
screenshot, a normal string-detail error, and a non-JSON response — all
three now produce a readable message instead of crashing or printing
`[object Object]`.

**Important gotcha I found while fixing this:** your project has *two*
separate `api.ts` files that have drifted apart — one at `shared/api.ts`
(top level) and one at `extension/src/shared/api.ts`. They're not the
same file and not kept in sync automatically. The extension's actual
build only uses the one inside `extension/src/`. My first attempt at this
fix edited the top-level one, which is why you still saw `[object Object]`
after rebuilding — the extension was never importing that file. The
version in this zip is the correct one, already fixed in the exact file
the build uses, including two more copies of the same bug pattern inside
`uploadDocument()` and `downloadDocument()` that also needed the fix.

Worth considering once this is stable: either delete the top-level
`shared/` copy if it's unused, or set up your build to actually import
from a single shared location, so this kind of drift can't happen again.

## What I actually verified (not just read the code and guessed)

Ran this exact sequence against your real backend, in order, after each
fix:
- `GET /health` → `200 {"status":"ok"}`
- `POST /api/v1/auth/register` with a JSON body → `201`, user created
- `POST /api/v1/auth/login` with a JSON body (matching your extension's
  actual request shape) → `200`, real access token returned
- `GET /api/v1/auth/me` with that real token → `200`, correct user returned
- `GET /api/v1/auth/me` with **no** token → `401` (correctly rejected)
- `GET /api/v1/auth/me` with a **garbage** token → `401` (correctly rejected)

All six passed after applying the three fixes above.

## One more thing worth knowing

Your `README.md` says PostgreSQL 14+ is required, but `.env` and
`app/core/config.py` both default to SQLite (`sqlite+aiosqlite`). That's
not a bug — it works fine as-is for local dev — but if you were expecting
Postgres to be involved and wondering why it "just worked" without you
setting one up, that's why. Worth deciding which one is actually your
target before this grows much further, since SQLite doesn't support some
things (e.g. certain concurrent-write patterns) you might eventually need.
