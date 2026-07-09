# CLAUDE.md — Workspace Cypress

Workspace de automação E2E com Cypress. Cada subpasta é um projeto independente com configuração própria. A pasta `_template/` é a base para novos projetos.

---

## Estrutura

```
Workspace Cypress/
  _template/               ← copiar para criar novo projeto
  nome-do-projeto/         ← projeto real (não comitado aqui)
  .gitignore
  CLAUDE.md
  README.md
  REQUIREMENTS.md
  WHITEPAPER.md
  requirements.txt
```

Cada projeto contém:

```
nome-do-projeto/
  cypress/
    e2e/                   ← specs (*.cy.ts)
    fixtures/              ← dados estáticos JSON
    support/
      commands.ts          ← comandos customizados
      e2e.ts               ← importa plugins e commands
      pages/               ← Page Objects
    reports/
      json/                ← output por spec (mochawesome)
      html/                ← relatório consolidado
  cypress.config.ts
  tsconfig.json
  eslint.config.cjs
  .prettierrc
  .env
  package.json
```

---

## Git

O repositório git da workspace rastreia apenas:
- `_template/`
- Arquivos de documentação (`README.md`, `WHITEPAPER.md`, `REQUIREMENTS.md`, `requirements.txt`, `CLAUDE.md`)
- `.gitignore`

**Projetos individuais não são comitados aqui.** Cada projeto em `nome-do-projeto/` deve ter seu próprio repositório git (`git init` dentro da pasta do projeto).

---

## Criar novo projeto

```powershell
Copy-Item -Recurse "_template" "nome-do-projeto"
cd "nome-do-projeto"
git init
npm install
```

Após copiar, ajustar obrigatoriamente:
- `baseUrl` em `cypress.config.ts`
- `BASE_URL` e `API_URL` em `.env`

---

## Comandos disponíveis (dentro de cada projeto)

```bash
npm run cy:open          # abre Cypress UI
npm run cy:run           # headless
npm run cy:run:headed    # com browser visível
npm run report           # gera relatório HTML
npm run lint             # verifica ESLint
npm run lint:fix         # corrige ESLint
npm run format           # Prettier
```

---

## Stack

- **Cypress 15** — runner E2E
- **TypeScript 6** — todas as specs e suporte em `.ts`
- **ESLint + typescript-eslint + eslint-plugin-cypress** — qualidade de código
- **Prettier** — formatação (singleQuote, sem semi, printWidth 100)
- **Mochawesome** — relatórios HTML
- **Faker.js** — geração de dados dinâmicos
- **dayjs / uuid / dotenv** — utilitários
- **cypress-real-events** — eventos reais de mouse/teclado
- **cypress-wait-until** — esperas condicionais
- **Husky + lint-staged** — lint automático no pre-commit

---

## Padrões obrigatórios

### Page Objects

Toda interação com a UI deve passar por uma Page Object em `cypress/support/pages/`.
Specs não manipulam seletores diretamente.

```typescript
// cypress/support/pages/LoginPage.ts
export class LoginPage {
  private email = '[data-cy="email"]'
  private password = '[data-cy="password"]'
  private submit = '[data-cy="submit"]'

  visit() { cy.visit('/login'); return this }
  fillEmail(v: string) { cy.get(this.email).type(v); return this }
  fillPassword(v: string) { cy.get(this.password).type(v); return this }
  clickSubmit() { cy.get(this.submit).click(); return this }
}
```

```typescript
// cypress/e2e/autenticacao/login.cy.ts
import { LoginPage } from '../../support/pages/LoginPage'

const login = new LoginPage()

describe('Login', () => {
  it('entra com credenciais válidas', () => {
    login.visit().fillEmail('user@email.com').fillPassword('senha').clickSubmit()
    cy.url().should('include', '/dashboard')
  })
})
```

### Seletores

Prioridade obrigatória:

1. `[data-cy="nome"]` — preferido sempre
2. `[data-testid="nome"]`
3. ARIA roles — `cy.findByRole('button', { name: 'Enviar' })`
4. ID semântico — `#login-form`
5. Classe CSS — evitar
6. XPath — proibido salvo exceção justificada

### Nomenclatura de specs

```
cypress/e2e/
  modulo/
    funcionalidade.cy.ts
```

Exemplos: `autenticacao/login.cy.ts`, `checkout/pagamento.cy.ts`

### Dados de teste

Usar Faker.js para dados dinâmicos. Evitar dados hardcoded em specs.

```typescript
import { faker } from '@faker-js/faker'

const usuario = {
  nome: faker.person.fullName(),
  email: faker.internet.email(),
  cpf: faker.string.numeric(11),
}
```

Usar fixtures para dados estáticos reutilizáveis:

```typescript
cy.fixture('usuario').then((dados) => { ... })
```

### Variáveis de ambiente

```typescript
Cypress.env('API_URL')   // correto
'https://...'            // hardcoded — proibido em specs
```

---

## Anti-padrões — nunca fazer

| Proibido | Alternativa |
|---|---|
| `cy.wait(3000)` | `cy.waitUntil()` ou `.should('be.visible')` |
| Seletor por classe CSS | `data-cy` attribute |
| `cy.xpath()` sem justificativa | Seletores CSS ou ARIA |
| Dados hardcoded em specs | `faker` ou `cy.fixture()` |
| Specs com dependência de ordem | Cada spec deve ser auto-suficiente |
| `as any` no TypeScript | Tipar corretamente |
| Comentários explicando O QUE o código faz | Código autoexplicativo com nomes claros |

---

## Configuração do cypress.config.ts

Campos que sempre devem ser revisados ao criar um projeto:

```typescript
baseUrl: 'https://url-do-sistema',   // obrigatório
env: {
  API_URL: '',                        // se o projeto usa API
},
reporter: 'mochawesome',             // não alterar
```

---

## Qualidade

O pre-commit (Husky) roda `lint-staged` automaticamente.
Antes de entregar qualquer código, verificar manualmente:

```bash
npm run lint
npm run format
```

Nenhum erro de ESLint deve ser ignorado com `// eslint-disable` sem comentário explicando o motivo.
