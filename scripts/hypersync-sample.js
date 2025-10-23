#!/usr/bin/env node
// Simple sample that queries HyperSync for recent transactions to ChimeraProtocol
// Usage: HYPERSYNC_URL=... node scripts/hypersync-sample.js

import { queryHyperSync } from "../src/lib/hypersync-client.ts";
import fs from "fs";

async function main() {
  const url = process.env.HYPERSYNC_URL;
  if (!url) {
    console.error("Set HYPERSYNC_URL to your HyperSync endpoint.");
    process.exit(1);
  }

  // Minimal example payload; adjust per HyperSync docs/builder
  const payload = {
    limit: 10,
    filters: {
      toAddress: process.env.CHIMERA_ADDRESS || "",
    },
    sort: { field: "blockNumber", order: "desc" },
  };

  const data = await queryHyperSync(url, payload);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

