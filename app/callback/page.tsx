import { createServerClient } from "supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookies() }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession();

  if (error) {
    return <p>Er ging iets mis bij verificatie: {error.message}</p>;
  }

  // ✅ succesvol ingelogd → redirect naar dashboard
  redirect("/dashboard");

  return null;
}
