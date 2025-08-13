export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#2563eb',
        marginBottom: '1rem'
      }}>
        LukaMath - Site is Working!
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: '#374151',
        marginBottom: '1.5rem'
      }}>
        Professional Online Math Tutoring
      </p>
      <div style={{
        backgroundColor: '#dbeafe',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #93c5fd'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e40af',
          marginBottom: '0.5rem'
        }}>
          ✅ React App Successfully Loaded!
        </h2>
        <p style={{ color: '#2563eb' }}>
          The frontend is now working correctly. All systems operational.
        </p>
      </div>
    </div>
  );
}
