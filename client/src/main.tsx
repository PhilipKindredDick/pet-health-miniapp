import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/i18n";
import { initTelegramApp } from "./lib/telegram";

// Initialize Telegram Web App
initTelegramApp();

createRoot(document.getElementById("root")!).render(<App />);
