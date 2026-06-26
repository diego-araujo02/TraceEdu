import { useWallet } from "../../context/WalletContext";

/**
 * Envolve uma área restrita. Mostra mensagens claras quando o usuário
 * não está conectado, está na rede errada, ou não tem o papel exigido.
 *
 * props:
 *   allow      — boolean: true se o papel do usuário permite ver o conteúdo
 *   papel      — string para a mensagem ("uma escola cadastrada", "um auditor")
 *   loading    — boolean: ainda verificando o papel
 */
export default function StatusGate({ allow, papel, loading, children }) {
  const { isConnected, isSupportedNetwork, connect, networkName } = useWallet();

  if (!isConnected) {
    return (
      <Aviso
        titulo="Conecte sua carteira"
        texto="Para usar esta área, conecte sua carteira MetaMask."
      >
        <button
          onClick={connect}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all"
        >
          Conectar Carteira
        </button>
      </Aviso>
    );
  }

  if (!isSupportedNetwork) {
    return (
      <Aviso
        titulo="Rede não suportada"
        texto={`Você está em "${networkName}". Troque para a rede Hardhat Local (31337) ou Sepolia na sua MetaMask.`}
      />
    );
  }

  if (loading) {
    return (
      <Aviso titulo="Verificando permissões..." texto="Lendo seu papel no contrato." />
    );
  }

  if (!allow) {
    return (
      <Aviso
        titulo="Acesso restrito"
        texto={`Esta área é exclusiva para ${papel}. Sua carteira não tem esse papel — peça ao administrador para cadastrá-la.`}
      />
    );
  }

  return children;
}

function Aviso({ titulo, texto, children }) {
  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm mt-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">{titulo}</h3>
      <p className="text-slate-500 mb-6">{texto}</p>
      {children}
    </div>
  );
}
