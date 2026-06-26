import { ethers } from "ethers";

/** Encurta um endereço: 0x1234...abcd */
export function shortAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Converte um valor on-chain (wei / 18 casas) para "R$ 1.234,56". */
export function formatReais(weiValue) {
  try {
    const ether = ethers.formatEther(weiValue ?? 0n);
    const number = Number(ether);
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } catch {
    return "R$ 0,00";
  }
}

/** Converte um texto de reais ("1500" ou "1.500,50") para wei (bigint). */
export function reaisToWei(text) {
  const normalized = String(text)
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "")
    .trim();
  if (!normalized) return 0n;
  return ethers.parseEther(normalized);
}

/** Formata um timestamp Unix (segundos, on-chain) para data/hora pt-BR. */
export function formatData(timestampSegundos) {
  const ts = Number(timestampSegundos ?? 0);
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString("pt-BR");
}

/** bytes32 zerado = "ainda não anexada". */
export function hashVazio(hash) {
  return (
    !hash ||
    hash === "0x" + "0".repeat(64) ||
    hash === "0x0"
  );
}
