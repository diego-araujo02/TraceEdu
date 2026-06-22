import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/contract";

export class TraceEduService {
  constructor(signerOrProvider) {
    // Instancia o contrato usando o endereço, a ABI e o Signer (carteira) ou Provider (leitura)
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
  }

  // ── Leitura (View) ────────────────────────────────────────────────────────
  async isEscolaStatus(address) {
    return await this.contract.isEscolaStatus(address);
  }

  async isAuditorStatus(address) {
    return await this.contract.isAuditorStatus(address);
  }

  async getVerbasEscola(address) {
    return await this.contract.getVerbasEscola(address);
  }

  async getVerbaDetalhes(verbaId) {
    return await this.contract.verbas(verbaId);
  }

  async getCotacoes(verbaId) {
    return await this.contract.getCotacoes(verbaId);
  }

  // ── Escrita (Transações) ──────────────────────────────────────────────────
  async registrarVerba(valor, finalidade) {
    const tx = await this.contract.registrarVerba(valor, finalidade);
    return await tx.wait(); // Aguarda a transação ser minerada
  }

  async registrarCotacao(verbaId, fornecedor, valor, descricao) {
    const tx = await this.contract.registrarCotacao(verbaId, fornecedor, valor, descricao);
    return await tx.wait();
  }

  async aprovarCompra(verbaId, fornecedorVencedor, valorAprovado) {
    const tx = await this.contract.aprovarCompra(verbaId, fornecedorVencedor, valorAprovado);
    return await tx.wait();
  }

  async anexarNotaFiscal(verbaId, hashDocumento) {
    const tx = await this.contract.anexarNotaFiscal(verbaId, hashDocumento);
    return await tx.wait();
  }

  async confirmarEntrega(verbaId) {
    const tx = await this.contract.confirmarEntrega(verbaId);
    return await tx.wait();
  }

  async auditarVerba(verbaId) {
    const tx = await this.contract.auditarVerba(verbaId);
    return await tx.wait();
  }
}