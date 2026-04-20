import Image from "next/image";
import { BarChart3, MapPin, ShieldCheck } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* LADO ESQUERDO — brand / hero */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-emerald-700 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Padrão decorativo */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 40%)",
          }}
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
            <Image
              src="/icon.png"
              alt="Brasão MS"
              width={28}
              height={28}
              className="drop-shadow"
            />
          </div>
          <span className="font-semibold tracking-wide">Dashboard Eleitoral</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
            Decisões de campanha
            <br />
            <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
              orientadas por dados.
            </span>
          </h1>
          <p className="max-w-md text-lg text-blue-100/90">
            Análise da votação de prefeitos e vereadores em Mato Grosso do Sul,
            com filtros por cidade, turno e distância de Ponta Porã.
          </p>

          <ul className="mt-8 grid gap-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <BarChart3 className="h-4 w-4" />
              </span>
              Votação por cidade, turno e candidato
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <MapPin className="h-4 w-4" />
              </span>
              Mapa interativo e distância até Ponta Porã
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
              </span>
              Gestão de equipe e gastos de campanha
            </li>
          </ul>
        </div>

        <div className="relative text-xs text-blue-100/70">
          © {new Date().getFullYear()} Dashboard Eleitoral · Ponta Porã / MS
        </div>
      </section>

      {/* LADO DIREITO — formulário */}
      <section className="relative flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-6 py-12">
        {/* Brand mobile */}
        <div className="absolute left-6 top-6 flex items-center gap-2 lg:hidden">
          <Image src="/icon.png" alt="Brasão MS" width={28} height={28} />
          <span className="text-sm font-semibold">Dashboard Eleitoral</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
            Acesso restrito à equipe autorizada.
            <br />
            Para solicitar acesso, contate o administrador.
          </p>
        </div>
      </section>
    </main>
  );
}
