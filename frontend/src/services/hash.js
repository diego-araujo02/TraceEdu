/**
 * hash.js — Calcula SHA-256 de arquivos no browser usando Web Crypto API.
 *
 * Por que no browser?
 *   A integridade do hash não depende de um servidor — qualquer pessoa
 *   pode verificar localmente que o arquivo não foi alterado desde que
 *   seu hash foi gravado na blockchain. Isso é a prova de autenticidade.
 *
 * Formato de saída: "0x" + 64 hex chars (= bytes32 do Solidity)
 */

/**
 * Calcula SHA-256 de um objeto File.
 * @param {File} file - arquivo selecionado pelo usuário (PDF, XML etc.)
 * @returns {Promise<string>} hash no formato "0x..."
 */
export async function hashFile(file) {
  const buffer      = await file.arrayBuffer();
  const hashBuffer  = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(hashBuffer);
}

/**
 * Calcula SHA-256 de uma string (útil para testes sem arquivo real).
 * @param {string} text
 * @returns {Promise<string>} hash no formato "0x..."
 */
export async function hashString(text) {
  const data        = new TextEncoder().encode(text);
  const hashBuffer  = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

/**
 * Verifica se um arquivo corresponde ao hash armazenado na blockchain.
 * @param {File}   file        - arquivo a verificar
 * @param {string} storedHash  - hash retornado pelo contrato ("0x...")
 * @returns {Promise<boolean>}
 */
export async function verifyFile(file, storedHash) {
  const computed = await hashFile(file);
  return computed.toLowerCase() === storedHash.toLowerCase();
}

// ── Utilitários internos ──────────────────────────────────────────────────────

function bufferToHex(buffer) {
  const byteArray = Array.from(new Uint8Array(buffer));
  const hex       = byteArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hex;
}
