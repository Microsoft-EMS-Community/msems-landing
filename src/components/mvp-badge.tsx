import Image from "next/image";

interface MvpBadgeProps {
  /** Rendered size in px. Defaults to the 18px used on the speaker cards. */
  size?: number;
}

/** The Microsoft MVP award badge, shown beside an awardee's name. */
export function MvpBadge({ size = 18 }: MvpBadgeProps) {
  return (
    <Image
      src="/mvp-badge.png"
      alt="Microsoft MVP"
      title="Microsoft MVP"
      width={size}
      height={size}
      className="shrink-0 rounded-[3px]"
    />
  );
}
