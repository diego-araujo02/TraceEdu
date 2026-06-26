import { useState, useMemo } from "react";
import { useRole } from "../hooks/useRole";
import { useVerbas } from "../hooks/useVerbas";
import StatusGate from "../components/common/StatusGate";
import VerbaCardAuditor from "../components/auditoria/VerbaCardAuditor";
import { formatReais } from "../utils/format";

const ENTREGA_CONFIRMADA = 4;
const AUDITADO = 5;

export default function Auditoria() {
  const { isAuditor, loading: loadingRole } = useRole();

  return (
    <StatusGate allow={isAuditor} loading={loadingRole} papel="um auditor cadastrado">
      <PainelAuditoria />
    </StatusGate>
  );
}

function PainelAuditoria() {
  const { verbas, loading, reload } = useVerbas(); // todas
  const [filtro, setFiltro] = useState("todas");

  const stats = useMemo(() => {
    const total = verbas.reduce((s, v) => s + v.valor, 0n);
    const pendentes = verbas.filter((v) => v.etapa === ENTREGA_CONFIRMADA).length;
    const auditadas = verbas.filter((v) => v.etapa === AUDITADO).length;
    return { total, pendentes, auditadas, qtd: verbas.length };
  }, [verbas]);

  const lista = useMemo(() => {
    if (filtro === "pendentes")
      return verbas.filter((v) => v.etapa === ENTREGA_CONFIRMADA);
    if (filtro === "auditadas") return verbas.filter((v) => v.etapa === AUDITADO);
    return verbas;
  }, [verbas, filtro]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">Portal de Auditoria</h1>
        <p className="text-slate-500 mt-1">
          Histórico completo e imutável de todas as verbas. Verifique a autenticidade
          das notas fiscais em segundos.
        </p>
      </header>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat titulo="Verbas" valor={stats.qtd} />
        <Stat titulo="Valor total" valor={formatReais(stats.total)} />
        <Stat titulo="A auditar" valor={stats.pendentes} destaque="amber" />
        <Stat titulo="Auditadas" valor={stats.auditadas} destaque="emerald" />
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            ["todas", "Todas"],
            ["pendentes", "A auditar"],
            ["auditadas", "Auditadas"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filtro === key
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={reload}
          disabled={loading}
          className="text-sm text-emerald-600 hover:underline"
        >
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </div>

      {/* Lista */}
      <section className="space-y-5">
        {!loading && lista.length === 0 && (
          <p className="text-slate-400 text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhuma verba neste filtro.
          </p>
        )}
        {lista.map((v) => (
          <VerbaCardAuditor key={v.id} verba={v} onChanged={reload} />
        ))}
      </section>
    </div>
  );
}

function Stat({ titulo, valor, destaque }) {
  const cor =
    destaque === "amber"
      ? "text-amber-600"
      : destaque === "emerald"
      ? "text-emerald-600"
      : "text-slate-800";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <p className="text-xs text-slate-400 uppercase tracking-wide">{titulo}</p>
      <p className={`text-xl font-extrabold mt-1 ${cor}`}>{valor}</p>
    </div>
  );
}
