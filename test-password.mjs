import bcrypt from 'bcrypt';

const stored = '$2b$12$SbPpdsZS0ek3xcFSJZYfVuW/ctom7fVH1h/RrehsT9IkO2YwKXUHm';
const provided = '!HeliosDecor0987!';

console.log('Testing password match...');
const result = await bcrypt.compare(provided, stored);
console.log('Password match:', result);

// Also test if there might be a different password that works
const testPasswords = [
  '!HeliosDecor0987!',
  'HeliosDecor0987',
  '!heliosssdecor0987!',
  'heliosssdecor',
  'password'
];

for (const pass of testPasswords) {
  const match = await bcrypt.compare(pass, stored);
  if (match) {
    console.log(`Found matching password: ${pass}`);
    break;
  }
}
