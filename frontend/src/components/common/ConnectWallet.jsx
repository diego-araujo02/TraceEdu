import { useWallet } from "../../context/WalletContext";
import { shortAddress } from "../../utils/format";

/**
 * Botão de conexão MetaMask + indicador de rede/conta.
 * Lê o estado compartilhado do WalletProvider.
 */
export default function ConnectWallet() {
  const {
    isConnected,
    isConnecting,
    address,
    networkName,
    isSupportedNetwork,
    connect,
    disconnect,
    error,
  } = useWallet();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={connect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-blue-400 hover:to-blue-500 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Conectando..." : "Conectar Carteira"}
        </button>
        {error && (
          <span className="text-xs text-red-500 max-w-[220px] text-right">{error}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-end">
        <span className="font-mono text-sm font-semibold text-slate-800">
          {shortAddress(address)}
        </span>
        <span
          className={`text-xs font-medium ${
            isSupportedNetwork ? "text-emerald-600" : "text-red-500"
          }`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
              isSupportedNetwork ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          {isSupportedNetwork ? networkName : `${networkName} (não suportada)`}
        </span>
      </div>
      <button
        onClick={disconnect}
        className="text-slate-400 hover:text-red-500 transition-colors text-sm border border-slate-200 rounded-lg px-3 py-1.5"
        title="Desconectar"
      >
        Sair
      </button>
    </div>
  );
}
