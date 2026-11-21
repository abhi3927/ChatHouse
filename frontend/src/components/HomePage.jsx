import { useSelector } from "react-redux";
import useGetMessages from "../hooks/useGetMessages";
import useGetOtherUsers from "../hooks/useGetOtherUsers";
import MessageContainer from "./MessageContainer";
import Sidebar from "./Sidebar";

const HomePage = () => {
  useGetOtherUsers();
  useGetMessages();

  const selectedUser = useSelector((state) => state.user.selectedUser);

  // Mobile: show either the sidebar or the chat. Desktop: show both side by side.
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white shadow-2xl dark:bg-wa-surfaceDark md:h-[90vh] md:max-w-6xl md:rounded-2xl">
      <div
        className={`${
          selectedUser ? "hidden md:flex" : "flex"
        } w-full shrink-0 border-r border-gray-200 dark:border-gray-700 md:w-[360px] lg:w-[400px]`}
      >
        <Sidebar />
      </div>
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} min-w-0 flex-1`}>
        <MessageContainer />
      </div>
    </div>
  );
};

export default HomePage;
