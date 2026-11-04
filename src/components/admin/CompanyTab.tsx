import { useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, Select, thead, trow } from "@/components/budget/ui";
import { useAdmin, uid } from "@/lib/admin/store";
import { ESTABLISHMENT_TYPES, type Establishment, type EstablishmentType } from "@/lib/admin/model";
import { Modal, Tag } from "./ui";

const typeLabel = (t: EstablishmentType) => ESTABLISHMENT_TYPES.find((x) => x.id === t)?.label ?? t;

export function CompanyTab() {
  const { companies, establishments, users, upsertCompany, upsertEstablishment, deleteEstablishment } = useAdmin();
  const company = companies[0];
  const [form, setForm] = useState(company);
  const [editing, setEditing] = useState<Establishment | null>(null);
  const [eForm, setEForm] = useState<Omit<Establishment, "id" | "companyId">>({ name: "", type: "agence", adresse: "", ville: "", responsable: "" });

  if (!company) return null;

  const saveCompany = () => {
    upsertCompany(form);
    toast.success("Informations de l'entreprise enregistrées");
  };

  const openNew = () => { setEditing(null); setEForm({ name: "", type: "agence", adresse: "", ville: "", responsable: "" }); };
  const openEdit = (e: Establishment) => { const { id: _i, companyId: _c, ...rest } = e; setEForm(rest); setEditing(e); };
  const saveEst = () => {
    if (!eForm.name.trim()) return toast.error("Le nom de l'établissement est obligatoire.");
    upsertEstablishment({ ...eForm, id: editing?.id ?? uid("E"), companyId: company.id });
    toast.success(editing ? "Établissement modifié" : "Établissement créé");
    setEditing(null);
  };

  return (
    <div className="space-y-5">
      <Panel title="Informations de l'entreprise" subtitle="Identité, coordonnées et informations légales marocaines" action={<Btn onClick={saveCompany}>Enregistrer</Btn>}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Raison sociale" value={form.raisonSociale} onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })} />
          <Field label="Nom commercial" value={form.nomCommercial} onChange={(e) => setForm({ ...form, nomCommercial: e.target.value })} />
          <Field label="Forme juridique" value={form.formeJuridique} onChange={(e) => setForm({ ...form, formeJuridique: e.target.value })} />
          <Field label="Secteur d'activité" value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })} />
          <Field label="Adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          <Field label="Ville" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} />
          <Field label="Pays" value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })} />
          <Field label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <Field label="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Site web" value={form.siteWeb ?? ""} onChange={(e) => setForm({ ...form, siteWeb: e.target.value })} />
        </div>

        <h3 className="mt-6 mb-3 text-sm font-bold text-foreground">Informations légales — Maroc</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="ICE" value={form.ice} onChange={(e) => setForm({ ...form, ice: e.target.value })} />
          <Field label="Identifiant fiscal (IF)" value={form.identifiantFiscal} onChange={(e) => setForm({ ...form, identifiantFiscal: e.target.value })} />
          <Field label="Registre de commerce (RC)" value={form.registreCommerce} onChange={(e) => setForm({ ...form, registreCommerce: e.target.value })} />
          <Field label="CNSS" value={form.cnss ?? ""} onChange={(e) => setForm({ ...form, cnss: e.target.value })} />
          <Field label="Taxe professionnelle" value={form.taxeProfessionnelle ?? ""} onChange={(e) => setForm({ ...form, taxeProfessionnelle: e.target.value })} />
        </div>

        <h3 className="mt-6 mb-3 text-sm font-bold text-foreground">Paramètres financiers</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Select label="Devise principale" value={form.devise} onChange={(e) => setForm({ ...form, devise: e.target.value })}>
            <option value="MAD">MAD — Dirham marocain</option>
            <option value="EUR">EUR — Euro</option>
            <option value="USD">USD — Dollar américain</option>
          </Select>
          <Field label="Début d'exercice (MM-JJ)" value={form.exerciceDebut} onChange={(e) => setForm({ ...form, exerciceDebut: e.target.value })} />
          <Field label="Fin d'exercice (MM-JJ)" value={form.exerciceFin} onChange={(e) => setForm({ ...form, exerciceFin: e.target.value })} />
        </div>
      </Panel>

      <Panel
        title="Établissements"
        subtitle={`${establishments.length} établissement${establishments.length > 1 ? "s" : ""} — les données restent isolées par entreprise`}
        action={<Btn onClick={openNew}><Plus className="h-4 w-4" />Ajouter</Btn>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className={thead}>
              <tr>
                <th className="py-2.5 pr-3 font-medium">Établissement</th>
                <th className="py-2.5 pr-3 font-medium">Type</th>
                <th className="py-2.5 pr-3 font-medium">Localisation</th>
                <th className="py-2.5 pr-3 font-medium">Responsable</th>
                <th className="py-2.5 pr-3 font-medium">Utilisateurs</th>
                <th className="py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {establishments.map((e) => (
                <tr key={e.id} className={trow}>
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2 font-semibold text-foreground"><Building2 className="h-4 w-4 text-muted-foreground" />{e.name}</span>
                  </td>
                  <td className="py-2.5 pr-3"><Tag tone="info">{typeLabel(e.type)}</Tag></td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{e.adresse}, {e.ville}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{e.responsable ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{users.filter((u) => u.establishmentId === e.id).length}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      <button title="Modifier" onClick={() => openEdit(e)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button title="Supprimer" onClick={() => { deleteEstablishment(e.id); toast.success("Établissement supprimé"); }} className="rounded-md p-1.5 text-destructive hover:bg-destructive-soft"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={editing !== null || eForm.name !== "" || undefined === undefined} onClose={() => { setEditing(null); setEForm({ name: "", type: "agence", adresse: "", ville: "", responsable: "" }); }} title={editing ? "Modifier l'établissement" : "Nouvel établissement"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom *" value={eForm.name} onChange={(e) => setEForm({ ...eForm, name: e.target.value })} className="sm:col-span-2" />
          <Select label="Type" value={eForm.type} onChange={(e) => setEForm({ ...eForm, type: e.target.value as EstablishmentType })}>
            {ESTABLISHMENT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>
          <Field label="Ville" value={eForm.ville} onChange={(e) => setEForm({ ...eForm, ville: e.target.value })} />
          <Field label="Adresse" value={eForm.adresse} onChange={(e) => setEForm({ ...eForm, adresse: e.target.value })} className="sm:col-span-2" />
          <Field label="Responsable" value={eForm.responsable ?? ""} onChange={(e) => setEForm({ ...eForm, responsable: e.target.value })} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => { setEditing(null); setEForm({ name: "", type: "agence", adresse: "", ville: "", responsable: "" }); }}>Annuler</Btn>
          <Btn onClick={saveEst}>{editing ? "Enregistrer" : "Créer"}</Btn>
        </div>
      </Modal>
    </div>
  );
}
