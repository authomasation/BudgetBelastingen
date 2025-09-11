import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(searchParams); // v2 redirect login

  if (error) {
    return <p>Er ging iets mis bij verificatie: {error.message}</p>;
  }

  // succesvol ingelogd → redirect naar home
  redirect("/");

  return null;
}
