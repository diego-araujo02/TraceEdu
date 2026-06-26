const hre = require("hardhat");
const { writeFileSync } = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance    = await hre.ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════");
  console.log("  TraceEdu — Deploy");
  console.log("═══════════════════════════════════════════");
  console.log("  Rede:     ", hre.network.name);
  console.log("  Deployer: ", deployer.address);
  console.log("  Saldo:    ", hre.ethers.formatEther(balance), "ETH");
  console.log("───────────────────────────────────────────");

  const TraceEdu = await hre.ethers.getContractFactory("TraceEdu");
  const traceEdu = await TraceEdu.deploy();
  await traceEdu.waitForDeployment();

  const address = await traceEdu.getAddress();

  console.log("✅  Contrato implantado em:", address);
  console.log("    O deployer é automaticamente auditor.");
  console.log("═══════════════════════════════════════════");

  const deployedAt = new Date().toISOString();

  // 1) Salva o endereço na raiz (referência / histórico)
  const output = {
    address,
    network:    hre.network.name,
    deployer:   deployer.address,
    deployedAt,
  };
  writeFileSync("./deployment.json", JSON.stringify(output, null, 2));
  console.log("💾  Endereço salvo em deployment.json");

  // 2) Gera o módulo que o frontend importa — sem precisar colar à mão
  const frontendModule =
    `// ⚠️ Arquivo gerado automaticamente pelo deploy (scripts/deploy.js).\n` +
    `// Não edite à mão — o deploy sobrescreve o endereço aqui.\n` +
    `// Ordem de prioridade no app: VITE_CONTRACT_ADDRESS (.env) > este arquivo.\n` +
    `export const DEPLOYMENT = {\n` +
    `  address: "${address}",\n` +
    `  network: "${hre.network.name}",\n` +
    `  deployedAt: "${deployedAt}",\n` +
    `};\n`;
  writeFileSync("./frontend/src/constants/deployment.js", frontendModule);
  console.log("💾  Endereço injetado em frontend/src/constants/deployment.js");
  console.log("═══════════════════════════════════════════");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
