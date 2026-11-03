import { describe, expect, it } from "vitest";
import {
  MODULES,
  PERMISSIONS,
  canDeleteDepartment,
  canTransition,
  departmentBlockers,
  duplicateRole,
  hasPermission,
  isValidEmail,
  standardRoles,
  togglePermission,
  type Department,
  type User,
} from "./model";

const roles = standardRoles();
const role = (id: string) => roles.find((r) => r.id === id)!;

describe("rôles standards", () => {
  it("préconfigure les 11 rôles du référentiel", () => {
    expect(roles).toHaveLength(11);
    expect(roles.every((r) => r.standard)).toBe(true);
  });

  it("le super administrateur possède toutes les permissions sur tous les modules", () => {
    const sa = role("super-admin");
    for (const m of MODULES) for (const p of PERMISSIONS) expect(hasPermission(sa, m.id, p.id)).toBe(true);
  });

  it("l'utilisateur standard ne fait que consulter le tableau de bord (moindre privilège)", () => {
    const u = role("standard");
    expect(hasPermission(u, "dashboard", "consulter")).toBe(true);
    expect(hasPermission(u, "dashboard", "modifier")).toBe(false);
    expect(hasPermission(u, "budgets", "consulter")).toBe(false);
    expect(hasPermission(u, "administration", "consulter")).toBe(false);
    expect(hasPermission(u, "tresorerie", "valider")).toBe(false);
  });

  it("le comptable valide les écritures mais ne peut ni supprimer ni administrer la comptabilité", () => {
    const c = role("comptable");
    expect(hasPermission(c, "comptabilite", "valider")).toBe(true);
    expect(hasPermission(c, "comptabilite", "supprimer")).toBe(false);
    expect(hasPermission(c, "comptabilite", "administrer")).toBe(false);
  });

  it("l'administrateur ne peut pas administrer le module Administration", () => {
    const a = role("admin");
    expect(hasPermission(a, "administration", "modifier")).toBe(true);
    expect(hasPermission(a, "administration", "administrer")).toBe(false);
  });
});

describe("matrice de permissions", () => {
  it("togglePermission ajoute puis retire une permission", () => {
    let u = role("standard");
    u = togglePermission(u, "budgets", "consulter");
    expect(hasPermission(u, "budgets", "consulter")).toBe(true);
    u = togglePermission(u, "budgets", "consulter");
    expect(hasPermission(u, "budgets", "consulter")).toBe(false);
  });

  it("duplicateRole copie la matrice sans partager les références", () => {
    const copy = duplicateRole(role("comptable"), "custom-1", "Comptable junior");
    expect(copy.standard).toBe(false);
    expect(hasPermission(copy, "comptabilite", "valider")).toBe(true);
    const modified = togglePermission(copy, "comptabilite", "valider");
    expect(hasPermission(modified, "comptabilite", "valider")).toBe(false);
    expect(hasPermission(role("comptable"), "comptabilite", "valider")).toBe(true);
  });
});

describe("circuit de validation", () => {
  it("un brouillon peut être soumis ou annulé, pas validé directement", () => {
    expect(canTransition("brouillon", "en_attente")).toBe(true);
    expect(canTransition("brouillon", "annule")).toBe(true);
    expect(canTransition("brouillon", "valide")).toBe(false);
  });

  it("une demande en attente doit être prise en charge avant validation", () => {
    expect(canTransition("en_attente", "valide")).toBe(false);
    expect(canTransition("en_attente", "en_cours")).toBe(true);
    expect(canTransition("en_cours", "valide")).toBe(true);
    expect(canTransition("en_cours", "rejete")).toBe(true);
    expect(canTransition("en_cours", "en_attente")).toBe(true); // demande de correction
  });

  it("les états finaux sont verrouillés ; un rejet repasse en brouillon", () => {
    expect(canTransition("valide", "en_attente")).toBe(false);
    expect(canTransition("annule", "brouillon")).toBe(false);
    expect(canTransition("rejete", "brouillon")).toBe(true);
  });
});

describe("suppression de département", () => {
  const departments: Department[] = [
    { id: "D-DF", name: "Direction financière" },
    { id: "D-CPT", name: "Comptabilité", parentId: "D-DF" },
    { id: "D-VIDE", name: "Archives" },
  ];
  const users = [{ departmentId: "D-CPT" } as User];

  it("bloque la suppression si des utilisateurs sont affectés", () => {
    expect(canDeleteDepartment("D-CPT", users, departments)).toBe(false);
    expect(departmentBlockers("D-CPT", users, departments)[0]).toContain("utilisateur");
  });

  it("bloque la suppression si des sous-départements sont rattachés", () => {
    expect(canDeleteDepartment("D-DF", users, departments)).toBe(false);
    expect(departmentBlockers("D-DF", users, departments)[0]).toContain("sous-département");
  });

  it("autorise la suppression d'un département sans dépendance", () => {
    expect(canDeleteDepartment("D-VIDE", users, departments)).toBe(true);
  });
});

describe("e-mail", () => {
  it("valide les adresses professionnelles", () => {
    expect(isValidEmail("s.alaoui@atlas.ma")).toBe(true);
    expect(isValidEmail("sans-arobase")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });
});
