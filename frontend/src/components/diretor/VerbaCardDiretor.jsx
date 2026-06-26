import { useState, useEffect, useCallback } from "react";
import { useContract } from "../../hooks/useContract";
import EtapaBadge from "../common/EtapaBadge";
import Progresso from "../common/Progresso";
import { formatReais, formatData, reaisToWei } from "../../utils/format";
import { parseTxError } from "../../utils/tx";
import { hashString } from "../../services/hash";
import { uploadNotaFiscal, storageConfigurado } from "../../services/storage";
import { validarNFe } from "../../services/sefaz";

// Índices das etapas (devem espelhar o enum Etapa do contrato)
const RECEBIDA = 0;
const COTACOES = 1;
const APROVADA = 2;
const NOTA_ANEXADA = 3;
const ENTREGA_CONFIRMADA = 4;
const AUDITADO = 5;

const MIN_COTACOES_DEFAULT = 3;

export default function VerbaCardDiretor({ verba, onChanged }) {
  const { contract } = useContract();
  const [cotacoes, setCotacoes] = useState([]);
  const [minCotacoes, setMinCotacoes] = useState(MIN_COTACOES_DEFAULT);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const carregarCotacoes = useCallback(async () => {
    if (!contract) return;
    try {
      const lista = await contract.getCotacoes(verba.id);
      setCotacoes(lista);
    } catch (err) {
      console.error("Erro ao ler cotações:", err);
    }
  }, [contract, verba.id]);

  useEffect(() => {
    carregarCotacoes();
  }, [carregarCotacoes]);

  // Lê o mínimo de cotações vigente no contrato (configurável pelo admin).
  useEffect(() => {
    if (!contract) return;
    contract
      .minCotacoes()
      .then((n) => setMinCotacoes(Number(n)))
      .catch(() => {});
  }, [contract]);

  // Wrapper padrão de transação: cuida de busy + mensagens + recarregar.
  async function exec(fn, sucesso) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ tipo: "ok", texto: sucesso });
      await carregarCotacoes();
      await onChanged?.();
    } catch (err) {
      setMsg({ tipo: "erro", texto: parseTxError(err) });
    } finally {
      setBusy(false);
    }
  }

  const etapa = verba.etapa;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">#{verba.id}</span>
            <h3 className="text-lg font-bold text-slate-800">{verba.finalidade}</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Verba: <strong>{formatReais(verba.valor)}</strong>
            {verba.valorAprovado > 0n && (
              <> · Aprovado: <strong>{formatReais(verba.valorAprovado)}</strong></>
            )}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Criada em {formatData(verba.criadaEm)}
          </p>
        </div>
        <EtapaBadge etapa={etapa} />
      </div>

      <div className="p-5 space-y-4">
        {/* Linha do tempo simplificada */}
        <Progresso etapa={etapa} />

        {/* ── Etapa: COTAÇÕES ───────────────────────────────────────────── */}
        {(etapa === RECEBIDA || etapa === COTACOES) && (
          <SecaoCotacoes
            cotacoes={cotacoes}
            min={minCotacoes}
            busy={busy}
            onAddCotacao={(c) =>
              exec(
                () =>
                  contract.registrarCotacao(
                    verba.id,
                    c.fornecedor,
                    reaisToWei(c.valor),
                    c.descricao
                  ),
                "Cotação registrada na blockchain."
              )
            }
            onAprovar={(a) =>
              exec(
                () =>
                  contract.aprovarCompra(
                    verba.id,
                    a.fornecedor,
                    reaisToWei(a.valor)
                  ),
                "Compra aprovada."
              )
            }
            verbaValor={verba.valor}
          />
        )}

        {/* Cotações já registradas (somente leitura nas etapas seguintes) */}
        {etapa > COTACOES && cotacoes.length > 0 && (
          <ListaCotacoes cotacoes={cotacoes} vencedor={verba.fornecedorVencedor} />
        )}

        {/* ── Etapa: ANEXAR NOTA FISCAL (via SEFAZ) ─────────────────────── */}
        {etapa === APROVADA && (
          <AnexarNota
            verba={verba}
            busy={busy}
            onAnexar={(fn) => exec(fn, "Nota validada na SEFAZ e gravada on-chain.")}
            contract={contract}
          />
        )}

        {/* ── Etapa: CONFIRMAR ENTREGA ──────────────────────────────────── */}
        {etapa === NOTA_ANEXADA && (
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-600 mb-3">
              Nota fiscal anexada. Confirme o recebimento dos itens para liberar a
              auditoria.
            </p>
            <button
              disabled={busy}
              onClick={() =>
                exec(() => contract.confirmarEntrega(verba.id), "Entrega confirmada.")
              }
              className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-500 transition-all disabled:opacity-60"
            >
              {busy ? "Confirmando..." : "Confirmar Entrega"}
            </button>
          </div>
        )}

        {etapa === ENTREGA_CONFIRMADA && (
          <p className="text-sm text-teal-700 bg-teal-50 rounded-xl p-4">
            ✓ Entrega confirmada. Aguardando auditoria da secretaria / tribunal de
            contas.
          </p>
        )}

        {etapa === AUDITADO && (
          <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-4">
            ✓ Verba auditada e aprovada. Ciclo concluído e lacrado na blockchain.
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

// ── Seção de cotações (adicionar + aprovar) ──────────────────────────────────
function SecaoCotacoes({ cotacoes, min, busy, onAddCotacao, onAprovar, verbaValor }) {
  const [fornecedor, setFornecedor] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  const podeAprovar = cotacoes.length >= min;

  function submitCotacao(e) {
    e.preventDefault();
    if (!fornecedor || !valor) return;
    onAddCotacao({ fornecedor, valor, descricao });
    setFornecedor("");
    setValor("");
    setDescricao("");
  }

  return (
    <div className="space-y-4">
      <ListaCotacoes cotacoes={cotacoes} />

      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700 text-sm">
            Cotações ({cotacoes.length}/{min})
          </h4>
          {!podeAprovar && (
            <span className="text-xs text-amber-600">
              Faltam {min - cotacoes.length} para liberar a aprovação
            </span>
          )}
        </div>

        <form onSubmit={submitCotacao} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={fornecedor}
            onChange={(e) => setFornecedor(e.target.value)}
            placeholder="Fornecedor"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Valor (R$)"
            inputMode="decimal"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição"
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={busy || !fornecedor || !valor}
            className="sm:col-span-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-500 transition-all disabled:opacity-60"
          >
            {busy ? "Registrando..." : "Adicionar Cotação"}
          </button>
        </form>
      </div>

      {podeAprovar && (
        <AprovarCompra
          cotacoes={cotacoes}
          busy={busy}
          verbaValor={verbaValor}
          onAprovar={onAprovar}
        />
      )}
    </div>
  );
}

function AprovarCompra({ cotacoes, busy, verbaValor, onAprovar }) {
  const [idx, setIdx] = useState(0);
  const escolhida = cotacoes[idx];

  function submit(e) {
    e.preventDefault();
    if (!escolhida) return;
    onAprovar({
      fornecedor: escolhida.fornecedor,
      // valor da cotação vencedora, em reais (string) → o pai converte p/ wei
      valor: Number(escolhida.valor) / 1e18,
    });
  }

  return (
    <form onSubmit={submit} className="bg-orange-50 border border-orange-100 rounded-xl p-4">
      <h4 className="font-semibold text-orange-800 text-sm mb-3">
        Aprovar compra (fornecedor vencedor)
      </h4>
      <select
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm mb-3 bg-white"
      >
        {cotacoes.map((c, i) => (
          <option key={i} value={i}>
            {c.fornecedor} — {formatReais(c.valor)}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={busy}
        className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-500 transition-all disabled:opacity-60"
      >
        {busy ? "Aprovando..." : "Aprovar Fornecedor Vencedor"}
      </button>
    </form>
  );
}

function ListaCotacoes({ cotacoes, vencedor }) {
  if (!cotacoes.length) return null;
  return (
    <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
      {cotacoes.map((c, i) => {
        const isVencedor = vencedor && c.fornecedor === vencedor;
        return (
          <li
            key={i}
            className={`flex items-center justify-between px-4 py-2 text-sm ${
              isVencedor ? "bg-emerald-50" : "bg-white"
            }`}
          >
            <div>
              <span className="font-medium text-slate-700">{c.fornecedor}</span>
              {isVencedor && (
                <span className="ml-2 text-xs text-emerald-600 font-semibold">
                  ✓ vencedor
                </span>
              )}
              {c.descricao && (
                <span className="block text-xs text-slate-400">{c.descricao}</span>
              )}
            </div>
            <span className="font-mono text-slate-600">{formatReais(c.valor)}</span>
          </li>
        );
      })}
    </ul>
  );
}

// ── Anexar nota fiscal (validação na SEFAZ + hash do XML) ────────────────────
function AnexarNota({ verba, busy, onAnexar, contract }) {
  const [chave, setChave] = useState("");
  const [validando, setValidando] = useState(false);
  const [nfe, setNfe] = useState(null); // resultado da SEFAZ quando válida
  const [erro, setErro] = useState(null);

  const cnpjEscola = import.meta.env.VITE_CNPJ_ESCOLA || "";
  const valorRefReais = Number(verba.valorAprovado) / 1e18;

  async function validar() {
    setValidando(true);
    setErro(null);
    setNfe(null);
    const r = await validarNFe({
      chave: chave.replace(/\D/g, ""),
      cnpjEscola,
      valorReferencia: valorRefReais,
    });
    if (r.valido) setNfe(r);
    else setErro(r.motivo || r.situacao || "NF-e inválida.");
    setValidando(false);
  }

  function anexar() {
    if (!nfe) return;
    onAnexar(async () => {
      // 1) Hash do XML CANÔNICO devolvido pela SEFAZ (não de um PDF qualquer)
      const hash = await hashString(nfe.xml);
      // 2) Guarda o XML off-chain (Supabase), se configurado
      try {
        await uploadNotaFiscal(
          new Blob([nfe.xml], { type: "application/xml" }),
          verba.id
        );
      } catch (err) {
        console.warn("Upload off-chain falhou, seguindo só com o hash:", err);
      }
      // 3) Grava hash + chave + CNPJ + valor oficial on-chain
      await contract.anexarNotaFiscal(
        verba.id,
        hash,
        nfe.chave,
        nfe.emitente.cnpj,
        reaisToWei(nfe.valorTotal)
      );
    });
  }

  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
      <h4 className="font-semibold text-purple-800 text-sm">
        Anexar nota fiscal (validada na SEFAZ)
      </h4>
      <p className="text-xs text-purple-700/80">
        Informe a chave de acesso (44 dígitos). O backend confirma na SEFAZ que a
        NF-e existe e está autorizada; só o hash do XML e a chave entram on-chain.
        {!storageConfigurado() && (
          <span className="block mt-1 text-purple-600">
            Storage off-chain não configurado: o hash e a chave ainda são gravados.
          </span>
        )}
      </p>

      <input
        value={chave}
        onChange={(e) => {
          setChave(e.target.value);
          setNfe(null);
          setErro(null);
        }}
        placeholder="Chave de acesso da NF-e (44 dígitos)"
        inputMode="numeric"
        className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm font-mono"
      />

      {!nfe && (
        <button
          disabled={validando || chave.replace(/\D/g, "").length !== 44}
          onClick={validar}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-500 transition-all disabled:opacity-60"
        >
          {validando ? "Consultando SEFAZ..." : "Validar na SEFAZ"}
        </button>
      )}

      {erro && (
        <p className="text-sm bg-red-50 text-red-600 rounded-lg p-3">✗ {erro}</p>
      )}

      {nfe && (
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-3 text-sm text-slate-600 space-y-1">
            <p className="text-emerald-700 font-semibold">✓ {nfe.situacao}</p>
            <p>Emitente (CNPJ): <span className="font-mono">{nfe.emitente?.cnpj}</span></p>
            <p>Valor da nota: <strong>{formatReais(reaisToWei(nfe.valorTotal))}</strong></p>
          </div>
          <button
            disabled={busy}
            onClick={anexar}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-500 transition-all disabled:opacity-60"
          >
            {busy ? "Gravando..." : "Anexar e Gravar On-chain"}
          </button>
        </div>
      )}
    </div>
  );
}
