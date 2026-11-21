import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { BASE_URL } from "../index";
import { setAuthUser } from "../redux/userSlice";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      toast.error("Please enter your username and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, form, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      // The route guard in App redirects to the chat once authUser is set.
      dispatch(setAuthUser(res.data.user));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not reach the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-wa-surfaceDark">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-wa-green text-3xl text-white">
          <FiMessageCircle />
        </div>
        <h1 className="text-2xl font-bold text-wa-teal dark:text-wa-green">ChatHouse App</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Log in to continue chatting</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-wa-teal hover:underline dark:text-wa-green">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
