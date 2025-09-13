"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/src/lib/supabaseClient";

const SignInPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12 overflow-hidden text-white">
      {/* Background Image */}
      <Image
        src="/new-york-4582500_1920.jpg"
        alt="New York City"
        fill
        className="object-cover"
        priority
      />

      {/* Dark semi-transparent gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(127,90,240,0.35), rgba(59,10,95,0.45), rgba(30,27,43,0.55))",
        }}
      />

      {/* Sign In Form */}
      <div className="relative z-10 w-full max-w-md p-8 bg-black/40 rounded-xl shadow-lg backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center mb-6">Sign In 🗝️</h2>

        {authError && <p className="text-red-400 mb-4 text-center">{authError}</p>}

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-3 rounded-lg bg-white/10 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-full bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors duration-200"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-purple-200 mt-6">
          Don't have an account?
          <span
            className="text-purple-400 cursor-pointer hover:underline ml-2"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
