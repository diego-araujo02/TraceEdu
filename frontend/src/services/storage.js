/**
 * storage.js — Armazenamento OFF-CHAIN da nota fiscal (Supabase).
 *
 * Decisão central do projeto (ver TraceEdu.docx §6): o ARQUIVO pesado e
 * qualquer dado pessoal NUNCA vão para a blockchain — por desempenho e LGPD.
 * Só a "impressão digital" (hash SHA-256) entra on-chain. O arquivo em si
 * fica aqui, no Supabase Storage.
 *
 * Opcional por design: se as variáveis de ambiente não estiverem
 * configuradas (ou o pacote @supabase/supabase-js não estiver instalado),
 * o app continua funcionando com a prova de integridade por hash — o auditor
 * apenas precisa do arquivo original para re-verificar. Assim o MVP roda
 * imediatamente, e a integração com Supabase é um "plug-in".
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "notas-fiscais";

export function storageConfigurado() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let _clientPromise = null;
async function getClient() {
  if (!storageConfigurado()) return null;
  if (!_clientPromise) {
    // Import dinâmico: o Vite faz code-split do pacote num chunk separado,
    // carregado só quando o storage é realmente usado. Se algo falhar,
    // caímos no modo "só hash" sem quebrar o app.
    _clientPromise = import("@supabase/supabase-js")
      .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
      .catch((err) => {
        console.warn("Falha ao carregar o Supabase, seguindo só com hash:", err);
        return null;
      });
  }
  return _clientPromise;
}

// Caminho determinístico por verba: assim o auditor consegue localizar a nota
// só com o id da verba, sem precisar de um banco de dados auxiliar no MVP.
const notaPath = (verbaId) => `verba-${verbaId}/nota-fiscal`;

/**
 * Envia o arquivo da nota fiscal para o Supabase Storage.
 * @param {File} file
 * @param {number|string} verbaId
 * @returns {Promise<{ uploaded: boolean, path?: string, url?: string }>}
 */
export async function uploadNotaFiscal(file, verbaId) {
  const client = await getClient();
  if (!client) return { uploaded: false };

  const path = notaPath(verbaId);
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });
  if (error) {
    console.error("Falha no upload para o Supabase:", error);
    return { uploaded: false };
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return { uploaded: true, path, url: data?.publicUrl };
}

/**
 * URL pública da nota de uma verba (se o storage estiver configurado).
 * Retorna a URL mesmo sem garantir que o arquivo exista — o auditor confirma
 * a autenticidade pelo hash, não pela mera presença do link.
 */
export async function getNotaUrlByVerba(verbaId) {
  const client = await getClient();
  if (!client) return null;
  const { data } = client.storage.from(BUCKET).getPublicUrl(notaPath(verbaId));
  return data?.publicUrl ?? null;
}
