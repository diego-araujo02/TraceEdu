# TraceEdu 🏫🔗
> Transparência Escolar On-chain. Transformando a prestação de contas de merenda e infraestrutura em um registro imutável lacrado por criptografia.

O **TraceEdu** é uma plataforma Web3/GovTech desenvolvida para garantir transparência absoluta no gerenciamento de orçamentos escolares. Através de Smart Contracts, o sistema automatiza fluxos de licitação, exige o mínimo de cotações para aprovação e permite auditoria em tempo real por órgãos públicos.

## 🛠 Tecnologias Utilizadas

* **Blockchain:** Solidity, Hardhat, Ethers.js
* **Frontend:** React, Vite, Tailwind CSS v4
* **Backend (oráculo SEFAZ):** Node.js + Express — valida a NF-e na SEFAZ (mock plugável para a demo)
* **Storage:** Supabase (armazenamento off-chain do XML das notas)

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
O endereço do contrato é **injetado automaticamente** em `frontend/src/constants/deployment.js` — não precisa colar nada à mão. ✨

### Passo 4 (opcional): Popular dados de demonstração
Para a demo já abrir "com vida" (verbas em várias etapas, sem precisar clicar tudo na hora):
```bash
npm run seed:local
```
Isso cadastra a **Account #1** do Hardhat como escola e cria 6 verbas, da etapa *Recebida* até *Auditada*. Importe a chave privada da Account #1 na MetaMask para atuar como **diretor**, e a Account #0 para atuar como **admin/auditor**.

### Passo 5: Subir o Backend (oráculo da SEFAZ)
Abra um **Terminal 3**, entre na pasta `backend` e suba a API que valida as notas fiscais:
```bash
cd backend
npm install
npm run dev    # http://localhost:3001 (provider mock, sem certificado)
```

### Passo 6: Iniciar a Aplicação
Ainda no **Terminal 2**, entre na pasta do frontend e suba o servidor de desenvolvimento do Vite:
```bash
cd frontend
npm run dev
```
Acesse `http://localhost:5173` no seu navegador.

### Passo 7: Configurar a MetaMask para Testes
Para interagir com o DApp sem gastar dinheiro real:
1. Abra a MetaMask e vá em **Redes > Adicionar Rede > Adicionar manualmente**.
2. Preencha com os dados do Hardhat:
   * **Nome da Rede:** Hardhat Localhost
   * **Nova URL da RPC:** `http://127.0.0.1:8545/`
   * **ID da Cadeia (Chain ID):** `31337`
   * **Símbolo da Moeda:** `ETH`
3. Pegue a "Private Key" (Chave Privada) da **Account #0** que apareceu no Terminal 1 (quando você rodou o `npx hardhat node`) e importe na MetaMask. Isso te dará os fundos necessários para atuar como Diretor/Auditor no ambiente de testes.

> 💡 **Dica:** em vez de editar `contract.js`, você pode copiar `frontend/.env.example` para `frontend/.env` e colar o endereço do contrato em `VITE_CONTRACT_ADDRESS`.

---

## 🎬 Roteiro da demonstração (verba do início ao fim)

A **Account #0** (deployer) é o **administrador** e já nasce **auditor**. Importe também a **Account #1** na MetaMask para atuar como **escola/diretor**.

1. **Admin** — conectado com a Account #0, acesse a aba **Admin** e cadastre o endereço da Account #1 em **"Cadastrar Escola"**.
2. **Diretor** — troque para a Account #1 na MetaMask, acesse **Área do Diretor** e:
   - Registre uma verba (ex.: *Merenda*, R$ 5.000).
   - Lance **3 cotações** de fornecedores (a aprovação só libera com 3).
   - **Aprove** o fornecedor vencedor.
   - **Anexe a nota fiscal**: informe uma **chave de NF-e de 44 dígitos** → o app valida na SEFAZ (via backend) e grava on-chain o hash do XML + a chave + o CNPJ do emitente + o valor oficial.
     - *Dica de demo:* qualquer chave de 44 dígitos é aceita pelo mock; uma chave **terminada em `00`** é rejeitada (simula nota inexistente na SEFAZ).
   - **Confirme a entrega**.
3. **Auditoria** — volte para a Account #0, acesse **Auditoria**, abra a verba, **verifique a nota** (reenvie o XML → o hash bate), clique em **Reconsultar na SEFAZ** (confirma a origem direto no fisco, sem confiar no sistema) e em **Auditar e Aprovar**.

O histórico completo fica lacrado e visível para qualquer carteira.

### 📦 Supabase (opcional)
O armazenamento dos **arquivos** das notas fiscais é off-chain (só o hash vai para a blockchain — por desempenho e LGPD). Sem configurar o Supabase, o sistema funciona normalmente: o auditor verifica a autenticidade reenviando o arquivo original. Para habilitar o armazenamento, preencha as variáveis `VITE_SUPABASE_*` em `frontend/.env` e crie um bucket público `notas-fiscais`.

