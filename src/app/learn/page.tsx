"use client";

import { useEffect, useRef } from "react";

const learnSections = [
  {
    id: "what-is-chimeraai",
    title: "What Is ChimeraAI",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        ChimeraAI is an AI-powered binary prediction platform built on
        Hedera EVM. Participants use PYUSD tokens to express beliefs about
        future events by staking on either a Yes or a No outcome. The
        distribution of stakes across outcomes reflects the community's implied
        probability for each event.
      </p>
    ),
  },
  {
    id: "how-it-works",
    title: "How ChimeraAI Works",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">Pick a Market:</span>{" "}
          Each market resolves to either Yes or No.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Stake PYUSD:</span>{" "}
          Choose your side and stake PYUSD tokens. Stakes are locked in a smart
          contract until resolution.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Implied Probability:
          </span>{" "}
          The ratio of PYUSD on each side indicates the market's current
          consensus.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Resolution:</span> When
          the outcome becomes known, the contract finalizes the winning side
          based on predefined rules.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Payouts:</span> After
          deducting any applicable fee, the remaining pool is distributed
          proportionally to winners.
        </li>
      </ul>
    ),
  },
  {
    id: "why-use",
    title: "Why Use ChimeraAI",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">Powered by Hedera:</span>{" "}
          Native utility for the Hedera EVM ecosystem.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Simple Binary Design:
          </span>{" "}
          No order books—just Yes or No.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Transparent and On-Chain:
          </span>{" "}
          Stakes, resolutions, and payouts are verifiable on the blockchain.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Collective Intelligence:
          </span>{" "}
          Market prices often track real-world probabilities effectively.
        </li>
        <li>
          <span className="font-semibold text-gray-100">No House Edge:</span>{" "}
          ChimeraAI is a neutral protocol; it is not your counterparty.
        </li>
      </ul>
    ),
  },
  {
    id: "prediction-markets",
    title: "Prediction Markets Overview",
    content: (
      <p className="text-gray-300 text-sm leading-relaxed">
        Prediction markets are mechanisms where participants buy or stake value
        on future outcomes. Prices or stake ratios act as real-time
        probabilities. Incentives for correctness drive more accurate
        forecasting than polls in many contexts. Common categories include
        sports, politics, crypto, finance, culture, and other verifiable events.
      </p>
    ),
  },
  {
    id: "considerations",
    title: "Important Considerations",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">Risk:</span> If your
          prediction is incorrect, you may lose your staked PYUSD tokens. Only
          stake what you can afford to lose.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Restricted Regions:
          </span>{" "}
          ChimeraAI is not available in the USA or jurisdictions that prohibit
          or restrict cryptocurrency use.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            No Financial Advice:
          </span>{" "}
          ChimeraAI provides an information and education platform; it does not
          provide investment or legal advice.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            On-Chain Transparency:
          </span>{" "}
          All activity is public, immutable, and auditable on the Hedera
          blockchain.
        </li>
      </ul>
    ),
  },
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">
            Create a Wallet:
          </span>{" "}
          Use a Hedera EVM-compatible wallet and secure your
          seed phrase.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Acquire PYUSD Tokens:
          </span>{" "}
          Buy PYUSD via our bridge system and transfer them to your wallet.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Connect to ChimeraAI:
          </span>{" "}
          Visit the platform and link your wallet.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Explore Markets:</span>{" "}
          Browse active markets, choose an outcome, and stake PYUSD.
        </li>
        <li>
          <span className="font-semibold text-gray-100">Track & Withdraw:</span>{" "}
          Monitor events and claim payouts after resolution if you were correct.
        </li>
      </ul>
    ),
  },
  {
    id: "use-cases",
    title: "Educational Use Cases",
    content: (
      <ul className="list-none space-y-2 text-gray-300 text-sm leading-relaxed">
        <li>
          <span className="font-semibold text-gray-100">
            Learn Blockchain and Smart Contracts:
          </span>{" "}
          Observe how on-chain logic secures value and automates payouts.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Study Probability and Game Theory:
          </span>{" "}
          See how incentives shape collective forecasts.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Alternative Data for Analysis:
          </span>{" "}
          Use market consensus as an input for research and analytics.
        </li>
        <li>
          <span className="font-semibold text-gray-100">
            Community Engagement:
          </span>{" "}
          Coordinate predictions around governance or social outcomes.
        </li>
      </ul>
    ),
  },
  {
    id: "payout-calculation",
    title: "Payout Calculation",
    content: (
      <div className="space-y-4">
        <p className="text-gray-300 text-sm leading-relaxed">
          ChimeraAI distributes winnings using a proportional (pro-rata) model.
          After deducting any platform or market-level fee, the remaining pool
          is split among all participants on the correct outcome in proportion
          to their stake.
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="font-semibold text-gray-100">Formula:</span>
          <br />
          Payout = (User's Stake ÷ Total Winning Stake) × (Total Pool − Fee)
        </p>
        <p className="text-gray-300 text-sm leading-relaxed">
          <span className="font-semibold text-gray-100">Worked Example:</span>
          <br />
          Total Pool: 1,000 PYUSD | Platform Fee: 2.5% (25 PYUSD) | Remaining Pool:
          975 PYUSD
          <br />
          Outcome A (Winner): 400 PYUSD | Outcome B (Loser): 600 PYUSD
          <br />
          Emma stakes 100 PYUSD on Outcome A → Emma's share = 100 ÷ 400 = 25% →
          Payout = 25% × 975 = 243.75 PYUSD
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-300 border-collapse">
            <thead>
              <tr className="bg-[#2a2c38] text-gray-100">
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">Stake (PYUSD)</th>
                <th className="p-2 text-left">Outcome Picked</th>
                <th className="p-2 text-left">Result</th>
                <th className="p-2 text-left">Payout (PYUSD)</th>
                <th className="p-2 text-left">Profit (PYUSD)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="p-2">Emma</td>
                <td className="p-2">100</td>
                <td className="p-2">A (Winner)</td>
                <td className="p-2">Win</td>
                <td className="p-2">243.75</td>
                <td className="p-2">+143.75</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Liam</td>
                <td className="p-2">150</td>
                <td className="p-2">A (Winner)</td>
                <td className="p-2">Win</td>
                <td className="p-2">365.63</td>
                <td className="p-2">+215.63</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Sophia</td>
                <td className="p-2">150</td>
                <td className="p-2">A (Winner)</td>
                <td className="p-2">Win</td>
                <td className="p-2">365.63</td>
                <td className="p-2">+215.63</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="p-2">Noah</td>
                <td className="p-2">600</td>
                <td className="p-2">B (Loser)</td>
                <td className="p-2">Lose</td>
                <td className="p-2">0.00</td>
                <td className="p-2">−600.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 text-xs italic mt-2">
          Note: Fees and parameters may vary by market and are disclosed before
          you stake. All values and examples above are illustrative.
        </p>
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
    sectionRefs.current = sectionRefs.current.slice(0, learnSections.length);
  }, []);

  return (
    <div className="text-white min-h-screen flex flex-col mt-4">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          ChimeraAI Learn
        </h1>
        <p className="text-gray-200 text-sm mt-2">
          Effective Date: October 12, 2025 | Last Updated: October 12, 2025
        </p>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
        {/* Sidebar */}
        <aside className="lg:w-1/4 bg-[#1a1c26] p-4 rounded-lg lg:sticky lg:top-8 h-fit">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Sections</h2>
          <ul className="space-y-2">
            {learnSections.map((section, index) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(index)}
                  className="text-sm text-gray-400 hover:text-[#9b87f5] transition-colors duration-150 w-full text-left py-1"
                >
                  {index + 1}. {section.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="lg:w-3/4 space-y-8">
          {learnSections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => {
                if (el) sectionRefs.current[index] = el;
              }}
              className="p-6"
            >
              <h2 className="text-lg font-semibold text-gray-100 mb-3">
                {index + 1}. {section.title}
              </h2>
              {section.content}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default Page;