/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#121212",
                surface: "#1E1E1E",
                primary: "#3B82F6",
                success: "#10B981",
                alert: "#EF4444",
                "text-primary": "#E0E0E0",
                "text-secondary": "#A0A0A0",
                border: "#333333",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
                sm: "4px",
            },
        },
    },
    plugins: [],
}
