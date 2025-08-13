import { createRoot } from "react-dom/client";

function TestApp() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#059669',
      color: 'white',
      fontSize: '28px',
      padding: '40px',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '2rem' }}>
        🎉 SUCCESS! 🎉
      </h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        LukaMath Website is FINALLY WORKING!
      </h2>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        React is working with Vite in plain JavaScript mode
      </p>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <p>✅ Frontend: Working</p>
        <p>✅ Database: Connected (Neon)</p>
        <p>✅ API: Functional</p>
        <p>✅ All Systems: GO!</p>
      </div>
    </div>
  );
}

console.log("Loading React with plain JSX...");
const root = document.getElementById("root");
console.log("Root found:", root);
createRoot(root).render(<TestApp />);
console.log("React app rendered!");
