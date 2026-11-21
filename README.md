# ChatHouse App

A real-time one-to-one chat app built with the MERN stack and Socket.IO. It runs entirely on localhost.

- **Backend:** Node.js (ES modules), Express, MongoDB + Mongoose, Socket.IO, JWT (httpOnly cookie), bcryptjs
- **Frontend:** React (Create React App), Redux Toolkit, React Router v6, Tailwind CSS, Axios, socket.io-client

## Prerequisites

- **Node.js 18 or newer** (`node --version`)
- **MongoDB Community Server running locally** on the default port 27017 (`mongod`). MongoDB Atlas is not needed.
- npm (comes with Node.js)

## Default ports

| Part     | URL                   |
| -------- | --------------------- |
| Backend  | http://localhost:8080 |
| Frontend | http://localhost:3000 |

## Setup

### 1. Start MongoDB

Make sure the local MongoDB server is running before starting the backend.

- Windows: start the "MongoDB" service, or run `mongod`
- macOS (Homebrew): `brew services start mongodb-community`
- Linux (systemd): `sudo systemctl start mongod`

### 2. Backend

```bash
cd backend
npm install
```

Create the environment file from the example:

```bash
# macOS / Linux
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

`backend/.env`:

```
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/chit-chat-app
JWT_SECRET_KEY=change_me
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Replace `JWT_SECRET_KEY` with a long random string. `FRONTEND_URL` may hold several comma-separated origins. The server refuses to start if a required variable is missing.

Run it:

```bash
npm run dev      # auto-restart with nodemon
# or
npm start        # plain node
```

You should see `MongoDB connected` and `Server running on http://localhost:8080`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

The app opens at http://localhost:3000.

Optional: to point the frontend at a different backend, copy `frontend/.env.example` to `frontend/.env` and edit `REACT_APP_API_URL`. Without it the frontend uses `http://localhost:8080`. Restart `npm start` after changing it.

## Test the real-time flow with two browsers

Use one normal window and one incognito/private window, because each keeps its own cookies and therefore its own logged-in user.

1. **Normal window:** open http://localhost:3000, click **Sign up**, create user `alice`, then log in.
2. **Incognito window:** open http://localhost:3000, sign up as `bob`, then log in.
3. In Alice's window, `bob` appears in the sidebar without a refresh (the `newUser` event). Alice sees a green dot next to Bob (online).
4. **First message from a brand-new user:** sign up a third user `carol` in the incognito window after logging out, or simply use Bob. Log in as Bob and send Alice a message while Alice is **not** in a chat with Bob. In Alice's sidebar Bob moves to the top with the message preview, time and an unread badge, with no refresh.
5. Alice opens the chat with Bob: the badge clears and the messages load. While the chat is open, new messages from Bob appear instantly and are marked read.
6. Start typing in one window: the other window shows `typing...` under the chat header and in the sidebar row, and it disappears about 1.5 seconds after you stop.
7. Open Alice's account in a second tab: both tabs receive new messages.
8. Close Bob's window: Bob's green dot disappears in Alice's sidebar.
9. Click your avatar (top left of the sidebar) to open **Profile**, which shows your name and username and has the **Log out** button. Refresh the page while logged in: you stay logged in (session restored via `GET /api/v1/user/me`).
10. Try the sun/moon button in the sidebar header: the theme is remembered after a reload.

## API overview (prefix `/api/v1`)

| Method | Route                | Auth | Purpose                                              |
| ------ | -------------------- | ---- | ---------------------------------------------------- |
| POST   | `/user/register`     | no   | Create an account (rate limited)                     |
| POST   | `/user/login`        | no   | Log in, sets the `token` cookie (rate limited)       |
| GET    | `/user/logout`       | no   | Clears the cookie                                    |
| GET    | `/user/me`           | yes  | Current user (session recovery)                      |
| GET    | `/user/`             | yes  | Other users with `lastMessage` and `unreadCount`     |
| POST   | `/message/send/:id`  | yes  | Send a message to user `:id`                         |
| GET    | `/message/:id`       | yes  | Conversation with user `:id`                         |
| PUT    | `/message/read/:id`  | yes  | Mark all messages from `:id` to me as read           |

Socket.IO events: server to client `getOnlineUsers`, `newMessage`, `newUser`, `typing`, `stopTyping`; client to server `typing`, `stopTyping`. The socket is authenticated from the `token` cookie, and every user has a personal room, so all of their tabs receive events.

## Troubleshooting

**MongoDB not running**
The backend prints `Could not start the server ... Is MongoDB running locally`. Start MongoDB (step 1) and check that `MONGO_URI` in `backend/.env` is correct.

**CORS errors in the browser console**
`FRONTEND_URL` in `backend/.env` must exactly match the address in the browser's address bar (`http://localhost:3000`, not `127.0.0.1`, and no trailing path). If you use another origin or port, add it to `FRONTEND_URL` (comma-separated) and restart the backend.

**Cookies / "Not authenticated" after login, or the socket does not connect**
- The app must be opened as `http://localhost:3000` and the API reached as `http://localhost:8080`. Both are `localhost`, so the `sameSite: lax` cookie is sent. Mixing `localhost` and `127.0.0.1` makes the browser drop the cookie.
- Do not block cookies for localhost in the browser.
- Keep `NODE_ENV=development` locally. With `production`, the cookie is `secure` and only works over HTTPS.
- After editing `.env`, restart the backend.

**"Too many attempts"**
Login and signup are limited to 30 attempts per IP every 15 minutes. Restart the backend to reset the counter during development.

**Port already in use**
Change `PORT` in `backend/.env` (and set `REACT_APP_API_URL` plus `FRONTEND_URL` accordingly), or stop the process using the port.
