import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiSearch } from "react-icons/fi";
import { BASE_URL } from "../index";
import { setMessages } from "../redux/messageSlice";
import { resetUser, setSelectedUser } from "../redux/userSlice";
import Avatar from "./Avatar";
import OtherUsers from "./OtherUsers";
import ThemeToggle from "./ThemeToggle";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const authUser = useSelector((state) => state.user.authUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openProfile = () => {
    // Close the open chat so incoming messages are not auto-read while away.
    dispatch(setSelectedUser(null));
    navigate("/profile");
  };

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
    <aside className="flex h-full w-full flex-col bg-white dark:bg-wa-surfaceDark">
      <header className="flex items-center justify-between bg-wa-teal px-4 py-3 text-white dark:bg-wa-panelDark">
        <button
          type="button"
          onClick={openProfile}
          aria-label="Open profile settings"
          title="Profile"
          className="flex items-center gap-3 rounded-full text-left"
        >
          <Avatar name={authUser?.fullName} size="md" />
          <span className="text-lg font-semibold">ChatHouse</span>
        </button>
        <div className="flex items-center">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
            title="Log out"
            className="rounded-full p-2 text-xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      <div className="p-3">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users"
            aria-label="Search users"
            className="input-field rounded-full py-2 pl-9"
          />
        </div>
      </div>

      <OtherUsers search={search} />
    </aside>
  );
};

export default Sidebar;