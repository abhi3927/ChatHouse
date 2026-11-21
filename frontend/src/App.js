import { useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import { BASE_URL } from "./index";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HomePage from "./components/HomePage";
import ProfileSettings from "./components/ProfileSettings";
import useGetRealTimeMessage from "./hooks/useGetRealTimeMessage";
import { setSocket } from "./redux/socketSlice";
import { setAuthUser, setOnlineUsers } from "./redux/userSlice";

// Pages that need a logged-in user.
const ProtectedRoute = ({ children }) => {
  const authUser = useSelector((state) => state.user.authUser);
  return authUser ? children : <Navigate to="/login" replace />;
};

// Login/Signup are hidden from logged-in users.
const GuestRoute = ({ children }) => {
  const authUser = useSelector((state) => state.user.authUser);
  return authUser ? <Navigate to="/" replace /> : children;
};

function App() {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.user.authUser);
  const authLoading = useSelector((state) => state.user.authLoading);
  const userId = authUser?._id;

  // Listens for new/typing/user events while logged in.
  useGetRealTimeMessage();

  // Restore the session after a page refresh from the httpOnly cookie.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/v1/user/me`, {
          withCredentials: true,
        });
        if (!cancelled) dispatch(setAuthUser(res.data.user));
      } catch (error) {
        if (!cancelled) dispatch(setAuthUser(null));
      }
    };

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // One socket per logged-in user. Depends on the id only, not the whole object.
  useEffect(() => {
    if (!userId) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });

    const handleOnlineUsers = (onlineIds) => {
      dispatch(setOnlineUsers(onlineIds));
    };
    // Only log: socket.io keeps retrying on its own.
    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    socket.on("getOnlineUsers", handleOnlineUsers);
    socket.on("connect_error", handleConnectError);
    dispatch(setSocket(socket));

    // Deferred connect avoids the React StrictMode "closed before the
    // connection is established" warning (cleanup cancels the timer first).
    const connectTimer = setTimeout(() => socket.connect(), 0);

    return () => {
      clearTimeout(connectTimer);
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("connect_error", handleConnectError);
      socket.close();
      dispatch(setSocket(null));
      dispatch(setOnlineUsers([]));
    };
  }, [userId, dispatch]);

  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden md:p-6">
      <div className="app-bg absolute inset-0 -z-10" />
      <Toaster position="top-center" />

      {authLoading ? (
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-wa-green"
          role="status"
          aria-label="Loading"
        />
      ) : (
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
