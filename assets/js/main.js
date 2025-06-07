document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("theme-toggle") || document.querySelector(".toggle-btn");
  const body = document.body;

  // apply saved or system preference
  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    body.classList.remove("light");
    body.classList.add("dark");
    if (toggleBtn) toggleBtn.textContent = "☀️";
  } else {
    body.classList.remove("dark");
    body.classList.add("light");
    if (toggleBtn) toggleBtn.textContent = "🌙";
  }

  // toggle listener
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = body.classList.toggle("dark");
      body.classList.toggle("light", !isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
      toggleBtn.textContent = isDark ? "☀️" : "🌙";
    });
  }
});
