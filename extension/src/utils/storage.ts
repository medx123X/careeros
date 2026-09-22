const TOKEN_KEY = 'careeros_auth_token';
const USER_KEY = 'careeros_user';

interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    'is_active' in obj &&
    'created_at' in obj
  );
}

export async function getToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(TOKEN_KEY);
  const value = result[TOKEN_KEY];
  return typeof value === 'string' ? value : null;
}

export async function setToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [TOKEN_KEY]: token });
}

export async function clearToken(): Promise<void> {
  await chrome.storage.local.remove(TOKEN_KEY);
}

export async function getUser(): Promise<User | null> {
  const result = await chrome.storage.local.get(USER_KEY);
  const value = result[USER_KEY];
  return isUser(value) ? value : null;
}

export async function setUser(user: User): Promise<void> {
  await chrome.storage.local.set({ [USER_KEY]: user });
}

export async function clearUser(): Promise<void> {
  await chrome.storage.local.remove(USER_KEY);
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.local.remove([TOKEN_KEY, USER_KEY]);
}

export { type User };
