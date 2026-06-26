import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "../hooks/useContract";
import { useRole } from "../hooks/useRole";
import { useVerbas } from "../hooks/useVerbas";
import StatusGate from "../components/common/StatusGate";
import VerbaCardDiretor from "../components/diretor/VerbaCardDiretor";
import { reaisToWei } from "../utils/format";
import { parseTxError } from "../utils/tx";

export default function Diretor() {
  const { address } = useWallet();
  const { isEscola, loading: loadingRole } = useRole();

  return (
    <StatusGate allow={isEscola} loading={loadingRole} papel="uma escola cadastrada">
      <PainelDiretor address={address} />
    </StatusGate>
  );
}

function PainelDiretor({ address }) {
  const { contract } = useContract();
  const { verbas, loading, reload } = useVerbas({ escola: address });

  const [finalidade, setFinalidade] = useState("");
  const [valor, setValor] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function registrar(e) {
    e.preventDefault();
    if (!finalidade || !valor) return;
    setBusy(true);
    setMsg(null);
    try {
      await contract.registrarVerba(reaisToWei(valor), finalidade);
      setMsg({ tipo: "ok", texto: "Verba registrada na blockchain." });
      setFinalidade("");
      setValor("");
      await reload();
    } catch (err) {
      setMsg({ tipo: "erro", texto: parseTxError(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">Painel da Escola</h1>
        <p className="text-slate-500 mt-1">
          Lance verbas e conduza a licitação etapa por etapa. Cada passo é gravado de
          forma imutável.
        </p>
      </header>

      {/* Registrar nova verba */}
      <form
        onSubmit={registrar}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
      >
        <h2 className="font-bold text-slate-800">Registrar nova verba recebida</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={finalidade}
            onChange={(e) => setFinalidade(e.target.value)}
            placeholder="Finalidade (ex.: Merenda)"
            className="sm:col-span-2 border border-slate-300 rounded-lg px-3 py-2.5 text-sm"
          />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Valor (R$)"
            inputMode="decimal"
            className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !finalidade || !valor}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-500 transition-all disabled:opacity-60"
        >
          {busy ? "Registrando..." : "Registrar Verba"}
        </button>
        {msg && (
          <p
            className={`text-sm rounded-lg p-3 ${
              msg.tipo === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {msg.texto}
          </p>
        )}
      </form>

      {/* Lista de verbas */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Minhas verbas</h2>
          <button
            onClick={reload}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>

        {!loading && verbas.length === 0 && (
          <p className="text-slate-400 text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
            Nenhuma verba registrada ainda.
          </p>
        )}

        {verbas.map((v) => (
          <VerbaCardDiretor key={v.id} verba={v} onChanged={reload} />
        ))}
      </section>
    </div>
  );
}
