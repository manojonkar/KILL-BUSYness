const fs = require('fs');
const env = fs.readFileSync('.env.prod.local', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"?([^\"\n\r]+)\"?/);
console.log('URL IS:', urlMatch ? urlMatch[1] : 'NOT FOUND');
