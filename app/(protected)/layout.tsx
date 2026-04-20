import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";
import { NavLink } from "@/components/nav-link";

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
            <NavLink href="/dashboard">Painel</NavLink>
            <NavLink href="/vereadores">Vereadores</NavLink>
            <NavLink href="/equipe">Equipe</NavLink>
            <NavLink href="/gastos">Gastos</NavLink>
            <NavLink href="/relatorios">Relatórios</NavLink>
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
