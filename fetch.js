const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://oictzdcrdqgwawezwjzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3R6ZGNyZHFnd2F3ZXp3anpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTc5MzQsImV4cCI6MjEwMTU3MzkzNH0._-QPa4TDifIriTJlcuP05w6eCPnXUjcFDQNcFEQ0kB8';

const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('store_items').select('*').then(res => console.log(JSON.stringify(res.data, null, 2)));
