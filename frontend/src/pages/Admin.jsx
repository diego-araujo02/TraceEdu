import { useState } from "react";
import { ethers } from "ethers";
import { useContract } from "../hooks/useContract";
import { useRole } from "../hooks/useRole";
import StatusGate from "../components/common/StatusGate";
import { parseTxError } from "../utils/tx";

export default function Admin() {
  const { isOwner, loading } = useRole();
  return (
    <StatusGate allow={isOwner} loading={loading} papel="o administrador (owner do contrato)">
      <PainelAdmin />
    </StatusGate>
  );
}

function PainelAdmin() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900">Administração</h1>
        <p className="text-slate-500 mt-1">
          Cadastre as carteiras que poderão atuar como escolas (diretores) e como
          auditores (secretaria / tribunal de contas).
        </p>
      </header>

      <CadastroCard
        titulo="Cadastrar Escola"
        descricao="Permite que esta carteira registre verbas e conduza licitações."
        rotuloBotao="Adicionar Escola"
        cor="blue"
        acao={(contract, addr) => contract.addEscola(addr)}
      />

      <CadastroCard
        titulo="Cadastrar Auditor"
        descricao="Permite que esta carteira audite verbas com entrega confirmada."
        rotuloBotao="Adicionar Auditor"
        cor="emerald"
        acao={(contract, addr) => contract.addAuditor(addr)}
      />
    </div>
  );
}

function CadastroCard({ titulo, descricao, rotuloBotao, cor, acao }) {
  const { contract } = useContract();
  const [addr, setAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const cores = {
    blue: "bg-blue-600 hover:bg-blue-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500",
  };

  async function submit(e) {
    e.preventDefault();
    if (!ethers.isAddress(addr)) {
      setMsg({ tipo: "erro", texto: "Endereço inválido." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await acao(contract, addr);
      setMsg({ tipo: "ok", texto: "Cadastrado com sucesso na blockchain." });
      setAddr("");
    } catch (err) {
      setMsg({ tipo: "erro", texto: parseTxError(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3"
    >
      <h2 className="font-bold text-slate-800">{titulo}</h2>
      <p className="text-sm text-slate-500">{descricao}</p>
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        placeholder="0x..."
        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono"
      />
      <button
        type="submit"
        disabled={busy || !addr}
        className={`text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${cores[cor]}`}
      >
        {busy ? "Enviando..." : rotuloBotao}
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
  );
}
