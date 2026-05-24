"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function loginMetGoogle() {
    setLoading("google");
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  async function loginMetFacebook() {
    setLoading("facebook");
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      {/* Achtergrond decoratie */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-64 bg-primary" />
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo & titel */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-hover mb-4">
            <span className="text-4xl">🐾</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Bulldog Planner
          </h1>
          <p className="text-white/70 text-sm">
            Jouw persoonlijke bulldog agenda
          </p>
        </div>

        {/* Login kaart */}
        <div className="bg-white rounded-3xl shadow-hover p-8">
          <h2 className="font-display text-xl font-bold text-primary text-center mb-2">
            Inloggen
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Log in om je agenda te bekijken en evenementen te volgen
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={loginMetGoogle}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="flex-1 text-sm font-semibold text-gray-700 text-center">
                {loading === "google" ? "Bezig..." : "Doorgaan met Google"}
              </span>
            </button>

            {/* Facebook */}
            <button
              onClick={loginMetFacebook}
              disabled={loading !== null}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1877F2] rounded-2xl hover:bg-[#1565d8] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="flex-1 text-sm font-semibold text-white text-center">
                {loading === "facebook" ? "Bezig..." : "Doorgaan met Facebook"}
              </span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Door in te loggen ga je akkoord met onze{" "}
              <a href="https://stichtingbulldogsteunfondsnederland.nl/privacyverklaring" target="_blank" className="text-primary hover:underline">
                privacyverklaring
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs mt-6">
          Een app van Stichting Bulldog Steunfonds Nederland
        </p>
      </div>
    </div>
  );
}
