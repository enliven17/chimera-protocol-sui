#!/usr/bin/env node
// Headless sample to call Vincent Skill execute_action endpoint
// Usage (PowerShell):
//   $env:LIT_PROTOCOL_ENDPOINT="http://localhost:3001"
//   node scripts/lit-execute-sample.js place_bet 1 0 25

import axios from "axios";

async function main() {
  const endpoint = process.env.LIT_PROTOCOL_ENDPOINT || "http://localhost:3001";
  const [action = "place_bet", marketId = "1", option = "0", amount = "10"] = process.argv.slice(2);

  const payload = {
    type: action,
    market_id: Number(marketId),
    option: Number(option),
    amount: Number(amount),
    analysis: {
      recommendation: option === "0" ? "BUY_A" : "BUY_B",
      confidence: 0.7,
      reasoning: "Headless trigger",
    },
    timestamp: new Date().toISOString(),
  };

  const url = `${endpoint}/execute_action`;
  const res = await axios.post(url, payload, { headers: { "Content-Type": "application/json" } });
  console.log("Response:", res.status, res.data);
}

main().catch((e) => {
  console.error(e.response?.data || e.message || e);
  process.exit(1);
});

