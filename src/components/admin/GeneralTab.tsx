import { useState } from "react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, Select } from "@/components/budget/ui";
import { useAdmin } from "@/lib/admin/store";
import type { GeneralSettings } from "@/lib/admin/model";

export function GeneralTab() {
  const { general, updateGeneral } = useAdmin();
  const [form, setForm] = useState<GeneralSettings>(general);

  const save = () => {
    updateGeneral(form);
    toast.success("Paramètres généraux enregistrés");
  };

  return (
    <div className="space-y-5">
      <Panel title="Paramètres de l'application" subtitle="Configuration générale de l'ERP" action={<Btn onClick={save}>Enregistrer</Btn>}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Nom de l'application" value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} />
          <Select label="Langue" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as GeneralSettings["language"] })}>
            <option value="fr">Français</option>
            <option value="ar">Arabe</option>
            <option value="en">Anglais</option>
          </Select>
          <Select label="Devise par défaut" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            <option value="MAD">MAD — Dirham marocain</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — Dollar américain</option>
          </Select>
          <Select label="Fuseau horaire" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
            <option value="Africa/Casablanca">Africa/Casablanca (GMT+1)</option>
            <option value="Europe/Paris">Europe/Paris</option>
            <option value="UTC">UTC</option>
          </Select>
          <Select label="Format de date" value={form.dateFormat} onChange={(e) => setForm({ ...form, dateFormat: e.target.value as GeneralSettings["dateFormat"] })}>
            <option value="JJ/MM/AAAA">JJ/MM/AAAA</option>
            <option value="AAAA-MM-JJ">AAAA-MM-JJ</option>
            <option value="MM/JJ/AAAA">MM/JJ/AAAA</option>
          </Select>
          <Select label="Décimales" value={form.decimals} onChange={(e) => setForm({ ...form, decimals: Number(e.target.value) })}>
            <option value={0}>0</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </Select>
        </div>
      </Panel>

      <Panel title="Paramètres régionaux" subtitle="Préconfiguration pour les entreprises marocaines">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Langue", "Français"],
            ["Pays", "Maroc"],
            ["Devise", "MAD (DH)"],
            ["Fuseau horaire", "Africa/Casablanca"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          L'identité visuelle globale de l'ERP (couleurs, typographie, barre latérale) n'est pas modifiable depuis cet espace.
        </p>
      </Panel>
    </div>
  );
}
