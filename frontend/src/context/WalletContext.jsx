import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";

const REDES_SUPORTADAS = {
  31337: "Hardhat Local",
  11155111: "Sepolia Testnet",
};

const WalletContext = createContext(null);

/**
 * Provider único que mantém a conexão MetaMask para toda a aplicação.
 *
 * Antes, cada componente que chamava useWallet() criava o seu próprio estado
 * de conexão — Header e páginas ficavam dessincronizados. Centralizando aqui,
 * todos compartilham o mesmo provider/signer/address.
 */
export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const isConnected = Boolean(address);
  const networkName = REDES_SUPORTADAS[chainId] ?? (chainId ? `Rede ${chainId}` : "—");
  const isSupportedNetwork = chainId in REDES_SUPORTADAS;

  // ── Conectar ────────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask não encontrado. Instale a extensão e recarregue a página.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);

      const web3Signer = await web3Provider.getSigner();
      const web3Address = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAddress(web3Address);
      setChainId(Number(network.chainId));
    } catch (err) {
      setError(err?.shortMessage ?? err?.message ?? "Erro ao conectar carteira.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ── Desconectar ─────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
  }, []);

  // ── Eventos MetaMask ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) disconnect();
      else connect();
    };

    const onChainChanged = () => {
      // MetaMask recomenda recarregar ao trocar de rede
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [connect, disconnect]);

  // ── Auto-reconecta se já estava conectado ───────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts.length > 0) connect();
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    provider,
    signer,
    address,
    chainId,
    networkName,
    isConnected,
    isSupportedNetwork,
    isConnecting,
    error,
    connect,
    disconnect,
    clearError: () => setError(null),
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet deve ser usado dentro de <WalletProvider>.");
  }
  return ctx;
}
