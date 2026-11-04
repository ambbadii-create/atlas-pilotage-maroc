import { useMemo, useState } from "react";
import { Pause, Pencil, Play, Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/app/ui-bits";
import { Btn, Field, Select, thead, trow } from "@/components/budget/ui";
import { useAdmin, uid } from "@/lib/admin/store";
import { isValidEmail, userFullName, type User, type UserStatus } from "@/lib/admin/model";
import { EmptyState, Modal, Tag, UserStatusBadge, fmtDate, fmtDateTime } from "./ui";

const empty: Omit<User, "id"> = {
  firstName: "", lastName: "", email: "", phone: "", fonction: "",
  departmentId: "", roleId: "standard", establishmentId: "", createdAt: "", status: "actif",
};

export function UsersTab() {
  const { users, roles, departments, establishments, events, upsertUser, setUserStatus } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<User | null>(null);
  const [detail, setDetail] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, "id">>(empty);
  const [error, setError] = useState("");

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? "—";
  const deptName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (status !== "all" && u.status !== status) return false;
        const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.fonction}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [users, q, status],
  );

  const openNew = () => {
    setForm({ ...empty, departmentId: departments[0]?.id ?? "", establishmentId: establishments[0]?.id ?? "", createdAt: new Date().toISOString().slice(0, 10) });
    setEditing(null);
    setError("");
  };
  const openEdit = (u: User) => {
    const { id: _id, ...rest } = u;
    setForm(rest);
    setEditing(u);
    setError("");
  };
  const save = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return setError("Le nom et le prénom sont obligatoires.");
    if (!isValidEmail(form.email)) return setError("Adresse e-mail invalide.");
    upsertUser({ ...form, id: editing?.id ?? uid("U") });
    toast.success(editing ? "Utilisateur modifié" : "Utilisateur créé", {
      description: editing ? undefined : "L'invitation par e-mail nécessite un service de messagerie configuré (non disponible en démonstration).",
    });
    setEditing(null);
    setForm(empty);
  };

  const cycle = (u: User, s: UserStatus) => {
    setUserStatus(u.id, s);
    toast.success(`Compte ${s === "actif" ? "activé" : s === "suspendu" ? "suspendu" : "désactivé"}`);
  };

  const modalOpen = editing !== null || form !== empty;
  const closeModal = () => { setEditing(null); setForm(empty); };

  return (
    <div className="space-y-5">
      <Panel
        title="Comptes utilisateurs"
        subtitle={`${filtered.length} utilisateur${filtered.length > 1 ? "s" : ""}`}
        action={<Btn onClick={openNew}><Plus className="h-4 w-4" />Ajouter un utilisateur</Btn>}
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground sm:max-w-xs">
            <Search className="h-4 w-4" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un nom, un e-mail…" className="w-full bg-transparent outline-none" />
          </label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            <option value="all">Tous les statuts</option>
            <option value="actif">Actifs</option>
            <option value="inactif">Inactifs</option>
            <option value="suspendu">Suspendus</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState message="Aucun utilisateur ne correspond à votre recherche." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className={thead}>
                <tr>
                  <th className="py-2.5 pr-3 font-medium">Utilisateur</th>
                  <th className="py-2.5 pr-3 font-medium">Fonction</th>
                  <th className="py-2.5 pr-3 font-medium">Département</th>
                  <th className="py-2.5 pr-3 font-medium">Rôle</th>
                  <th className="py-2.5 pr-3 font-medium">Dernière connexion</th>
                  <th className="py-2.5 pr-3 font-medium">Statut</th>
                  <th className="py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className={trow}>
                    <td className="py-2.5 pr-3">
                      <button onClick={() => setDetail(u)} className="text-left">
                        <p className="font-semibold text-foreground hover:text-primary">{userFullName(u)}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </button>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{u.fonction}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{deptName(u.departmentId)}</td>
                    <td className="py-2.5 pr-3"><Tag tone="info">{roleName(u.roleId)}</Tag></td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "Jamais"}</td>
                    <td className="py-2.5 pr-3"><UserStatusBadge status={u.status} /></td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-1">
                        <button title="Modifier" onClick={() => openEdit(u)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                        {u.status !== "actif" ? (
                          <button title="Activer" onClick={() => cycle(u, "actif")} className="rounded-md p-1.5 text-success hover:bg-success-soft"><Play className="h-4 w-4" /></button>
                        ) : (
                          <button title="Suspendre" onClick={() => cycle(u, "suspendu")} className="rounded-md p-1.5 text-destructive hover:bg-destructive-soft"><Pause className="h-4 w-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? `Modifier — ${userFullName(editing)}` : "Nouvel utilisateur"} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Prénom *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <Field label="Nom *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <Field label="E-mail professionnel *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Téléphone (facultatif)" value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label="Fonction" value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })} />
          <Select label="Département" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select label="Rôle" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <Select label="Établissement" value={form.establishmentId} onChange={(e) => setForm({ ...form, establishmentId: e.target.value })}>
            {establishments.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </Select>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Aucun mot de passe n'est saisi ni stocké ici : la création de l'accès passe par une invitation sécurisée (nécessite l'authentification de Lovable Cloud).
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={closeModal}>Annuler</Btn>
          <Btn onClick={save}>{editing ? "Enregistrer" : "Créer le compte"}</Btn>
        </div>
      </Modal>

      <Modal open={detail !== null} onClose={() => setDetail(null)} title={detail ? userFullName(detail) : ""} wide>
        {detail && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {detail.firstName[0]}{detail.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-foreground">{detail.fonction}</p>
                <p className="text-muted-foreground">{detail.email}{detail.phone ? ` · ${detail.phone}` : ""}</p>
              </div>
              <div className="ml-auto"><UserStatusBadge status={detail.status} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Département" value={deptName(detail.departmentId)} />
              <Info label="Rôle" value={roleName(detail.roleId)} />
              <Info label="Établissement" value={establishments.find((e) => e.id === detail.establishmentId)?.name ?? "—"} />
              <Info label="Responsable hiérarchique" value={detail.managerId ? userFullName(users.find((u) => u.id === detail.managerId)!) : "—"} />
              <Info label="Compte créé le" value={fmtDate(detail.createdAt)} />
              <Info label="Dernière connexion" value={detail.lastLoginAt ? fmtDateTime(detail.lastLoginAt) : "Jamais connecté"} />
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><UserRound className="h-3.5 w-3.5" />Historique d'activité</p>
              <ul className="space-y-2">
                {events.filter((e) => e.user === userFullName(detail)).slice(0, 5).map((e) => (
                  <li key={e.id} className="flex justify-between gap-3 text-xs">
                    <span className="text-foreground">{e.action}</span>
                    <span className="shrink-0 text-muted-foreground">{fmtDateTime(e.at)}</span>
                  </li>
                ))}
                {events.filter((e) => e.user === userFullName(detail)).length === 0 && (
                  <li className="text-xs text-muted-foreground">Aucun événement enregistré pour cet utilisateur.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium text-foreground">{value}</p>
    </div>
  );
}
