"use client";

import { ArrowLeftRight, House, Plus, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "@/components/ui/Button";

const items = [
  { href: "/", label: "Overview", icon: House },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideRail() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-rule bg-surface px-5 py-8 lg:flex">
      <Link href="/" className="block px-2">
        <span className="block text-lg font-semibold tracking-[-0.02em]">
          Budget Tracker
        </span>
        <span className="mt-0.5 block text-xs text-muted">On this device</span>
      </Link>

      <nav aria-label="Primary" className="mt-10">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-[4px] px-3 text-sm transition-colors duration-150 ${
                    active
                      ? "bg-accent/10 font-medium text-accent"
                      : "text-muted hover:bg-paper hover:text-ink"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Link
        href="/transactions/new"
        className={buttonClass("primary", "md", "mt-8 w-full")}
      >
        <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
        Add transaction
      </Link>

      <p className="mt-auto border-t border-rule pt-4 text-xs leading-5 text-muted">
        Your data is stored in this browser.
      </p>
    </aside>
  );
}
