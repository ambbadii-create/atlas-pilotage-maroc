// Stocks & Approvisionnements — types, référentiels et calculs (purs, testables).
//
// Valorisation : CMUP (coût unitaire moyen pondéré). À chaque entrée valorisée,
// le coût unitaire est recalculé : (stock × coût + qté × coût d'entrée) / (stock + qté).
// Les sorties ne modifient pas le coût moyen. Les montants sont arrondis au centime
// (round2) pour éviter les dérives de calcul en virgule flottante.

import { MONTHS } from "@/lib/budget/model";

export const round2 = (v: number) => Math.round(v * 100) / 100;

export const frDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// ---------- Référentiels ----------

export type Warehouse = { id: string; label: string; ville: string };
export const WAREHOUSES: Warehouse[] = [
  { id: "WH-CAS", label: "Entrepôt Casablanca", ville: "Casablanca" },
  { id: "WH-FES", label: "Entrepôt Fès", ville: "Fès" },
  { id: "WH-TAN", label: "Entrepôt Tanger", ville: "Tanger" },
];
export const warehouseLabel = (id: string) => WAREHOUSES.find((w) => w.id === id)?.label ?? id;

export const PRODUCT_CATEGORIES = ["Huiles & condiments", "Épicerie", "Boissons", "Hygiène & entretien", "Emballages"];
export const UNITS = ["pièce", "carton", "kg", "L", "palette"];

export type Supplier = { id: string; name: string; ville: string; delaiJours: number };

// ---------- Produits ----------

export type Product = {
  id: string;
  ref: string;
  designation: string;
  category: string;
  unit: string;
  warehouseId: string;
  stock: number;
  min: number;
  max: number;
  unitCost: number; // CMUP en MAD
  supplierId?: string;
  barcode?: string;
  expiry?: string; // ISO, optionnel
};

export type StockStatus = "disponible" | "faible" | "rupture" | "surstock";
export const STATUS_LABELS: Record<StockStatus, string> = {
  disponible: "Disponible",
  faible: "Stock faible",
  rupture: "Rupture",
  surstock: "Surstock",
};

export function productStatus(p: Product): StockStatus {
  if (p.stock <= 0) return "rupture";
  if (p.stock < p.min) return "faible";
  if (p.max > 0 && p.stock > p.max) return "surstock";
  return "disponible";
}

export const stockValue = (p: Product) => round2(p.stock * p.unitCost);

export function validateProduct(p: Product, existing: Product[]): string | null {
  if (!p.ref.trim()) return "La référence est obligatoire.";
  if (existing.some((x) => x.id !== p.id && x.ref.trim().toLowerCase() === p.ref.trim().toLowerCase()))
    return `La référence « ${p.ref} » existe déjà.`;
  if (!p.designation.trim()) return "La désignation est obligatoire.";
  if (!p.category) return "La catégorie est obligatoire.";
  if (!p.warehouseId) return "L'entrepôt est obligatoire.";
  if (p.stock < 0 || p.min < 0 || p.max < 0 || p.unitCost < 0) return "Les quantités et coûts doivent être positifs.";
  if (p.max > 0 && p.min > p.max) return "Le stock minimum ne peut pas dépasser le stock maximum.";
  return null;
}

// ---------- Mouvements ----------

export type MovementType =
  | "entree"
  | "sortie"
  | "transfert"
  | "ajustement+"
  | "ajustement-"
  | "retour-fournisseur"
  | "retour-client";

export const MOVEMENT_TYPES: { id: MovementType; label: string; sign: 1 | -1 | 0 }[] = [
  { id: "entree", label: "Entrée fournisseur", sign: 1 },
  { id: "sortie", label: "Sortie", sign: -1 },
  { id: "transfert", label: "Transfert entre entrepôts", sign: 0 },
  { id: "ajustement+", label: "Ajustement positif", sign: 1 },
  { id: "ajustement-", label: "Ajustement négatif", sign: -1 },
  { id: "retour-fournisseur", label: "Retour fournisseur", sign: -1 },
  { id: "retour-client", label: "Retour client", sign: 1 },
];
export const movementLabel = (t: MovementType) => MOVEMENT_TYPES.find((m) => m.id === t)?.label ?? t;
export const movementSign = (t: MovementType) => MOVEMENT_TYPES.find((m) => m.id === t)!.sign;

export type Movement = {
  id: string;
  numero: string;
  date: string; // ISO
  type: MovementType;
  productId: string;
  warehouseId: string; // destination pour un transfert
  qty: number;
  unitCost: number;
  doc?: string;
  user?: string;
  orderId?: string;
};

/**
 * Applique un mouvement à un produit. Renvoie soit une erreur, soit le produit
 * mis à jour. Les sorties ne peuvent pas rendre le stock négatif. Les entrées
 * valorisées recalculent le CMUP. Un transfert déplace la totalité de la ligne
 * vers un autre entrepôt (le transfert partiel n'est pas pris en charge).
 */
