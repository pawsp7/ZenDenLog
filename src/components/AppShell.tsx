import Link from "next/link";
import { CalendarDays, Clock3, Home, Shuffle } from "lucide-react";
import { Enso } from "./Enso";
import { SignOutButton } from "./SignOutButton";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/open", label: "Open", icon: Shuffle },
  { href: "/hours", label: "Hours", icon: Clock3 },
];

export function AppShell({
  name,
  currentPath,
  children,
}: {
  name: string;
  currentPath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      <header className="bg-moss-800 text-parchment-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Enso className="h-9 w-9" />
            <div>
              <p className="font-serif text-xl leading-none">ZenDenLog</p>
              <p className="mt-1 text-xs tracking-wide text-sage-400">Staff hours & shifts</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  currentPath === link.href ? "bg-white/15" : "text-parchment-100/80 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-parchment-100/80 sm:inline">{name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-moss-900/10 bg-parchment-50/95 backdrop-blur md:hidden">
        <div className="safe-bottom mx-auto grid max-w-6xl grid-cols-4">
          {links.map((link) => {
            const Icon = link.icon;
            const active = currentPath === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 py-3 text-xs ${
                  active ? "text-moss-800" : "text-ink/55"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
