import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, naam, verificationToken } = await request.json();
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/verify-contact?token=${verificationToken}`;
    
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Bevestig je contactbericht',
      html: `
        <h2>Bevestig je contactbericht</h2>
        <p>Hallo${naam ? ` ${naam}` : ''},</p>
        <p>Klik op de onderstaande link om je contactbericht te bevestigen:</p>
        <p><a href="${verificationUrl}" style="background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Bevestig bericht</a></p>
        <p>Deze link is 24 uur geldig.</p>
        <p>Als je dit bericht niet hebt verzonden, kun je deze email negeren.</p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}