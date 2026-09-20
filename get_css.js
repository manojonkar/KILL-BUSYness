const { createClient } = require('@supabase/supabase-js');
const zlib = require('zlib');
const fs = require('fs');

const url = 'https://oictzdcrdqgwawezwjzr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTk5NzkzNCwiZXhwIjoyMTAxNTczOTM0fQ.ETwNnjVfKrjn-Q5mc9lyB0O7vhMz6gq3i210Hu2DOZA';

const supabase = createClient(url, key);

async function getCSS() {
  const { data } = await supabase.from('brand_assets').select('b64').eq('name', 'app-css-v1').single();
  const css = zlib.gunzipSync(Buffer.from(data.b64, 'base64')).toString('utf8');
  fs.writeFileSync('app-styles.css', css);
  console.log('Saved to app-styles.css');
}

getCSS();
