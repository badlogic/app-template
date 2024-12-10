/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["src/**/*.{html,ts,css}", "html/**/*.{html,ts,css}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                bg: "var(--bg)",
                fg: "var(--fg)",
                muted: "var(--muted)",
                "muted-strong": "var(--muted-strong)",
                primary: "var(--primary)",
                "primary-fg": "var(--primary-fg)",
                "primary-muted": "var(--primary-muted)",
                divider: "var(--divider)",
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
