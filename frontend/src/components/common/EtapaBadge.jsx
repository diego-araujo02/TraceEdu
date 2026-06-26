// Mapeia o índice da etapa (uint8 do contrato) para rótulo + classes Tailwind.
// Mantemos as classes completas (não interpoladas) para o Tailwind não purgar.
const ETAPA_INFO = [
  { label: "Verba Recebida", cls: "bg-blue-100 text-blue-700 ring-blue-600/20" },
  { label: "Cotações Registradas", cls: "bg-amber-100 text-amber-700 ring-amber-600/20" },
  { label: "Compra Aprovada", cls: "bg-orange-100 text-orange-700 ring-orange-600/20" },
  { label: "Nota Fiscal Anexada", cls: "bg-purple-100 text-purple-700 ring-purple-600/20" },
  { label: "Entrega Confirmada", cls: "bg-teal-100 text-teal-700 ring-teal-600/20" },
  { label: "Auditado ✓", cls: "bg-emerald-100 text-emerald-700 ring-emerald-600/20" },
];

export const ETAPA_LABELS = ETAPA_INFO.map((e) => e.label);

export default function EtapaBadge({ etapa }) {
  const info = ETAPA_INFO[Number(etapa)] ?? {
    label: "Desconhecida",
    cls: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${info.cls}`}
    >
      {info.label}
    </span>
  );
}
