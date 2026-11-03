// Administration & Paramétrage — types, référentiels et règles (purs, testables).

// ---------- Modules & permissions ----------

export type ModuleId =
  | "dashboard"
  | "budgets"
  | "stocks"
  | "achats"
  | "ventes"
  | "comptabilite"
  | "tresorerie"
  | "reporting"
  | "administration";

export const MODULES: { id: ModuleId; label: string }[] = [
  { id: "dashboard", label: "Tableau de bord" },
  { id: "budgets", label: "Budgets & Prévisions" },
  { id: "stocks", label: "Stocks & Approvisionnements" },
  { id: "achats", label: "Achats & Fournisseurs" },
  { id: "ventes", label: "Ventes & Clients" },
  { id: "comptabilite", label: "Comptabilité & Analyse financière" },
  { id: "tresorerie", label: "Trésorerie" },
  { id: "reporting", label: "Reporting" },
  { id: "administration", label: "Administration" },
];
export const moduleLabel = (m: ModuleId) => MODULES.find((x) => x.id === m)?.label ?? m;

export type Permission = "consulter" | "creer" | "modifier" | "supprimer" | "valider" | "exporter" | "administrer";
export const PERMISSIONS: { id: Permission; label: string }[] = [
  { id: "consulter", label: "Consulter" },
  { id: "creer", label: "Créer" },
  { id: "modifier", label: "Modifier" },
  { id: "supprimer", label: "Supprimer" },
  { id: "valider", label: "Valider" },
  { id: "exporter", label: "Exporter" },
  { id: "administrer", label: "Administrer" },
];

export type PermissionMatrix = Partial<Record<ModuleId, Permission[]>>;

export type Role = {
  id: string;
  name: string;
  description: string;
  standard: boolean;
  permissions: PermissionMatrix;
};

/** Vrai si le rôle possède la permission sur le module. */
export const hasPermission = (role: Role, module: ModuleId, perm: Permission) =>
  role.permissions[module]?.includes(perm) ?? false;

const ALL: Permission[] = ["consulter", "creer", "modifier", "supprimer", "valider", "exporter", "administrer"];
const READ: Permission[] = ["consulter"];
const READ_EXPORT: Permission[] = ["consulter", "exporter"];
const MANAGE: Permission[] = ["consulter", "creer", "modifier", "exporter"];
const MANAGE_VALIDATE: Permission[] = ["consulter", "creer", "modifier", "valider", "exporter"];
const everyModule = (perms: Permission[]): PermissionMatrix =>
  Object.fromEntries(MODULES.map((m) => [m.id, perms])) as PermissionMatrix;

/** Les onze rôles standards préconfigurés. */
export function standardRoles(): Role[] {
  const r = (id: string, name: string, description: string, permissions: PermissionMatrix): Role => ({
    id,
    name,
    description,
    standard: true,
    permissions,
  });
  return [
    r("super-admin", "Super administrateur", "Accès complet à l'ensemble de l'ERP, y compris l'administration.", everyModule(ALL)),
    r("admin", "Administrateur", "Administration fonctionnelle ; ne peut pas administrer le module Administration.", {
      ...everyModule(ALL),
      administration: ["consulter", "creer", "modifier", "exporter"],
    }),
    r("dg", "Directeur général", "Vue globale et validation des opérations stratégiques.", {
      ...everyModule(READ_EXPORT),
      budgets: [...READ_EXPORT, "valider"],
      achats: [...READ_EXPORT, "valider"],
      ventes: [...READ_EXPORT, "valider"],
      comptabilite: [...READ_EXPORT, "valider"],
      tresorerie: [...READ_EXPORT, "valider"],
    }),
    r("daf", "Directeur financier", "Pilote la finance, la comptabilité, la trésorerie et les budgets.", {
      dashboard: READ_EXPORT,
      budgets: MANAGE_VALIDATE,
      stocks: READ,
      achats: [...READ_EXPORT, "valider"],
      ventes: READ_EXPORT,
      comptabilite: MANAGE_VALIDATE,
      tresorerie: MANAGE_VALIDATE,
      reporting: READ_EXPORT,
    }),
    r("controleur", "Contrôleur de gestion", "Élabore et suit les budgets, analyse les écarts.", {
      dashboard: READ_EXPORT,
      budgets: MANAGE_VALIDATE,
      stocks: READ_EXPORT,
      achats: READ_EXPORT,
      ventes: READ_EXPORT,
      comptabilite: READ_EXPORT,
      tresorerie: READ,
      reporting: ["consulter", "creer", "modifier", "exporter"],
    }),
    r("comptable", "Comptable", "Saisit et valide les écritures ; ne peut ni supprimer ni administrer la comptabilité.", {
      dashboard: READ,
      achats: READ,
      ventes: READ,
      comptabilite: MANAGE_VALIDATE,
      tresorerie: READ,
    }),
    r("tresorier", "Trésorier", "Gère la trésorerie et les paiements.", {
      dashboard: READ,
      comptabilite: READ,
      tresorerie: MANAGE_VALIDATE,
    }),
    r("resp-commercial", "Responsable commercial", "Gère les ventes et les clients.", {
      dashboard: READ_EXPORT,
      stocks: READ,
      ventes: MANAGE_VALIDATE,
    }),
    r("resp-achats", "Responsable achats", "Gère les achats et les fournisseurs.", {
      dashboard: READ_EXPORT,
      stocks: READ_EXPORT,
      achats: MANAGE_VALIDATE,
    }),
    r("resp-ops", "Responsable opérationnel", "Gère les stocks et les approvisionnements.", {
      dashboard: READ_EXPORT,
      stocks: MANAGE_VALIDATE,
      achats: READ,
    }),
    r("standard", "Utilisateur standard", "Consultation du tableau de bord uniquement.", {
      dashboard: READ,
    }),
  ];
}

