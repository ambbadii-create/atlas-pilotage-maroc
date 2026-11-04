import { Globe, Puzzle } from "lucide-react";
import { Panel } from "@/components/app/ui-bits";
import { useAdmin } from "@/lib/admin/store";
import { IntegrationStatusBadge, fmtDateTime } from "./ui";

export function IntegrationsTab() {
  const { integrations } = useAdmin();
  const internes = integrations.filter((i) => i.kind === "interne");
  const externes = integrations.filter((i) => i.kind === "externe");

  return (
    <div className="space-y-5">
      <Panel title="Modules internes" subtitle="Connexions entre Administration et les modules de l'ERP">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {internes.map((i) => (
            <div key={i.id} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Puzzle className="h-4 w-4 text-muted-foreground" />{i.name}
                </p>
                <IntegrationStatusBadge status={i.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{i.detail}</p>
              {i.lastSync && <p className="mt-2 text-[11px] text-muted-foreground">Dernière synchronisation : {fmtDateTime(i.lastSync)}</p>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Services externes" subtitle="Architecture extensible — aucune connexion externe n'est configurée à ce jour">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {externes.map((i) => (
            <div key={i.id} className="rounded-lg border border-dashed border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Globe className="h-4 w-4 text-muted-foreground" />{i.name}
                </p>
                <IntegrationStatusBadge status={i.status} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{i.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          Aucune intégration n'est affichée comme active sans configuration réelle. Les clés API et secrets ne sont jamais stockés ni exposés dans le navigateur :
          ils seront gérés côté serveur via les secrets de Lovable Cloud.
        </p>
      </Panel>
    </div>
  );
}
