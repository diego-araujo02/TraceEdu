/**
 * Provider MOCK da SEFAZ.
 *
 * Simula a consulta de uma NF-e sem precisar de certificado digital, para a
 * demo rodar de ponta a ponta. A interface é idêntica à do provider real
 * (mesmo formato de retorno), então trocar um pelo outro é só mudar a env
 * SEFAZ_PROVIDER — o resto do sistema não muda.
 *
 * Regras de simulação (para demonstrar tanto o sucesso quanto a rejeição):
 *   • chave com ≠ 44 dígitos        → inválida
 *   • chave terminada em "00"        → NÃO autorizada (simula nota inexistente)
 *   • caso contrário                 → Autorizada o uso da NF-e
 *
 * O CNPJ do emitente é extraído da própria chave (posições 6–20, como na
 * chave de acesso real). O valor total é ecoado de `valorReferencia` apenas
 * no mock — o provider real lê o valor verdadeiro do XML da SEFAZ.
 */
export const nome = "mock";

const SITUACAO_OK = "Autorizada o uso da NF-e";

function soDigitos(s) {
  return String(s || "").replace(/\D/g, "");
}

export async function consultar(chave, { cnpjDestinatario, valorReferencia } = {}) {
  const chaveLimpa = soDigitos(chave);

  if (chaveLimpa.length !== 44) {
    return {
      valido: false,
      situacao: "Chave inválida",
      motivo: "A chave de acesso deve ter 44 dígitos.",
    };
  }

  if (chaveLimpa.endsWith("00")) {
    return {
      valido: false,
      situacao: "NF-e não encontrada / não autorizada",
      motivo: "Nenhuma NF-e autorizada com esta chave na base da SEFAZ (simulado).",
    };
  }

  const cnpjEmitente = chaveLimpa.slice(6, 20);
  const valorTotal = valorReferencia != null ? Number(valorReferencia) : 1000.0;

  const xml = montarXmlNFe({ chave: chaveLimpa, cnpjEmitente, cnpjDestinatario, valorTotal });

  return {
    valido: true,
    situacao: SITUACAO_OK,
    chave: chaveLimpa,
    emitente: { cnpj: cnpjEmitente, nome: "Fornecedor Demonstração LTDA" },
    destinatario: { cnpj: soDigitos(cnpjDestinatario) || "00000000000000" },
    valorTotal,
    dataEmissao: new Date().toISOString(),
    xml,
  };
}

// XML canônico mínimo no estilo NF-e — é o documento que será hasheado e guardado.
function montarXmlNFe({ chave, cnpjEmitente, cnpjDestinatario, valorTotal }) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<nfeProc versao="4.00"><NFe><infNFe Id="NFe${chave}">` +
    `<emit><CNPJ>${cnpjEmitente}</CNPJ><xNome>Fornecedor Demonstração LTDA</xNome></emit>` +
    `<dest><CNPJ>${soDigitos(cnpjDestinatario) || "00000000000000"}</CNPJ></dest>` +
    `<total><ICMSTot><vNF>${Number(valorTotal).toFixed(2)}</vNF></ICMSTot></total>` +
    `</infNFe></NFe>` +
    `<protNFe><infProt><cStat>100</cStat><xMotivo>${SITUACAO_OK}</xMotivo></infProt></protNFe>` +
    `</nfeProc>`
  );
}
