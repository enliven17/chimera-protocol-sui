import { ErrorBoundary } from "@/components/shared/error-bounday";
import { headers } from "next/headers";
import { Header } from "@/components/shared/header";
import { TermsGuard } from "@/components/shared/terms-guard";
import { Web3Provider } from "@/providers/web3-provider";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/shared/footer";
import { FloatingChatbot } from "@/components/shared/floating-chatbot";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

// Global Metadata
export const metadata = {
  title: {
    default: "ChimeraAI – AI-Powered Prediction Markets",
    template: "%s | ChimeraAI",
  },
  description:
    "AI-powered prediction markets on Hedera EVM with autonomous agents, Pyth Oracle integration, and PYUSD betting. Features ASI Alliance reasoning and Lit Protocol secure execution.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "ChimeraAI – AI-Powered Prediction Markets",
    description:
      "AI-powered prediction markets with autonomous agents, oracle integration, and secure execution on Hedera EVM.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "ChimeraAI",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "ChimeraAI",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChimeraAI – AI-Powered Prediction Markets",
    description:
      "AI-powered prediction markets with autonomous agents on Hedera EVM.",
    creator: "@chimeraai",
    images: [],
  },
  icons: undefined,
  manifest: "/site.webmanifest",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.className} bg-gradient-to-r from-[#0A0C14] via-[#1A1F2C] to-[#0A0C14]`}
      >
        <ErrorBoundary>
          <Web3Provider>
            <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#0A0C14] via-[#1A1F2C] to-[#0A0C14] text-white relative">
              <TermsGuard>
                <Header />
                <main className="flex-1">{children}</main>
                {pathname === "/" && <Footer />}
              </TermsGuard>
              <FloatingChatbot />
            </div>
            <Toaster theme="dark" position="top-right" />
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}