import React, { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    // Check localStorage for a saved theme preference
    const savedTheme = localStorage.getItem("theme");

    // Check for system preference if no theme is saved
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Return the correct initial state
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return prefersDark; // Use system preference as the default
  });

  // Apply the correct theme on mount and whenever it changes
  useEffect(() => {
    // Apply the 'dark' class to the <html> element
    document.documentElement.classList.toggle("dark", dark);

    // Save the new theme to localStorage
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="px-3 py-1 text-sm text-gray-900 transition-colors duration-300 bg-gray-200 border rounded dark:bg-gray-700 dark:text-white"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
