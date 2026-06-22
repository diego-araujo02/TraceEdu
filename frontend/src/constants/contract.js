// ── ATENÇÃO ────────────────────────────────────────────────────────────────
// Após rodar `npm run deploy:local`, cole o endereço gerado em deployment.json aqui.
// ──────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// ABI em formato Human-Readable (ethers.js v6)
// Mantida aqui para facilitar leitura. Após `npm run compile`, você pode
// também importar direto de ../../artifacts/contracts/TraceEdu.sol/TraceEdu.json
export const CONTRACT_ABI = [
  // ── Eventos ──────────────────────────────────────────────────────────────
  "event VerbaRegistrada(uint256 indexed id, address indexed escola, uint256 valor, string finalidade, uint256 timestamp)",
  "event CotacaoRegistrada(uint256 indexed verbaId, uint256 numero, string fornecedor, uint256 valor, uint256 timestamp)",
  "event CompraAprovada(uint256 indexed verbaId, string fornecedorVencedor, uint256 valorAprovado, uint256 timestamp)",
  "event NotaFiscalAnexada(uint256 indexed verbaId, bytes32 hashDocumento, uint256 timestamp)",
  "event EntregaConfirmada(uint256 indexed verbaId, uint256 timestamp)",
  "event VerbaAuditada(uint256 indexed verbaId, address auditor, uint256 timestamp)",
  "event EscolaAdicionada(address indexed escola)",
  "event AuditorAdicionado(address indexed auditor)",

  // ── Leitura ──────────────────────────────────────────────────────────────
  "function owner() view returns (address)",
  "function totalVerbas() view returns (uint256)",
  "function isEscola(address) view returns (bool)",
  "function isAuditor(address) view returns (bool)",
  "function verbas(uint256) view returns (uint256 id, address escola, uint256 valor, string finalidade, uint8 etapaAtual, uint256 criadaEm, string fornecedorVencedor, uint256 valorAprovado, bytes32 hashNotaFiscal, uint256 notaAnexadaEm, bool auditado)",
  "function getCotacoes(uint256 verbaId) view returns (tuple(string fornecedor, uint256 valor, string descricao, uint256 timestamp)[])",
  "function getVerbasEscola(address escola) view returns (uint256[])",
  "function getNumeroCotacoes(uint256 verbaId) view returns (uint256)",

  // ── Escrita — diretor ─────────────────────────────────────────────────────
  "function registrarVerba(uint256 valor, string calldata finalidade) returns (uint256)",
  "function registrarCotacao(uint256 verbaId, string calldata fornecedor, uint256 valor, string calldata descricao)",
  "function aprovarCompra(uint256 verbaId, string calldata fornecedorVencedor, uint256 valorAprovado)",
  "function anexarNotaFiscal(uint256 verbaId, bytes32 hashDocumento)",
  "function confirmarEntrega(uint256 verbaId)",

  // ── Escrita — auditor ─────────────────────────────────────────────────────
  "function auditarVerba(uint256 verbaId)",

  // ── Escrita — administração ───────────────────────────────────────────────
  "function addEscola(address escola)",
  "function addAuditor(address auditor)",
];

// Mapeamento de etapa (uint8) → rótulo e cor
export const ETAPAS = [
  { label: "Verba Recebida",        cor: "blue"   },
  { label: "Cotações Registradas",  cor: "yellow" },
  { label: "Compra Aprovada",       cor: "orange" },
  { label: "Nota Fiscal Anexada",   cor: "purple" },
  { label: "Entrega Confirmada",    cor: "teal"   },
  { label: "Auditado ✓",           cor: "green"  },
];
