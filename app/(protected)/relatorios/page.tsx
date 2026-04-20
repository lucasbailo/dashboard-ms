import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { EquipeTable } from "@/components/equipe/equipe-table";
import { GastosTable } from "@/components/gastos/gastos-table";
import { listEquipe } from "@/lib/queries/equipe";
import { listGastos } from "@/lib/queries/gastos";

export default async function RelatoriosPage() {
  const [equipe, gastos] = await Promise.all([listEquipe(), listGastos()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Painéis consolidados de equipe e gastos de campanha
        </p>
      </div>

      <Tabs defaultValue="equipe">
        <TabsList>
          <TabsTrigger value="equipe">Equipe ({equipe.length})</TabsTrigger>
          <TabsTrigger value="gastos">Gastos ({gastos.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="equipe" className="mt-6">
          <EquipeTable items={equipe} />
        </TabsContent>
        <TabsContent value="gastos" className="mt-6">
          <GastosTable items={gastos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
