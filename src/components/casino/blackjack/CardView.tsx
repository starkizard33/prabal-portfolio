import type { CSSProperties } from "react";
import type { Card } from "@/casino/engine/cards";

const SUIT_GLYPH: Record<Card["suit"], string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

type CardViewProps = {
  card?: Card;
  hidden?: boolean;
  dealIndex?: number;
  settleRot?: number;
  flipReveal?: boolean;
};

export function CardView({
  card,
  hidden = false,
  dealIndex = 0,
  settleRot = 0,
  flipReveal = false,
}: CardViewProps) {
  const style = {
    "--deal-index": dealIndex,
    "--deal-settle-rot": `${settleRot}deg`,
  } as CSSProperties;

  if (!card || hidden) {
    return (
      <div
        className="bj-deal-in flex h-24 w-[4.25rem] items-center justify-center rounded-lg border border-sz-jade/30 bg-[linear-gradient(145deg,#13221c,#0a1410)] shadow-[0_10px_28px_rgba(0,0,0,0.45)] sm:h-28 sm:w-20"
        style={style}
      >
        <div className="h-14 w-10 rounded-md border border-sz-ember/40 bg-[repeating-linear-gradient(45deg,rgba(255,107,44,0.15)_0_6px,transparent_6px_12px)] sm:h-16 sm:w-12" />
      </div>
    );
  }

  const glyph = SUIT_GLYPH[card.suit];
  const red = card.suit === "H" || card.suit === "D";

  return (
    <div
      className={`bj-deal-in flex h-24 w-[4.25rem] flex-col justify-between rounded-lg border border-white/20 bg-[#f7f3ea] p-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.4)] sm:h-28 sm:w-20 sm:p-2 ${
        red ? "text-[#c23b22]" : "text-[#12151c]"
      } ${flipReveal ? "bj-hole-flip" : ""}`}
      style={style}
    >
      <span className="text-xs font-semibold sm:text-sm">
        {card.rank}
        {glyph}
      </span>
      <span className="self-center text-2xl sm:text-3xl">{glyph}</span>
      <span className="self-end text-xs font-semibold sm:text-sm">
        {card.rank}
        {glyph}
      </span>
    </div>
  );
}
