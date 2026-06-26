/**
 * sefaz.js — fala com o backend (oráculo da SEFAZ).
 *
 * O frontend NUNCA fala direto com a SEFAZ (isso exige certificado e-CNPJ,
 * que vive só no backend). Aqui só chamamos a nossa API.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Valida uma chave de NF-e na SEFAZ.
 * @returns {Promise<{valido:boolean, situacao?, emitente?, valorTotal?, xml?, motivo?}>}
 */
export async function validarNFe({ chave, cnpjEscola, valorReferencia }) {
  try {
    const resp = await fetch(`${API_URL}/api/nfe/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chave, cnpjEscola, valorReferencia }),
    });
    // 200 (válido) e 422 (rejeitada) trazem JSON; ambos são respostas úteis.
    return await resp.json();
  } catch (err) {
    return {
      valido: false,
      motivo:
        "Não foi possível falar com o backend da SEFAZ. Ele está rodando? (cd backend && npm run dev)",
    };
  }
}
