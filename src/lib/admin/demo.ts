// Données de démonstration du module Administration (fictives).
import {
  standardRoles,
  type ActivityEvent,
  type Company,
  type Department,
  type Establishment,
  type FinanceSettings,
  type GeneralSettings,
  type Integration,
  type Role,
  type SecuritySettings,
  type User,
  type ValidationRequest,
  type Workflow,
} from "./model";

export type AdminState = {
  users: User[];
  roles: Role[];
  companies: Company[];
  establishments: Establishment[];
  departments: Department[];
  general: GeneralSettings;
  finance: FinanceSettings;
  security: SecuritySettings;
  workflows: Workflow[];
  requests: ValidationRequest[];
  integrations: Integration[];
  events: ActivityEvent[];
};

export function buildDemo(): AdminState {
  const departments: Department[] = [
    { id: "D-DG", name: "Direction générale", managerId: "U-DG", costCenter: "CC-DG" },
    { id: "D-DF", name: "Direction financière", parentId: "D-DG", managerId: "U-DAF", costCenter: "CC-DAF" },
    { id: "D-CPT", name: "Comptabilité", parentId: "D-DF", managerId: "U-CPT" },
    { id: "D-CDG", name: "Contrôle de gestion", parentId: "D-DF", managerId: "U-CDG" },
    { id: "D-TRE", name: "Trésorerie", parentId: "D-DF", managerId: "U-TRE" },
    { id: "D-COM", name: "Commercial", parentId: "D-DG", managerId: "U-COM", costCenter: "CC-COM" },
    { id: "D-ACH", name: "Achats", parentId: "D-DG", managerId: "U-ACH", costCenter: "CC-ACH" },
    { id: "D-LOG", name: "Logistique", parentId: "D-DG", costCenter: "CC-LOG" },
    { id: "D-RH", name: "Ressources humaines", parentId: "D-DG" },
    { id: "D-PRD", name: "Production", parentId: "D-DG", costCenter: "CC-USK" },
    { id: "D-ADM", name: "Administration", parentId: "D-DG", managerId: "U-ADM" },
  ];

  const users: User[] = [
    { id: "U-ADMIN", firstName: "Abdelmoughite", lastName: "Badii", email: "a.badii@atlas.ma", fonction: "Administrateur système", departmentId: "D-ADM", roleId: "super-admin", establishmentId: "E-SIEGE", createdAt: "2025-09-01", lastLoginAt: "2026-11-03T08:42:00", status: "actif" },
    { id: "U-DG", firstName: "Youssef", lastName: "Benali", email: "y.benali@atlas.ma", fonction: "Directeur général", departmentId: "D-DG", roleId: "dg", establishmentId: "E-SIEGE", createdAt: "2025-09-01", lastLoginAt: "2026-11-02T17:15:00", status: "actif" },
    { id: "U-DAF", firstName: "Karim", lastName: "Idrissi", email: "k.idrissi@atlas.ma", fonction: "Directeur financier", departmentId: "D-DF", roleId: "daf", establishmentId: "E-SIEGE", createdAt: "2025-09-01", lastLoginAt: "2026-11-03T09:05:00", status: "actif" },
    { id: "U-CDG", firstName: "Salma", lastName: "Alaoui", email: "s.alaoui@atlas.ma", fonction: "Contrôleuse de gestion", departmentId: "D-CDG", roleId: "controleur", establishmentId: "E-SIEGE", managerId: "U-DAF", createdAt: "2025-10-06", lastLoginAt: "2026-11-03T08:58:00", status: "actif" },
    { id: "U-CPT", firstName: "Nadia", lastName: "El Fassi", email: "n.elfassi@atlas.ma", fonction: "Comptable", departmentId: "D-CPT", roleId: "comptable", establishmentId: "E-SIEGE", managerId: "U-DAF", createdAt: "2025-10-06", lastLoginAt: "2026-11-01T16:40:00", status: "actif" },
    { id: "U-TRE", firstName: "Omar", lastName: "Tazi", email: "o.tazi@atlas.ma", fonction: "Trésorier", departmentId: "D-TRE", roleId: "tresorier", establishmentId: "E-SIEGE", managerId: "U-DAF", createdAt: "2025-11-03", lastLoginAt: "2026-10-30T11:22:00", status: "actif" },
    { id: "U-COM", firstName: "Laila", lastName: "Berrada", email: "l.berrada@atlas.ma", fonction: "Responsable commerciale", departmentId: "D-COM", roleId: "resp-commercial", establishmentId: "E-AGC-CASA", managerId: "U-DG", createdAt: "2025-11-17", lastLoginAt: "2026-11-02T14:03:00", status: "actif" },
    { id: "U-ACH", firstName: "Mehdi", lastName: "Chraibi", email: "m.chraibi@atlas.ma", fonction: "Responsable achats", departmentId: "D-ACH", roleId: "resp-achats", establishmentId: "E-USINE-KEN", managerId: "U-DG", createdAt: "2026-01-12", lastLoginAt: "2026-09-18T10:31:00", status: "inactif" },
    { id: "U-ADM", firstName: "Sara", lastName: "Amrani", email: "s.amrani@atlas.ma", fonction: "Assistante administrative", departmentId: "D-ADM", roleId: "standard", establishmentId: "E-SIEGE", managerId: "U-ADMIN", createdAt: "2026-02-02", lastLoginAt: "2026-10-12T09:47:00", status: "suspendu" },
  ];

  const companies: Company[] = [
    {
      id: "C-ATLAS",
      raisonSociale: "Société Atlas SA",
      nomCommercial: "Atlas Industries",
      formeJuridique: "Société anonyme (SA)",
      secteur: "Industrie manufacturière",
      adresse: "Zone industrielle Sidi Bernoussi, Lot 42",
      ville: "Casablanca",
      pays: "Maroc",
      telephone: "+212 5 22 78 40 00",
      email: "contact@atlas.ma",
      siteWeb: "https://www.atlas.ma",
      ice: "001234567000091",
      identifiantFiscal: "40123456",
      registreCommerce: "RC 123456 — Casablanca",
      cnss: "8765432",
      taxeProfessionnelle: "TP 34509812",
      devise: "MAD",
      exerciceDebut: "01-01",
      exerciceFin: "12-31",
    },
  ];

  const establishments: Establishment[] = [
    { id: "E-SIEGE", companyId: "C-ATLAS", name: "Siège social — Casablanca", type: "siege", adresse: "Zone industrielle Sidi Bernoussi, Lot 42", ville: "Casablanca", responsable: "Youssef Benali" },
    { id: "E-USINE-KEN", companyId: "C-ATLAS", name: "Usine de Kénitra", type: "usine", adresse: "Zone industrielle Atlantic Free Zone", ville: "Kénitra", responsable: "Mehdi Chraibi" },
    { id: "E-AGC-CASA", companyId: "C-ATLAS", name: "Agence commerciale — Casablanca", type: "agence", adresse: "Boulevard Mohammed V", ville: "Casablanca", responsable: "Laila Berrada" },
  ];

  const general: GeneralSettings = {
    appName: "Pilotage CG",
    language: "fr",
    currency: "MAD",
    timezone: "Africa/Casablanca",
    dateFormat: "JJ/MM/AAAA",
    decimals: 2,
  };

  const finance: FinanceSettings = {
    referentiel: "CGNC",
    exerciceDebut: "2026-01-01",
    exerciceFin: "2026-12-31",
    journaux: ["ACH — Achats", "VTE — Ventes", "BQ — Banque", "CA — Caisse", "OD — Opérations diverses"],
    tvaRates: [
      { id: "TVA-20", label: "Taux normal", rate: 20, compte: "4455", actif: true },
      { id: "TVA-14", label: "Taux intermédiaire", rate: 14, compte: "4455", actif: true },
      { id: "TVA-10", label: "Taux réduit", rate: 10, compte: "4455", actif: true },
      { id: "TVA-7", label: "Taux particulier", rate: 7, compte: "4455", actif: false },
    ],
    seuilLiquidite: 500000,
    moyensPaiement: ["Virement", "Chèque", "Effet de commerce", "Espèces"],
  };

  const security: SecuritySettings = { sessionMinutes: 480, maxLoginAttempts: 5, passwordMinLength: 10, mfa: false };

  const workflows: Workflow[] = [
    { id: "W-BUD", type: "budget", initiateurRole: "controleur", valideur1Role: "daf", valideur2Role: "dg", delaiJours: 10, actif: true },
    { id: "W-DA", type: "demande_achat", initiateurRole: "resp-achats", valideur1Role: "daf", valideur2Role: "dg", seuil: 50000, delaiJours: 5, actif: true },
    { id: "W-CMD", type: "commande", initiateurRole: "resp-achats", valideur1Role: "daf", seuil: 100000, delaiJours: 3, actif: true },
    { id: "W-FAC", type: "facture", initiateurRole: "comptable", valideur1Role: "daf", delaiJours: 5, actif: true },
    { id: "W-PAY", type: "paiement", initiateurRole: "tresorier", valideur1Role: "daf", valideur2Role: "dg", seuil: 100000, delaiJours: 2, actif: true },
    { id: "W-ECR", type: "ecriture", initiateurRole: "comptable", valideur1Role: "daf", delaiJours: 7, actif: true },
    { id: "W-CLO", type: "cloture", initiateurRole: "comptable", valideur1Role: "daf", valideur2Role: "dg", delaiJours: 15, actif: false },
  ];

  const requests: ValidationRequest[] = [
    {
      id: "V-001", workflowId: "W-DA", ref: "DA-2026-041", objet: "Achat matière première — acier inox (12 t)", montant: 186000, demandeur: "Mehdi Chraibi", createdAt: "2026-10-28", status: "en_cours",
      history: [
        { at: "2026-10-28T09:12:00", actor: "Mehdi Chraibi", action: "Demande soumise" },
        { at: "2026-10-29T14:30:00", actor: "Karim Idrissi", action: "Prise en charge — validation DAF" },
      ],
    },
    {
      id: "V-002", workflowId: "W-PAY", ref: "PAY-2026-118", objet: "Règlement fournisseur Maroc Acier — facture F-2214", montant: 92500, demandeur: "Omar Tazi", createdAt: "2026-10-30", status: "en_attente",
      history: [{ at: "2026-10-30T10:05:00", actor: "Omar Tazi", action: "Demande soumise" }],
    },
    {
      id: "V-003", workflowId: "W-BUD", ref: "BUD-2026-CDG", objet: "Budget 2027 — Contrôle de gestion (préparation)", montant: 2450000, demandeur: "Salma Alaoui", createdAt: "2026-10-25", status: "en_cours",
      history: [
        { at: "2026-10-25T11:40:00", actor: "Salma Alaoui", action: "Budget soumis" },
        { at: "2026-10-27T16:20:00", actor: "Karim Idrissi", action: "Prise en charge — validation DAF" },
      ],
    },
    {
      id: "V-004", workflowId: "W-FAC", ref: "FAC-2026-0892", objet: "Facture client Atlas Distribution — octobre", montant: 412300, demandeur: "Nadia El Fassi", createdAt: "2026-11-02", status: "en_attente",
      history: [{ at: "2026-11-02T08:55:00", actor: "Nadia El Fassi", action: "Facture soumise" }],
    },
    {
      id: "V-005", workflowId: "W-ECR", ref: "OD-2026-0331", objet: "Écriture de régularisation — charges constatées d'avance", montant: 67800, demandeur: "Nadia El Fassi", createdAt: "2026-10-20", status: "valide",
      history: [
        { at: "2026-10-20T15:02:00", actor: "Nadia El Fassi", action: "Écriture soumise" },
        { at: "2026-10-21T09:18:00", actor: "Karim Idrissi", action: "Validée" },
      ],
    },
    {
      id: "V-006", workflowId: "W-DA", ref: "DA-2026-038", objet: "Achat fournitures de bureau — Q4", montant: 18400, demandeur: "Sara Amrani", createdAt: "2026-10-15", status: "rejete",
      history: [
        { at: "2026-10-15T13:26:00", actor: "Sara Amrani", action: "Demande soumise" },
        { at: "2026-10-16T10:44:00", actor: "Karim Idrissi", action: "Rejetée", note: "Budget fournitures épuisé pour 2026" },
      ],
    },
  ];

  const integrations: Integration[] = [
    { id: "I-BUD", name: "Budgets & Prévisions", kind: "interne", status: "connecte", lastSync: "2026-11-03T08:00:00", detail: "Exercices, centres de coûts et droits de validation synchronisés." },
    { id: "I-STK", name: "Stocks & Approvisionnements", kind: "interne", status: "connecte", lastSync: "2026-11-03T08:00:00", detail: "Entrepôts et unités de mesure synchronisés." },
    { id: "I-ACH", name: "Achats & Fournisseurs", kind: "interne", status: "connecte", lastSync: "2026-11-02T18:30:00", detail: "Circuits d'approbation et seuils actifs." },
    { id: "I-VTE", name: "Ventes & Clients", kind: "interne", status: "connecte", lastSync: "2026-11-02T18:30:00", detail: "Paramètres commerciaux synchronisés." },
    { id: "I-CPT", name: "Comptabilité & Analyse financière", kind: "interne", status: "connecte", lastSync: "2026-11-03T07:45:00", detail: "Référentiel CGNC, journaux et taux de TVA actifs." },
    { id: "I-TRE", name: "Trésorerie", kind: "interne", status: "connecte", lastSync: "2026-11-03T07:45:00", detail: "Moyens de paiement et seuils de validation actifs." },
    { id: "I-RPT", name: "Reporting", kind: "interne", status: "connecte", lastSync: "2026-11-03T08:00:00", detail: "Droits d'exportation et de consultation appliqués." },
    { id: "I-MAIL", name: "Service d'e-mail transactionnel", kind: "externe", status: "non_configure", detail: "Nécessaire pour les invitations et les notifications. Aucun fournisseur configuré." },
    { id: "I-BANK", name: "Connexion bancaire", kind: "externe", status: "non_configure", detail: "Aucune intégration bancaire autorisée n'est configurée." },
    { id: "I-IMP", name: "Importation de fichiers (CSV / Excel)", kind: "externe", status: "non_configure", detail: "Connecteur d'import non configuré." },
  ];

  const events: ActivityEvent[] = [
    { id: "EV-001", at: "2026-11-03T09:05:00", user: "Karim Idrissi", action: "Connexion réussie", module: "Authentification", type: "connexion", result: "succes" },
    { id: "EV-002", at: "2026-11-03T08:58:00", user: "Salma Alaoui", action: "Connexion réussie", module: "Authentification", type: "connexion", result: "succes" },
    { id: "EV-003", at: "2026-11-03T08:42:00", user: "Abdelmoughite Badii", action: "Connexion réussie", module: "Authentification", type: "connexion", result: "succes" },
    { id: "EV-004", at: "2026-11-02T17:40:00", user: "Abdelmoughite Badii", action: "Modification du taux de TVA 7 % (désactivé)", module: "Paramètres financiers", type: "modification", result: "succes" },
    { id: "EV-005", at: "2026-11-02T16:12:00", user: "Karim Idrissi", action: "Validation du paiement PAY-2026-115", module: "Trésorerie", type: "validation", result: "succes" },
    { id: "EV-006", at: "2026-11-02T11:03:00", user: "Inconnu", action: "Tentative de connexion échouée (s.amrani@atlas.ma)", module: "Authentification", type: "securite", result: "echec", detail: "Compte suspendu" },
    { id: "EV-007", at: "2026-10-30T15:55:00", user: "Abdelmoughite Badii", action: "Attribution du rôle « Trésorier » à Omar Tazi", module: "Utilisateurs", type: "modification", result: "succes" },
    { id: "EV-008", at: "2026-10-28T10:20:00", user: "Abdelmoughite Badii", action: "Création de l'établissement « Agence commerciale — Casablanca »", module: "Entreprises", type: "creation", result: "succes" },
    { id: "EV-009", at: "2026-10-21T09:18:00", user: "Karim Idrissi", action: "Validation de l'écriture OD-2026-0331", module: "Comptabilité", type: "validation", result: "succes" },
    { id: "EV-010", at: "2026-10-16T10:44:00", user: "Karim Idrissi", action: "Rejet de la demande DA-2026-038", module: "Achats", type: "validation", result: "succes", detail: "Budget fournitures épuisé" },
  ];

  return {
    users,
    roles: standardRoles(),
    companies,
    establishments,
    departments,
    general,
    finance,
    security,
    workflows,
    requests,
    integrations,
    events,
  };
}
