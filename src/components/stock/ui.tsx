import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type MovementType, type OrderStatus, type StockStatus } from "@/lib/stock/model";

export function Modal({ title, subtitle, onClose, children, wide }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className={cn("card-elevated my-8 w-full p-6", wide ? "max-w-3xl" : "max-w-lg")} onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const statusCls: Record<StockStatus, string> = {
  disponible: "bg-success-soft text-success",
  faible: "bg-warning-soft text-foreground",
  rupture: "bg-destructive-soft text-destructive",
  surstock: "bg-accent text-accent-foreground",
};
export function StatusBadge({ s }: { s: StockStatus }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusCls[s])}>{STATUS_LABELS[s]}</span>;
}

const orderCls: Record<OrderStatus, string> = {
  Brouillon: "bg-muted text-muted-foreground",
  "En attente de validation": "bg-warning-soft text-foreground",
  Validée: "bg-accent text-accent-foreground",
  "Partiellement reçue": "bg-warning-soft text-foreground",
  Reçue: "bg-success-soft text-success",
  Annulée: "bg-destructive-soft text-destructive",
};
export function OrderBadge({ s }: { s: OrderStatus }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", orderCls[s])}>{s}</span>;
}

const mvCls: Record<1 | -1 | 0, string> = {
  1: "bg-success-soft text-success",
  "-1": "bg-destructive-soft text-destructive",
  0: "bg-accent text-accent-foreground",
};
export function MovementBadge({ type, label, sign }: { type: MovementType; label: string; sign: 1 | -1 | 0 }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", mvCls[sign])} data-type={type}>{label}</span>;
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-3 text-xs text-muted-foreground">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-border p-1.5 hover:bg-muted disabled:opacity-40" aria-label="Page précédente">
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <span>Page {page} / {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-lg border border-border p-1.5 hover:bg-muted disabled:opacity-40" aria-label="Page suivante">
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded-lg bg-destructive-soft px-3 py-2 text-xs font-semibold text-destructive">{message}</p>;
}
