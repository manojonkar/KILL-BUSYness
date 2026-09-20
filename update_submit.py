import re

with open(r'C:\Users\Manoj\.gemini\antigravity\brain\61d1d81b-60d5-467c-8c62-11f28f95cac4\scratch\KILL-BUSYness\app\assessment\page.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the import at the top
content = content.replace('import html2canvas from \'html2canvas\';', 'import html2canvas from \'html2canvas\';\nimport { sendAssessmentEmail } from "./actions";')

# Replace the submitResults function
old_func = '''  const submitResults = async () => {
    try {
      if (supabaseUrl !== 'https://oictzdcrqgwawezwjzr.supabase.co') {
        await supabase.from('assessments').insert([{
          org_name: orgName,
          email: email,
          xo_index: xoIndex,
          answers: answers,
          band_name: band ? band.name : ''
        }]);
      } else {
        console.warn("Supabase URL not configured. Data not saved.");
      }
    } catch (e) {
      console.error('Error saving assessment:', e);
    }
    setScreen("results");
  };'''

new_func = '''  const submitResults = async () => {
    try {
      // 1. Save to Supabase
      await supabase.from('assessments').insert([{
        org_name: orgName,
        email: email,
        xo_index: xoIndex,
        answers: answers,
        band_name: band ? band.name : ''
      }]);
      
      // 2. Trigger Email #1 via Resend
      if (email && email.includes('@')) {
        await sendAssessmentEmail(email, xoIndex, band ? band.name : '');
      }
    } catch (e) {
      console.error('Error saving assessment or sending email:', e);
    }
    setScreen("results");
  };'''

content = content.replace(old_func, new_func)

with open(r'C:\Users\Manoj\.gemini\antigravity\brain\61d1d81b-60d5-467c-8c62-11f28f95cac4\scratch\KILL-BUSYness\app\assessment\page.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
