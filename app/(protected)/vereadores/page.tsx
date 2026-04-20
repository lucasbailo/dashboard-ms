import { VereadoresFilters } from "@/components/filters/vereadores-filters";
import { VereadoresSplitView } from "@/components/vereadores/split-view";
import { listMunicipios, listVotacao } from "@/lib/queries/votacao";

type SearchParams = {
  municipio?: string;
  distancia?: string;
  votosMax?: string;
};

export default async function VereadoresPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const municipio = searchParams.municipio;
  const distanciaMax = searchParams.distancia
    ? Number.parseInt(searchParams.distancia, 10)
    : undefined;
  const votosMax = searchParams.votosMax
    ? Number.parseInt(searchParams.votosMax, 10)
    : undefined;

  const [municipios, vereadores] = await Promise.all([
    listMunicipios(),
    listVotacao({
      municipio,
      distanciaMax,
      votosMax,
      cargo: "Vereador",
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vereadores</h1>
        <p className="text-sm text-muted-foreground">
          {vereadores.length} candidato(s) — clique em uma linha para ver detalhes
        </p>
      </div>

      <VereadoresFilters municipios={municipios} />

      <VereadoresSplitView vereadores={vereadores} />
    </div>
  );
}
