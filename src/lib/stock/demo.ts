// Données de démonstration fictives — générées de façon déterministe.
import type { Movement, Order, Product, Supplier } from "./model";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

export const DEMO_SUPPLIERS: Supplier[] = [
  { id: "F-LES", name: "Lesieur Cristal", ville: "Casablanca", delaiJours: 10 },
  { id: "F-COS", name: "Cosumar", ville: "Casablanca", delaiJours: 7 },
  { id: "F-DAR", name: "Dari", ville: "Casablanca", delaiJours: 5 },
  { id: "F-COP", name: "Copag", ville: "Taroudant", delaiJours: 12 },
  { id: "F-MUT", name: "Mutandis", ville: "Casablanca", delaiJours: 8 },
];

const products: Product[] = [
  { id: "P-01", ref: "HOL-5L", designation: "Huile d'olive vierge 5L", category: "Huiles & condiments", unit: "pièce", warehouseId: "WH-CAS", stock: 120, min: 400, max: 1200, unitCost: 285, supplierId: "F-COP", barcode: "6111250900017", expiry: "2027-06-30" },
  { id: "P-02", ref: "HOL-1L", designation: "Huile d'olive vierge 1L", category: "Huiles & condiments", unit: "pièce", warehouseId: "WH-FES", stock: 850, min: 300, max: 1500, unitCost: 62, supplierId: "F-COP", expiry: "2027-06-30" },
  { id: "P-03", ref: "SEM-25", designation: "Semoule fine 25kg", category: "Épicerie", unit: "sac", warehouseId: "WH-FES", stock: 310, min: 500, max: 2000, unitCost: 148, supplierId: "F-DAR" },
  { id: "P-04", ref: "THE-500", designation: "Thé vert 500g", category: "Boissons", unit: "paquet", warehouseId: "WH-TAN", stock: 860, min: 1000, max: 3000, unitCost: 41, supplierId: "F-MUT" },
  { id: "P-05", ref: "SUC-2K", designation: "Sucre en pain 2kg", category: "Épicerie", unit: "pièce", warehouseId: "WH-CAS", stock: 45, min: 300, max: 1000, unitCost: 19.5, supplierId: "F-COS", barcode: "6111250900024" },
  { id: "P-06", ref: "FAR-50", designation: "Farine panifiable 50kg", category: "Épicerie", unit: "sac", warehouseId: "WH-FES", stock: 0, min: 200, max: 800, unitCost: 265, supplierId: "F-DAR" },
  { id: "P-07", ref: "HUI-5L", designation: "Huile de table 5L", category: "Huiles & condiments", unit: "pièce", warehouseId: "WH-TAN", stock: 540, min: 400, max: 1600, unitCost: 58, supplierId: "F-LES" },
  { id: "P-08", ref: "LAIT-1L", designation: "Lait UHT 1L (x12)", category: "Boissons", unit: "carton", warehouseId: "WH-CAS", stock: 2300, min: 800, max: 2500, unitCost: 7.8, supplierId: "F-COP", expiry: "2026-12-15" },
  { id: "P-09", ref: "SAV-200", designation: "Savon de ménage 200g", category: "Hygiène & entretien", unit: "pièce", warehouseId: "WH-TAN", stock: 1500, min: 600, max: 2400, unitCost: 4.2, supplierId: "F-MUT" },
  { id: "P-10", ref: "DET-5L", designation: "Détergent liquide 5L", category: "Hygiène & entretien", unit: "pièce", warehouseId: "WH-FES", stock: 95, min: 150, max: 600, unitCost: 72, supplierId: "F-MUT" },
  { id: "P-11", ref: "EMB-CAR", designation: "Cartons 60x40 (x50)", category: "Emballages", unit: "paquet", warehouseId: "WH-CAS", stock: 4200, min: 2000, max: 6000, unitCost: 3.6, supplierId: "F-LES" },
  { id: "P-12", ref: "EMB-PAL", designation: "Palettes bois 120x100", category: "Emballages", unit: "palette", warehouseId: "WH-FES", stock: 260, min: 100, max: 400, unitCost: 85, supplierId: "F-LES" },
  { id: "P-13", ref: "JUS-1L", designation: "Jus d'orange 1L", category: "Boissons", unit: "pièce", warehouseId: "WH-TAN", stock: 0, min: 500, max: 2000, unitCost: 9.4, supplierId: "F-COP", expiry: "2027-01-31" },
  { id: "P-14", ref: "CUS-1K", designation: "Couscous moyen 1kg", category: "Épicerie", unit: "paquet", warehouseId: "WH-CAS", stock: 1850, min: 700, max: 2200, unitCost: 11.2, supplierId: "F-DAR" },
];

