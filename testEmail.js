const fs = require('fs');
const resendKey = fs.readFileSync('.env.production.local', 'utf8').match(/RESEND_API_KEY=(.*)/)[1].replace(/"/g, '').trim();
const html = `<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #15171b; line-height: 1.6;'>
  <p>Hi Manoj (Test),</p>
  <p>Thank you very much for your order for the digital copy of the book <strong>'KILL BUSYness .Build High Performance Organizations'</strong>.</p>
  <p>You can complete your payment of <strong>INR 1999</strong> on this link:</p>
  <div style='margin: 24px 0;'>
    <a href='https://razorpay.me/@Management' style='display: inline-block; padding: 12px 24px; background: #0E9C74; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;'>Click here to pay via Razorpay</a>
  </div>
  <p style='font-size: 0.9em; color: #4b5563;'><em>(Once your payment is confirmed, you will receive an email with instant access to the eBook, AudioBook, App, and Portal).</em></p>
  <p style='margin-top: 24px; padding: 12px; border-left: 4px solid #f59e0b; background: #fef3c7;'>
    <strong>If you have already paid, please reply to this email and share the screenshot or the name of the payee, amount, and other details for us to confirm your payment.</strong>
  </p>
  <p style='margin-top: 30px;'>Best regards,<br/><strong>Team KILL BUSYness</strong></p>
</div>`;

fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'Team KILL BUSYness <admin@killbusyness.com>',
    reply_to: 'admin@managementinnovations.co.in',
    to: 'manojonkar@gmail.com',
    subject: 'TEST 1: Complete your payment for your Digital Access to KILL BUSYness',
    html: html
  })
}).then(r => r.json()).then(console.log);
