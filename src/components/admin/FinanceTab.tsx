import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, Select, thead, trow } from "@/components/budget/ui";
import { useAdmin, uid } from "@/lib/admin/store";
import type { TvaRate } from "@/lib/admin/model";
import { Modal, Tag, Toggle } from "./ui";

const MOYENS = ["Virement", "Chèque", "Effet de commerce", "Espèces", "Carte bancaire", "Prélèvement"];

export function FinanceTab() {
  const { finance, updateFinance } = useAdmin();
  const [addingTva, setAddingTva] = useState(false);
  const [tvaForm, setTvaForm] = useState<Omit<TvaRate, "id" | "actif">>({ label: "", rate: 20, compte: "4455" });

  const set = (patch: Partial<typeof finance>) => {
    updateFinance({ ...finance, ...patch });
    toast.success("Paramètres financiers enregistrés");
  };

  const toggleTva = (id: string) =>
    set({ tvaRates: finance.tvaRates.map((t) => (t.id === id ? { ...t, actif: !t.actif } : t)) });

  const addTva = () => {
    if (!tvaForm.label.trim() || tvaForm.rate < 0 || tvaForm.rate > 100) return toast.error("Libellé et taux (0–100) obligatoires.");
    set({ tvaRates: [...finance.tvaRates, { ...tvaForm, id: uid("TVA"), actif: true }] });
    setAddingTva(false);
    setTvaForm({ label: "", rate: 20, compte: "4455" });
  };

  const toggleMoyen = (m: string) =>
    set({ moyensPaiement: finance.moyensPaiement.includes(m) ? finance.moyensPaiement.filter((x) => x !== m) : [...finance.moyensPaiement, m] });

  return (
    <div className="space-y-5">
      <Panel title="Paramètres comptables" subtitle="Référentiel et exercice — le plan comptable marocain CGNC est pris en charge">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Select label="Référentiel comptable" value={finance.referentiel} onChange={() => set({ referentiel: "CGNC" })}>
            <option value="CGNC">CGNC — Code Général de Normalisation Comptable</option>
          </Select>
          <Field label="Début d'exercice" type="date" value={finance.exerciceDebut} onChange={(e) => set({ exerciceDebut: e.target.value })} />
          <Field label="Fin d'exercice" type="date" value={finance.exerciceFin} onChange={(e) => set({ exerciceFin: e.target.value })} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Journaux comptables</p>
          <div className="flex flex-wrap gap-2">
            {finance.journaux.map((j) => <Tag key={j} tone="info">{j}</Tag>)}
          </div>
        </div>
      </Panel>

      <Panel
        title="Paramètres fiscaux — TVA"
        subtitle="Taux configurables ; aucune règle fiscale n'est codée en dur"
        action={<Btn variant="ghost" onClick={() => setAddingTva(true)}><Plus className="h-4 w-4" />Ajouter un taux</Btn>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className={thead}>
              <tr>
                <th className="py-2.5 pr-3 font-medium">Catégorie</th>
                <th className="py-2.5 pr-3 font-medium text-right">Taux</th>
                <th className="py-2.5 pr-3 font-medium">Compte de TVA</th>
                <th className="py-2.5 font-medium text-right">Actif</th>
              </tr>
            </thead>
            <tbody>
              {finance.tvaRates.map((t) => (
                <tr key={t.id} className={trow}>
                  <td className="py-2.5 pr-3 font-medium text-foreground">{t.label}</td>
                  <td className="py-2.5 pr-3 text-right font-semibold text-foreground">{t.rate.toLocaleString("fr-FR")} %</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{t.compte} — État, TVA facturée</td>
                  <td className="py-2.5 text-right"><Toggle checked={t.actif} onChange={() => toggleTva(t.id)} label={`Activer ${t.label}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Paramètres budgétaires" subtitle="Compatibles avec le module Budgets & Prévisions">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>· Exercices budgétaires et périodes gérés dans le module Budgets & Prévisions.</li>
            <li>· Centres de coûts rattachés aux départements (rubrique Organisation).</li>
            <li>· Règles de validation définies dans la rubrique Workflows & Validations.</li>
          </ul>
        </Panel>

        <Panel title="Paramètres de trésorerie" subtitle="Seuils et moyens de paiement — la gestion des comptes bancaires reste dans le module Trésorerie">
          <Field
            label="Seuil minimum de liquidité (MAD)"
            type="number"
            value={finance.seuilLiquidite}
            onChange={(e) => set({ seuilLiquidite: Number(e.target.value) || 0 })}
          />
          <p className="mb-2 mt-4 text-xs font-medium text-muted-foreground">Moyens de paiement autorisés</p>
          <div className="flex flex-wrap gap-2">
            {MOYENS.map((m) => {
              const on = finance.moyensPaiement.includes(m);
              return (
                <button key={m} onClick={() => toggleMoyen(m)}>
                  <Tag tone={on ? "good" : "neutral"}>{m}</Tag>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <Modal open={addingTva} onClose={() => setAddingTva(false)} title="Nouveau taux de TVA">
        <div className="grid gap-4">
          <Field label="Libellé *" value={tvaForm.label} onChange={(e) => setTvaForm({ ...tvaForm, label: e.target.value })} placeholder="Ex. Taux super-réduit" />
          <Field label="Taux (%) *" type="number" value={tvaForm.rate} onChange={(e) => setTvaForm({ ...tvaForm, rate: Number(e.target.value) })} />
          <Field label="Compte de TVA" value={tvaForm.compte} onChange={(e) => setTvaForm({ ...tvaForm, compte: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Btn variant="ghost" onClick={() => setAddingTva(false)}>Annuler</Btn>
            <Btn onClick={addTva}>Ajouter</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