const orders: Order[] = [
  { id: "O-1", numero: "BC-2026-0041", supplierId: "F-LES", date: "2026-10-12", delivery: "2026-10-24", status: "Partiellement reçue", lines: [{ productId: "P-07", qty: 800, unitCost: 58, received: 400 }] },
  { id: "O-2", numero: "BC-2026-0042", supplierId: "F-COS", date: "2026-10-20", delivery: "2026-11-03", status: "Validée", lines: [{ productId: "P-05", qty: 1200, unitCost: 19.5, received: 0 }] },
  { id: "O-3", numero: "BC-2026-0043", supplierId: "F-DAR", date: "2026-10-26", delivery: "2026-11-05", status: "En attente de validation", lines: [{ productId: "P-03", qty: 600, unitCost: 148, received: 0 }, { productId: "P-14", qty: 500, unitCost: 11.2, received: 0 }] },
  { id: "O-4", numero: "BC-2026-0038", supplierId: "F-COP", date: "2026-09-15", delivery: "2026-09-28", status: "Reçue", lines: [{ productId: "P-01", qty: 500, unitCost: 285, received: 500 }] },
  { id: "O-5", numero: "BC-2026-0044", supplierId: "F-MUT", date: "2026-10-29", delivery: "2026-11-10", status: "Brouillon", lines: [{ productId: "P-09", qty: 1000, unitCost: 4.2, received: 0 }] },
];

export function buildDemo() {
  const r = rng(7);
  const users = ["S. Bennani", "Y. El Fassi", "K. Amrani"];
  const movements: Movement[] = [];
  let n = 0;
  const push = (m: Omit<Movement, "id" | "numero">) => {
    n += 1;
    movements.push({ ...m, id: `M-${n}`, numero: `MVT-2026-${String(n).padStart(4, "0")}` });
  };

  // Sorties mensuelles (janvier–septembre) et réapprovisionnements trimestriels.
  for (const p of products) {
    for (let m = 0; m < 9; m++) {
      const month = String(m + 1).padStart(2, "0");
      const qty = Math.round(p.stock * (0.1 + r() * 0.12));
      if (qty > 0)
        push({ date: `2026-${month}-${String(3 + Math.floor(r() * 24)).padStart(2, "0")}`, type: "sortie", productId: p.id, warehouseId: p.warehouseId, qty, unitCost: p.unitCost, doc: `BL-2026-${1000 + n}`, user: users[n % 3] });
      if (m % 3 === 2) {
        const qe = Math.round(p.max * (0.3 + r() * 0.2));
        push({ date: `2026-${month}-25`, type: "entree", productId: p.id, warehouseId: p.warehouseId, qty: qe, unitCost: p.unitCost, doc: `FAC-2026-${2000 + n}`, user: users[n % 3] });
      }
    }
  }

  // Octobre : réceptions de commandes et mouvements variés.
  push({ date: "2026-09-28", type: "entree", productId: "P-01", warehouseId: "WH-CAS", qty: 500, unitCost: 285, doc: "BL-COP-2210", user: "S. Bennani", orderId: "O-4" });
  push({ date: "2026-10-15", type: "entree", productId: "P-07", warehouseId: "WH-TAN", qty: 400, unitCost: 58, doc: "BL-LES-1187", user: "K. Amrani", orderId: "O-1" });
  push({ date: "2026-10-08", type: "transfert", productId: "P-02", warehouseId: "WH-FES", qty: 850, unitCost: 62, doc: "TRF-2026-014", user: "Y. El Fassi" });
  push({ date: "2026-10-18", type: "ajustement-", productId: "P-09", warehouseId: "WH-TAN", qty: 35, unitCost: 4.2, doc: "INV-2026-092", user: "K. Amrani" });
  push({ date: "2026-10-21", type: "retour-client", productId: "P-08", warehouseId: "WH-CAS", qty: 24, unitCost: 7.8, doc: "AV-2026-0051", user: "S. Bennani" });
  push({ date: "2026-10-24", type: "retour-fournisseur", productId: "P-11", warehouseId: "WH-CAS", qty: 60, unitCost: 3.6, doc: "RET-2026-0033", user: "Y. El Fassi" });
  push({ date: "2026-10-27", type: "ajustement+", productId: "P-12", warehouseId: "WH-FES", qty: 10, unitCost: 85, doc: "INV-2026-097", user: "S. Bennani" });

  return { products, movements, orders, suppliers: DEMO_SUPPLIERS };
}
