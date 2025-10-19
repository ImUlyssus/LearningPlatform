README
======

Project: Learning Platform (React + Node + MySQL)
-------------------------------------------------

A modular, production-oriented learning platform built to showcase code flow, structure and typical full‑stack patterns. The frontend is a Vite + React application; the backend is an Express.js API using Sequelize with MySQL. Features include users, courses & course materials, lecturers, promotions, enrollments, certificates, search (fuzzy and OR logic), RBAC, email verification & password reset, and file handling. Only partial code is provided for demonstration purposes.

Key Features
------------
- Users CRUD (registration, login, verification, password reset)
- Courses CRUD (main & sub-courses), course materials (video/photo/pdf/zip)
- Lecturers CRUD, lecturer-course mapping
- Student subscriptions & enrolled courses management
- Promotions CRUD (running / scheduled separation)
- Enrolled courses management & certificates generation
- Course search with Fuse.js (fuzzy) and OR logic
- File uploads served from local uploads directory
- Security: bcrypt password hashing, JWT auth, RBAC (role-based access control), auth middleware
- Emails: NodeMailer (email verification, password reset)
- Modularity: separate routes, controllers, services, utilities
- CI/CD: GitHub Actions (pipeline suggested)
- Frontend utilities: Axios + axiosPrivate (interceptor) with token handling

Technology Stack
----------------
Frontend
- React 18
- Vite
- Tailwind CSS
- Fuse.js (fuzzy search)
- axios, react-router-dom, react-hot-toast
- PDF viewer: @react-pdf-viewer
- Testing: Vitest, @testing-library/react

Backend
- Node.js + Express
- Sequelize ORM + MySQL2
- Sequelize CLI (migrations/seeds)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- multer (file uploads)
- nodemailer (email)
- dotenv, cors, fs-extra
- Development: nodemon

Repository layout (typical)
--------------------------
A suggested layout based on provided code:

- client/                   # Frontend (Vite + React)
  - public/
  - src/
    - api/                  # axios, axiosPrivate, helpers
    - components/
    - context/
    - services/             # service wrappers (userService, courseService, promotionService)
    - pages/
    - assets/
- server/                   # Backend
  - controllers/
  - middleware/
  - models/                 # Sequelize models
  - routes/
  - utils/                  # emailSender, constants, helpers
  - uploads/                 # static uploads (served via express.static)
  - config/                 # sequelize config / environment mapping
  - server.js
- README.md

Quick start — local development
-------------------------------

Prerequisites
- Node.js (LTS, e.g., Node 18+ recommended)
- npm
- MySQL server
- Optional: Docker (for local MySQL container)

1) Clone repo
2) Install dependencies

Frontend
- cd client
- npm install

Backend
- cd server
- npm install

3) Environment variables

Create .env files for server (server/.env) and client (client/.env if used). Example server .env keys used by the code:

SERVER (.env)
- NODE_ENV=development
- PORT=3001
- DB_HOST=localhost
- DB_PORT=3306
- DB_NAME=your_database_name
- DB_USER=your_db_user
- DB_PASS=your_db_password
- JWT_SECRET=your_jwt_secret
- FRONTEND_URL=http://localhost:5173   # used to construct verification/reset links
- SMTP_HOST=smtp.example.com
- SMTP_PORT=587
- SMTP_USER=your_smtp_user
- SMTP_PASS=your_smtp_password
- WEBSITE_NAME="MyLearningPlatform"

CLIENT (.env) — (Vite)
- VITE_API_URL=https://api.domain.com  # production backend URL
Note: In development, the client uses http://localhost:3001/api via logic in axios config.

4) Database & Sequelize
- Configure server/config/config.js (Sequelize) for your environments using the DB_* env vars.
- Run migrations / sync. The sample code calls db.sequelize.sync() on server start; for production you may prefer migrations:
  - npx sequelize-cli db:migrate
  - npx sequelize-cli db:seed:all (if you have seeds)

5) Run
Frontend (development)
- cd client
- npm run dev

Backend
- cd server
- npm start  (nodemon server.js)

The frontend axios BASE_URL is configured to use:
- http://localhost:3001/api in development
- VITE_API_URL (or /api) in production builds

API Overview (high-level)
-------------------------
Base path for API in examples: /api

Auth
- POST /api/auth/register — register user (sends verification email)
- GET  /api/auth/verify-email?token=... — verify email
- POST /api/auth/login — login (returns JWT)
- POST /api/auth/forgot-password — send reset email
- POST /api/auth/reset-password — reset password with token

