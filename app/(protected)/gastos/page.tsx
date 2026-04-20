import { GastosTable } from "@/components/gastos/gastos-table";
import { listGastos } from "@/lib/queries/gastos";

export default async function GastosPage() {
  const items = await listGastos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gastos de campanha</h1>
        <p className="text-sm text-muted-foreground">
          Consolidado por cidade — totais calculados automaticamente
        </p>
      </div>
      <GastosTable items={items} />
    </div>
  );
}
