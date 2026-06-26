import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { useContract } from "./useContract";

/**
 * Descobre o papel do endereço conectado lendo o contrato:
 *   isEscola   — diretor de escola cadastrada
 *   isAuditor  — secretaria / tribunal de contas
 *   isOwner    — admin (deployer)
 *
 * Reage à troca de conta e expõe um refetch() para atualizar após
 * o admin cadastrar uma nova escola/auditor.
 */
export function useRole() {
  const { contract } = useContract();
  const { address, isConnected } = useWallet();

  const [isEscola, setIsEscola] = useState(false);
  const [isAuditor, setIsAuditor] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!contract || !address) {
      setIsEscola(false);
      setIsAuditor(false);
      setIsOwner(false);
      return;
    }
    setLoading(true);
    try {
      const [escola, auditor, owner] = await Promise.all([
        contract.isEscolaStatus(address),
        contract.isAuditorStatus(address),
        contract.owner(),
      ]);
      setIsEscola(Boolean(escola));
      setIsAuditor(Boolean(auditor));
      setIsOwner(owner?.toLowerCase() === address.toLowerCase());
    } catch (err) {
      console.error("Erro ao detectar papel:", err);
    } finally {
      setLoading(false);
    }
  }, [contract, address]);

  useEffect(() => {
    refetch();
  }, [refetch, isConnected]);

  return { isEscola, isAuditor, isOwner, loading, refetch };
}
