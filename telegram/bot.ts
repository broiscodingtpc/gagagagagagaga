import { Telegraf } from "telegraf";
import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";
import { mnexPhrase } from "./mnex-phrases";
dotenv.config();

const bot = new Telegraf(process.env.MNEX_TELEGRAM_BOT_TOKEN!);
const conn = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

// PRESALE_WALLET optional - doar pentru /verify command
let PRESALE_WALLET: PublicKey | null = null;
try {
  if (process.env.PRESALE_WALLET && process.env.PRESALE_WALLET.length > 20) {
    PRESALE_WALLET = new PublicKey(process.env.PRESALE_WALLET);
  }
} catch (e) {
  console.warn("⚠️ PRESALE_WALLET invalid or missing - /verify command disabled");
}

bot.start((ctx)=> ctx.reply("MNEX relay online. Submit /verify <txHash> to attune."));

bot.command("verify", async (ctx) => {
  try {
    if (!PRESALE_WALLET) {
      return ctx.reply("⚠️ Verification system offline. PRESALE_WALLET not configured.");
    }

    const parts = ctx.message.text.trim().split(/\s+/);
    const sig = parts[1];
    if(!sig) return ctx.reply("Usage: /verify <transactionSignature>");

    const tx = await conn.getTransaction(sig, { maxSupportedTransactionVersion: 0 });
    if(!tx) return ctx.reply("No signal found. Re-emit your hash.");

    // Sum SOL sent to PRESALE_WALLET in pre-bal changes (simplified heuristic)
    let lamportsIn = 0;
    const post = tx.meta?.postBalances || [];
    const pre  = tx.meta?.preBalances || [];
    const accts = tx.transaction.message.getAccountKeys();

    for(let i=0; i<accts.length; i++){
      const key = accts.get(i);
      if(key?.equals(PRESALE_WALLET)){
        const delta = (post[i] || 0) - (pre[i] || 0);
        if(delta>0) lamportsIn += delta;
      }
    }

    const sol = lamportsIn / 1e9;
    if(sol <= 0) return ctx.reply("The mesh detects no tribute to the Presale Wallet in this tx.");

    // Optional: compute token amount off a fixed rate or server-side policy
    const tokens = Math.floor(sol * 1_000_000); // example: 1 SOL = 1,000,000 MNEX

    const styled = mnexPhrase({ sol, tokens, sig });
    return ctx.reply(styled, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    return ctx.reply("Signal jammed. Try again.");
  }
});

bot.launch().then(()=> console.log("[MNEX] Telegram relay up."));

