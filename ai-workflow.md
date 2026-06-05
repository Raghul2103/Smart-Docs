# AI Workflow Documentation

This document describes the development workflow, code creation, review processes, and validation methods used during building SmartDocs.

## AI Roles & Generation Steps
1. **System Planning**: Reviewed requirement specifications, drafted file allocations, and structured the initial directories.
2. **Backend Construction**: Generated Mongoose schemas, controllers, and router components. Designed custom file-upload validation using Multer buffers.
3. **Frontend Implementation**: Initialized React client with Vite. Set up state wrappers, Tailwind styling variables, and integrated Tiptap editing blocks.
4. **Integration Testing**: Created test scripts mimicking registration, document draft creation, sharing, and authorization rules using Supertest.

---

## Code Review & Iterative Refinements
- **Mime and Extension Filtering**: Explicitly integrated path checking on file uploads inside `uploadController.js` to verify user files are strictly `.txt`, `.md`, or `.docx`, keeping audio/video files out.
- **Permission Safety**: Added conditional checks in `updateDocument` ensuring shared users can edit content, but only the owner can rename the title.
- **Route Protection**: Introduced `ProtectedRoute` and `PublicRoute` wrappers in React Router to prevent cross-profile exposure.
- **Cross-Origin Cookie Configuration**: Updated JWT cookie generation in `authController.js` to dynamically apply `sameSite: "none"` and `secure: true` in production while defaulting to standard `lax` and `secure: false` locally, allowing seamless integration across Vercel and Render domains.
- **SPA Rewrite Rule for Vercel**: Added a `vercel.json` config in the client directory specifying wildcard route rewrites to `index.html` to prevent 404 errors on browser page reloads.

---

## Validation & Verification Process
1. **Unit and Integration Tests**: Ran Jest tests verifying authentication and document collaboration on a clean, isolated memory-based MongoDB.
2. **Manual Inspections**:
   - Registered two users (`raghul@gmail.com` and `raj@gmail.com`).
   - Created documents, saved, and checked state on database refresh.
   - Tested document sharing by registering Bob, sharing access from Alice's session, logging into Bob's session, editing content, and verifying Bob is restricted from deleting the draft.
3. **Build & Config Verification**:
   - Validated compilation of Vite assets with the new `vercel.json` inclusion.
   - Checked environment variable guidelines for Render and Vercel hosting.
