import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";
import { BASE_URL } from "../index";
import { setMessages } from "../redux/messageSlice";
import { resetUser } from "../redux/userSlice";
import Avatar from "./Avatar";

const ProfileSettings = () => {
  const authUser = useSelector((state) => state.user.authUser);
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.get(`${BASE_URL}/api/v1/user/logout`, { withCredentials: true });
      dispatch(setMessages([]));
      // Clearing authUser closes the socket (see App) and the route guard opens /login.
      dispatch(resetUser());
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not log out");
      setLoggingOut(false);
    }
  };

  return (
    <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-wa-surfaceDark">
      <header className="flex items-center gap-3 bg-wa-teal px-3 py-3 text-white dark:bg-wa-panelDark">
        <Link
          to="/"
          aria-label="Back to chats"
          className="rounded-full p-2 text-xl transition hover:bg-white/10"
        >
          <FiArrowLeft />
        </Link>
        <h1 className="text-lg font-semibold">Profile</h1>
      </header>

      <div className="flex flex-col items-center gap-2 px-6 py-8">
        <Avatar name={authUser?.fullName} size="xl" />
        <h2 className="mt-3 text-xl font-semibold">{authUser?.fullName}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{authUser?.username}</p>
      </div>

      <div className="border-t border-gray-200 p-6 dark:border-gray-700">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiLogOut />
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
