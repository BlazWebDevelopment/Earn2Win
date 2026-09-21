import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * The E2W mark. Always the supplied artwork — never re-typeset as text — with
 * the wordmark beside it for the header and footer lockups.
 */
export function Logo({
  className,
  markClassName,
  showWordmark = true,
  priority = false,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/e2w-logo.png"
        alt="Earn2Win"
        width={1024}
        height={769}
        priority={priority}
        sizes="140px"
        className={cn("h-8 w-auto", markClassName)}
      />
      {showWordmark ? (
        <span className="text-[15px] font-semibold tracking-[-0.01em]">Earn2Win</span>
      ) : null}
    </span>
  );
}

export function LogoLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Earn2Win home"
      className={cn(
        "press -mx-1 inline-flex items-center rounded-lg px-1 py-1 hover:opacity-90",
        className,
      )}
    >
      <Logo priority />
    </Link>
  );
}
