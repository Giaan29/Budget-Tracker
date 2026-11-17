"use client";

import { ArrowLeftRight, House, Plus, Settings, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Overview", icon: House },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function BottomNav() {
  const pathname = usePathname();
  const [overview, transactions, budgets, settings] = items;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-surface pb-safe lg:hidden"
    >
      <ul className="mx-auto grid max-w-[560px] grid-cols-5 items-end px-1">
        <NavItem item={overview} active={isActive(pathname, overview.href)} />
        <NavItem
          item={transactions}
          active={isActive(pathname, transactions.href)}
        />
        <li className="flex justify-center">
          <Link
            href="/transactions/new"
            className="flex min-h-14 flex-col items-center justify-center gap-1 px-2 pt-1"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[6px] bg-accent text-white transition-colors duration-150 hover:bg-accent-strong">
              <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-[0.7rem] font-medium text-accent">Add</span>
          </Link>
        </li>
        <NavItem item={budgets} active={isActive(pathname, budgets.href)} />
        <NavItem item={settings} active={isActive(pathname, settings.href)} />
      </ul>
    </nav>
  );
}

function NavItem({
  item,
  active,
}: {
  item: (typeof items)[number];
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 pb-1 pt-2 text-[0.7rem] transition-colors duration-150 ${
          active ? "font-medium text-accent" : "text-muted hover:text-ink"
        }`}
      >
        <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
        <span>{item.label}</span>
      </Link>
    </li>
  );
}
