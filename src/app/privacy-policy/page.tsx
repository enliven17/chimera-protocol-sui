"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const privacySections = [
  {
    id: "info-collected",
    title: "Information We Collect",
    content: (
      <div className="space-y-2">
        <p className="text-gray-300 text-sm leading-relaxed">
          We may collect the following types of information:
        </p>
        <ul className="list-none space-y-2">
          <li>
            <span className="font-semibold text-gray-100">Information You Provide:</span>{" "}
            <span className="text-gray-300 text-sm leading-relaxed">
              Account details, optional profile information, KYC/AML verification details (if required by law), and communications with support.
            </span>
          </li>
          <li>
            <span className="font-semibold text-gray-100">Automatically Collected Information:</span>{" "}
            <span className="text-gray-300 text-sm leading-relaxed">
              Wallet addresses and on-chain transactions, device data (IP, browser, OS), and platform usage activity.
            </span>
          </li>
          <li>
            <span className="font-semibold text-gray-100">Third-Party Information:</span>{" "}
            <span className="text-gray-300 text-sm leading-relaxed">
              Data from compliance providers, payment processors, or regulators.
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "use-info",
    title: "How We Use Your Information",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        We use your information to operate ChimeraAI, process transactions, comply with laws, improve security and user experience, and communicate with you.
      </p>
    ),
  },
  {
    id: "blockchain",
    title: "Blockchain Transparency",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        Wallet addresses and transactions are public and immutable on EVM-based blockchains. ChimeraAI cannot alter or erase blockchain records.
      </p>
    ),
  },
  {
    id: "restrictions",
    title: "Regional Restrictions",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI does not provide services to users in the United States of America (USA) or in jurisdictions where cryptocurrency or prediction platforms are restricted (e.g., China, North Korea).
      </p>
    ),
  },
  {
    id: "share-info",
    title: "How We Share Information",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        We do not sell your data. We may share it with service providers, regulators, or in case of business transfers. Sharing may also occur with your explicit consent.
      </p>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        We use encryption, restricted access, and monitoring to protect data. However, you are responsible for securing your wallet keys, seed phrases, and devices.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your Rights",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        Depending on your jurisdiction (GDPR, CCPA, etc.), you may have rights to access, correct, delete, or restrict processing of your data. You may also withdraw consent or file a complaint with your data authority.
      </p>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        We retain personal data only as long as necessary to provide services, comply with laws, and resolve disputes.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and Tracking",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        We may use cookies and tracking tools to improve functionality, analyze usage, and personalize experience. You can disable cookies in your browser settings.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI is not intended for users under 18 (or legal age in their jurisdiction). Data from minors will be deleted.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        We may update this Privacy Policy. Updates will be posted with a new 'Last Updated' date.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <div>
        <p className="text-gray-300 text-sm leading-relaxed">
          For questions about this Privacy Policy or your rights, please visit our official website:
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
    sectionRefs.current = sectionRefs.current.slice(0, privacySections.length);
  }, []);

  return (
    <div className="text-white min-h-screen flex flex-col mt-4">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">ChimeraAI Privacy Policies</h1>
        <p className="text-gray-200 text-sm mt-2">Effective Date: October 12, 2025 | Last Updated: October 12, 2025</p>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        <aside className="lg:w-1/4 bg-[#1a1c26] p-4 rounded-lg lg:sticky lg:top-8 h-fit">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Sections</h2>
          <ul className="space-y-2">
            {privacySections.map((section, index) => (
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
          {privacySections.map((section, index) => (
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
