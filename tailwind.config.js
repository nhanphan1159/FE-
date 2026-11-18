/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1677ff",
        jar: {
          nec: "#3b82f6",  // 55% Nhu cầu thiết yếu (Blue)
          ffa: "#10b981",  // 10% Tự do tài chính / Babylon 10% (Emerald/Gold)
          ltss: "#8b5cf6", // 10% Tiết kiệm dài hạn (Purple)
          edu: "#f59e0b",  // 10% Giáo dục (Amber)
          play: "#ec4899", // 10% Hưởng thụ (Pink)
          give: "#06b6d4", // 5% Cho đi (Cyan)
        }
      }
    },
  },
  corePlugins: {
    // Để không xung đột reset style với Ant Design button/input
    preflight: true,
  },
  plugins: [],
}
