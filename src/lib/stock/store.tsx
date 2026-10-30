import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { buildDemo } from "./demo";
import {
  applyMovement,
  nextNumero,
  statusAfterReceipt,
  validateOrder,
  validateProduct,
  validateReceipt,
  type Movement,
  type MovementType,
  type Order,
  type OrderStatus,
  type Product,
  type Supplier,
} from "./model";

type State = { products: Product[]; movements: Movement[]; orders: Order[]; suppliers: Supplier[] };
const KEY = "pilotage-cg-stocks-v1";

export type MovementInput = {
  date: string;
  type: MovementType;
  productId: string;
  qty: number;
  unitCost: number;
  doc?: string;
  user?: string;
};

type Ctx = State & {
  /** Renvoie null si OK, sinon le message d'erreur. */
  upsertProduct: (p: Product) => string | null;
  addMovement: (mv: MovementInput, targetWarehouseId?: string) => string | null;
  upsertOrder: (o: Order) => string | null;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  receiveOrder: (id: string, receipts: Record<string, number>) => string | null;
  reset: () => void;
};

const StockCtx = createContext<Ctx | null>(null);
const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function StockProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(buildDemo);
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

  const ctx: Ctx = {
    ...state,

    upsertProduct: (p) => {
      const error = validateProduct(p, state.products);
      if (error) return error;
      setState((s) => ({
        ...s,
        products: s.products.some((x) => x.id === p.id) ? s.products.map((x) => (x.id === p.id ? p : x)) : [...s.products, p],
      }));
      return null;
    },

    addMovement: (mv, targetWarehouseId) => {
      const p = state.products.find((x) => x.id === mv.productId);
      if (!p) return "Produit introuvable.";
      const r = applyMovement(p, mv, targetWarehouseId);
      if (r.error || !r.product) return r.error ?? "Mouvement invalide.";
      const product = r.product;
      setState((s) => ({
        ...s,
        products: s.products.map((x) => (x.id === p.id ? product : x)),
        movements: [
          {
            ...mv,
            id: uid("M"),
            numero: nextNumero("MVT-2026", s.movements.map((m) => m.numero)),
            warehouseId: mv.type === "transfert" && targetWarehouseId ? targetWarehouseId : p.warehouseId,
          },
          ...s.movements,
        ],
      }));
      return null;
    },

    upsertOrder: (o) => {
      const error = validateOrder(o, state.products);
      if (error) return error;
      setState((s) => ({
        ...s,
        orders: s.orders.some((x) => x.id === o.id) ? s.orders.map((x) => (x.id === o.id ? o : x)) : [o, ...s.orders],
      }));
      return null;
    },

    setOrderStatus: (id, status) =>
      setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),

    receiveOrder: (id, receipts) => {
      const order = state.orders.find((o) => o.id === id);
      if (!order) return "Commande introuvable.";
      const error = validateReceipt(order, receipts);
      if (error) return error;
      // Pré-calcule les produits mis à jour (CMUP) avant de valider l'écriture.
      const updated = new Map<string, Product>();
      for (const l of order.lines) {
        const q = receipts[l.productId] ?? 0;
        if (q <= 0) continue;
        const p = state.products.find((x) => x.id === l.productId);
        if (!p) return "Produit introuvable.";
        const r = applyMovement(p, { type: "entree", qty: q, unitCost: l.unitCost });
        if (r.error || !r.product) return r.error ?? "Réception invalide.";
        updated.set(l.productId, r.product);
      }
      setState((s) => {
        const newOrder: Order = {
          ...order,
          lines: order.lines.map((l) => ({ ...l, received: l.received + (receipts[l.productId] ?? 0) })),
        };
        newOrder.status = statusAfterReceipt(newOrder);
        const newMovements: Movement[] = order.lines
          .filter((l) => (receipts[l.productId] ?? 0) > 0)
          .map((l, i) => ({
            id: uid(`MR${i}`),
            numero: nextNumero("MVT-2026", [...s.movements.map((m) => m.numero), ...Array(i).fill("")]),
            date: new Date().toISOString().slice(0, 10),
            type: "entree" as const,
            productId: l.productId,
            warehouseId: updated.get(l.productId)!.warehouseId,
            qty: receipts[l.productId] ?? 0,
            unitCost: l.unitCost,
            doc: order.numero,
            orderId: order.id,
          }));
        return {
          ...s,
          products: s.products.map((p) => updated.get(p.id) ?? p),
          orders: s.orders.map((o) => (o.id === id ? newOrder : o)),
          movements: [...newMovements, ...s.movements],
        };
      });
      return null;
    },

    reset: () => setState(buildDemo()),
  };
  return <StockCtx.Provider value={ctx}>{children}</StockCtx.Provider>;
}

export function useStock() {
  const c = useContext(StockCtx);
  if (!c) throw new Error("useStock hors StockProvider");
  return c;
}
