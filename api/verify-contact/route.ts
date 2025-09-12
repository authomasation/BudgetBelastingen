// /api/verify-contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server operations
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse('Invalid token', { status: 400 });
  }

  try {
    // Find the temporary message
    const { data: tempMessage, error: fetchError } = await supabase
      .from('contact_berichten_temp')
      .select('*')
      .eq('verification_token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (fetchError || !tempMessage) {
      return new NextResponse('Token expired or invalid', { status: 400 });
    }

    // Move to permanent table
    const { error: insertError } = await supabase
      .from('contact_berichten')
      .insert({
        email: tempMessage.email,
        naam: tempMessage.naam,
        contact_type: tempMessage.contact_type,
        bericht: tempMessage.bericht,
        verified_at: new Date().toISOString()
      });

    if (insertError) {
      throw insertError;
    }

    // Delete from temporary table
    await supabase
      .from('contact_berichten_temp')
      .delete()
      .eq('id', tempMessage.id);

    // Redirect to success page
    return NextResponse.redirect(new URL('/contact/success', request.url));
  } catch (error) {
    console.error('Error verifying contact:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}