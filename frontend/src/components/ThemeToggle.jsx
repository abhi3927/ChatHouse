import { useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

// The saved theme is applied on load by a small script in public/index.html,
// so the initial state is read from the <html> class.
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (error) {
      // Storage unavailable: the theme still changes for this session.
    }
    setIsDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full p-2 text-xl text-white transition hover:bg-white/10"
    >
      {isDark ? <FiSun /> : <FiMoon />}
    </button>
  );
};

export default ThemeToggle;
