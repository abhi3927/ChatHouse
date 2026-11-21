import { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "../index";
import { setOtherUsers } from "../redux/userSlice";

// Loads the sidebar users (with lastMessage + unreadCount) into Redux.
// Also used by the real-time hook when a message arrives from an unknown sender.
export const fetchOtherUsers = async (dispatch) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/user/`, {
      withCredentials: true,
    });
    dispatch(setOtherUsers(res.data));
  } catch (error) {
    toast.error(error.response?.data?.message || "Could not load users");
  }
};

const useGetOtherUsers = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.authUser?._id);

  useEffect(() => {
    if (userId) fetchOtherUsers(dispatch);
  }, [userId, dispatch]);
};

export default useGetOtherUsers;
