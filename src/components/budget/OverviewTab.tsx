import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Panel } from "@/components/app/ui-bits";
import {
  CATEGORIES, CENTRES, MONTHS, achievementRate, forecastYear, isRevenue, lineStats, sumStats, varianceNature,
  type BudgetLine, type Category,
} from "@/lib/budget/model";
import { StatCard, fmt, fmtM, pct } from "./ui";

const tip = { contentStyle: { borderRadius: 10, border: "1px solid var(--border)", fontSize: 12 } };
const mAxis = (v: number) => `${(v / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;

export function OverviewTab({ lines, months, centreOf }: { lines: BudgetLine[]; months: number[]; centreOf: (l: BudgetLine) => string }) {
  const [scope, setScope] = useState<"charges" | "revenus">("charges");
  const scoped = lines.filter((l) => (scope === "revenus" ? isRevenue(l.category) : !isRevenue(l.category)));
  const s = sumStats(scoped.map((l) => lineStats(l, months)));
  const ecart = s.actual - s.budgetToDate;
  const nature = varianceNature(scope === "revenus" ? "revenus" : "achats", ecart);
  const fy = scoped.reduce((a, l) => a + forecastYear(l), 0);
  const fyBudget = scoped.reduce((a, l) => a + lineStats(l).budgetYear, 0);

  const monthly = months.map((m) => ({
    mois: MONTHS[m],
    budget: scoped.reduce((a, l) => a + (l.budget[m] ?? 0), 0),
    reel: scoped.some((l) => l.actual[m] != null) ? scoped.reduce((a, l) => a + (l.actual[m] ?? 0), 0) : null,
  }));

  const group = (key: (l: BudgetLine) => string, labels: { id: string; label: string }[]) =>
    labels
      .map((g) => {
        const gl = lines.filter((l) => key(l) === g.id);
        const st = sumStats(gl.map((l) => lineStats(l, months)));
        // écart signé "favorable positif" : recettes +, charges −
        const fav = gl.reduce((a, l) => {
          const x = lineStats(l, months);
          return a + (isRevenue(l.category) ? 1 : -1) * (x.actual - x.budgetToDate);
        }, 0);
        return { name: g.label, ecart: Math.round(fav), budget: st.budgetToDate, n: gl.length };
      })
      .filter((g) => g.n > 0);

  const byCentre = group(centreOf, CENTRES);
  const byCat = group((l) => l.category, CATEGORIES.map((c) => ({ id: c.id, label: c.label })));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Périmètre des indicateurs :</span>
        {(["charges", "revenus"] as const).map((k) => (
          <button key={k} onClick={() => setScope(k)} className={`rounded-full px-3 py-1 text-xs font-semibold ${scope === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {k === "charges" ? "Charges" : "Chiffre d'affaires"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Budget total" value={fmtM(s.budgetYear)} sub="Période sélectionnée" />
        <StatCard label="Réalisé à date" value={fmtM(s.actual)} sub={`vs budget à date ${fmtM(s.budgetToDate)}`} />
        <StatCard label="Écart (MAD)" value={`${ecart > 0 ? "+" : ""}${fmt(ecart)}`} tone={nature === "favorable" ? "good" : nature === "defavorable" ? "bad" : undefined} sub={nature === "favorable" ? "Favorable" : nature === "defavorable" ? "Défavorable" : "—"} />
        <StatCard label="Taux de réalisation" value={pct(achievementRate(s.actual, s.budgetToDate))} sub="Réel / budget des mois réalisés" />
        <StatCard label="Prévision fin d'année" value={fmtM(fy)} tone="forecast" sub={`Budget annuel ${fmtM(fyBudget)} · estimation`} />
      </div>

      <Panel title="Budget vs réalisé mensuel" subtitle={scope === "charges" ? "Charges, en DH" : "Chiffre d'affaires, en DH"}>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={monthly} barGap={3}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mois" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickFormatter={mAxis} tickLine={false} axisLine={false} fontSize={12} width={44} />
              <Tooltip {...tip} formatter={(v: number) => fmt(v)} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar name="Budget" dataKey="budget" fill="var(--chart-2)" radius={[5, 5, 0, 0]} />
              <Bar name="Réalisé" dataKey="reel" fill="var(--chart-1)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        {[{ t: "Écarts par centre de coûts", d: byCentre }, { t: "Écarts par catégorie", d: byCat }].map((g) => (
          <Panel key={g.t} title={g.t} subtitle="Impact sur le résultat : positif = favorable, négatif = défavorable">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={g.d} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${Math.round(v / 1000)} k`} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={150} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip {...tip} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="ecart" name="Écart" radius={4}>
                    {g.d.map((x) => <Cell key={x.name} fill={x.ecart >= 0 ? "var(--success)" : "var(--destructive)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export type { Category };
