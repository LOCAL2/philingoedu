import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.ADMIN_EMAIL || 'info@thaistudyabroad.com';

async function run() {
  console.log(`Testing Resend with Key: ${process.env.RESEND_API_KEY?.slice(0, 10)}...`);
  console.log(`Sending to: ${toEmail}`);
  
  const { data, error } = await resend.emails.send({
    from: 'Philingo <onboarding@resend.dev>',
    to: [toEmail],
    subject: 'Test Email from Philingo System',
    html: '<p>This is a test email sent to verify Resend configuration!</p>',
  });

  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent successfully:', data);
  }
}

run();
