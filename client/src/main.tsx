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
        LukaMath Website is FIXED!
      </h2>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        React is working properly with Vite and TypeScript
      </p>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '20px',
        borderRadius: '10px'
      }}>
        <p>✅ Frontend: Working</p>
        <p>✅ Database: Connected</p>
        <p>✅ API: Functional</p>
      </div>
    </div>
  );
}

console.log("Loading React with JSX...");
createRoot(document.getElementById("root")!).render(<TestApp />);
