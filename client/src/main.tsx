import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Main.tsx loading...");
console.log("Root element:", document.getElementById("root"));

try {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element not found!");
  } else {
    console.log("Creating React root...");
    createRoot(root).render(<App />);
    console.log("React app rendered!");
  }
} catch (error) {
  console.error("Error rendering React app:", error);
}
