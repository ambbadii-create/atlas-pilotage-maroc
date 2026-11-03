import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntegrationStatus, UserStatus, ValidationStatus } from "@/lib/admin/model";
import { validationStatusLabel } from "@/lib/admin/model";

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function Tag({ tone = "neutral", children }: { tone?: "good" | "bad" | "warn" | "info" | "neutral"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone === "good" && "bg-success-soft text-success",
        tone === "bad" && "bg-destructive-soft text-destructive",
        tone === "warn" && "bg-warning-soft text-warning",
        tone === "info" && "bg-accent text-accent-foreground",
        tone === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <Tag tone={status === "actif" ? "good" : status === "suspendu" ? "bad" : "neutral"}>
      {status === "actif" ? "Actif" : status === "suspendu" ? "Suspendu" : "Inactif"}
    </Tag>
  );
}

export function ValidationStatusBadge({ status }: { status: ValidationStatus }) {
  const tone =
    status === "valide" ? "good" : status === "rejete" ? "bad" : status === "annule" ? "neutral" : status === "en_cours" ? "info" : "warn";
  return <Tag tone={tone}>{validationStatusLabel(status)}</Tag>;
}

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === "connecte") return <Tag tone="good">Connecté</Tag>;
  if (status === "erreur") return <Tag tone="bad">Erreur</Tag>;
  return <Tag tone="neutral">Non configuré</Tag>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Basculer"}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn("card-elevated mt-10 w-full p-6", wide ? "max-w-3xl" : "max-w-lg")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} aria-label="Fermer" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{message}</p>;
}