Users
- Protected: /api/user/* (user CRUD, profile)
- Auth middleware required (token in Authorization: Bearer <token> or x-auth-token)

Promotions
- GET  /api/promotions — (public/controller returns runningPromotions & scheduledPromotions)
- POST /api/promotions — create promotion (protected; admin/manager)
- PUT  /api/promotions/:id — update (protected; admin/manager)
- DELETE /api/promotions/:id — delete (protected; admin/manager)

Courses & Modules
- /api/courses
- /api/sub-courses
- /api/modules
- /api/lectures
- /api/files — file uploads & retrieval

Lecturers
- /api/lecturers — CRUD and mapping endpoints

Enrolled / Saved courses & certificates
- /api/enrolled-courses
- /api/saved-courses
- /api/certificates

File serving
- Server exposes static files at /api/uploads mapped to server/uploads directory:
  Example: GET /api/uploads/<file-path>

Promotion endpoints — sample usage
- Add promotion (POST /api/promotions)
  Request body (JSON):
  {
    "amount": 50,
    "title": "Summer Sale",
    "description": "50% off select courses",
    "startDate": "2025-06-01T00:00:00.000Z",
    "endDate": "2025-06-30T23:59:59.999Z",
    "course_id": "ALL_COURSES" // or JSON string of course ids
  }

Security (summary of implementation)
-----------------------------------
- Password hashing: bcryptjs used with salt (example uses salt rounds = 10).
- Authentication: JWT tokens signed with process.env.JWT_SECRET, expiry 30 days in sample login flow.
- Token transport: Authorization header Bearer <token> (axiosPrivate attaches it automatically). Backend auth middleware reads from x-auth-token or Authorization header.
- Auth middleware: verifies JWT, fetches user record from DB, attaches req.user with both user_role and roles array (roles: [user_role]) for compatibility with RBAC middleware.
- RBAC: authorizeRoles middleware checks req.user.user_role against allowedRoles array and returns 403 when unauthorized.
- Email verification & password reset:
  - Verification: register creates verificationToken (crypto.randomBytes) and expires in 1 hour; email contains link to frontend verifying endpoint.
  - Password reset: forgotPassword generates passwordResetToken and saves expiry; reset-password endpoint validates token and updates hashed password.
- Frontend token handling:
  - axiosPrivate has a request interceptor that adds Authorization header from localStorage token.
  - axiosPrivate response interceptor handles 401 by clearing token/local user and redirecting to /login using injected navigate function (setNavigator) or window.location fallback.
- Security notes & recommendations:
  - Do not store the JWT in localStorage for high-security apps — consider httpOnly secure cookies for production to reduce XSS risk.
  - Use HTTPS in production and enforce secure cookies and proper CORS config.
  - Ensure strong JWT_SECRET and rotate/expire tokens accordingly.
  - Rate-limit auth endpoints and implement account lockout policies for repeated failed logins.
  - Validate and sanitize inputs to prevent SQL injection (Sequelize helps but validate any raw queries).

File uploads & static serving
----------------------------
- multer used to accept file uploads.
- Server serves uploaded files from server/uploads at route /api/uploads (express.static).
- Keep uploads directory outside the public repo or configure object storage (S3) for production.
- Validate file types & size on upload middleware.

Search
------
- Frontend uses fuse.js for fuzzy searches.
- Backend can implement search endpoints with OR logic or full-text search; frontend also performs client-side filtering as needed.

CI/CD
-----
- GitHub Actions suggested for building, testing and deploying both client and server.
- Example pipeline steps:
  - Checkout, install, lint, test (client & server), build client, run server tests, deploy artifacts to hosting
- Secrets: store DB creds, JWT_SECRET, SMTP credentials in GitHub Secrets.

How frontend and backend interact (example)
------------------------------------------
- Base API URL configured in client/src/api/axios.js:
  - DEV: http://localhost:3001/api
  - PROD: VITE_API_URL or /api
- axiosPrivate attaches Authorization header to protected requests.
- Example service call for promotions:
  - client service uses axiosPrivate.post('/promotions', promotionData)
  - server route: POST /api/promotions (auth middleware + authorizeRoles)
- Example flow: Admin adds promotion via UI -> calls addPromotion service -> backend validates dates/course_id and creates Promotion model -> front-end refreshes running/scheduled lists using GET /api/promotions.

Example cURL — get promotions
-----------------------------
curl -X GET "http://localhost:3001/api/promotions"

Example cURL — add promotion
----------------------------
curl -X POST "http://localhost:3001/api/promotions" \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25,
    "title": "Black Friday",
    "description": "25% off selected courses",
    "startDate": "2025-11-27T00:00:00.000Z",
    "endDate": "2025-11-30T23:59:59.999Z",
    "course_id": "ALL_COURSES"
  }'

Development notes & conventions
-------------------------------
- Modular architecture: keep routes, controllers and business logic separated. Use services/helpers for cross-cutting concerns (email, file utilities, token helpers).
- Controllers do validation then call model/service functions; keep controllers thin where possible.
- Use consistent response shape for successful and error responses (recommended).
- Use environment-specific config in /config (Sequelize config or other app settings).

Testing
-------
- Frontend: Vitest + Testing Library — run:
  - cd client
  - npm run test
- Backend: add Jest/Mocha + supertest for endpoint tests as needed (not included in provided code). Add CI job to run backend tests.

Environment & production tips
-----------------------------
- Use secure, private storage for environment secrets; never commit .env files.
- Use production database backups & migrations (Sequelize migrations).
- For file storage at scale, move uploads to S3 or similar and serve via CDN.
- Monitor email sending limits; use transactional email provider (SendGrid, SES) for increased reliability.

Contribution
------------
- Fork, create a feature branch, open a pull request.
- Run linter and tests before submitting PR. Follow repository coding standards:
  - ESLint + Prettier recommended
  - Meaningful commit messages and PR descriptions

Contact / Support
-----------------
- Kyaw Swar Hein

Appendix — Useful snippets from provided code
---------------------------------------------
- axios config: axiosPrivate interceptor adds Authorization header and handles 401 by redirecting to login.
- authController: registration validates inputs, hashes password, creates verification token, sends verification email, handles login (returns token + user data), forgotPassword and resetPassword flows included.
- authMiddleware: verifies JWT and attaches req.user with roles array for RBAC compatibility.
- authorizeRoles middleware: checks user role against allowedRoles and returns 403 when unauthorized.
- promotions: controller separates running and scheduled promotions based on start_date and end_date and includes create/update/delete validation (date parsing, course_id string enforcement).
