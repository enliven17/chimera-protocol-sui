import { ErrorBoundary } from "@/components/shared/error-bounday";
import { headers } from "next/headers";
import { Header } from "@/components/shared/header";
import { TermsGuard } from "@/components/shared/terms-guard";
import { SuiWalletProvider } from "@/providers/SuiWalletProvider";
import { ZkLoginProvider } from "@/providers/ZkLoginProvider";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/shared/footer";
import { FloatingChatbot } from "@/components/shared/floating-chatbot";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"] });

// Global Metadata
export const metadata = {
  title: {
    default: "Suimera",
    template: "%s | Suimera",
  },
  description:
    "Decentralized prediction markets on Sui blockchain. Create, trade, and profit from real-world event predictions with SUI tokens.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Suimera",
    description:
      "Decentralized prediction markets on Sui blockchain. Create, trade, and profit from real-world event predictions.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Suimera",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Suimera",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suimera",
    description:
      "Decentralized prediction markets on Sui blockchain with SUI tokens.",
    creator: "@suimera",
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
        <ClientProviders>
          <ErrorBoundary>
            <ZkLoginProvider>
              <SuiWalletProvider>
                <div className="min-h-screen flex flex-col bg-gradient-to-r from-[#0A0C14] via-[#1A1F2C] to-[#0A0C14] text-white relative">
                  <TermsGuard>
                    <Header />
                    <main className="flex-1">{children}</main>
                    {pathname === "/" && <Footer />}
                  </TermsGuard>
                  <FloatingChatbot />
                </div>
                <Toaster theme="dark" position="top-right" />
              </SuiWalletProvider>
            </ZkLoginProvider>
          </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  );
}