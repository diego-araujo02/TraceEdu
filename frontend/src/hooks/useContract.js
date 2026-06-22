import { useMemo } from "react";
import { useWallet } from "./useWallet";
import { TraceEduService } from "../services/contract";

/**
 * Hook que fornece a instância de serviço do contrato TraceEdu.
 * Ele reage automaticamente a mudanças de conta e rede do MetaMask.
 */
export function useContract() {
  const { signer, provider, isConnected, isSupportedNetwork } = useWallet();

  const contract = useMemo(() => {
    // Se o usuário está conectado, usamos o Signer (permite assinar transações/escrita)
    // Se não, tentamos o Provider (apenas leitura de dados públicos)
    const signerOrProvider = signer || provider;
    
    if (!signerOrProvider) return null;
    
    return new TraceEduService(signerOrProvider);
  }, [signer, provider]);

  // Retorna o contrato pronto para uso e sinalizadores de estado úteis para a UI
  return {
    contract,
    isReady: Boolean(contract && isConnected && isSupportedNetwork),
  };
}