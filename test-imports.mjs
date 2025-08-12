console.log("🔍 Testing imports...");

console.log("1. Testing express import...");
try {
  const express = await import('express');
  console.log("✅ Express import successful");
} catch (err) {
  console.error("❌ Express import failed:", err.message);
}

console.log("2. Testing database import...");
try {
  const db = await import('./server/db.ts');
  console.log("✅ Database import successful");
} catch (err) {
  console.error("❌ Database import failed:", err.message);
}

console.log("3. Testing routes import...");
try {
  const routes = await import('./server/routes.ts');
  console.log("✅ Routes import successful");
} catch (err) {
  console.error("❌ Routes import failed:", err.message);
}

console.log("4. Testing vite import...");
try {
  const vite = await import('./server/vite.ts');
  console.log("✅ Vite import successful");
} catch (err) {
  console.error("❌ Vite import failed:", err.message);
}

console.log("🏁 Import test completed");
