import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardFilters } from "@/components/filters/dashboard-filters";
import { BarChartVotos } from "@/components/charts/bar-chart-votos";
import { MapWrapper } from "@/components/map/map-wrapper";
import { listMunicipios, listVotacao } from "@/lib/queries/votacao";

const TOP_LIMIT = 15;

type SearchParams = {
  municipio?: string;
  turno?: string;
  distancia?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const municipio = searchParams.municipio;
  const turno = searchParams.turno
    ? Number.parseInt(searchParams.turno, 10)
    : undefined;
  const distanciaMax = searchParams.distancia
    ? Number.parseInt(searchParams.distancia, 10)
    : undefined;

  const [municipios, prefeitos, vereadores] = await Promise.all([
    listMunicipios(),
    listVotacao({ municipio, turno, distanciaMax, cargo: "Prefeito" }),
    listVotacao({ municipio, turno, distanciaMax, cargo: "Vereador" }),
  ]);

  const prefeitosTop = (municipio ? prefeitos : prefeitos.slice(0, TOP_LIMIT)).map(
    (v) => ({
      nome: v.nome_candidato,
      votos: v.votos,
      partido: v.partido,
      situacao: v.situacao,
    })
  );
  const vereadoresTop = (municipio ? vereadores : vereadores.slice(0, TOP_LIMIT)).map(
    (v) => ({
      nome: v.nome_candidato,
      votos: v.votos,
      partido: v.partido,
      situacao: v.situacao,
    })
  );

  const distanciaCidade =
    municipio != null
      ? prefeitos.find((v) => v.distancia_ponta_pora != null)?.distancia_ponta_pora ??
        vereadores.find((v) => v.distancia_ponta_pora != null)?.distancia_ponta_pora ??
        null
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel Geral</h1>
        <p className="text-sm text-muted-foreground">
          {municipio ? `Cidade: ${municipio}` : `Top ${TOP_LIMIT} em MS`}
          {turno ? ` — ${turno}º turno` : ""}
          {distanciaMax != null ? ` — até ${distanciaMax} km de Ponta Porã` : ""}
        </p>
      </div>

      <DashboardFilters
        municipios={municipios}
        distanciaMax={distanciaMax ?? 1000}
      />

      {municipio && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Distância de Ponta Porã
              </p>
              <p className="text-2xl font-bold">
                {distanciaCidade != null ? (
                  <>
                    <span className="font-mono text-primary">
                      {distanciaCidade}
                    </span>{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      km até {municipio}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground">
                    Sem dado de distância para {municipio}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prefeitos — votação</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartVotos data={prefeitosTop} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mapa</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[480px] overflow-hidden rounded-b-xl">
              <MapWrapper municipio={municipio} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vereadores — votação</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartVotos data={vereadoresTop} />
        </CardContent>
      </Card>
    </div>
  );
}
