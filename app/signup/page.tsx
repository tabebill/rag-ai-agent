"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/src/lib/supabaseClient";

const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(true);

  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Hide form and show confirmation message
      setFormVisible(false);
      setAuthMessage(
        "Thank you for signing up! Now please go to your inbox and confirm your email."
      );
    } catch (err: string) {
      console.error(err);
      setAuthMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(127,90,240,0.35), rgba(59,10,95,0.45), rgba(30,27,43,0.55))",
        }}
      />

      {/* Form / Message */}
      <div className="relative z-10 w-full max-w-md p-8 bg-black/40 backdrop-blur-md rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up ✨</h2>

        {authMessage && <p className="text-purple-200">{authMessage}</p>}

        {formVisible && (
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
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
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        )}

        {!formVisible && (
          <p
            className="text-purple-400 mt-6 cursor-pointer hover:underline"
            onClick={() => router.push("/signin")}
          >
            Go to Sign In
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
