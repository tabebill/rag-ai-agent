"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/src/lib/supabaseClient";

const LandingPage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      }
      setLoading(false);
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p className="animate-pulse text-xl">Loading… ⏳</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12 text-white overflow-hidden">
      {/* Background Image */}
      <Image
        src="/new-york-4582500_1920.jpg"
        alt="New York City"
        fill
        className="object-cover"
        priority
      />

      {/* Darker semi-transparent diagonal gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(127,90,240,0.35), rgba(59,10,95,0.45), rgba(30,27,43,0.55))",
        }}
      />

      {/* Blurry container for text and buttons */}
      <div className="relative z-10 w-full max-w-3xl p-8 bg-black/40 backdrop-blur-md rounded-xl space-y-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          Hi, I&apos;m Bill! 🏠✨
        </h1>
        <p className="text-lg sm:text-xl text-purple-100">
          I&apos;m your friendly <strong>Commercial Real Estate AI 🤖</strong>.<br />
          I have REIT statistics from <strong>1987 onwards 📈</strong>.<br />
          I can help you make smart financial choices based on your portfolio 💰🏢.
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-6 justify-center">
          <button
            className="px-8 py-3 rounded-full bg-purple-700 text-white font-semibold hover:bg-purple-800 shadow-lg transition-colors duration-200"
            onClick={() => router.push("/signup")}
          >
            Sign Up ✨
          </button>
          <button
            className="px-8 py-3 rounded-full bg-purple-400 text-gray-900 font-semibold hover:bg-purple-500 shadow-lg transition-colors duration-200"
            onClick={() => router.push("/signin")}
          >
            Sign In 🔑
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-sm text-purple-200 text-center">
        Get started by signing up or logging in 🏡🚀
      </p>
    </div>
  );
};

export default LandingPage;
