// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TraceEdu {
    address public owner;
    uint256 public totalVerbas;

    // Controle de acesso
    mapping(address => bool) public isEscola;
    mapping(address => bool) public isAuditor;

    // Etapas estritas da licitação
    enum Etapa { Recebida, Cotacoes, Aprovada, NotaAnexada, EntregaConfirmada, Auditado }

    struct Cotacao {
        string fornecedor;
        uint256 valor;
        string descricao;
        uint256 timestamp;
    }

    struct Verba {
        uint256 id;
        address escola;
        uint256 valor;
        string finalidade;
        Etapa etapaAtual;
        uint256 criadaEm;
        string fornecedorVencedor;
        uint256 valorAprovado;
        bytes32 hashNotaFiscal;
        uint256 notaAnexadaEm;
        bool auditado;
    }

    // Armazenamento de estado
    mapping(uint256 => Verba) public verbas;
    mapping(uint256 => Cotacao[]) internal cotacoesPorVerba;
    mapping(address => uint256[]) internal verbasPorEscola;

    // Eventos 
    event VerbaRegistrada(uint256 indexed id, address indexed escola, uint256 valor, string finalidade, uint256 timestamp);
    event CotacaoRegistrada(uint256 indexed verbaId, uint256 numero, string fornecedor, uint256 valor, uint256 timestamp);
    event CompraAprovada(uint256 indexed verbaId, string fornecedorVencedor, uint256 valorAprovado, uint256 timestamp);
    event NotaFiscalAnexada(uint256 indexed verbaId, bytes32 hashDocumento, uint256 timestamp);
    event EntregaConfirmada(uint256 indexed verbaId, uint256 timestamp);
    event VerbaAuditada(uint256 indexed verbaId, address auditor, uint256 timestamp);
    event EscolaAdicionada(address indexed escola);
    event AuditorAdicionado(address indexed auditor);

    // ── Modificadores ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Apenas o admin pode fazer isso");
        _;
    }

    modifier onlyEscola() {
        require(isEscola[msg.sender], "Apenas escolas cadastradas");
        _;
    }

    modifier onlyAuditor() {
        require(isAuditor[msg.sender], "Apenas auditores cadastrados");
        _;
    }

    modifier donoDaVerba(uint256 verbaId) {
        require(verbas[verbaId].escola == msg.sender, "Apenas a escola dona da verba pode alterar");
        _;
    }

    constructor() {
        owner = msg.sender;
        isAuditor[msg.sender] = true; // O deployer (admin) já nasce como auditor
    }

    // ── Administração ────────────────────────────────────────────────────────
    function addEscola(address escola) external onlyOwner {
        isEscola[escola] = true;
        emit EscolaAdicionada(escola);
    }

    function addAuditor(address auditor) external onlyOwner {
        isAuditor[auditor] = true;
        emit AuditorAdicionado(auditor);
    }

    // ── Lógica Principal (Diretor da Escola) ─────────────────────────────────
    
    function registrarVerba(uint256 valor, string calldata finalidade) external onlyEscola returns (uint256) {
        totalVerbas++;
        uint256 novoId = totalVerbas;

        verbas[novoId] = Verba({
            id: novoId,
            escola: msg.sender,
            valor: valor,
            finalidade: finalidade,
            etapaAtual: Etapa.Recebida,
            criadaEm: block.timestamp,
            fornecedorVencedor: "",
            valorAprovado: 0,
            hashNotaFiscal: 0,
            notaAnexadaEm: 0,
            auditado: false
        });

        verbasPorEscola[msg.sender].push(novoId);
        emit VerbaRegistrada(novoId, msg.sender, valor, finalidade, block.timestamp);
        return novoId;
    }

    function registrarCotacao(uint256 verbaId, string calldata fornecedor, uint256 valor, string calldata descricao) external onlyEscola donoDaVerba(verbaId) {
        Verba storage v = verbas[verbaId];
        require(v.etapaAtual == Etapa.Recebida || v.etapaAtual == Etapa.Cotacoes, "Fora da etapa de cotacoes");

        cotacoesPorVerba[verbaId].push(Cotacao({
            fornecedor: fornecedor,
            valor: valor,
            descricao: descricao,
            timestamp: block.timestamp
        }));

        if (v.etapaAtual == Etapa.Recebida) {
            v.etapaAtual = Etapa.Cotacoes;
        }

        emit CotacaoRegistrada(verbaId, cotacoesPorVerba[verbaId].length, fornecedor, valor, block.timestamp);
    }

    function aprovarCompra(uint256 verbaId, string calldata fornecedorVencedor, uint256 valorAprovado) external onlyEscola donoDaVerba(verbaId) {
        Verba storage v = verbas[verbaId];
        require(v.etapaAtual == Etapa.Cotacoes, "Faltam cotacoes ou compra ja aprovada");
        require(cotacoesPorVerba[verbaId].length >= 3, "Minimo de 3 cotacoes exigido pela licitacao");
        require(valorAprovado <= v.valor, "Valor aprovado excede a verba original");

        v.fornecedorVencedor = fornecedorVencedor;
        v.valorAprovado = valorAprovado;
        v.etapaAtual = Etapa.Aprovada;

        emit CompraAprovada(verbaId, fornecedorVencedor, valorAprovado, block.timestamp);
    }

    function anexarNotaFiscal(uint256 verbaId, bytes32 hashDocumento) external onlyEscola donoDaVerba(verbaId) {
        Verba storage v = verbas[verbaId];
        require(v.etapaAtual == Etapa.Aprovada, "Compra ainda nao aprovada ou nota ja anexada");

        v.hashNotaFiscal = hashDocumento;
        v.notaAnexadaEm = block.timestamp;
        v.etapaAtual = Etapa.NotaAnexada;

        emit NotaFiscalAnexada(verbaId, hashDocumento, block.timestamp);
    }

    function confirmarEntrega(uint256 verbaId) external onlyEscola donoDaVerba(verbaId) {
        Verba storage v = verbas[verbaId];
        require(v.etapaAtual == Etapa.NotaAnexada, "Nota fiscal ainda nao anexada");

        v.etapaAtual = Etapa.EntregaConfirmada;

        emit EntregaConfirmada(verbaId, block.timestamp);
    }

    // ── Lógica de Auditoria (Tribunal/Secretaria) ────────────────────────────

    function auditarVerba(uint256 verbaId) external onlyAuditor {
        Verba storage v = verbas[verbaId];
        require(v.etapaAtual == Etapa.EntregaConfirmada, "Verba ainda nao teve entrega confirmada pela escola");
        require(!v.auditado, "Verba ja auditada");

        v.auditado = true;
        v.etapaAtual = Etapa.Auditado;

        emit VerbaAuditada(verbaId, msg.sender, block.timestamp);
    }

    // ── Funções de Visualização (Leitura Frontend) ───────────────────────────

    function isEscolaStatus(address _escola) external view returns (bool) { return isEscola[_escola]; }
    function isAuditorStatus(address _auditor) external view returns (bool) { return isAuditor[_auditor]; }
    
    function getVerbasEscola(address escola) external view returns (uint256[] memory) {
        return verbasPorEscola[escola];
    }

    function getCotacoes(uint256 verbaId) external view returns (Cotacao[] memory) {
        return cotacoesPorVerba[verbaId];
    }

    function getNumeroCotacoes(uint256 verbaId) external view returns (uint256) {
        return cotacoesPorVerba[verbaId].length;
    }
}