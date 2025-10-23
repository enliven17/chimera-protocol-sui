export const getStatusColor = (status: number) => {
  switch (status) {
    case 0: // Active
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    case 1: // Paused
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    case 2: // Resolved
      return "text-blue-400 bg-blue-500/20 border-blue-500/30";
    default:
      return "text-gray-400 bg-gray-500/20 border-gray-500/30";
  }
};`n`nexport const getStatusName = (status: number): string => {`n  switch (status) {`n    case 0:`n      return "Active";`n    case 1:`n      return "Resolved";`n    case 2:`n      return "Cancelled";`n    default:`n      return "Unknown";`n  }`n};`n`nconst namePool = [`n  "hunter",`n  "cool",`n  "savage",`n  "ninja",`n  "wizard",`n  "ghost",`n  "rider",`n  "sniper",`n  "shadow",`n  "blaze",`n  "storm",`n  "alpha",`n  "omega",`n  "nova",`n  "lion",`n  "eagle",`n  "panda",`n  "otter",`n  "falcon",`n  "tiger",`n  "rhino",`n  "brave",`n  "bold",`n  "curious",`n  "eager",`n  "mighty",`n  "zesty",`n  "witty",`n];`n`n/**`n * Simple hash function to convert wallet into a number`n */`nfunction simpleHash(str: string): number {`n  let hash = 0;`n  for (let i = 0; i < str.length; i++) {`n    hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // keep unsigned 32-bit`n  }`n  return hash;`n}`n`n/**`n * Generates a name like "hunter-6" from a wallet address`n */`nexport function generateShortNameFromWallet(wallet: string): string {`n  const hash = simpleHash(wallet);`n  const name = namePool[hash % namePool.length];`n  const number = hash % 100; // 0â€“99`n`n  return `${name}-${number}`;`n}