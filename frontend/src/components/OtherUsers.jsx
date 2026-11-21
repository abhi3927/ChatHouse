import { useSelector } from "react-redux";
import OtherUser from "./OtherUser";

// Sidebar list. The server/Redux already keep it sorted; this only applies the search filter.
const OtherUsers = ({ search }) => {
  const otherUsers = useSelector((state) => state.user.otherUsers);

  const query = search.trim().toLowerCase();
  const visibleUsers = query
    ? otherUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
      )
    : otherUsers;

  if (visibleUsers.length === 0) {
    return (
      <p className="flex-1 px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        {query ? "No users match your search" : "No other users yet"}
      </p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {visibleUsers.map((user) => (
        <OtherUser key={user._id} user={user} />
      ))}
    </div>
  );
};

export default OtherUsers;
