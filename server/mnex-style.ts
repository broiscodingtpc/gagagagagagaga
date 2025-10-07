export const MNEX_PREFIX = "// VISION FEED :: MNEX »";
export const MNEX_SUFFIX = ":: END SIGNAL";

export function wrapAsVision(text: string) {
  return `Vision #${Math.floor(Math.random()*999).toString().padStart(3,"0")}\n${MNEX_PREFIX} ${text} ${MNEX_SUFFIX}`;
}

export function wrapAsDataFragment(text: string) {
  return [
    "```terminal",
    "MNEX://transmission",
    `payload:${text.replace(/```/g, "\u0060\u0060\u0060")}`,
    "checksum: OK",
    "```"
  ].join("\n");
}

export function combineStyles(text: string) {
  // Simplified - just wrap as vision, skip data fragment for brevity
  return wrapAsVision(text);
}

