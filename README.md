# CareerOS

A Chrome browser extension that keeps your professional information, CVs, and posts organized and instantly accessible while browsing job and freelance platforms.

## Project Structure

```
careeros/
├── extension/          # Chrome Extension (Manifest V3) with React + TypeScript
├── backend/            # FastAPI backend with PostgreSQL
└── shared/             # Shared TypeScript types and API client
```

## Getting Started

### Prerequisites

- Node.js 22+
- Python 3.11+
- SQLite (default); PostgreSQL is optional

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -e ".[dev]"

# Set up environment
cp .env.example .env  # On Windows: copy .env.example .env
# Set a unique SECRET_KEY in .env

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Extension Setup

```bash
cd extension
npm install
npm run build
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder (after running `npm run build`)

## Development

### Extension Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm run format     # Format with Prettier
npm run format:check # Check formatting
```

### Backend Commands

```bash
ruff check .       # Lint with Ruff
ruff format .      # Format with Ruff
mypy app           # Type check
pytest             # Run tests
```

## Architecture

### Extension (Manifest V3)

- **Popup**: Quick access panel
- **Sidebar**: Full-featured floating panel
- **Background**: Service worker for auth and messaging
- **Content Script**: Page interaction (future Smart Fill)

### Backend

- **FastAPI**: REST API with async SQLAlchemy
- **SQLite**: Default local database; PostgreSQL can be configured
- **JWT**: Authentication
- **Alembic**: Database migrations

## Features (MVP)

- [ ] Authentication (register/login)
- [ ] Master Profile management
- [ ] Job & Freelance profile contexts
- [ ] Experience, Education, Projects, Certifications
- [ ] Document/CV storage
- [ ] Quick copy system
- [ ] Post manager with versions
- [ ] Platform directory
- [ ] Floating sidebar UI

## License

MIT