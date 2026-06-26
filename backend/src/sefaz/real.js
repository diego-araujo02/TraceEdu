/**
 * Provider REAL da SEFAZ (esqueleto para produção).
 *
 * Mesma interface do mock: consultar(chave, opts) → mesmo formato de retorno.
 *
 * Caminhos possíveis de implementação:
 *   1) Web services oficiais da SEFAZ (SOAP), por UF/SVRS:
 *        - NfeConsultaProtocolo  → situação atual da NF-e pela chave
 *        - NFeDistribuicaoDFe     → baixa o XML das notas emitidas CONTRA o
 *                                   CNPJ da prefeitura (manifestação do destinatário)
 *      Exige certificado digital A1/A3 (e-CNPJ) — guardado SÓ aqui no backend,
 *      nunca no frontend. Bibliotecas: node-soap, ou libs específicas de NF-e.
 *
 *   2) API REST de terceiro que embrulha a SEFAZ e cuida do certificado
 *      (ex.: Nuvem Fiscal, Focus NFe, WebmaniaBR). Mais simples para o MVP:
 *      troca o SOAP + certificado por um GET autenticado por token.
 *
 * Validações de negócio (iguais nos dois caminhos) ficam no index.js:
 *   situação = autorizada · destinatário = CNPJ da escola/prefeitura.
 */
export const nome = "real";

export async function consultar(/* chave, opts */) {
  throw new Error(
    "Provider real da SEFAZ ainda não implementado. " +
      "Configure SEFAZ_PROVIDER=mock para a demo, ou implemente este arquivo " +
      "(SOAP com e-CNPJ ou API REST de terceiro) para produção."
  );
}