/** Duplique un rôle sous un nouveau nom (copie profonde de la matrice). */
export function duplicateRole(role: Role, id: string, name: string): Role {
  const permissions = Object.fromEntries(
    Object.entries(role.permissions).map(([m, perms]) => [m, [...perms]]),
  ) as PermissionMatrix;
  return { id, name, description: `Copie de « ${role.name} »`, standard: false, permissions };
}

/** Ajoute ou retire une permission dans la matrice d'un rôle. */
export function togglePermission(role: Role, module: ModuleId, perm: Permission): Role {
  const current = role.permissions[module] ?? [];
  const next = current.includes(perm) ? current.filter((p) => p !== perm) : [...current, perm];
  return { ...role, permissions: { ...role.permissions, [module]: next } };
}

// ---------- Utilisateurs ----------

export type UserStatus = "actif" | "inactif" | "suspendu";
export const USER_STATUSES: { id: UserStatus; label: string }[] = [
  { id: "actif", label: "Actif" },
  { id: "inactif", label: "Inactif" },
  { id: "suspendu", label: "Suspendu" },
];

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  fonction: string;
  departmentId: string;
  roleId: string;
  establishmentId: string;
  managerId?: string;
  createdAt: string; // ISO date
  lastLoginAt?: string; // ISO datetime
  status: UserStatus;
};

export const userFullName = (u: User) => `${u.firstName} ${u.lastName}`;
export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

// ---------- Entreprises, établissements, départements ----------

export type Company = {
  id: string;
  raisonSociale: string;
  nomCommercial: string;
  formeJuridique: string;
  secteur: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone: string;
  email: string;
  siteWeb?: string;
  ice: string;
  identifiantFiscal: string;
  registreCommerce: string;
  cnss?: string;
  taxeProfessionnelle?: string;
  devise: string;
  exerciceDebut: string; // MM-JJ
  exerciceFin: string;
};

export type EstablishmentType = "siege" | "usine" | "entrepot" | "agence";
export const ESTABLISHMENT_TYPES: { id: EstablishmentType; label: string }[] = [
  { id: "siege", label: "Siège social" },
  { id: "usine", label: "Usine" },
  { id: "entrepot", label: "Entrepôt" },
  { id: "agence", label: "Agence" },
];
export type Establishment = {
  id: string;
  companyId: string;
  name: string;
  type: EstablishmentType;
  adresse: string;
  ville: string;
  responsable?: string;
};

export type Department = {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string; // user id
  costCenter?: string;
};

/** Raisons empêchant la suppression d'un département (utilisateurs affectés, sous-départements). */
export function departmentBlockers(deptId: string, users: User[], departments: Department[]): string[] {
  const blockers: string[] = [];
  const nUsers = users.filter((u) => u.departmentId === deptId).length;
  if (nUsers > 0) blockers.push(`${nUsers} utilisateur${nUsers > 1 ? "s" : ""} affecté${nUsers > 1 ? "s" : ""}`);
  const nChildren = departments.filter((d) => d.parentId === deptId).length;
  if (nChildren > 0) blockers.push(`${nChildren} sous-département${nChildren > 1 ? "s" : ""} rattaché${nChildren > 1 ? "s" : ""}`);
  return blockers;
}
export const canDeleteDepartment = (deptId: string, users: User[], departments: Department[]) =>
  departmentBlockers(deptId, users, departments).length === 0;

