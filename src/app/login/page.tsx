"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const unauthorized = searchParams.get("error") === "unauthorized";

  const adminEmails = ["shouryam1508@gmail.com", "shivam301097@gmail.com"];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check if email is authorized before sending magic link
    if (!adminEmails.includes(email.toLowerCase().trim())) {
      setError("This email is not authorized to access the dashboard.");
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <>
      {unauthorized && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-sm text-red-400">Access denied. Your email is not authorized.</p>
        </div>
      )}

      {sent ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#12121a] p-6 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-lg font-semibold text-white">Check your email</h2>
          <p className="text-sm text-gray-500 mt-2">
            We sent a magic link to <span className="text-purple-400">{email}</span>
          </p>
          <p className="text-xs text-gray-600 mt-4">Click the link in the email to sign in.</p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="mt-4 text-xs text-purple-400 hover:text-purple-300"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="rounded-2xl border border-white/[0.06] bg-[#12121a] p-6">
          <label className="block text-xs font-medium text-gray-400 mb-2">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@fingle.app"
            required
            className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-semibold hover:from-purple-600 hover:to-violet-700 transition-all disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
          <p className="text-[10px] text-gray-700 text-center mt-4">
            Only authorized admin emails can access this dashboard.
          </p>
        </form>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-xl font-bold text-white">Fingle Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Traction Dashboard</p>
        </div>
        <Suspense fallback={<div className="text-center text-gray-600 text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
