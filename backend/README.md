# TraceEdu — Backend (oráculo da SEFAZ)

Camada que valida notas fiscais na SEFAZ e devolve o dado oficial para o
frontend. É um **oráculo**: traz informação de fora para dentro, mas **não**
guarda registro nem decide a verdade — a fonte da verdade continua na
blockchain (a chave da NF-e é gravada on-chain para reconsulta independente).

## Rodar

```bash
cd backend
npm install
cp .env.example .env   # opcional; o padrão já usa o mock
npm run dev            # http://localhost:3001
```

## Endpoints

- `GET /health` → `{ ok, sefazProvider }`
- `POST /api/nfe/validar` → body `{ chave, cnpjEscola?, valorReferencia? }`

## Provider mock (demo, sem certificado)

`SEFAZ_PROVIDER=mock` (padrão). Regras para demonstrar sucesso e rejeição:

| Chave (44 dígitos) | Resultado |
|---|---|
| termina em `00` | ❌ NF-e não autorizada (simula nota inexistente) |
| qualquer outra | ✅ Autorizada — emitente extraído da chave |
| ≠ 44 dígitos | ❌ chave inválida |

## Provider real (produção)

`SEFAZ_PROVIDER=real` usa `src/sefaz/real.js` (esqueleto). Dois caminhos:
1. **Web services SEFAZ (SOAP)** com certificado e-CNPJ (A1/A3) — `NfeConsultaProtocolo`, `NFeDistribuicaoDFe`.
2. **API REST de terceiro** (Nuvem Fiscal, Focus NFe, WebmaniaBR) que embrulha o certificado.

A interface (`consultar(chave, opts)`) é a mesma do mock — trocar é só mudar a env.
