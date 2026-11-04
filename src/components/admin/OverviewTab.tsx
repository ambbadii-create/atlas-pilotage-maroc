import { Activity, Building2, Grid3X3, ShieldAlert, UserCheck, UserX, Users, Workflow } from "lucide-react";
import { Panel } from "@/components/app/ui-bits";
import { useAdmin } from "@/lib/admin/store";
import { IntegrationStatusBadge, Tag, fmtDateTime } from "./ui";

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string | number; sub?: string }) {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function OverviewTab() {
  const { users, roles, companies, integrations, requests, events } = useAdmin();

  const actifs = users.filter((u) => u.status === "actif").length;
  const inactifs = users.filter((u) => u.status !== "actif").length;
  const modulesActifs = integrations.filter((i) => i.kind === "interne" && i.status === "connecte").length;
  const enAttente = requests.filter((r) => r.status === "en_attente" || r.status === "en_cours").length;
  const sansRole = users.filter((u) => !roles.some((r) => r.id === u.roleId)).length;
  const echecs = events.filter((e) => e.result === "echec").length;

  const alertes: { label: string; tone: "bad" | "warn" }[] = [];
  if (inactifs > 0) alertes.push({ label: `${inactifs} compte${inactifs > 1 ? "s" : ""} inactif${inactifs > 1 ? "s" : ""} ou suspendu${inactifs > 1 ? "s" : ""}`, tone: "warn" });
  if (echecs > 0) alertes.push({ label: `${echecs} tentative${echecs > 1 ? "s" : ""} de connexion échouée${echecs > 1 ? "s" : ""} dans le journal`, tone: "bad" });
  if (sansRole > 0) alertes.push({ label: `${sansRole} utilisateur${sansRole > 1 ? "s" : ""} sans rôle attribué`, tone: "bad" });
  const integErr = integrations.filter((i) => i.status === "erreur").length;
  if (integErr > 0) alertes.push({ label: `${integErr} intégration${integErr > 1 ? "s" : ""} en erreur`, tone: "bad" });

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Users} label="Utilisateurs" value={users.length} sub={`${actifs} actifs`} />
        <Kpi icon={UserCheck} label="Utilisateurs actifs" value={actifs} />
        <Kpi icon={UserX} label="Inactifs / suspendus" value={inactifs} />
        <Kpi icon={ShieldAlert} label="Rôles configurés" value={roles.length} sub={`${roles.filter((r) => !r.standard).length} personnalisés`} />
        <Kpi icon={Building2} label="Entreprises" value={companies.length} />
        <Kpi icon={Grid3X3} label="Modules actifs" value={modulesActifs} sub="connexions internes" />
        <Kpi icon={Workflow} label="Validations en attente" value={enAttente} />
        <Kpi icon={Activity} label="Alertes administratives" value={alertes.length} />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Activité récente" subtitle="Derniers événements du journal">
          <ul className="space-y-3">
            {events.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{e.action}</p>
                  <p className="text-xs text-muted-foreground">{e.user} · {e.module}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{fmtDateTime(e.at)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="État des modules" subtitle="Connexions internes">
          <ul className="space-y-2.5">
            {integrations.filter((i) => i.kind === "interne").map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-foreground">{i.name}</span>
                <IntegrationStatusBadge status={i.status} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Alertes de sécurité" subtitle="Événements détectés dans les journaux">
          {alertes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune alerte détectée.</p>
          ) : (
            <ul className="space-y-2.5">
              {alertes.map((a) => (
                <li key={a.label} className="flex items-center gap-2 text-sm">
                  <Tag tone={a.tone}>!</Tag>
                  <span className="text-foreground">{a.label}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