export function applyMovement(
  p: Product,
  mv: Pick<Movement, "type" | "qty" | "unitCost">,
  targetWarehouseId?: string,
): { product?: Product; error?: string } {
  if (!Number.isFinite(mv.qty) || mv.qty <= 0) return { error: "La quantité doit être strictement positive." };
  if (!Number.isFinite(mv.unitCost) || mv.unitCost < 0) return { error: "Le coût unitaire est invalide." };
  if (mv.type === "transfert") {
    if (!targetWarehouseId || targetWarehouseId === p.warehouseId)
      return { error: "Choisissez un entrepôt de destination différent." };
    if (mv.qty > p.stock) return { error: `Stock insuffisant : ${p.stock} ${p.unit} disponibles.` };
    if (mv.qty !== p.stock)
      return { error: `Le transfert partiel n'est pas pris en charge : transférez la totalité de la ligne (${p.stock} ${p.unit}).` };
    return { product: { ...p, warehouseId: targetWarehouseId } };
  }
  const sign = movementSign(mv.type);
  if (sign === -1 && mv.qty > p.stock) return { error: `Stock insuffisant : ${p.stock} ${p.unit} disponibles.` };
  const stock = sign === 1 ? p.stock + mv.qty : p.stock - mv.qty;
  const unitCost = sign === 1 && mv.unitCost > 0 ? round2((p.stock * p.unitCost + mv.qty * mv.unitCost) / stock) : p.unitCost;
  return { product: { ...p, stock, unitCost } };
}

// ---------- Commandes fournisseurs ----------

export type OrderStatus = "Brouillon" | "En attente de validation" | "Validée" | "Partiellement reçue" | "Reçue" | "Annulée";
export const ORDER_STATUSES: OrderStatus[] = [
  "Brouillon",
  "En attente de validation",
  "Validée",
  "Partiellement reçue",
  "Reçue",
  "Annulée",
];
/** Transitions manuelles autorisées (hors réception). */
export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  Brouillon: ["En attente de validation", "Annulée"],
  "En attente de validation": ["Validée", "Annulée"],
  Validée: ["Annulée"],
  "Partiellement reçue": [],
  Reçue: [],
  Annulée: [],
};

export type OrderLine = { productId: string; qty: number; unitCost: number; received: number };
export type Order = {
  id: string;
  numero: string;
  supplierId: string;
  date: string; // ISO
  delivery: string; // ISO prévue
  status: OrderStatus;
  lines: OrderLine[];
};

export const orderTotal = (o: Order) => round2(o.lines.reduce((a, l) => a + l.qty * l.unitCost, 0));
export const orderQty = (o: Order) => o.lines.reduce((a, l) => a + l.qty, 0);
export const orderReceived = (o: Order) => o.lines.reduce((a, l) => a + l.received, 0);
export const isOpenOrder = (o: Order) => o.status !== "Reçue" && o.status !== "Annulée";

export function validateOrder(o: Order, products: Product[]): string | null {
  if (!o.supplierId) return "Sélectionnez un fournisseur.";
  if (!o.date || !o.delivery) return "Les dates de commande et de livraison sont obligatoires.";
  if (o.delivery < o.date) return "La livraison prévue ne peut pas précéder la commande.";
  if (o.lines.length === 0) return "Ajoutez au moins un article.";
  for (const l of o.lines) {
    if (!products.some((p) => p.id === l.productId)) return "Une ligne référence un produit inconnu.";
    if (!Number.isFinite(l.qty) || l.qty <= 0) return "Les quantités doivent être strictement positives.";
    if (!Number.isFinite(l.unitCost) || l.unitCost < 0) return "Les coûts unitaires doivent être positifs.";
  }
  return null;
}

/** Statut après réception : Reçue si toutes les lignes sont complètes, sinon Partiellement reçue. */
export function statusAfterReceipt(o: Order): OrderStatus {
  return o.lines.every((l) => l.received >= l.qty) ? "Reçue" : "Partiellement reçue";
}

/**
 * Valide une réception : commande réceptionnable, quantités positives,
 * jamais au-delà du reste à livrer (empêche les doubles réceptions),
 * et au moins une quantité saisie.
 */
export function validateReceipt(o: Order, receipts: Record<string, number>): string | null {
  if (o.status === "Reçue" || o.status === "Annulée" || o.status === "Brouillon" || o.status === "En attente de validation")
    return `Une commande au statut « ${o.status} » ne peut pas être réceptionnée.`;
  let any = false;
  for (const l of o.lines) {
    const q = receipts[l.productId] ?? 0;
    if (!Number.isFinite(q) || q < 0) return "Les quantités reçues doivent être positives.";
    if (q > l.qty - l.received) return "La quantité reçue dépasse le reste à livrer sur une ligne.";
    if (q > 0) any = true;
  }
  if (!any) return "Saisissez au moins une quantité reçue.";
  return null;
}