// ---------- Paramètres ----------

export type GeneralSettings = {
  appName: string;
  language: "fr" | "ar" | "en";
  currency: string;
  timezone: string;
  dateFormat: "JJ/MM/AAAA" | "AAAA-MM-JJ" | "MM/JJ/AAAA";
  decimals: number;
};

export type TvaRate = { id: string; label: string; rate: number; compte: string; actif: boolean };

export type FinanceSettings = {
  referentiel: "CGNC";
  exerciceDebut: string;
  exerciceFin: string;
  journaux: string[];
  tvaRates: TvaRate[];
  seuilLiquidite: number; // MAD
  moyensPaiement: string[];
};

export type SecuritySettings = {
  sessionMinutes: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  mfa: boolean;
};

// ---------- Workflows & validations ----------

export type OperationType = "budget" | "demande_achat" | "commande" | "facture" | "paiement" | "ecriture" | "cloture";
export const OPERATION_TYPES: { id: OperationType; label: string }[] = [
  { id: "budget", label: "Validation des budgets" },
  { id: "demande_achat", label: "Demandes d'achat" },
  { id: "commande", label: "Commandes" },
  { id: "facture", label: "Factures" },
  { id: "paiement", label: "Paiements" },
  { id: "ecriture", label: "Écritures comptables" },
  { id: "cloture", label: "Clôtures de périodes" },
];
export const operationLabel = (t: OperationType) => OPERATION_TYPES.find((x) => x.id === t)?.label ?? t;

export type Workflow = {
  id: string;
  type: OperationType;
  initiateurRole: string; // role id
  valideur1Role: string;
  valideur2Role?: string;
  seuil?: number; // MAD — au-delà, le 2e valideur est requis
  delaiJours: number;
  actif: boolean;
};

export type ValidationStatus = "brouillon" | "en_attente" | "en_cours" | "valide" | "rejete" | "annule";
export const VALIDATION_STATUSES: { id: ValidationStatus; label: string }[] = [
  { id: "brouillon", label: "Brouillon" },
  { id: "en_attente", label: "En attente" },
  { id: "en_cours", label: "En cours de validation" },
  { id: "valide", label: "Validé" },
  { id: "rejete", label: "Rejeté" },
  { id: "annule", label: "Annulé" },
];
export const validationStatusLabel = (s: ValidationStatus) => VALIDATION_STATUSES.find((x) => x.id === s)?.label ?? s;

/** Transitions autorisées du circuit de validation. */
const TRANSITIONS: Record<ValidationStatus, ValidationStatus[]> = {
  brouillon: ["en_attente", "annule"],
  en_attente: ["en_cours", "annule"],
  en_cours: ["valide", "rejete", "en_attente"], // retour en_attente = demande de correction
  valide: [],
  rejete: ["brouillon"],
  annule: [],
};
export const canTransition = (from: ValidationStatus, to: ValidationStatus) => TRANSITIONS[from].includes(to);

export type ValidationEvent = { at: string; actor: string; action: string; note?: string };
export type ValidationRequest = {
  id: string;
  workflowId: string;
  ref: string;
  objet: string;
  montant: number; // MAD
  demandeur: string;
  createdAt: string;
  status: ValidationStatus;
  history: ValidationEvent[];
};

// ---------- Intégrations ----------

export type IntegrationStatus = "connecte" | "non_configure" | "erreur";
export type Integration = {
  id: string;
  name: string;
  kind: "interne" | "externe";
  status: IntegrationStatus;
  lastSync?: string;
  detail: string;
};

// ---------- Journal d'activité ----------

export type ActivityType = "connexion" | "creation" | "modification" | "validation" | "suppression" | "securite";
export const ACTIVITY_TYPES: { id: ActivityType; label: string }[] = [
  { id: "connexion", label: "Connexion" },
  { id: "creation", label: "Création" },
  { id: "modification", label: "Modification" },
  { id: "validation", label: "Validation" },
  { id: "suppression", label: "Suppression" },
  { id: "securite", label: "Sécurité" },
];
export type ActivityEvent = {
  id: string;
  at: string; // ISO datetime
  user: string;
  action: string;
  module: string;
  type: ActivityType;
  result: "succes" | "echec";
  detail?: string;
};
