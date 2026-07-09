# Workspace Cypress

Workspace de automação de testes E2E com Cypress, organizado para suportar múltiplos projetos independentes.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) LTS (v18+)
- npm (v9+)

Verificar:

```bash
node -v
npm -v
```

---

## Estrutura do workspace

```
Workspace Cypress/
  _template/               ← base para novos projetos
  nome-do-projeto/         ← projeto real (criado a partir do template)
  .gitignore
  CLAUDE.md
  README.md
  REQUIREMENTS.md
  WHITEPAPER.md
  requirements.txt
```

Cada projeto é independente — configuração, variáveis de ambiente e relatórios próprios.

---

## Criar um novo projeto

```powershell
# 1. Copiar o template
Copy-Item -Recurse "_template" "nome-do-projeto"

# 2. Entrar no projeto
cd nome-do-projeto

# 3. Inicializar repositório git do projeto
git init

# 4. Instalar dependências
npm install

# 5. Configurar baseUrl em cypress.config.ts
#    baseUrl: 'https://url-do-sistema'

# 6. Configurar variáveis em .env
#    BASE_URL=https://url-do-sistema

# 7. Abrir Cypress
npm run cy:open
```

---

## Estrutura de cada projeto

```
nome-do-projeto/
  cypress/
    e2e/              ← specs (*.cy.ts)
    fixtures/         ← dados estáticos (JSON)
    support/
      commands.ts     ← comandos customizados (cy.login etc.)
      e2e.ts          ← ponto de entrada do support
      pages/          ← Page Objects
    reports/
      json/           ← saída bruta do Mochawesome
      html/           ← relatório final gerado
  cypress.config.ts   ← configuração principal
  tsconfig.json
  eslint.config.cjs
  .prettierrc
  .env                ← variáveis locais (não comitar)
  package.json
```

---

## Scripts disponíveis

| Script | O que faz |
|---|---|
| `npm run cy:open` | Abre a interface visual do Cypress |
| `npm run cy:run` | Executa todos os testes headless |
| `npm run cy:run:headed` | Executa com browser visível |
| `npm run report` | Gera relatório HTML (Mochawesome) |
| `npm run lint` | Verifica problemas de código |
| `npm run lint:fix` | Corrige problemas automaticamente |
| `npm run format` | Formata o código com Prettier |

---

## Stack

| Ferramenta | Versão | Finalidade |
|---|---|---|
| Cypress | 15 | Runner de testes E2E |
| TypeScript | 6 | Tipagem estática |
| ESLint | 10 | Qualidade de código |
| Prettier | 3 | Formatação |
| Faker.js | 10 | Geração de dados |
| Mochawesome | 7 | Relatórios HTML |
| Husky | 9 | Git hooks |
| lint-staged | 17 | Lint no pre-commit |
| cypress-real-events | 1 | Eventos reais de mouse/teclado |
| cypress-wait-until | 3 | Esperas condicionais |
| dayjs | 1 | Manipulação de datas |
| uuid | 14 | Geração de IDs únicos |
| dotenv | 17 | Variáveis de ambiente |

---

## Documentação

- [CLAUDE.md](CLAUDE.md) — instruções para o Claude Code (padrões, anti-padrões, comandos)
- [REQUIREMENTS.md](REQUIREMENTS.md) — requisitos de sistema, software, rede e qualidade
- [WHITEPAPER.md](WHITEPAPER.md) — decisões arquiteturais, padrões e boas práticas
- [requirements.txt](requirements.txt) — lista de pacotes com versões mínimas
- [Cypress Docs](https://docs.cypress.io)

---

**Eduardo Felizardo Cândido**  
Senior QA Automation Engineer | AI-driven Testing | Robot
