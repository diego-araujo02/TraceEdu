import "dotenv/config";
import express from "express";
import cors from "cors";
import { consultar, nomeProvider } from "./sefaz/index.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get("/health", (_req, res) => {
  res.json({ ok: true, sefazProvider: nomeProvider });
});

/**
 * POST /api/nfe/validar
 * body: { chave, cnpjEscola?, valorReferencia? }
 *
 * Consulta a NF-e na SEFAZ (via provider configurado), aplica as validações
 * de negócio e devolve os dados canônicos + o XML para o frontend hashear.
 */
app.post("/api/nfe/validar", async (req, res) => {
  const { chave, cnpjEscola, valorReferencia } = req.body || {};

  if (!chave) {
    return res.status(400).json({ valido: false, motivo: "Informe a chave da NF-e." });
  }

  try {
    const r = await consultar(chave, {
      cnpjDestinatario: cnpjEscola,
      valorReferencia,
    });

    if (!r.valido) {
      return res.status(422).json(r);
    }

    // ── Validações de negócio (o "portão de entrada") ──────────────────────
    if (r.situacao !== "Autorizada o uso da NF-e") {
      return res
        .status(422)
        .json({ valido: false, situacao: r.situacao, motivo: "NF-e não está autorizada." });
    }
    // Em produção: exigir que o destinatário seja o CNPJ da escola/prefeitura.
    // No mock o destinatário é apenas ecoado, então deixamos como aviso.

    return res.json({
      valido: true,
      situacao: r.situacao,
      chave: r.chave,
      emitente: r.emitente,
      destinatario: r.destinatario,
      valorTotal: r.valorTotal,
      dataEmissao: r.dataEmissao,
      xml: r.xml,
    });
  } catch (err) {
    console.error("Erro ao consultar SEFAZ:", err);
    return res.status(500).json({ valido: false, motivo: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`TraceEdu backend ouvindo na porta ${PORT} (SEFAZ provider: ${nomeProvider})`);
});
