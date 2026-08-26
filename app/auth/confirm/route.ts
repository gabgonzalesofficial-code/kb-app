import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/reset-password';

  if (token_hash && type) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const cookieStore = {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      };

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: cookieStore,
      });

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'recovery' | 'signup' | 'magiclink' | 'email_change',
      });

      if (!error) {
        // Build the redirect response and copy the auth cookies onto it
        const redirectResponse = NextResponse.redirect(new URL(next, origin));
        request.cookies.getAll().forEach(({ name, value }) => {
          redirectResponse.cookies.set(name, value);
        });
        return redirectResponse;
      } else {
        console.error('Error verifying OTP:', error);
        return NextResponse.redirect(
          new URL('/reset-password?error=invalid_link', origin)
        );
      }
    }
  }

  // Missing or invalid params
  return NextResponse.redirect(
    new URL('/reset-password?error=invalid_link', origin)
  );
}
