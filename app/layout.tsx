import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "تقارير نادي بورتو الرياضي | Porto Sporting Club",
  description: "المنصة الرسمية لتقارير نادي بورتو الرياضي — عامر جروب",
  icons: {
    icon: "/porto-logo.png",
    apple: "/porto-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
        <meta name="darkreader" content="NO-DARK-READER" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="font-arabic antialiased bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
