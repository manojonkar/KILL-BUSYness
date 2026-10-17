const { createClient } = require('@supabase/supabase-js');
const zlib = require('zlib');
const fs = require('fs');

const url = 'https://oictzdcrdqgwawezwjzr.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function getCSS() {
  const { data } = await supabase.from('brand_assets').select('b64').eq('name', 'app-css-v1').single();
  const css = zlib.gunzipSync(Buffer.from(data.b64, 'base64')).toString('utf8');
  fs.writeFileSync('app-styles.css', css);
  console.log('Saved to app-styles.css');
}

getCSS();
