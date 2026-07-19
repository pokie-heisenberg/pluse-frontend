<div align="center">

# 🌊 Pluse

### *A Modern Social Media Experience*

<br/>

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-EF0078?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](./LICENSE)

<br/>

> **Pluse** is a sleek, feature-rich social media platform frontend built with React 19 and a glassmorphism dark-mode UI. Think Twitter/X — but with beautiful animations, Two-Factor Authentication, and a modern developer experience.

<br/>

[🚀 Live Demo](#) · [🐛 Report Bug](https://github.com/pokie-heisenberg/pluse-frontend/issues) · [✨ Request Feature](https://github.com/pokie-heisenberg/pluse-frontend/issues) · [🔗 Backend Repo](https://github.com/pokie-heisenberg/Pluse)

</div>

---

## 📸 Screenshots

> **Home Feed** — The main timeline displaying posts with like, comment, and create-post functionality in a dark glassmorphism card layout.

> **Profile Page** — User profile showcasing posts, followers/following count, follow/unfollow button, and a smooth animated header.

> **Settings Page** — Clean settings panel with tabs for profile editing, password change, and Two-Factor Authentication toggle with QR code support.

> **Login / 2FA Flow** — Animated login screen that gracefully redirects to a 6-digit OTP entry page when Two-Factor Authentication is enabled.

> **Search** — Real-time user search with animated result cards and instant follow/unfollow actions.

> **Notifications** — Live notification feed with read/unread state, timestamps, and subtle entrance animations.

---

## ✨ Features

<details open>
<summary><strong>🔐 Authentication & Security</strong></summary>

<br/>

- 🔑 **JWT Authentication** — Tokens stored in `localStorage` + secure `httpOnly` cookie for refresh
- 📧 **Email Verification Flow** — Pending screen → auto-verify via tokenized link
- 🛡️ **Two-Factor Authentication** — 6-digit TOTP OTP with a live countdown timer
- 🔁 **Password Reset Flow** — Forgot password → secure reset link via email
- 🚧 **Protected Routes** — Route guards redirect unauthenticated users automatically

</details>

<details>
<summary><strong>🌐 Social Interactions</strong></summary>

<br/>

- 📝 **Create Posts** — Text posts with image & video upload support
- ❤️ **Like & Unlike** — Real-time like toggling with optimistic UI updates
- 💬 **Comments & Replies** — Nested comment threads with reply support
- 👥 **Follow / Unfollow** — Follow users and manage follow requests
- 📨 **Follow Request System** — Send and manage follow requests for private accounts
- 🔔 **Real-time Notifications** — Live notification feed for likes, comments, and follows
- 🔍 **User Search** — Discover users instantly with live search
- 🗂️ **Bookmarks** — Save posts for later *(coming soon)*

</details>

<details>
<summary><strong>🎨 UI / UX Excellence</strong></summary>

<br/>

- 🌑 **Dark Mode by Default** — Premium glassmorphism dark theme out of the box
- 🌊 **Framer Motion Animations** — Smooth page transitions, entrance animations, and micro-interactions throughout
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop
- 🍞 **React Hot Toast** — Beautiful non-intrusive toast notifications
- ♾️ **Pagination** — Infinite-scroll-style post feed for seamless browsing
- 🖼️ **Profile Photo Upload** — Drag-and-drop or click-to-upload avatar
- ⚡ **Vite-Powered** — Lightning-fast HMR and optimized production builds

</details>

---

## 🛣️ Pages & Routes

| Route | Page | Auth Required | Description |
|---|---|:---:|---|
| `/` | **Home** | ✅ | Main feed — view, create, like, and comment on posts |
| `/login` | **Login** | ❌ | Login with email & password; 2FA redirect support |
| `/signup` | **Signup** | ❌ | Create a new Pluse account |
| `/verify-email` | **Verify Email** | ❌ | Pending verification screen after signup |
| `/verify-email/:token` | **Auto-Verify** | ❌ | Auto-verifies email when user clicks email link |
| `/2fa` | **Two-Factor Auth** | ❌ | 6-digit OTP entry with countdown timer |
| `/forgot-password` | **Forgot Password** | ❌ | Request a password reset email |
| `/reset-password/:token` | **Reset Password** | ❌ | Set a new password via secure token link |
| `/profile/:id` | **User Profile** | ✅ | View any user's posts, follow/unfollow |
| `/profile` | **Own Profile** | ✅ | Your own profile page |
| `/settings` | **Settings** | ✅ | Edit profile, change password, toggle 2FA |
| `/search` | **Search** | ✅ | Search for users across the platform |
| `/notifications` | **Notifications** | ✅ | View all activity notifications |
| `/bookmarks` | **Bookmarks** | ✅ | Saved posts *(coming soon)* |

---

## 🛠️ Tech Stack

| Library | Version | Purpose |
|---|---|---|
| ⚛️ [React](https://react.dev/) | `19` | Core UI framework |
| ⚡ [Vite](https://vitejs.dev/) | `8` | Build tool & dev server |
| 🎨 [TailwindCSS](https://tailwindcss.com/) | `v4` | Utility-first styling |
| 🌊 [Framer Motion](https://www.framer.com/motion/) | latest | Animations & page transitions |
| 🔗 [React Router DOM](https://reactrouter.com/) | `v7` | Client-side routing |
| 📡 [Axios](https://axios-http.com/) | latest | HTTP client for API requests |
| 🎯 [Lucide React](https://lucide.dev/) | latest | Beautiful icon library |
| 🍞 [React Hot Toast](https://react-hot-toast.com/) | latest | Notification toasts |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** `>=18.x` — [Download](https://nodejs.org/)
- **npm** `>=9.x` (comes with Node.js)
- A running instance of the **[Pluse Backend](https://github.com/pokie-heisenberg/Pluse)**

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/pokie-heisenberg/pluse-frontend.git
cd pluse-frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Then edit `.env` with your backend URL:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

**4. Start the development server**

```bash
npm run dev
```

The app will be available at **[http://localhost:5173](http://localhost:5173)** 🎉

---

## ⚙️ Environment Variables

<details>
<summary><strong>Development</strong> — <code>.env</code></summary>

<br/>

```env
VITE_API_URL=http://localhost:8000/api/v1
```

</details>

<details>
<summary><strong>Production</strong> — <code>.env.production</code></summary>

<br/>

```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

> ⚠️ **Important:** Replace `your-backend.railway.app` with your actual deployed backend URL. This is the only variable required for a production deployment on Vercel.

</details>

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint source files using **oxlint** |

---

## 🗂️ Project Structure

<details>
<summary>Click to expand the full project tree</summary>

<br/>

```
pluse-frontend/
│
├── public/                     # Static assets served as-is
│
├── src/
│   │
│   ├── pages/                  # Top-level route components
│   │   ├── Home.jsx            # 🏠 Main post feed
│   │   ├── Login.jsx           # 🔑 Login with 2FA redirect
│   │   ├── Signup.jsx          # 📝 New user registration
│   │   ├── VerifyEmail.jsx     # 📧 Email verification pending + auto-verify
│   │   ├── TwoFactorVerify.jsx # 🛡️  6-digit OTP entry page
│   │   ├── ForgotPassword.jsx  # 🔁 Request password reset
│   │   ├── ResetPassword.jsx   # 🔒 Set new password via token
│   │   ├── Profile.jsx         # 👤 User profile (self & others)
│   │   ├── Settings.jsx        # ⚙️  Profile, password, 2FA settings
│   │   ├── Search.jsx          # 🔍 Discover & search users
│   │   └── Notifications.jsx   # 🔔 Activity notifications
│   │
│   ├── components/             # Reusable UI components
│   │   └── ...                 # PostCard, Sidebar, Avatar, Modal, etc.
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx     # 🌐 Global authentication state & actions
│   │
│   ├── services/
│   │   ├── api.js              # 📡 All API call functions
│   │   └── apiClient.js        # 🔧 Configured Axios instance
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx      # 🗃️  Sidebar + content layout wrapper
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── ...
│   │
│   └── assets/                 # Images, icons, and static resources
│
├── .env                        # Development environment variables
├── .env.production             # Production environment variables
├── .env.example                # Environment variable template
├── index.html                  # Vite HTML entry point
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # TailwindCSS configuration
├── eslint.config.js            # ESLint / oxlint configuration
└── package.json                # Project metadata & dependencies
```

</details>

---

## ☁️ Deployment

Pluse Frontend is deployed on **[Vercel](https://vercel.com/)** for optimal performance and global edge delivery.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pokie-heisenberg/pluse-frontend)

**Steps:**

1. Fork this repository
2. Connect your fork to Vercel
3. Add the `VITE_API_URL` environment variable in the Vercel project settings
4. Deploy — Vercel handles the rest automatically ✅

---

## 🔗 Related Repositories

| Repository | Description |
|---|---|
| 🌊 **[pluse-frontend](https://github.com/pokie-heisenberg/pluse-frontend)** | This repository — React frontend |
| ⚙️ **[Pluse (Backend)](https://github.com/pokie-heisenberg/Pluse)** | Node.js/Express REST API backend |

---

## 🤝 Contributing

Contributions are welcome and greatly appreciated! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes with a descriptive message
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request against the `main` branch

### Guidelines

- Follow the existing code style and component patterns
- Keep components focused, reusable, and well-named
- Add comments for any non-obvious logic
- Test your changes across different screen sizes
- Use conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`, etc.)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

```
MIT License — Copyright (c) 2026 Aman Yadav (pokie-heisenberg)
```

---

<div align="center">

**Made with ❤️ by [Aman Yadav](https://github.com/pokie-heisenberg)**

<br/>

⭐ **Star this repo if you found it useful!** ⭐

<br/>

[![GitHub stars](https://img.shields.io/github/stars/pokie-heisenberg/pluse-frontend?style=social)](https://github.com/pokie-heisenberg/pluse-frontend/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/pokie-heisenberg/pluse-frontend?style=social)](https://github.com/pokie-heisenberg/pluse-frontend/network/members)

</div>
