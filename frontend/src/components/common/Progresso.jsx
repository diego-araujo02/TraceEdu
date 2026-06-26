// Linha do tempo das 6 etapas da verba (índice = enum Etapa do contrato).
const PASSOS = ["Verba", "Cotações", "Aprovada", "Nota", "Entrega", "Auditada"];

export default function Progresso({ etapa }) {
  return (
    <div className="flex items-center gap-1">
      {PASSOS.map((p, i) => (
        <div key={p} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full h-1.5 rounded-full ${
              i <= etapa ? "bg-blue-500" : "bg-slate-200"
            }`}
          />
          <span
            className={`text-[10px] ${
              i <= etapa ? "text-blue-600 font-semibold" : "text-slate-400"
            }`}
          >
            {p}
          </span>
        </div>
      ))}
    </div>
  );
}