// ---------- Alertes & réapprovisionnement ----------

/** Seuil configurable d'alerte de péremption, en jours. */
export const EXPIRY_ALERT_DAYS = 60;

/** Règle configurable de réapprovisionnement : remonter au stock maximum. */
export const recommendedQty = (p: Product) => Math.max(0, p.max - p.stock);

export type AlertKind = "rupture" | "faible" | "surstock" | "peremption" | "retard";
export type Alert = {
  id: string;
  kind: AlertKind;
  severity: "critique" | "avertissement";
  ref: string;
  designation: string;
  warehouseId?: string;
  stock?: number;
  min?: number;
  suggestedQty?: number;
  detail: string;
  action: string;
  productId?: string;
};

export function buildAlerts(products: Product[], orders: Order[], suppliers: Supplier[], todayISO: string): Alert[] {
  const alerts: Alert[] = [];
  const limit = new Date(new Date(todayISO).getTime() + EXPIRY_ALERT_DAYS * 86400000).toISOString().slice(0, 10);
  for (const p of products) {
    const st = productStatus(p);
    const base = { ref: p.ref, designation: p.designation, warehouseId: p.warehouseId, stock: p.stock, min: p.min, productId: p.id };
    if (st === "rupture")
      alerts.push({ ...base, id: `r-${p.id}`, kind: "rupture", severity: "critique", suggestedQty: recommendedQty(p), detail: "Stock épuisé", action: "Commander en urgence" });
    else if (st === "faible")
      alerts.push({ ...base, id: `f-${p.id}`, kind: "faible", severity: "avertissement", suggestedQty: recommendedQty(p), detail: `Sous le stock minimum (${p.min} ${p.unit})`, action: "Réapprovisionner" });
    else if (st === "surstock")
      alerts.push({ ...base, id: `s-${p.id}`, kind: "surstock", severity: "avertissement", detail: `Au-dessus du stock maximum (${p.max} ${p.unit})`, action: "Écouler ou transférer" });
    if (p.expiry && p.expiry <= limit)
      alerts.push({ ...base, id: `p-${p.id}`, kind: "peremption", severity: "avertissement", detail: `Péremption le ${frDate(p.expiry)}`, action: "Prioriser la sortie (FIFO)" });
  }
  for (const o of orders) {
    if (isOpenOrder(o) && o.delivery < todayISO) {
      const sup = suppliers.find((s) => s.id === o.supplierId)?.name ?? o.supplierId;
      alerts.push({
        id: `o-${o.id}`,
        kind: "retard",
        severity: "critique",
        ref: o.numero,
        designation: sup,
        detail: `Livraison prévue le ${frDate(o.delivery)}`,
        action: "Relancer le fournisseur",
      });
    }
  }
  const rank = { critique: 0, avertissement: 1 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

// ---------- Analyse ----------

/** Rotation = quantités sorties (type « sortie ») / stock actuel. null si aucune sortie ou stock nul. */
export function rotation(productId: string, stock: number, movements: Movement[]): number | null {
  const out = movements.filter((m) => m.productId === productId && m.type === "sortie").reduce((a, m) => a + m.qty, 0);
  if (out === 0 || stock <= 0) return null;
  return round2(out / stock);
}

/**
 * Valeur du stock à une date de fin, reconstruite en retranchant de la valeur
 * actuelle les flux valorisés postérieurs à cette date (approximation CMUP).
 */
export function valueAt(products: Product[], movements: Movement[], endISO: string): number {
  let v = products.reduce((a, p) => a + stockValue(p), 0);
  for (const m of movements) {
    if (m.date > endISO) v -= movementSign(m.type) * m.qty * m.unitCost;
  }
  return round2(v);
}

/** Les n derniers fins de mois (incluant le mois de référence), libellés en français. */
export function lastMonthEnds(n: number, refISO: string): { mois: string; end: string }[] {
  const ref = new Date(`${refISO}T00:00:00Z`);
  const out: { mois: string; end: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - i + 1, 0));
    out.push({ mois: MONTHS[d.getUTCMonth()]!, end: d.toISOString().slice(0, 10) });
  }
  return out;
}

/** Numéro suivant d'une série (« MVT-2026-0042 » → 0043). */
export function nextNumero(prefix: string, existing: string[]): string {
  const max = existing.reduce((a, n) => {
    const m = n.match(/(\d+)$/);
    return m ? Math.max(a, Number(m[1])) : a;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}

/** CSV compatible Excel FR (séparateur « ; », BOM ajouté à l'export). */
export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c).replace(/"/g, '""');
          return /[";\n]/.test(s) ? `"${s}"` : s;
        })
        .join(";"),
    )
    .join("\n");
}
