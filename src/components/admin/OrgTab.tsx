import { useState } from "react";
import { Network, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, Select, thead, trow } from "@/components/budget/ui";
import { useAdmin, uid } from "@/lib/admin/store";
import { canDeleteDepartment, departmentBlockers, userFullName, type Department } from "@/lib/admin/model";
import { Modal, Tag } from "./ui";

export function OrgTab() {
  const { departments, users, upsertDepartment, deleteDepartment } = useAdmin();
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<Omit<Department, "id"> | null>(null);

  const managerName = (id?: string) => (id ? userFullName(users.find((u) => u.id === id) ?? ({ firstName: "—", lastName: "" } as never)) : "—");
  const userCount = (id: string) => users.filter((u) => u.departmentId === id).length;

  const openNew = () => { setEditing(null); setForm({ name: "", parentId: undefined, managerId: undefined, costCenter: "" }); };
  const openEdit = (d: Department) => { const { id: _i, ...rest } = d; setForm(rest); setEditing(d); };
  const close = () => { setEditing(null); setForm(null); };

  const save = () => {
    if (!form?.name.trim()) return toast.error("Le nom du département est obligatoire.");
    upsertDepartment({ ...form, id: editing?.id ?? uid("D") });
    toast.success(editing ? "Département modifié" : "Département créé");
    close();
  };

  const remove = (d: Department) => {
    if (!canDeleteDepartment(d.id, users, departments)) {
      toast.error(`Suppression impossible : ${departmentBlockers(d.id, users, departments).join(" et ")}.`);
      return;
    }
    deleteDepartment(d.id);
    toast.success("Département supprimé");
  };

  const roots = departments.filter((d) => !d.parentId);
  const childrenOf = (id: string) => departments.filter((d) => d.parentId === id);

  const OrgNode = ({ d, depth }: { d: Department; depth: number }) => (
    <li>
      <div className="inline-flex min-w-52 flex-col rounded-lg border border-border bg-card px-4 py-2.5 shadow-sm">
        <span className="text-sm font-semibold text-foreground">{d.name}</span>
        <span className="text-xs text-muted-foreground">{managerName(d.managerId)} · {userCount(d.id)} collaborateur{userCount(d.id) > 1 ? "s" : ""}</span>
      </div>
      {childrenOf(d.id).length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3 border-l-2 border-border pl-4">
          {childrenOf(d.id).map((c) => <OrgNode key={c.id} d={c} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );

  return (
    <div className="space-y-5">
      <Panel
        title="Départements"
        subtitle="Structure organisationnelle et centres de coûts associés"
        action={<Btn onClick={openNew}><Plus className="h-4 w-4" />Nouveau département</Btn>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className={thead}>
              <tr>
                <th className="py-2.5 pr-3 font-medium">Département</th>
                <th className="py-2.5 pr-3 font-medium">Rattachement</th>
                <th className="py-2.5 pr-3 font-medium">Responsable</th>
                <th className="py-2.5 pr-3 font-medium">Centre de coûts</th>
                <th className="py-2.5 pr-3 font-medium">Utilisateurs</th>
                <th className="py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className={trow}>
                  <td className="py-2.5 pr-3 font-semibold text-foreground">{d.name}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{d.parentId ? departments.find((x) => x.id === d.parentId)?.name : "—"}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{managerName(d.managerId)}</td>
                  <td className="py-2.5 pr-3">{d.costCenter ? <Tag tone="info">{d.costCenter}</Tag> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{userCount(d.id)}</td>
                  <td className="py-2.5">
                    <div className="flex justify-end gap-1">
                      <button title="Modifier" onClick={() => openEdit(d)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                      <button title="Supprimer" onClick={() => remove(d)} className="rounded-md p-1.5 text-destructive hover:bg-destructive-soft"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Un département ne peut être supprimé que s'il n'a ni utilisateur affecté ni sous-département rattaché.
        </p>
      </Panel>

      <Panel title="Organigramme" subtitle="Hiérarchie de l'organisation" action={<Network className="h-4 w-4 text-muted-foreground" />}>
        <div className="overflow-x-auto pb-2">
          <ul className="flex gap-3">
            {roots.map((d) => <OrgNode key={d.id} d={d} depth={0} />)}
          </ul>
        </div>
      </Panel>

      <Modal open={form !== null} onClose={close} title={editing ? "Modifier le département" : "Nouveau département"}>
        {form && (
          <div className="grid gap-4">
            <Field label="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select label="Rattachement hiérarchique" value={form.parentId ?? ""} onChange={(e) => setForm({ ...form, parentId: e.target.value || undefined })}>
              <option value="">Aucun (niveau racine)</option>
              {departments.filter((d) => d.id !== editing?.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
            <Select label="Responsable" value={form.managerId ?? ""} onChange={(e) => setForm({ ...form, managerId: e.target.value || undefined })}>
              <option value="">Aucun</option>
              {users.map((u) => <option key={u.id} value={u.id}>{userFullName(u)}</option>)}
            </Select>
            <Field label="Centre de coûts (facultatif)" value={form.costCenter ?? ""} onChange={(e) => setForm({ ...form, costCenter: e.target.value })} placeholder="Ex. CC-LOG" />
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={close}>Annuler</Btn>
              <Btn onClick={save}>{editing ? "Enregistrer" : "Créer"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
