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

    it("Deve nascer com minCotacoes = 3", async function () {
      expect(await traceEdu.minCotacoes()).to.equal(3);
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

    it("Não deve permitir que não-donos alterem o minCotacoes", async function () {
      await expect(
        traceEdu.connect(escola).setMinCotacoes(2)
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

    it("Não deve permitir que uma carteira não cadastrada registre verba", async function () {
      await expect(
        traceEdu.connect(escola).registrarVerba(ethers.parseEther("100"), "Merenda")
      ).to.be.revertedWith("Apenas escolas cadastradas");
    });
  });

  describe("Fluxo da licitação (regras de etapa)", function () {
    const valor = ethers.parseEther("5000");
    const hashNota =
      "0x1234567890123456789012345678901234567890123456789012345678901234";
    const chaveNFe = "3".repeat(44); // chave de acesso fictícia com 44 dígitos
    const cnpjEmit = "00166000187";

    beforeEach(async function () {
      await traceEdu.addEscola(escola.address);
      await traceEdu.connect(escola).registrarVerba(valor, "Merenda");
    });

    async function registrarTresCotacoes() {
      await traceEdu.connect(escola).registrarCotacao(1, "Forn A", ethers.parseEther("4800"), "Arroz");
      await traceEdu.connect(escola).registrarCotacao(1, "Forn B", ethers.parseEther("4600"), "Arroz");
      await traceEdu.connect(escola).registrarCotacao(1, "Forn C", ethers.parseEther("4900"), "Arroz");
    }

    it("Não deve aprovar a compra com menos do que o mínimo de cotações", async function () {
      await traceEdu.connect(escola).registrarCotacao(1, "Forn A", ethers.parseEther("4800"), "Arroz");
      await expect(
        traceEdu.connect(escola).aprovarCompra(1, "Forn A", ethers.parseEther("4800"))
      ).to.be.revertedWith("Minimo de cotacoes nao atingido");
    });

    it("Deve respeitar o minCotacoes ajustado pelo admin", async function () {
      await traceEdu.setMinCotacoes(2);
      await traceEdu.connect(escola).registrarCotacao(1, "Forn A", ethers.parseEther("4800"), "Arroz");
      await traceEdu.connect(escola).registrarCotacao(1, "Forn B", ethers.parseEther("4600"), "Arroz");
      // Com o mínimo agora em 2, duas cotações já liberam a aprovação
      await expect(
        traceEdu.connect(escola).aprovarCompra(1, "Forn B", ethers.parseEther("4600"))
      ).to.emit(traceEdu, "CompraAprovada");
    });

    it("Não deve aprovar valor acima da verba original", async function () {
      await registrarTresCotacoes();
      await expect(
        traceEdu.connect(escola).aprovarCompra(1, "Forn B", ethers.parseEther("6000"))
      ).to.be.revertedWith("Valor aprovado excede a verba original");
    });

    it("Não deve anexar nota antes da compra ser aprovada", async function () {
      await registrarTresCotacoes();
      await expect(
        traceEdu.connect(escola).anexarNotaFiscal(1, hashNota, chaveNFe, cnpjEmit, ethers.parseEther("4600"))
      ).to.be.revertedWith("Compra ainda nao aprovada ou nota ja anexada");
    });

    it("Não deve aceitar chave NF-e fora de 44 dígitos", async function () {
      await registrarTresCotacoes();
      await traceEdu.connect(escola).aprovarCompra(1, "Forn B", ethers.parseEther("4600"));
      await expect(
        traceEdu.connect(escola).anexarNotaFiscal(1, hashNota, "123", cnpjEmit, ethers.parseEther("4600"))
      ).to.be.revertedWith("Chave NF-e invalida (44 digitos)");
    });

    it("Não deve aceitar nota com valor acima do aprovado", async function () {
      await registrarTresCotacoes();
      await traceEdu.connect(escola).aprovarCompra(1, "Forn B", ethers.parseEther("4600"));
      await expect(
        traceEdu.connect(escola).anexarNotaFiscal(1, hashNota, chaveNFe, cnpjEmit, ethers.parseEther("5000"))
      ).to.be.revertedWith("Nota fiscal acima do valor aprovado");
    });

    it("Auditor não deve auditar antes da entrega confirmada", async function () {
      await expect(traceEdu.auditarVerba(1)).to.be.revertedWith(
        "Verba ainda nao teve entrega confirmada pela escola"
      );
    });

    it("Deve percorrer o ciclo completo: verba → cotações → aprovação → nota → entrega → auditoria", async function () {
      await registrarTresCotacoes();
      expect(await traceEdu.getNumeroCotacoes(1)).to.equal(3);

      await traceEdu.connect(escola).aprovarCompra(1, "Forn B", ethers.parseEther("4600"));
      await traceEdu.connect(escola).anexarNotaFiscal(1, hashNota, chaveNFe, cnpjEmit, ethers.parseEther("4600"));
      await traceEdu.connect(escola).confirmarEntrega(1);

      // owner nasce auditor → pode auditar
      await expect(traceEdu.auditarVerba(1))
        .to.emit(traceEdu, "VerbaAuditada");

      const v = await traceEdu.verbas(1);
      expect(v.etapaAtual).to.equal(5); // Etapa.Auditado
      expect(v.auditado).to.equal(true);
      expect(v.hashNotaFiscal).to.equal(hashNota);
      expect(v.fornecedorVencedor).to.equal("Forn B");
    });

    it("Não deve permitir auditar a mesma verba duas vezes", async function () {
      await registrarTresCotacoes();
      await traceEdu.connect(escola).aprovarCompra(1, "Forn B", ethers.parseEther("4600"));
      await traceEdu.connect(escola).anexarNotaFiscal(1, hashNota, chaveNFe, cnpjEmit, ethers.parseEther("4600"));
      await traceEdu.connect(escola).confirmarEntrega(1);
      await traceEdu.auditarVerba(1);

      // A dupla auditoria é barrada pela guarda de etapa: após auditar, a etapa
      // vira Auditado, então a verba não está mais em EntregaConfirmada.
      await expect(traceEdu.auditarVerba(1)).to.be.revertedWith(
        "Verba ainda nao teve entrega confirmada pela escola"
      );
    });
  });
});