// A lógica de conexão agora vive em context/WalletContext.jsx, para que todos
// os componentes compartilhem a mesma carteira. Este arquivo é mantido apenas
// como re-export para não quebrar imports existentes (ex.: useContract).
export { useWallet } from "../context/WalletContext";
