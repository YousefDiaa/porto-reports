import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-[#E4007C] via-[#C20063] to-[#9C004B] dark:from-[#9C004B] dark:via-[#1A0B1A] dark:to-[#0B0F19] shadow-porto-lg sticky top-0 z-50 border-b-4 border-porto-cyan transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3.5 group min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 bg-white dark:bg-slate-900 border-2 border-porto-cyan shadow-sm flex items-center justify-center overflow-hidden group-hover:scale-105 transition-all shrink-0">
              <Image
                src="/porto-logo.png"
                alt="Porto Sporting Club Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-black text-sm sm:text-xl leading-tight tracking-wide truncate">
                نادي بورتو الرياضي
              </h1>
              <p className="text-porto-yellow text-[10px] sm:text-xs font-bold tracking-wider truncate max-w-[140px] sm:max-w-none">
                PORTO SPORTING CLUB
              </p>
            </div>
          </Link>

          {/* Navigation & Theme Toggle */}
          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="text-white/90 hover:text-porto-yellow transition-colors text-xs sm:text-sm font-bold px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/10 hidden sm:inline-block"
            >
              الرئيسية
            </Link>

            <Link
              href="/admin/login"
              className="bg-porto-cyan hover:bg-porto-cyan-dark text-white font-black text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-xl transition-all duration-200 shadow-porto-cyan hover:shadow-none hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              لوحة الأدمن
            </Link>

            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
