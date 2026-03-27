# CipherDrop Frontend

React + Vite frontend for the existing file-sharing backend.

## What this UI supports

- Register and login with the backend's `/api/auth/register` and `/api/auth/login` routes
- Upload a single file through `/api/upload` using `multipart/form-data` with the `file` field
- List authenticated uploads from `/api/my-files`
- Delete owned files through `/api/file/:id`
- Use the raw share URL returned only at upload time from `/api/share/:token`

## Local development

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000`.

If the frontend is deployed separately, set:

```bash
VITE_API_BASE_URL=https://your-backend-origin.com
```

## Frontend structure

```text
src/
  components/
    auth/        Authentication UI
    dashboard/   Upload, share, and file-history modules
    ui/          Shared reusable UI pieces
  context/       Auth and toast state providers
  hooks/         Context access helpers
  pages/         Top-level authenticated / unauthenticated screens
  services/api/  Centralized API client and backend integrations
  styles/        App-level styling
  utils/         Formatting and storage helpers
```
