"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function NavLink({ href, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isActive = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={(e) => {
        if (pathname === href) return;
        e.preventDefault();
        startTransition(() => router.push(href));
      }}
      className={cn(
        "relative inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        isPending && "opacity-60"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
      {isPending && (
        <span
          className="ml-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
    </Link>
  );
}
