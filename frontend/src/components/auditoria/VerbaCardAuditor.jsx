import { useState, useEffect, useCallback } from "react";
import { useContract } from "../../hooks/useContract";
import EtapaBadge from "../common/EtapaBadge";
import Progresso from "../common/Progresso";
import {
  formatReais,
  formatData,
  shortAddress,
  hashVazio,
} from "../../utils/format";
import { parseTxError } from "../../utils/tx";
import { verifyFile } from "../../services/hash";
import { getNotaUrlByVerba, storageConfigurado } from "../../services/storage";
import { validarNFe } from "../../services/sefaz";

const ENTREGA_CONFIRMADA = 4;

export default function VerbaCardAuditor({ verba, onChanged }) {
  const { contract } = useContract();
  const [cotacoes, setCotacoes] = useState([]);
  const [notaUrl, setNotaUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await contract.getCotacoes(verba.id);
        if (ativo) setCotacoes(lista);
      } catch (err) {
        console.error(err);
      }
      if (storageConfigurado() && !hashVazio(verba.hashNotaFiscal)) {
        const url = await getNotaUrlByVerba(verba.id);
        if (ativo) setNotaUrl(url);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [contract, verba.id, verba.hashNotaFiscal]);

  async function auditar() {
    setBusy(true);
    setMsg(null);
    try {
      await contract.auditarVerba(verba.id);
      setMsg({ tipo: "ok", texto: "Verba auditada e lacrada." });
      await onChanged?.();
    } catch (err) {
      setMsg({ tipo: "erro", texto: parseTxError(err) });
    } finally {
      setBusy(false);
    }
  }

  const temNota = !hashVazio(verba.hashNotaFiscal);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">#{verba.id}</span>
            <h3 className="text-lg font-bold text-slate-800">{verba.finalidade}</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Escola: <span className="font-mono">{shortAddress(verba.escola)}</span>
          </p>
          <p className="text-sm text-slate-500">
            Verba: <strong>{formatReais(verba.valor)}</strong>
            {verba.valorAprovado > 0n && (
              <> · Aprovado: <strong>{formatReais(verba.valorAprovado)}</strong></>
            )}
          </p>
        </div>
        <EtapaBadge etapa={verba.etapa} />
      </div>

      <div className="p-5 space-y-4">
        <Progresso etapa={verba.etapa} />

        {/* Cotações */}
        {cotacoes.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Cotações ({cotacoes.length})
            </h4>
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {cotacoes.map((c, i) => {
                const venc = verba.fornecedorVencedor === c.fornecedor;
                return (
                  <li
                    key={i}
                    className={`flex justify-between px-4 py-2 text-sm ${
                      venc ? "bg-emerald-50" : "bg-white"
                    }`}
                  >
                    <span>
                      {c.fornecedor}
                      {venc && (
                        <span className="ml-2 text-xs text-emerald-600 font-semibold">
                          ✓ vencedor
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-600">
                      {formatReais(c.valor)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Nota fiscal + verificação de hash */}
        {temNota ? (
          <VerificacaoNota
            verba={verba}
            notaUrl={notaUrl}
          />
        ) : (
          <p className="text-sm text-slate-400">Nota fiscal ainda não anexada.</p>
        )}

        {/* Ação de auditoria */}
        {verba.etapa === ENTREGA_CONFIRMADA && (
          <button
            onClick={auditar}
            disabled={busy}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all disabled:opacity-60"
          >
            {busy ? "Auditando..." : "Auditar e Aprovar Verba"}
          </button>
        )}

        {verba.etapa > ENTREGA_CONFIRMADA && (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">
            ✓ Auditada — registro conferido e lacrado na blockchain.
          </p>
        )}

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
      </div>
    </div>
  );
}

// ── Verificação de integridade da nota fiscal ────────────────────────────────
function VerificacaoNota({ verba, notaUrl }) {
  const [resultado, setResultado] = useState(null); // "ok" | "falha" | null
  const [checando, setChecando] = useState(false);
  const [reconsulta, setReconsulta] = useState(null); // resultado da SEFAZ
  const [reconsultando, setReconsultando] = useState(false);

  async function verificar(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setChecando(true);
    setResultado(null);
    try {
      const ok = await verifyFile(f, verba.hashNotaFiscal);
      setResultado(ok ? "ok" : "falha");
    } catch {
      setResultado("falha");
    } finally {
      setChecando(false);
    }
  }

  async function reconsultarSefaz() {
    setReconsultando(true);
    setReconsulta(null);
    // O auditor reconsulta a SEFAZ usando a chave gravada ON-CHAIN — sem
    // confiar no operador do sistema. Essa é a prova de origem independente.
    const r = await validarNFe({ chave: verba.chaveNFe });
    setReconsulta(r);
    setReconsultando(false);
  }

  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-slate-700">
        Nota fiscal — prova de integridade + origem
      </h4>
      <p className="text-xs font-mono break-all text-slate-500">
        hash on-chain: {verba.hashNotaFiscal}
      </p>
      {verba.chaveNFe && (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>chave NF-e: <span className="font-mono break-all">{verba.chaveNFe}</span></p>
          <p>emitente (CNPJ): <span className="font-mono">{verba.cnpjEmitente}</span></p>
          <p>valor da nota: <strong>{formatReais(verba.valorNFe)}</strong></p>
        </div>
      )}
      <p className="text-xs text-slate-500">
        Anexada em {formatData(verba.notaAnexadaEm)}
      </p>

      {/* Reconsulta independente na SEFAZ */}
      {verba.chaveNFe && (
        <div>
          <button
            onClick={reconsultarSefaz}
            disabled={reconsultando}
            className="text-sm bg-slate-700 text-white px-4 py-1.5 rounded-lg hover:bg-slate-600 transition-all disabled:opacity-60"
          >
            {reconsultando ? "Consultando..." : "🔎 Reconsultar na SEFAZ"}
          </button>
          {reconsulta && (
            <p
              className={`text-sm rounded-lg p-2 mt-2 ${
                reconsulta.valido
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {reconsulta.valido
                ? `✓ SEFAZ confirma: ${reconsulta.situacao} · emitente ${reconsulta.emitente?.cnpj}`
                : `✗ ${reconsulta.motivo || reconsulta.situacao}`}
            </p>
          )}
        </div>
      )}

      {notaUrl && (
        <a
          href={notaUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-blue-600 hover:underline"
        >
          ⬇ Baixar nota (Supabase)
        </a>
      )}

      <div>
        <label className="text-xs text-slate-500 block mb-1">
          Verificar um arquivo: confere se o hash bate com o registrado on-chain.
        </label>
        <input
          type="file"
          onChange={verificar}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white file:text-xs hover:file:bg-slate-600"
        />
      </div>

      {checando && <p className="text-xs text-slate-500">Calculando hash...</p>}
      {resultado === "ok" && (
        <p className="text-sm font-semibold text-emerald-700 bg-emerald-100 rounded-lg p-2">
          ✓ Autêntico — o arquivo corresponde exatamente ao hash gravado. Não foi
          alterado.
        </p>
      )}
      {resultado === "falha" && (
        <p className="text-sm font-semibold text-red-700 bg-red-100 rounded-lg p-2">
          ✗ NÃO confere — este arquivo é diferente do que foi registrado on-chain.
        </p>
      )}
    </div>
  );
}
