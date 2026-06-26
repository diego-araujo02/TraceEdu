/**
 * seed.js — Popula o contrato já implantado com dados de demonstração.
 *
 * Cria uma escola e várias verbas em etapas diferentes, para a demo ao vivo
 * mostrar o sistema "com vida" sem precisar clicar tudo na hora.
 *
 * Pré-requisitos:
 *   1. `npx hardhat node`        (Terminal 1)
 *   2. `npm run deploy:local`    (gera deployment.json)
 *   3. `npm run seed:local`      (este script)
 *
 * A conta de ESCOLA usada é a Account #1 do Hardhat — importe a chave dela
 * na MetaMask para atuar como diretor na interface.
 */
const hre = require("hardhat");
const { readFileSync } = require("fs");

const ethers = hre.ethers;

async function main() {
  const { address } = JSON.parse(readFileSync("./deployment.json", "utf8"));
  console.log("Usando contrato em:", address);

  const [owner, escola] = await ethers.getSigners();
  const c = await ethers.getContractAt("TraceEdu", address);

  // Owner (auditor nato) cadastra a escola
  console.log("Cadastrando escola:", escola.address);
  await (await c.addEscola(escola.address)).wait();

  const cEscola = c.connect(escola);
  const min = Number(await c.minCotacoes());

  // Sobe uma verba até a etapa-alvo (0=Recebida ... 5=Auditado)
  async function criarVerba(valorReais, finalidade, ateEtapa) {
    const valor = ethers.parseEther(String(valorReais));
    await (await cEscola.registrarVerba(valor, finalidade)).wait();
    const id = Number(await c.totalVerbas());

    if (ateEtapa >= 1) {
      for (let i = 0; i < min; i++) {
        const v = ethers.parseEther(String(valorReais - 100 * (i + 1)));
        await (await cEscola.registrarCotacao(id, `Fornecedor ${String.fromCharCode(65 + i)}`, v, finalidade)).wait();
      }
    }
    if (ateEtapa >= 2) {
      const aprov = ethers.parseEther(String(valorReais - 100));
      await (await cEscola.aprovarCompra(id, "Fornecedor B", aprov)).wait();
    }
    if (ateEtapa >= 3) {
      const hash = ethers.keccak256(ethers.toUtf8Bytes(`nota-fiscal-verba-${id}`));
      const chaveNFe = String(id).padStart(44, "0"); // chave fictícia com 44 dígitos
      const cnpjEmitente = "00166000187";
      const valorNFe = ethers.parseEther(String(valorReais - 100)); // = valor aprovado
      await (await cEscola.anexarNotaFiscal(id, hash, chaveNFe, cnpjEmitente, valorNFe)).wait();
    }
    if (ateEtapa >= 4) {
      await (await cEscola.confirmarEntrega(id)).wait();
    }
    if (ateEtapa >= 5) {
      await (await c.auditarVerba(id)).wait(); // owner = auditor
    }

    console.log(`  Verba #${id} "${finalidade}" → etapa ${ateEtapa}`);
    return id;
  }

  console.log("Criando verbas de demonstração...");
  await criarVerba(5000, "Merenda escolar", 0);          // só recebida
  await criarVerba(8000, "Material de limpeza", 1);      // com cotações
  await criarVerba(12000, "Reforma da cozinha", 2);      // compra aprovada
  await criarVerba(3000, "Material esportivo", 3);       // nota anexada
  await criarVerba(15000, "Climatização das salas", 4);  // entrega confirmada (pronta p/ auditar)
  await criarVerba(2500, "Livros didáticos", 5);         // ciclo completo (auditada)

  console.log("\n✅  Seed concluído.");
  console.log("    Escola (importe na MetaMask):", escola.address);
  console.log("    Total de verbas:", Number(await c.totalVerbas()));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
