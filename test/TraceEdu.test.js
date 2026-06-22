const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TraceEdu Contract", function () {
  let TraceEdu, traceEdu;
  let owner, escola, auditor;

  // Roda antes de cada teste: faz o deploy de um contrato zerado
  beforeEach(async function () {
    [owner, escola, auditor] = await ethers.getSigners();
    TraceEdu = await ethers.getContractFactory("TraceEdu");
    traceEdu = await TraceEdu.deploy();
  });

  describe("Configuração Inicial", function () {
    it("Deve definir o dono (owner) corretamente", async function () {
      expect(await traceEdu.owner()).to.equal(owner.address);
    });

    it("O dono deve nascer como auditor", async function () {
      expect(await traceEdu.isAuditorStatus(owner.address)).to.be.true;
    });
  });

  describe("Controle de Acesso", function () {
    it("Deve permitir que o dono adicione uma escola", async function () {
      await traceEdu.addEscola(escola.address);
      expect(await traceEdu.isEscolaStatus(escola.address)).to.be.true;
    });

    it("Não deve permitir que não-donos adicionem escolas", async function () {
      // Tenta usar a conta 'escola' para adicionar ela mesma
      await expect(
        traceEdu.connect(escola).addEscola(escola.address)
      ).to.be.revertedWith("Apenas o admin pode fazer isso");
    });
  });

  describe("Gestão de Verbas", function () {
    it("Deve permitir que uma escola registrada crie uma verba", async function () {
      // 1. Cadastra a escola
      await traceEdu.addEscola(escola.address);
      
      // 2. Escola registra a verba
      const valor = ethers.parseEther("5000"); // 5000 tokens/reais
      await traceEdu.connect(escola).registrarVerba(valor, "Reforma da Quadra");
      
      // 3. Verifica se a verba foi salva
      const verbas = await traceEdu.getVerbasEscola(escola.address);
      expect(verbas.length).to.equal(1);
    });
  });
});