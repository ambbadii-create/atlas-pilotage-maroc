import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { buildDemo, type AdminState } from "./demo";
import {
  canTransition,
  duplicateRole,
  togglePermission,
  type ActivityEvent,
  type ActivityType,
  type Company,
  type Department,
  type Establishment,
  type GeneralSettings,
  type FinanceSettings,
  type ModuleId,
  type Permission,
  type Role,
  type SecuritySettings,
  type User,
  type UserStatus,
  type ValidationRequest,
  type ValidationStatus,
  type Workflow,
} from "./model";

const KEY = "pilotage-cg-admin-v1";
export const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

type Ctx = AdminState & {
  upsertUser: (u: User) => void;
  setUserStatus: (id: string, status: UserStatus) => void;
  upsertRole: (r: Role) => void;
  duplicateRoleById: (id: string, name: string) => void;
  toggleRolePermission: (roleId: string, module: ModuleId, perm: Permission) => void;
  resetRoles: () => void;
  upsertCompany: (c: Company) => void;
  upsertEstablishment: (e: Establishment) => void;
  deleteEstablishment: (id: string) => void;
  upsertDepartment: (d: Department) => void;
  deleteDepartment: (id: string) => void;
  updateGeneral: (g: GeneralSettings) => void;
  updateFinance: (f: FinanceSettings) => void;
  updateSecurity: (s: SecuritySettings) => void;
  upsertWorkflow: (w: Workflow) => void;
  transitionRequest: (id: string, to: ValidationStatus, actor: string, note?: string) => boolean;
  logEvent: (e: Omit<ActivityEvent, "id" | "at">) => void;
  reset: () => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(buildDemo);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (loaded.current) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const log = (type: ActivityType, action: string, module: string, result: "succes" | "echec" = "succes", detail?: string): ActivityEvent => ({
    id: uid("EV"),
    at: new Date().toISOString(),
    user: "Abdelmoughite Badii",
    action,
    module,
    type,
    result,
    detail,
  });
  const push = (e: ActivityEvent) => setState((s) => ({ ...s, events: [e, ...s.events].slice(0, 200) }));

  const ctx: Ctx = {
    ...state,
    logEvent: (e) => push(log(e.type, e.action, e.module, e.result, e.detail)),

    upsertUser: (u) =>
      setState((s) => {
        const exists = s.users.some((x) => x.id === u.id);
        push(log(exists ? "modification" : "creation", exists ? `Modification de l'utilisateur ${u.firstName} ${u.lastName}` : `Création de l'utilisateur ${u.firstName} ${u.lastName}`, "Utilisateurs"));
        return { ...s, users: exists ? s.users.map((x) => (x.id === u.id ? u : x)) : [...s.users, u] };
      }),
    setUserStatus: (id, status) =>
      setState((s) => {
        const u = s.users.find((x) => x.id === id);
        if (u) push(log("securite", `Compte ${u.firstName} ${u.lastName} — statut « ${status} »`, "Utilisateurs"));
        return { ...s, users: s.users.map((x) => (x.id === id ? { ...x, status } : x)) };
      }),

    upsertRole: (r) =>
      setState((s) => {
        const exists = s.roles.some((x) => x.id === r.id);
        push(log(exists ? "modification" : "creation", exists ? `Modification du rôle « ${r.name} »` : `Création du rôle « ${r.name} »`, "Rôles & Permissions"));
        return { ...s, roles: exists ? s.roles.map((x) => (x.id === r.id ? r : x)) : [...s.roles, r] };
      }),
    duplicateRoleById: (id, name) =>
      setState((s) => {
        const src = s.roles.find((x) => x.id === id);
        if (!src) return s;
        push(log("creation", `Duplication du rôle « ${src.name} » vers « ${name} »`, "Rôles & Permissions"));
        return { ...s, roles: [...s.roles, duplicateRole(src, uid("R"), name)] };
      }),
    toggleRolePermission: (roleId, module, perm) =>
      setState((s) => ({
        ...s,
        roles: s.roles.map((r) => (r.id === roleId ? togglePermission(r, module, perm) : r)),
      })),
    resetRoles: () =>
      setState((s) => {
        push(log("modification", "Réinitialisation des rôles vers les paramètres standards", "Rôles & Permissions"));
        return { ...s, roles: buildDemo().roles };
      }),

    upsertCompany: (c) =>
      setState((s) => {
        push(log("modification", `Mise à jour des informations de « ${c.raisonSociale} »`, "Entreprises"));
        return { ...s, companies: s.companies.map((x) => (x.id === c.id ? c : x)) };
      }),
    upsertEstablishment: (e) =>
      setState((s) => {
        const exists = s.establishments.some((x) => x.id === e.id);
        push(log(exists ? "modification" : "creation", exists ? `Modification de l'établissement « ${e.name} »` : `Création de l'établissement « ${e.name} »`, "Entreprises"));
        return { ...s, establishments: exists ? s.establishments.map((x) => (x.id === e.id ? e : x)) : [...s.establishments, e] };
      }),
    deleteEstablishment: (id) =>
      setState((s) => {
        const e = s.establishments.find((x) => x.id === id);
        if (e) push(log("suppression", `Suppression de l'établissement « ${e.name} »`, "Entreprises"));
        return { ...s, establishments: s.establishments.filter((x) => x.id !== id) };
      }),

    upsertDepartment: (d) =>
      setState((s) => {
        const exists = s.departments.some((x) => x.id === d.id);
        push(log(exists ? "modification" : "creation", exists ? `Modification du département « ${d.name} »` : `Création du département « ${d.name} »`, "Organisation"));
        return { ...s, departments: exists ? s.departments.map((x) => (x.id === d.id ? d : x)) : [...s.departments, d] };
      }),
    deleteDepartment: (id) =>
      setState((s) => {
        const d = s.departments.find((x) => x.id === id);
        if (d) push(log("suppression", `Suppression du département « ${d.name} »`, "Organisation"));
        return { ...s, departments: s.departments.filter((x) => x.id !== id) };
      }),

    updateGeneral: (g) =>
      setState((s) => {
        push(log("modification", "Mise à jour des paramètres généraux", "Paramètres"));
        return { ...s, general: g };
      }),
    updateFinance: (f) =>
      setState((s) => {
        push(log("modification", "Mise à jour des paramètres financiers & comptables", "Paramètres"));
        return { ...s, finance: f };
      }),
    updateSecurity: (sec) =>
      setState((s) => {
        push(log("securite", "Mise à jour de la politique de sécurité", "Sécurité"));
        return { ...s, security: sec };
      }),

    upsertWorkflow: (w) =>
      setState((s) => {
        const exists = s.workflows.some((x) => x.id === w.id);
        push(log("modification", `${exists ? "Modification" : "Création"} du circuit « ${w.type} »`, "Workflows"));
        return { ...s, workflows: exists ? s.workflows.map((x) => (x.id === w.id ? w : x)) : [...s.workflows, w] };
      }),
    transitionRequest: (id, to, actor, note) => {
      const req = state.requests.find((r) => r.id === id);
      if (!req || !canTransition(req.status, to)) return false;
      const action =
        to === "valide" ? "Validée" : to === "rejete" ? "Rejetée" : to === "en_cours" ? "Prise en charge" : to === "en_attente" ? "Correction demandée" : "Annulée";
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) =>
          r.id === id
            ? { ...r, status: to, history: [...r.history, { at: new Date().toISOString(), actor, action, note }] }
            : r,
        ),
      }));
      push(log("validation", `${action} — ${req.ref} (${req.objet})`, "Workflows", "succes", note));
      return true;
    },

    reset: () => setState(buildDemo()),
  };
  return <AdminCtx.Provider value={ctx}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin hors AdminProvider");
  return c;
}
