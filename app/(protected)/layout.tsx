import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-1.5 hover:bg-accent"
            >
              Painel
            </Link>
            <Link
              href="/vereadores"
              className="rounded-md px-3 py-1.5 hover:bg-accent"
            >
              Vereadores
            </Link>
            <Link
              href="/equipe"
              className="rounded-md px-3 py-1.5 hover:bg-accent"
            >
              Equipe
            </Link>
            <Link
              href="/gastos"
              className="rounded-md px-3 py-1.5 hover:bg-accent"
            >
              Gastos
            </Link>
            <Link
              href="/relatorios"
              className="rounded-md px-3 py-1.5 hover:bg-accent"
            >
              Relatórios
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground md:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
}
