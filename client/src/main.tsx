import { createRoot } from "react-dom/client";

// Extremely basic test without any CSS imports
function TestApp() {
  return React.createElement('div', {
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '24px',
      padding: '20px',
      zIndex: 9999
    }
  }, 'EMERGENCY TEST: If you see this, React is working!');
}

console.log("Loading React...");
const root = document.getElementById("root");
console.log("Root element:", root);

if (root) {
  console.log("Creating React root...");
  createRoot(root).render(React.createElement(TestApp));
  console.log("React app should be rendered!");
}
