"use client";

import { SiX } from "@icons-pack/react-simple-icons";
import { Menu, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogoLink } from "@/components/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_LINKS, SITE } from "@/config/site";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        scrolled || open
          ? "border-line bg-bg/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-bg/50 backdrop-blur-sm",
      )}
    >
      <div className="container-page">
        <div className="flex h-15 items-center justify-between gap-6">
          <LogoLink />

          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "press inline-flex h-9 items-center rounded-lg px-3 text-[13.5px] font-medium",
                      isActive(link.href)
                        ? "bg-white/[0.06] text-fg"
                        : "text-fg-secondary hover:bg-white/[0.04] hover:text-fg",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={SITE.x}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Earn2Win on X"
              className="press hidden size-9 items-center justify-center rounded-lg border border-line text-fg-secondary hover:border-line-strong hover:text-fg sm:inline-flex"
            >
              <SiX size={14} aria-hidden />
            </a>

            {/* Wrapped rather than using `hidden` on the button itself: the
                button's base `inline-flex` is the same specificity and wins. */}
            <span className="hidden sm:block">
              <ButtonLink href="/create" size="sm">
                Launch Token
              </ButtonLink>
            </span>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="press inline-flex size-10 items-center justify-center rounded-lg border border-line text-fg md:hidden"
            >
              {open ? <CloseIcon size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-bg/95 backdrop-blur-xl md:hidden"
      >
        <nav aria-label="Mobile" className="container-page py-3">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "press flex h-12 items-center rounded-xl px-4 text-[15px] font-medium",
                    isActive(link.href)
                      ? "bg-white/[0.06] text-fg"
                      : "text-fg-secondary hover:bg-white/[0.04] hover:text-fg",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center gap-2 pb-2">
            <ButtonLink
              href="/create"
              size="md"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Launch Token
            </ButtonLink>
            <a
              href={SITE.x}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Earn2Win on X"
              className="press inline-flex size-11 items-center justify-center rounded-xl border border-line text-fg-secondary hover:text-fg"
            >
              <SiX size={16} aria-hidden />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
