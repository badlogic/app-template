/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["src/**/*.{html,ts,css}", "html/**/*.{html,ts,css}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                text: "var(--text)",
                muted: "var(--muted)",
                link: "var(--link)",
                border: "var(--border)",
            },
            screens: {
                pwa: { raw: "(display-mode: standalone)" },
            },
            overflow: {
                "x-clip": "clip",
            },
            lineClamp: {
                8: "8",
                16: "16",
            },
        },
    },
    plugins: [require("tailwindcss-animated")],
};
