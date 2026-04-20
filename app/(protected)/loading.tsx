export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Cabeçalho skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted/70" />
      </div>

      {/* Filtros skeleton */}
      <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-4">
        <div className="h-14 animate-pulse rounded-md bg-muted" />
        <div className="h-14 animate-pulse rounded-md bg-muted" />
        <div className="h-14 animate-pulse rounded-md bg-muted" />
        <div className="h-14 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Conteúdo skeleton (cards / gráficos) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[420px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[420px] animate-pulse rounded-xl border bg-card" />
      </div>

      {/* Barra sutil no topo indicando navegação */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden">
        <div className="h-full w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-primary" />
      </div>

      <style>{`
        @keyframes progress {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(250%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
