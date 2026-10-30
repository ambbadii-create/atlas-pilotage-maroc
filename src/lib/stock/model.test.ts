import { describe, expect, it } from "vitest";
import {
  applyMovement,
  buildAlerts,
  nextNumero,
  orderTotal,
  productStatus,
  recommendedQty,
  rotation,
  statusAfterReceipt,
  stockValue,
  toCsv,
  validateOrder,
  validateProduct,
  validateReceipt,
  valueAt,
  type Movement,
  type Order,
  type Product,
} from "./model";

const p = (over: Partial<Product> = {}): Product => ({
  id: "P-1",
  ref: "TST-1",
  designation: "Produit test",
  category: "Épicerie",
  unit: "pièce",
  warehouseId: "WH-CAS",
  stock: 100,
  min: 50,
  max: 200,
  unitCost: 10,
  ...over,
});

const order = (over: Partial<Order> = {}): Order => ({
  id: "O-1",
  numero: "BC-2026-0001",
  supplierId: "F-1",
  date: "2026-10-01",
  delivery: "2026-10-10",
  status: "Validée",
  lines: [{ productId: "P-1", qty: 100, unitCost: 12, received: 0 }],
  ...over,
});

describe("statut de stock", () => {
  it("rupture à zéro, faible sous le minimum, surstock au-dessus du maximum", () => {
    expect(productStatus(p({ stock: 0 }))).toBe("rupture");
    expect(productStatus(p({ stock: 49 }))).toBe("faible");
    expect(productStatus(p({ stock: 50 }))).toBe("disponible");
    expect(productStatus(p({ stock: 201 }))).toBe("surstock");
  });
});

describe("applyMovement (CMUP)", () => {
  it("recalcule le coût moyen pondéré sur une entrée", () => {
    const r = applyMovement(p({ stock: 100, unitCost: 10 }), { type: "entree", qty: 100, unitCost: 16 });
    expect(r.product?.stock).toBe(200);
    expect(r.product?.unitCost).toBe(13);
  });
  it("une sortie diminue le stock sans changer le coût", () => {
    const r = applyMovement(p(), { type: "sortie", qty: 40, unitCost: 10 });
    expect(r.product?.stock).toBe(60);
    expect(r.product?.unitCost).toBe(10);
  });
  it("refuse une sortie qui rendrait le stock négatif", () => {
    expect(applyMovement(p({ stock: 30 }), { type: "sortie", qty: 31, unitCost: 10 }).error).toMatch(/insuffisant/i);
    expect(applyMovement(p({ stock: 30 }), { type: "retour-fournisseur", qty: 31, unitCost: 10 }).error).toMatch(/insuffisant/i);
  });
  it("refuse les quantités nulles ou négatives", () => {
    expect(applyMovement(p(), { type: "entree", qty: 0, unitCost: 10 }).error).toBeTruthy();
    expect(applyMovement(p(), { type: "entree", qty: -5, unitCost: 10 }).error).toBeTruthy();
  });
  it("un transfert exige un autre entrepôt et la totalité de la ligne", () => {
    expect(applyMovement(p(), { type: "transfert", qty: 100, unitCost: 10 }, "WH-CAS").error).toBeTruthy();
    expect(applyMovement(p(), { type: "transfert", qty: 50, unitCost: 10 }, "WH-FES").error).toMatch(/totalité/i);
    const ok = applyMovement(p(), { type: "transfert", qty: 100, unitCost: 10 }, "WH-FES");
    expect(ok.product?.warehouseId).toBe("WH-FES");
  });
});

