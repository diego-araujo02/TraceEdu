/** Extrai uma mensagem legível de um erro de transação do ethers v6. */
export function parseTxError(err) {
  if (!err) return "Erro desconhecido.";
  // require(...) do Solidity costuma vir em reason / shortMessage
  return (
    err.reason ||
    err.shortMessage ||
    err.info?.error?.message ||
    err.data?.message ||
    err.message ||
    "Falha na transação."
  );
}
