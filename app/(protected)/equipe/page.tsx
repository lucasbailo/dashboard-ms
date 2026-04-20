import { EquipeTable } from "@/components/equipe/equipe-table";
import { listEquipe } from "@/lib/queries/equipe";

export default async function EquipePage() {
  const items = await listEquipe();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Assessores e Coordenadores de campanha
        </p>
      </div>
      <EquipeTable items={items} />
    </div>
  );
}
