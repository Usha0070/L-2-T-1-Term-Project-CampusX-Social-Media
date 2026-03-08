# CampusX

A university campus social platform for BUET students — built as a Level 2 Term 1 project.

## 🎬 Video Demonstration

[![CampusX Demo](https://img.shields.io/badge/YouTube-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/g8KMoTC5_yY?si=KZg87nV8u-bX6aI6)

> **Watch the full demo:** https://youtu.be/g8KMoTC5_yY?si=KZg87nV8u-bX6aI6

---

## 📌 About

CampusX is a full-stack social networking platform designed specifically for university students. It supports a social news feed, friend system, direct messaging, group communities, a student marketplace, tuition post board, and an admin analytics dashboard.

---

## 🗂 Project Structure

```
CampusX/
├── backend/          # Express REST API (Node.js + PostgreSQL)
│   ├── db/           # Database query functions (postgres.js)
│   ├── middleware/   # Auth (JWT), validation (Zod), file upload (Multer)
│   └── routes/       # Route handlers
├── frontend/         # React app — newsfeed, auth, user profiles
├── frontend2/        # Vue 3 app — marketplace, chats, groups, search, stats
└── meta/media/       # Uploaded media files (auto-created, git-ignored)
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Register & login with JWT tokens, bcrypt password hashing |
| 📰 News Feed | Friend-filtered post feed with likes, comments, media |
| 👥 Friends | Send, accept, decline friend requests; follow/block users |
| 💬 Messaging | Direct messages between users |
| 🏘 Groups | Create and manage groups with moderators and members |
| 🛒 Marketplace | Buy/sell listings with categories and conditions |
| 📚 Tuition Board | Post and browse tuition opportunities |
| 🔍 Search | Search users, posts, and groups |
| 🔔 Notifications | User notification feed |
| 📊 Admin Stats | Analytics dashboard — top posts, active users, trends, marketplace stats |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express 5, PostgreSQL |
| ORM/Query | postgres.js (tagged template SQL) |
| Auth | JWT (jsonwebtoken), bcrypt |
| Validation | Zod |
| File Upload | Multer |
| Frontend 1 | React 19, React Router, Bootstrap |
| Frontend 2 | Vue 3, Vue Router, Tailwind CSS, Axios |

---

## ⚙️ Prerequisites

- Node.js 18+
- PostgreSQL 14+

---

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/CampusX.git
cd CampusX
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=CampusX
DB_USER=postgres
DB_PASS=your_postgres_password

SERVER_PORT=5000
CORS_ORIGIN=http://localhost:5173

# Generate a secret: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_strong_secret_here
```

### 3. Install all dependencies

```bash
npm run install:all
```

### 4. Run the project

Open **3 separate terminals**:

```bash
# Terminal 1 — Backend API (http://localhost:5000)
npm run backend

# Terminal 2 — React frontend (http://localhost:5173)
npm run frontend

# Terminal 3 — Vue frontend (http://localhost:5174)
npm run frontend2
```

---

## 📡 API Reference

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns JWT |

### Users
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | Yes | Get current user info |
| PUT | `/users/me` | Yes | Update current user |
| GET | `/users/me/profile` | Yes | Get profile (bio, pic) |
| PUT | `/users/me/profile` | Yes | Update profile |
| GET | `/users/me/feed` | Yes | Get news feed |
| GET | `/users/me/friends` | Yes | Get friends list |
| PUT | `/users/me/friends` | Yes | Send / accept / delete friend |
| PUT | `/users/me/follows` | Yes | Follow / unfollow |
| PUT | `/users/me/blocks` | Yes | Block / unblock |
| GET | `/users/:id` | Yes | Get any user's info |
| GET | `/users/:id/posts` | Yes | Get user's posts |

### Posts
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/posts/:id` | Yes | Get post by ID |
| POST | `/posts` | Yes | Create post (with media) |
| PUT | `/posts/:id` | Yes | Update post |
| DELETE | `/posts/:id` | Yes | Delete post |
| POST | `/posts/:id/likes` | Yes | Like a post |
| DELETE | `/posts/:id/likes` | Yes | Unlike a post |
| POST | `/posts/:id/comments` | Yes | Add comment |
| PUT | `/posts/:id/comments/:cid` | Yes | Edit comment |
| DELETE | `/posts/:id/comments/:cid` | Yes | Delete comment |

### Groups
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/groups` | Yes | Browse all groups |
| POST | `/groups` | Yes | Create group |
| GET | `/groups/:id` | Yes | Get group details |
| PUT | `/groups/:id` | Yes | Update group |
| GET | `/groups/:id/members` | Yes | List members |
| POST | `/groups/:id/members` | Yes | Add member |
| DELETE | `/groups/:id/members/:mid` | Yes | Remove member |
| POST | `/groups/:id/posts` | Yes | Post to group |

### Chats
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/chats` | Yes | Get all conversations |
| GET | `/chats/:id` | Yes | Get messages in chat |
| POST | `/chats/:id` | Yes | Send message |
| PUT | `/chats/:id/:mid` | Yes | Edit message |
| DELETE | `/chats/:id/:mid` | Yes | Delete message |

### Other
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/search?q=` | Yes | Search users, posts, groups |
| GET | `/notifications` | Yes | Get notifications |
| POST | `/api/media/upload` | Yes | Upload media file |
| GET | `/stats?type=` | Admin | Admin analytics |

### Stats query types
`users_joined` · `top_posts` · `active_users` · `active_groups` · `trends` · `marketplace_stats` · `tuition_stats`

---

## 🔒 Security Notes

- Never commit `.env` — it is git-ignored
- Rotate `JWT_SECRET` before deploying
- Admin access is controlled by user ID list in `backend/middleware/auth.js`

---

## 👨‍💻 Authors

BUET — Level 2 Term 1 Project
