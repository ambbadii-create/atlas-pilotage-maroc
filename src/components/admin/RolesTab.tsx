import { useState } from "react";
import { Copy, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, thead } from "@/components/budget/ui";
import { useAdmin } from "@/lib/admin/store";
import { MODULES, PERMISSIONS, hasPermission, type Role } from "@/lib/admin/model";
import { Modal, Tag } from "./ui";
import { cn } from "@/lib/utils";

export function RolesTab() {
  const { roles, users, upsertRole, duplicateRoleById, toggleRolePermission, resetRoles } = useAdmin();
  const [selectedId, setSelectedId] = useState(roles[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const selected: Role | undefined = roles.find((r) => r.id === selectedId) ?? roles[0];
  const userCount = (roleId: string) => users.filter((u) => u.roleId === roleId).length;

  const create = () => {
    if (!newName.trim()) return;
    upsertRole({ id: `R-${Date.now().toString(36)}`, name: newName.trim(), description: "Rôle personnalisé", standard: false, permissions: { dashboard: ["consulter"] } });
    toast.success(`Rôle « ${newName.trim()} » créé`, { description: "Ajustez ses permissions dans la matrice." });
    setCreating(false);
    setNewName("");
  };

  const duplicate = (r: Role) => {
    const name = `${r.name} (copie)`;
    duplicateRoleById(r.id, name);
    toast.success(`Rôle dupliqué sous « ${name} »`);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-warning/40 bg-warning-soft p-3 text-xs text-foreground">
        <strong>Principe du moindre privilège.</strong> En l'absence de backend, ces permissions gouvernent l'interface de démonstration.
        Le contrôle réel des accès (côté serveur, protection des URL) nécessite l'activation de Lovable Cloud.
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Panel
          title="Rôles"
          subtitle={`${roles.length} rôles`}
          action={<Btn variant="ghost" onClick={() => setCreating(true)} title="Créer un rôle personnalisé"><Plus className="h-4 w-4" />Nouveau</Btn>}
        >
          <ul className="space-y-1.5">
            {roles.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                    selected?.id === r.id ? "border-primary bg-accent" : "border-border hover:bg-muted",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.name}</span>
                    {r.standard ? <Tag tone="info">Standard</Tag> : <Tag>Personnalisé</Tag>}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{userCount(r.id)} utilisateur{userCount(r.id) > 1 ? "s" : ""}</p>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {selected && (
          <Panel
            title={selected.name}
            subtitle={selected.description}
            action={
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => duplicate(selected)}><Copy className="h-4 w-4" />Dupliquer</Btn>
                <Btn variant="ghost" onClick={() => { resetRoles(); toast.success("Rôles réinitialisés vers les paramètres standards"); }}><RotateCcw className="h-4 w-4" />Réinitialiser</Btn>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className={thead}>
                  <tr>
                    <th className="py-2.5 pr-3 font-medium">Module</th>
                    {PERMISSIONS.map((p) => (
                      <th key={p.id} className="py-2.5 px-2 text-center font-medium">{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => (
                    <tr key={m.id} className="border-b border-border last:border-0">
                      <td className="py-2 pr-3 font-medium text-foreground">{m.label}</td>
                      {PERMISSIONS.map((p) => {
                        const on = hasPermission(selected, m.id, p.id);
                        return (
                          <td key={p.id} className="px-2 py-2 text-center">
                            <button
                              onClick={() => toggleRolePermission(selected.id, m.id, p.id)}
                              aria-label={`${p.label} — ${m.label}`}
                              className={cn(
                                "inline-grid h-6 w-6 place-items-center rounded-md border transition-colors",
                                on ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-transparent hover:border-primary/50",
                              )}
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Les validations comptables, les paiements, les paramètres financiers et les suppressions sensibles doivent rester réservés aux rôles habilités.
            </p>
          </Panel>
        )}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Nouveau rôle personnalisé">
        <Field label="Nom du rôle *" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex. Auditeur interne" />
        <p className="mt-2 text-xs text-muted-foreground">Le rôle est créé avec la seule consultation du tableau de bord ; ajoutez ensuite ses permissions.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setCreating(false)}>Annuler</Btn>
          <Btn onClick={create} disabled={!newName.trim()}>Créer le rôle</Btn>
        </div>
      </Modal>
    </div>
  );
}
