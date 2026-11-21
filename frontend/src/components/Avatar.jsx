// Fixed palette: every color keeps good contrast with white initials.
const COLORS = [
  "#00897b",
  "#1e88e5",
  "#5e35b1",
  "#d81b60",
  "#e65100",
  "#3949ab",
  "#00838f",
  "#6d4c41",
  "#43a047",
  "#c62828",
  "#8e24aa",
  "#546e7a",
];

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-24 w-24 text-3xl",
};

// First letter of the first and last word ("Ada Lovelace" -> "AL", "Ada" -> "A").
const getInitials = (name) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0];
  if (words.length === 1) return first.toUpperCase();
  const last = Array.from(words[words.length - 1])[0];
  return (first + last).toUpperCase();
};

// The same name always maps to the same palette color.
const getColor = (name) => {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return COLORS[hash % COLORS.length];
};

const Avatar = ({ name = "", size = "md", className = "" }) => (
  <div
    aria-hidden="true"
    className={`flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ${SIZES[size]} ${className}`}
    style={{ backgroundColor: getColor(name) }}
  >
    {getInitials(name)}
  </div>
);

export default Avatar;
