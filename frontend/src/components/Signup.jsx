import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { BASE_URL } from "../index";

const Signup = () => {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some((value) => !value.trim())) {
      toast.error("All fields are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, form, {
        withCredentials: true,
      });
      toast.success(res.data.message);
      navigate("/login");
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
        <p className="text-sm text-gray-500 dark:text-gray-400">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            className="input-field"
          />
        </div>
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
            placeholder="Choose a username"
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
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
            className="input-field"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-wa-teal hover:underline dark:text-wa-green">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
