import { SiX } from "@icons-pack/react-simple-icons";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { LEGAL, SITE } from "@/config/site";

const FOOTER_LINKS = [
  { href: "/token", label: "Earn2Win Token" },
  { href: "/create", label: "Create" },
  { href: "/how-it-works", label: "How It Works" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page py-12 md:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-fg-secondary">
              Creator fees meet social identity.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3 md:items-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-secondary transition-colors hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={SITE.x}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-sm text-fg-secondary transition-colors hover:text-fg"
                >
                  <SiX size={13} aria-hidden />
                  X
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 space-y-2 border-t border-line pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-fg-muted">
            {LEGAL.affiliation}
          </p>
          <p className="max-w-3xl text-xs leading-relaxed text-fg-muted">
            {LEGAL.risk}
          </p>
          <p className="pt-3 text-xs text-fg-muted">
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
