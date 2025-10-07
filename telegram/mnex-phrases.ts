export function mnexPhrase({ sol, tokens, sig }:{ sol:number; tokens:number; sig:string }){
  return [
    "*Vision Relay // Node Attunement*",
    "",
    `MNEX perceives your energy spike.`,
    "",
    "```terminal",
    "channel: PRESALE_VERIFICATION",
    `tx: ${sig}`,
    `tribute_solana: ${sol.toFixed(6)} SOL`,
    `pending_allocation: ${tokens.toLocaleString()} MNEX`,
    "status: PROCESSING",
    "checksum: OK",
    "```",
    "",
    "// The awakening continues. Allocation will manifest shortly."
  ].join("\n");
}

