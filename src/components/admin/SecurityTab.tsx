import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, Select, thead, trow } from "@/components/budget/ui";
import { useAdmin } from "@/lib/admin/store";
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/admin/model";
import { EmptyState, Tag, Toggle, fmtDateTime } from "./ui";

export function SecurityTab() {
  const { events, security, updateSecurity } = useAdmin();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [result, setResult] = useState("all");
  const [form, setForm] = useState(security);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (type !== "all" && e.type !== type) return false;
        if (result !== "all" && e.result !== result) return false;
        const hay = `${e.user} ${e.action} ${e.module}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [events, q, type, result],
  );

  const save = () => {
    updateSecurity(form);
    toast.success("Politique de sécurité enregistrée");
  };

  return (
    <div className="space-y-5">
      <Panel title="Journal d'activité" subtitle={`${filtered.length} événement${filtered.length > 1 ? "s" : ""} — traçabilité des opérations sensibles`}>
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground sm:max-w-xs">
            <Search className="h-4 w-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un utilisateur, une action…" className="w-full bg-transparent outline-none" />
          </label>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="w-44">
            <option value="all">Tous les types</option>
            {ACTIVITY_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>
          <Select value={result} onChange={(e) => setResult(e.target.value)} className="w-36">
            <option value="all">Tous résultats</option>
            <option value="succes">Succès</option>
            <option value="echec">Échec</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="Aucun événement ne correspond à vos filtres." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className={thead}>
                <tr>
                  <th className="py-2.5 pr-3 font-medium">Date & heure</th>
                  <th className="py-2.5 pr-3 font-medium">Utilisateur</th>
                  <th className="py-2.5 pr-3 font-medium">Action</th>
                  <th className="py-2.5 pr-3 font-medium">Module</th>
                  <th className="py-2.5 pr-3 font-medium">Type</th>
                  <th className="py-2.5 font-medium text-right">Résultat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className={trow}>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">{fmtDateTime(e.at)}</td>
                    <td className="py-2.5 pr-3 text-foreground">{e.user}</td>
                    <td className="py-2.5 pr-3 text-foreground">{e.action}{e.detail && <span className="block text-xs text-muted-foreground">{e.detail}</span>}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{e.module}</td>
                    <td className="py-2.5 pr-3"><Tag tone="info">{ACTIVITY_TYPES.find((t) => t.id === (e.type as ActivityType))?.label ?? e.type}</Tag></td>
                    <td className="py-2.5 text-right"><Tag tone={e.result === "succes" ? "good" : "bad"}>{e.result === "succes" ? "Succès" : "Échec"}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Le journal n'affiche jamais de mot de passe, secret ou information d'authentification. En production, il sera stocké côté serveur, à l'abri des modifications.
        </p>
      </Panel>

      <Panel title="Sécurité des accès" subtitle="Politique de sessions et d'authentification" action={<Btn onClick={save}>Enregistrer</Btn>}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Select label="Expiration de session" value={form.sessionMinutes} onChange={(e) => setForm({ ...form, sessionMinutes: Number(e.target.value) })}>
            <option value={60}>1 heure</option>
            <option value={480}>8 heures</option>
            <option value={1440}>24 heures</option>
          </Select>
          <Select label="Tentatives de connexion max." value={form.maxLoginAttempts} onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })}>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </Select>
          <Field label="Longueur min. du mot de passe" type="number" value={form.passwordMinLength} onChange={(e) => setForm({ ...form, passwordMinLength: Number(e.target.value) || 8 })} />
          <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
            <span className="font-medium text-foreground">Authentification multifacteur</span>
            <Toggle checked={form.mfa} onChange={(v) => setForm({ ...form, mfa: v })} label="Activer la MFA" />
          </label>
        </div>
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Ces règles décrivent la politique cible. Leur application réelle (sessions, blocage de comptes, MFA) dépend du fournisseur
          d'authentification et sera effective avec Lovable Cloud.
        </p>
      </Panel>
    </div>
  );
}
