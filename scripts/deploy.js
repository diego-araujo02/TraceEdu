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
  console.log("");
  console.log("📋  Próximos passos:");
  console.log("    1. Copie o endereço acima para:");
  console.log("       frontend/src/constants/contract.js  →  CONTRACT_ADDRESS");
  console.log("    2. Registre escolas:  await traceEdu.addEscola('0x...')");
  console.log("    3. Registre auditores extras: await traceEdu.addAuditor('0x...')");
  console.log("═══════════════════════════════════════════");

  // Salva o endereço para o frontend usar
  const output = {
    address,
    network:    hre.network.name,
    deployer:   deployer.address,
    deployedAt: new Date().toISOString(),
  };

  writeFileSync("./deployment.json", JSON.stringify(output, null, 2));
  console.log("💾  Endereço salvo em deployment.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
