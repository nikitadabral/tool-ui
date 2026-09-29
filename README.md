# Request Triage UI

React and Vite frontend for the Request Triage application. Requesters can
submit and track requests; reviewers can inspect the queue and update triage
fields.

## Prerequisites

- Node.js 20.19 or newer
- npm
- The sibling `backend/` API running locally

## Setup

From this directory:

```bash
npm install
```

The UI calls `http://localhost:8010` by default. To use another API URL, create
`.env.local` in this directory:

```dotenv
VITE_API_BASE_URL=http://localhost:8010
```

Start the backend from the sibling repository:

```bash
cd ../backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8010
```

Then start the UI from this directory in another terminal:

```bash
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173. Create an account
and choose either the requester or reviewer role; there are no seeded login
credentials.

## Build and Checks

There is currently no automated frontend test suite. Run the linter and a
production build as the available checks:

```bash
npm run lint
npm run build
```

To inspect the production build locally:

```bash
npm run preview
```

## Assumptions

- The FastAPI backend is available at `VITE_API_BASE_URL`.
- Authentication tokens may be stored in browser local storage for this MVP.
- Users self-select their role during signup.
- A submitted title and description are combined into the backend's single
	`request_text` field and parsed back into display fields by the UI.
- The application targets current evergreen browsers and a local-development
	workflow.

## Known Gaps

- The request-detail screen uses a frontend placeholder brief and does not call
	the backend's `/api/requests/{id}/generate-brief` endpoint.
- There are no unit, component, integration, or end-to-end frontend tests.
- `npm run lint` currently reports six errors involving fast-refresh exports,
	state updates in effects, and preserved manual memoization.
- Authentication state uses local storage, with no hardened cookie-based session
	handling or cross-tab synchronization.
- The UI has no password reset, email verification, account administration, or
	reviewer approval workflow.
- Error handling is intentionally lightweight and there is no telemetry,
	offline behavior, or production deployment configuration.
