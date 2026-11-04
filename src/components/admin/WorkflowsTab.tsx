import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, fmt, thead, trow } from "@/components/budget/ui";
import { useAdmin } from "@/lib/admin/store";
import { operationLabel, type ValidationRequest } from "@/lib/admin/model";
import { EmptyState, Tag, ValidationStatusBadge, fmtDate, fmtDateTime } from "./ui";

const ACTOR = "Karim Idrissi"; // valideur de démonstration (DAF)

export function WorkflowsTab() {
  const { workflows, requests, roles, upsertWorkflow, transitionRequest } = useAdmin();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [motif, setMotif] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const roleName = (id?: string) => (id ? roles.find((r) => r.id === id)?.name ?? id : "—");
  const pending = requests.filter((r) => r.status === "en_attente" || r.status === "en_cours");
  const done = requests.filter((r) => r.status === "valide" || r.status === "rejete" || r.status === "annule");

  const act = (r: ValidationRequest, to: "en_cours" | "valide" | "en_attente", note?: string) => {
    const ok = transitionRequest(r.id, to, ACTOR, note);
    if (ok) toast.success(to === "valide" ? `${r.ref} validée` : to === "en_cours" ? `${r.ref} prise en charge` : `Correction demandée pour ${r.ref}`);
    else toast.error("Transition non autorisée pour ce statut.");
  };

  const reject = (r: ValidationRequest) => {
    if (!motif.trim()) return toast.error("Le motif du rejet est obligatoire.");
    if (transitionRequest(r.id, "rejete", ACTOR, motif.trim())) {
      toast.success(`${r.ref} rejetée`);
      setRejecting(null);
      setMotif("");
    }
  };

  const Row = ({ r }: { r: ValidationRequest }) => {
    const wf = workflows.find((w) => w.id === r.workflowId);
    const open = expanded === r.id;
    return (
      <>
        <tr className={trow}>
          <td className="py-2.5 pr-3">
            <p className="font-semibold text-foreground">{r.ref}</p>
            <p className="text-xs text-muted-foreground">{wf ? operationLabel(wf.type) : "—"}</p>
          </td>
          <td className="py-2.5 pr-3 text-foreground">{r.objet}</td>
          <td className="py-2.5 pr-3 text-right font-semibold text-foreground">{fmt(r.montant)}</td>
          <td className="py-2.5 pr-3 text-muted-foreground">{r.demandeur}</td>
          <td className="py-2.5 pr-3 text-muted-foreground">{fmtDate(r.createdAt)}</td>
          <td className="py-2.5 pr-3"><ValidationStatusBadge status={r.status} /></td>
          <td className="py-2.5">
            <div className="flex items-center justify-end gap-1">
              {r.status === "en_attente" && (
                <Btn variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => act(r, "en_cours")}>Prendre en charge</Btn>
              )}
              {r.status === "en_cours" && (
                <>
                  <button title="Valider" onClick={() => act(r, "valide")} className="rounded-md p-1.5 text-success hover:bg-success-soft"><Check className="h-4 w-4" /></button>
                  <button title="Rejeter" onClick={() => { setRejecting(r.id); setMotif(""); }} className="rounded-md p-1.5 text-destructive hover:bg-destructive-soft"><X className="h-4 w-4" /></button>
                  <button title="Demander une correction" onClick={() => act(r, "en_attente", "Correction demandée par le valideur")} className="rounded-md p-1.5 text-warning hover:bg-warning-soft"><Undo2 className="h-4 w-4" /></button>
                </>
              )}
              <button title="Historique" onClick={() => setExpanded(open ? null : r.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </td>
        </tr>
        {rejecting === r.id && (
          <tr className="border-b border-border bg-destructive-soft/40">
            <td colSpan={7} className="px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Motif du rejet (obligatoire)…"
                  className="h-9 min-w-64 flex-1 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:border-ring"
                />
                <Btn variant="danger" onClick={() => reject(r)}>Confirmer le rejet</Btn>
                <Btn variant="ghost" onClick={() => setRejecting(null)}>Annuler</Btn>
              </div>
            </td>
          </tr>
        )}
        {open && (
          <tr className="border-b border-border bg-muted/30">
            <td colSpan={7} className="px-3 py-3">
              <ul className="space-y-1.5 text-xs">
                {r.history.map((h, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-2">
                    <span className="font-semibold text-foreground">{h.action}</span>
                    <span className="text-muted-foreground">par {h.actor} · {fmtDateTime(h.at)}</span>
                    {h.note && <Tag tone="warn">{h.note}</Tag>}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        )}
      </>
    );
  };

  const Table = ({ list }: { list: ValidationRequest[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead className={thead}>
          <tr>
            <th className="py-2.5 pr-3 font-medium">Référence</th>
            <th className="py-2.5 pr-3 font-medium">Objet</th>
            <th className="py-2.5 pr-3 font-medium text-right">Montant</th>
            <th className="py-2.5 pr-3 font-medium">Demandeur</th>
            <th className="py-2.5 pr-3 font-medium">Soumise le</th>
            <th className="py-2.5 pr-3 font-medium">Statut</th>
            <th className="py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>{list.map((r) => <Row key={r.id} r={r} />)}</tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-5">
      <Panel title="Circuits de validation" subtitle="Configuration des approbations par type d'opération">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className={thead}>
              <tr>
                <th className="py-2.5 pr-3 font-medium">Type d'opération</th>
                <th className="py-2.5 pr-3 font-medium">Initiateur</th>
                <th className="py-2.5 pr-3 font-medium">1er valideur</th>
                <th className="py-2.5 pr-3 font-medium">2e valideur</th>
                <th className="py-2.5 pr-3 font-medium text-right">Seuil</th>
                <th className="py-2.5 pr-3 font-medium text-right">Délai</th>
                <th className="py-2.5 font-medium text-right">Actif</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((w) => (
                <tr key={w.id} className={trow}>
                  <td className="py-2.5 pr-3 font-medium text-foreground">{operationLabel(w.type)}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{roleName(w.initiateurRole)}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{roleName(w.valideur1Role)}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{roleName(w.valideur2Role)}</td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground">{w.seuil ? fmt(w.seuil) : "—"}</td>
                  <td className="py-2.5 pr-3 text-right text-muted-foreground">{w.delaiJours} j</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => { upsertWorkflow({ ...w, actif: !w.actif }); toast.success(`Circuit ${w.actif ? "désactivé" : "activé"}`); }}
                      className="inline-flex"
                    >
                      <Tag tone={w.actif ? "good" : "neutral"}>{w.actif ? "Actif" : "Inactif"}</Tag>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Au-delà du seuil financier, le second valideur est requis. Les validations ci-dessous agissent réellement sur les statuts et alimentent le journal d'activité.
        </p>
      </Panel>

      <Panel title="Validations en attente" subtitle={`${pending.length} demande${pending.length > 1 ? "s" : ""} à traiter`}>
        {pending.length === 0 ? <EmptyState message="Aucune validation en attente." /> : <Table list={pending} />}
      </Panel>

      <Panel title="Historique des validations" subtitle="Demandes clôturées">
        {done.length === 0 ? <EmptyState message="Aucune validation clôturée." /> : <Table list={done} />}
      </Panel>
    </div>
  );
}
