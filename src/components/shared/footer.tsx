"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

type FooterLink = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
    {
      title: "Product",
      links: [
        { label: "How it Works", href: "/" },
        { label: "Markets", href: "/markets" },
      ],
    },
    {
      title: "Terms of Use",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Condition", href: "/terms" },
        { label: "Learn", href: "/learn" },
      ],
    },
  ];

const socials: FooterLink[] = [];

export const Footer = () => {
  const pathname = usePathname();

  if(pathname !== "/") return null;

  return (
    <footer className="text-white w-full px-4 sm:px-8 lg:px-16 py-8 mt-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#fbbf24] via-[#eab308] to-[#ca8a04] bg-clip-text text-transparent">Chi</span>
            <span className="text-white">mera</span>
          </span>
        </Link>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm text-gray-400">
          {footerSections.flatMap((s) => s.links).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[#ca8a04] transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="h-px w-full max-w-5xl bg-gray-800/60 my-2" />

        <div className="w-full flex items-center justify-between text-[11px] sm:text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Chimera</span>
          <span className="hidden sm:block">All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};