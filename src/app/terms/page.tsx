"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const termsSections = [
  {
    id: "nature",
    title: "Nature of the Platform",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI is an AI-powered prediction platform built on Hedera EVM
        with autonomous agents. It allows users to participate in binary prediction markets.
        ChimeraAI is not a betting, gambling, or gaming service.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        You must be at least 18 years old (or the age of majority in your
        jurisdiction) to use ChimeraAI. You may not use the platform if you are
        located in the United States of America (USA) or any jurisdiction where
        cryptocurrency or prediction platforms are restricted (e.g., China,
        North Korea).
      </p>
    ),
  },
  {
    id: "wallets",
    title: "Wallets and Blockchain",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        Users must connect an EVM-compatible wallet to use ChimeraAI.
        You are solely responsible for safeguarding your wallet keys, passwords,
        and seed phrases. ChimeraAI cannot recover lost wallets or funds.
      </p>
    ),
  },
  {
    id: "risk",
    title: "Assumption of Risk",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        Participation involves financial risk. You may lose PYUSD tokens. Market
        conditions, smart contract issues, or blockchain malfunctions may impact
        your experience. You agree that you use ChimeraAI at your own risk.
      </p>
    ),
  },
  {
    id: "conduct",
    title: "Prohibited Conduct",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        You agree not to violate laws, attempt to access the platform from
        restricted jurisdictions, manipulate predictions with bots or malicious
        code, or exploit vulnerabilities in the platform.
      </p>
    ),
  },
  {
    id: "advice",
    title: "No Financial Advice",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI does not provide financial, legal, tax, or investment advice.
        Information provided is for informational and educational purposes only.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        To the maximum extent permitted by law, ChimeraAI and its affiliates are
        not liable for direct, indirect, incidental, or consequential damages
        arising from your use of the platform. Your sole remedy is to stop using
        the service.
      </p>
    ),
  },
  {
    id: "indemnification",
    title: "Indemnification",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        You agree to indemnify and hold harmless ChimeraAI, its affiliates, and
        team members from any claims, damages, or expenses arising from your use
        of the platform or violation of these terms.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "Modifications",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI may update these Terms at any time. Updated Terms will be
        posted with a new 'Last Updated' date. Continued use of the
        platform indicates acceptance.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI may suspend or terminate your access at any time for
        violations of these Terms or harmful conduct.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        These Terms are governed by the laws of [Your Jurisdiction]. Users agree
        to submit to the jurisdiction of the applicable courts.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <div>
        <p className="text-gray-300 text-sm leading-relaxed">
          For questions regarding these Terms, please visit our official
          website:
        </p>
        <ul className="list-none mt-2">
          <li>
            <Link
              href="https://chimeraai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#eab308] hover:text-[#ca8a04] transition-colors duration-150"
            >
              chimeraai.com
            </Link>
          </li>
        </ul>
      </div>
    ),
  },
];

const Page = () => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToSection = (index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    sectionRefs.current = sectionRefs.current.slice(0, termsSections.length);
  }, []);

  return (
    <div className="text-white min-h-screen flex flex-col mt-4">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ChimeraAI Terms of Service</h1>
        <p className="text-gray-200 text-sm mt-2">Effective Date: October 12, 2025 | Last Updated: October 12, 2025</p>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <aside className="lg:w-1/4 bg-[#1a1c26] p-4 rounded-lg lg:sticky lg:top-8 h-fit">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Sections</h2>
          <ul className="space-y-2">
            {termsSections.map((section, index) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(index)}
                  className="text-sm text-gray-400 hover:text-[#eab308] transition-colors duration-150 w-full text-left py-1"
                >
                  {index + 1}. {section.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="lg:w-3/4 space-y-8">
          {termsSections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => {
                if (el) sectionRefs.current[index] = el;
              }}
              className="p-6"
            >
              <h2 className="text-lg font-semibold text-gray-100 mb-3">{index + 1}. {section.title}</h2>
              {section.content}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Page;
