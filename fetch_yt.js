const https = require('https');
https.get("https://www.youtube.com/playlist?list=PLbhXnfry_MBA", (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const matches = data.match(/watch\?v=([a-zA-Z0-9_-]+)/g);
    const unique = [...new Set(matches)];
    console.log(unique);
  });
});
