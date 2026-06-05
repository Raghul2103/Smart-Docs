# SmartDocs – AI-Native Collaborative Document Editor (MERN)

A production-quality collaborative document editor inspired by Google Docs, built with a modern MERN stack.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios, Tiptap Editor, Lucide Icons.
- **Backend**: Node.js, Express.js, MongoDB Atlas (via Mongoose), Multer, JWT, BcryptJS, Mammoth (for `.docx` parsing).
- **Testing**: Jest, Supertest, MongoDB Memory Server.

---

## Features

1. **User Authentication**: Secure register and login system powered by JWT tokens and salted password hashing.
2. **Dashboard Management**:
   - Tabulated split lists separating Owned vs Shared documents.
   - Live query-based document search.
   - Direct manual Document Creation.
   - Text document import (.txt, .md, .docx).
3. **Rich Text Formatting**: Editor powered by Tiptap implementing bold, italic, underline, heading 1, heading 2, list configurations, undo/redo features.
4. **Editable Title Field**: Instantly update and save document titles (for owner users only).
5. **Permissions & Security Enforcement**:
   - Owners can edit, delete, rename, and share documents by email.
   - Shared users can view and edit contents, but cannot delete, share, or rename the document.
6. **File Import**: Read file content dynamically and auto-generate new editor documents (.docx documents are converted to formatted HTML with Mammoth).
7. **Robust Error & Feedback States**: Friendly 404 landing pages, invalid login alerts, duplicate emails, loading spinners, and manual save banners.

---

## Setup & Running Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### Backend Setup
1. Open the `/server` folder:
   ```bash
   cd server
   ```
2. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
3. Update environment configurations (e.g. `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`).
4. Install backend dependencies:
   ```bash
   npm install
   ```
5. Launch the backend server in developer mode:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open the `/client` folder:
   ```bash
   cd ../client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the frontend development build:
   ```bash
   npm run dev
   ```

---

## Environment Variables

### Local Development Configuration

#### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://...  (or local mongodb://127.0.0.1:27017/smartdocs)
JWT_SECRET=supersecretjwttokenkeyfordevelopment123
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### Frontend (`client/.env` or dynamic default)
* No file is strictly required locally as the client defaults to `http://localhost:5000/api`. If you want to specify a custom API URL locally:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Production Deployment Configuration

#### Render (Backend Environment Variables)
* Set `NODE_ENV` to `production` (toggles cross-site secure cookie transport).
* Set `CLIENT_URL` to your Vercel frontend URL (e.g. `https://smartdocs.vercel.app`).
* Set `MONGODB_URI` to your MongoDB Atlas connection string.
* Set `JWT_SECRET` to a strong random passphrase.
* Set `PORT` to `5000` or let Render bind dynamically.

#### Vercel (Frontend Environment Variables)
* Set `VITE_API_URL` to your Render backend API URL (e.g. `https://smartdocs-backend.onrender.com/api`).


---

## Running Automated Tests

To run the automated endpoint integration test suite (using Jest and an isolated Mongo Memory database):
```bash
cd server
npm run test
```

---

## Local Credentials (Suggested Test Accounts)
- **Account 1**: `raghul@example.com` (password: `12345678`)
- **Account 2**: `raj@example.com` (password: `12345678`)