describe("commandes fournisseurs", () => {
  it("calcule le montant total", () => {
    expect(orderTotal(order({ lines: [{ productId: "P-1", qty: 100, unitCost: 12, received: 0 }, { productId: "P-2", qty: 10, unitCost: 5.5, received: 0 }] }))).toBe(1255);
  });
  it("statut après réception : partielle puis complète", () => {
    expect(statusAfterReceipt(order({ lines: [{ productId: "P-1", qty: 100, unitCost: 12, received: 40 }] }))).toBe("Partiellement reçue");
    expect(statusAfterReceipt(order({ lines: [{ productId: "P-1", qty: 100, unitCost: 12, received: 100 }] }))).toBe("Reçue");
  });
  it("refuse une réception au-delà du reste à livrer (double réception)", () => {
    const o = order({ lines: [{ productId: "P-1", qty: 100, unitCost: 12, received: 60 }] });
    expect(validateReceipt(o, { "P-1": 40 })).toBeNull();
    expect(validateReceipt(o, { "P-1": 41 })).toMatch(/reste à livrer/i);
  });
  it("refuse de réceptionner une commande déjà reçue ou non validée", () => {
    expect(validateReceipt(order({ status: "Reçue" }), { "P-1": 1 })).toBeTruthy();
    expect(validateReceipt(order({ status: "Brouillon" }), { "P-1": 1 })).toBeTruthy();
  });
  it("valide les dates et les lignes d'une commande", () => {
    expect(validateOrder(order(), [p()])).toBeNull();
    expect(validateOrder(order({ delivery: "2026-09-30" }), [p()])).toMatch(/livraison/i);
    expect(validateOrder(order({ lines: [] }), [p()])).toMatch(/article/i);
  });
});

describe("produits", () => {
  it("refuse une référence en double et un min supérieur au max", () => {
    expect(validateProduct(p({ ref: "TST-1" }), [p({ id: "P-2", ref: "tst-1" })])).toMatch(/existe déjà/i);
    expect(validateProduct(p({ min: 300, max: 200 }), [])).toMatch(/minimum/i);
    expect(validateProduct(p(), [])).toBeNull();
  });
});

describe("alertes et réapprovisionnement", () => {
  it("recommande de remonter au stock maximum", () => {
    expect(recommendedQty(p({ stock: 45, max: 1000 }))).toBe(955);
    expect(recommendedQty(p({ stock: 1200, max: 1000 }))).toBe(0);
  });
  it("signale ruptures, faibles, péremptions proches et livraisons en retard", () => {
    const alerts = buildAlerts(
      [p({ id: "A", stock: 0 }), p({ id: "B", ref: "B-1", stock: 10, expiry: "2026-11-15" })],
      [order({ delivery: "2026-10-01" })],
      [{ id: "F-1", name: "Fournisseur X", ville: "Casa", delaiJours: 7 }],
      "2026-10-30",
    );
    expect(alerts.map((a) => a.kind).sort()).toEqual(["faible", "peremption", "retard", "rupture"]);
    expect(alerts.find((a) => a.kind === "rupture")?.severity).toBe("critique");
  });
});

describe("analyse", () => {
  const mv = (over: Partial<Movement>): Movement => ({
    id: "M-1", numero: "MVT-2026-0001", date: "2026-10-01", type: "sortie",
    productId: "P-1", warehouseId: "WH-CAS", qty: 10, unitCost: 10, ...over,
  });
  it("rotation = sorties / stock, null sans sortie", () => {
    expect(rotation("P-1", 100, [mv({ qty: 250 }), mv({ id: "M-2", qty: 150 })])).toBe(4);
    expect(rotation("P-1", 100, [mv({ type: "entree" })])).toBeNull();
  });
  it("valueAt remonte les flux postérieurs à la date", () => {
    const products = [p({ stock: 100, unitCost: 10 })]; // 1000 DH aujourd'hui
    const movements = [mv({ date: "2026-10-20", type: "entree", qty: 50, unitCost: 10 })];
    expect(valueAt(products, movements, "2026-10-31")).toBe(1000);
    expect(valueAt(products, movements, "2026-10-19")).toBe(500);
  });
  it("nextNumero incrémente la série", () => {
    expect(nextNumero("MVT-2026", ["MVT-2026-0007", "MVT-2026-0042"])).toBe("MVT-2026-0043");
    expect(nextNumero("BC-2026", [])).toBe("BC-2026-0001");
  });
  it("toCsv échappe les points-virgules et guillemets", () => {
    expect(toCsv([["a;b", 'il a dit "oui"'], ["1", "2"]])).toBe('"a;b";"il a dit ""oui"""\n1;2');
  });
  it("stockValue arrondit au centime", () => {
    expect(stockValue(p({ stock: 3, unitCost: 0.1 }))).toBe(0.3);
  });
});
