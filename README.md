# Folio · University Notes & Examination Repository

Folio is a high-fidelity academic archive providing university lecture notes, mid-semester tests (MST), end-semester examinations (EST), lab manuals, viva questions, and exam preparation.

Engineered with React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Radix UI primitives, Motion, and Google Firebase (Cloud Firestore with multi-tab offline persistence, and Cloud Storage).

---

## Architecture & Access Model

### 1. Zero-Friction Public Access (No User Accounts)
- **Public Browsing & Search**: All visitors can browse, search, preview, and download resources without creating an account or logging in.
- **Client-Side Bookmarks & Study Shelf**: Saved documents and exam preparation countdowns use `localStorage` only (`folio_bookmarks_v1`, `folio_exam_countdowns_v1`, `folio_study_shortlist_v1`), clearly designated as browser-only storage.
- **Real-Time Data Feed**: Live updates via Firestore `onSnapshot`. New uploads appear instantly at the top of "Just added" for all visitors.

### 2. Curator & Administrator Access
- **Client-Side Administrative Gate**: Access to `/admin`, `/admin/upload`, `/admin/manage`, and `/admin/taxonomy` is gated via a username and password login screen (`/admin/login`).
- **Default Credentials**: The portal is configured with fixed administrative credentials:
  - **Username**: `folio_123`
  - **Password**: Provided during system setup
- **Secure Storage**: The password is not stored in plain text anywhere in source code or documentation. Instead, `src/config/admin.ts` stores the SHA-256 hash of the password. Input is validated using `crypto.subtle.digest('SHA-256', ...)`.
- **Brute-Force Guard & Session Lifespan**:
  - Verification includes an intentional delay (~600ms).
  - 5 failed attempts trigger a 30-second lockout stored in `localStorage`.
  - A successful login issues a 30-day session token in `localStorage`.
  - An administrative "Log Out" action clears the session immediately.
- **Security Note**: This username/password login is a client-side gate designed for rapid curation without user account infrastructure. Backend data integrity is enforced by Firestore and Cloud Storage security rules, which strictly validate payload shapes, allowed values, file extensions, and file sizes.

---

## Changing the Admin Username or Password

To change the administrator username or password:

1. Generate the SHA-256 hex digest of your desired new password. You can run:
   ```bash
   node -e 'console.log(require("crypto").createHash("sha256").update("YOUR_NEW_PASSWORD").digest("hex"))'
   ```
2. Open `src/config/admin.ts`.
3. Update `username` to your new username and `passwordHash` to the generated hex string:
   ```typescript
   export const ADMIN_CONFIG = {
     username: 'your_new_username',
     passwordHash: 'your_generated_sha256_hash_here',
     sessionKey: 'folio_admin_session_v1',
     sessionDurationDays: 30,
     lockoutKey: 'folio_admin_lockout_v1',
     maxFailedAttempts: 5,
     lockoutDurationSeconds: 30,
     verificationDelayMs: 600,
   } as const;
   ```
4. Save the file. The new credentials will be active immediately.

---

## Deploying Firebase Security Rules & Storage

Deploy the Firestore rules, Storage rules, and composite indexes to your Firebase project using the Firebase CLI:

```bash
firebase deploy --only firestore,storage
```

Or deploy individual components:
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Cloud Storage security rules
firebase deploy --only storage

# Deploy Firestore composite indexes
firebase deploy --only firestore:indexes
```

### Security Rules Overview
- **`resources` Collection**:
  - Public read for `status == "published"` and `status == "draft"`. Draft resources are readable so the curator portal can manage unpublished drafts without user accounts. Draft document titles and metadata are therefore not confidential.
  - Document writes (`create`, `update`) require strict schema validation: `title` (1–200 characters), `resourceType` in the allowed category list, `status` in `["published", "draft"]`, `fileSize` under 25 MB, and rejection of any unknown fields via `hasOnly()`.
  - Document deletions are allowed.
- **Curriculum Taxonomy (`subjects`, `courses`, `departments`, `universities`, `categories`)**:
  - Public read access.
  - Writes validate `name` (string of 1–100 characters).
- **Cloud Storage (`resources/**`)**:
  - Public read access for preview and direct download URLs.
  - Uploads restricted to `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.webp` files up to 25 MB.
  - Deletions allowed for catalog cleanup.
- **Default Deny**: All other collections and paths are strictly denied (`allow read, write: if false;`).

---

## Local Development & Production Build

### Running Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```
Generates an optimized production bundle in `/dist` without source maps or console clutter.
