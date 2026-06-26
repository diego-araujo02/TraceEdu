import { useState, useEffect, useCallback } from "react";
import { useContract } from "./useContract";

/** Normaliza o struct on-chain (Result do ethers) para um objeto simples. */
export function mapVerba(v) {
  return {
    id: Number(v.id),
    escola: v.escola,
    valor: v.valor, // bigint (wei)
    finalidade: v.finalidade,
    etapa: Number(v.etapaAtual),
    criadaEm: v.criadaEm,
    fornecedorVencedor: v.fornecedorVencedor,
    valorAprovado: v.valorAprovado,
    hashNotaFiscal: v.hashNotaFiscal,
    chaveNFe: v.chaveNFe,
    cnpjEmitente: v.cnpjEmitente,
    valorNFe: v.valorNFe,
    notaAnexadaEm: v.notaAnexadaEm,
    auditado: v.auditado,
  };
}

/**
 * Carrega verbas do contrato.
 *   { escola }  → só as verbas daquela escola (painel do diretor)
 *   sem args    → todas as verbas 1..totalVerbas (painel de auditoria)
 */
export function useVerbas({ escola } = {}) {
  const { contract } = useContract();
  const [verbas, setVerbas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!contract) return;
    setLoading(true);
    setError(null);
    try {
      let ids = [];
      if (escola) {
        const raw = await contract.getVerbasEscola(escola);
        ids = raw.map(Number);
      } else {
        const total = Number(await contract.totalVerbas());
        ids = Array.from({ length: total }, (_, i) => i + 1);
      }

      const raws = await Promise.all(ids.map((id) => contract.getVerbaDetalhes(id)));
      // Mais recentes primeiro
      setVerbas(raws.map(mapVerba).sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error("Erro ao carregar verbas:", err);
      setError(err?.shortMessage ?? err?.message ?? "Erro ao carregar verbas.");
    } finally {
      setLoading(false);
    }
  }, [contract, escola]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { verbas, loading, error, reload };
}
