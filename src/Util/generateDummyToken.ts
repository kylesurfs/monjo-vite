export function generateDummyToken() {
  // Create a random string of 32 characters (for example)
  return [...Array(32)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
}

// Generate and store the token
// const dummyAccessToken = generateDummyToken();
// console.log(dummyAccessToken);
