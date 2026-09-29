# Request Triage UI

React and Vite application for submitting and tracking requests through a
role-based workflow, with reviewer triage, status updates, and audit history.

## 1. Setup Instructions

### Prerequisites

- Node.js 20.19 or newer
- npm
- Python 3.12 or newer
- The sibling `backend/` application

### Install and run the backend

From the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8010
```

### Install and run the frontend

In a second terminal, from the project root:

```bash
cd tool-ui
npm install
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>. Create an
account and select either the requester or reviewer role; no login credentials
are seeded.

The UI uses `http://localhost:8010` as the default API URL. To use a different
URL, create `tool-ui/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8010
```

## 2. Assumptions

- The FastAPI backend is available at `VITE_API_BASE_URL`.
- The application targets current evergreen browsers and local development.
- Authentication tokens may be stored in browser local storage for this MVP.
- Users self-select their role during signup.
- A submitted title and description are combined into the backend's single
  `request_text` field and parsed back into display fields by the UI.
- The backend database schema is initialized by the latest application version.

## 3. Known Gaps

- Generated briefs use placeholder data.
- Automated frontend tests are not yet implemented.
- Authentication uses browser local storage.
- Production deployment and advanced error handling are not yet configured.

## 4. How to Run Tests

### Backend tests

Automated tests are implemented for the backend. From the project root, run:

```bash
cd backend
source .venv/bin/activate
pytest
```

### Frontend verification

Automated frontend tests are not currently implemented. From `tool-ui/`, run
the linter and production build as verification checks:

```bash
npm run lint
npm run build
```
