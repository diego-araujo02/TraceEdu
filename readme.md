# TraceEdu 🏫🔗
> Transparência Escolar On-chain. Transformando a prestação de contas de merenda e infraestrutura em um registro imutável lacrado por criptografia.

O **TraceEdu** é uma plataforma Web3/GovTech desenvolvida para garantir transparência absoluta no gerenciamento de orçamentos escolares. Através de Smart Contracts, o sistema automatiza fluxos de licitação, exige o mínimo de cotações para aprovação e permite auditoria em tempo real por órgãos públicos.

## 🛠 Tecnologias Utilizadas

* **Blockchain:** Solidity, Hardhat, Ethers.js
* **Frontend:** React, Vite, Tailwind CSS v4
* **Backend/Storage:** Supabase (Banco de Dados e Armazenamento de Notas Fiscais/Documentos)

---

## 🚀 Como rodar o TraceEdu localmente

### Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
* **[Node.js](https://nodejs.org/en/)** (versão 18 ou superior)
* Extensão da carteira **[MetaMask](https://metamask.io/)** instalada no seu navegador.

### Passo 1: Clonar e Instalar Dependências
O projeto possui dependências tanto para a parte da Blockchain quanto para o Frontend. No seu terminal, execute:

```bash
# 1. Clone o repositório e entre na pasta
git clone [https://github.com/SEU_USUARIO/TraceEdu.git](https://github.com/SEU_USUARIO/TraceEdu.git)
cd TraceEdu

# 2. Instale as dependências da Blockchain (Hardhat)
npm install

# 3. Entre na pasta do frontend e instale as dependências da Interface (React/Vite)
cd frontend
npm install
```

### Passo 2: Subir a Blockchain Local
Abra um **Terminal 1**, volte para a pasta raiz do projeto (`TraceEdu`) e inicie a rede Ethereum simulada:
```bash
npx hardhat node
```
*Aviso: Deixe este terminal aberto. Ele gerará 20 carteiras de teste com 10.000 ETH falsos para usarmos.*

### Passo 3: Fazer o Deploy do Smart Contract
Abra um **Terminal 2** (na pasta raiz do projeto) e rode o script de deploy para injetar o `TraceEdu.sol` na rede local:
```bash
npm run deploy:local
```
O terminal retornará o endereço do contrato (ex: `0x5FbDB...`). **Copie este endereço.**

### Passo 4: Configurar o Frontend
1. Vá até o arquivo `frontend/src/constants/contract.js`.
2. Cole o endereço gerado no passo anterior na constante correspondente:
```javascript
export const CONTRACT_ADDRESS = "COLE_O_ENDERECO_AQUI";
```

### Passo 5: Iniciar a Aplicação
Ainda no **Terminal 2**, entre na pasta do frontend e suba o servidor de desenvolvimento do Vite:
```bash
cd frontend
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### Passo 6: Configurar a MetaMask para Testes
Para interagir com o DApp sem gastar dinheiro real:
1. Abra a MetaMask e vá em **Redes > Adicionar Rede > Adicionar manualmente**.
2. Preencha com os dados do Hardhat:
   * **Nome da Rede:** Hardhat Localhost
   * **Nova URL da RPC:** `http://127.0.0.1:8545/`
   * **ID da Cadeia (Chain ID):** `31337`
   * **Símbolo da Moeda:** `ETH`
3. Pegue a "Private Key" (Chave Privada) da **Account #0** que apareceu no Terminal 1 (quando você rodou o `npx hardhat node`) e importe na MetaMask. Isso te dará os fundos necessários para atuar como Diretor/Auditor no ambiente de testes.

