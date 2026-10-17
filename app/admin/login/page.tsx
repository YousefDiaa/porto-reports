"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Eye, EyeOff, Lock, User, LogIn, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4007C] via-[#B8005A] to-[#4A0027] dark:from-[#1A0311] dark:via-[#110D1F] dark:to-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Top action bar */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-white/90 hover:text-porto-yellow font-bold text-xs sm:text-sm bg-black/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/20 transition-all hover:scale-105"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          العودة للرئيسية
        </Link>
        <ThemeToggle />
      </div>

      {/* Background glowing orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-porto-cyan blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-porto-yellow blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up mt-8 sm:mt-0">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-4 border-porto-cyan p-2 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-porto-cyan">
            <Image
              src="/porto-logo.png"
              alt="Porto Logo"
              width={96}
              height={96}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-wide">لوحة تحكم الأدمن</h1>
          <p className="text-porto-yellow text-xs sm:text-sm font-bold">PORTO SPORTING CLUB</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-[#151D2F] rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-[#222F49] transition-colors duration-300">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-5 sm:mb-6 text-center">
            تسجيل الدخول
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pr-10 pl-4 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl pr-10 pl-10 py-3 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-[#1C263D] focus:outline-none focus:ring-2 focus:ring-porto-pink dark:focus:ring-porto-cyan text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-porto-pink dark:hover:text-porto-cyan transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-porto-pink to-porto-pink-dark hover:from-porto-pink-light hover:to-porto-pink text-white font-black py-3.5 rounded-xl transition-all duration-200 shadow-porto hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جارٍ التحقق...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  دخول اللوحة
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
