# Whitepaper — Workspace Cypress

**Versão:** 1.0  
**Data:** Julho 2026  
**Autor:** Eduardo Felizardo  

---

## 1. Objetivo

Este documento descreve as decisões arquiteturais, escolhas de stack e padrões de desenvolvimento adotados no Workspace Cypress. Serve como referência técnica para onboarding de novos membros, auditorias de qualidade e evolução da estrutura.

---

## 2. Contexto

O workspace foi criado para centralizar projetos de automação de testes E2E baseados em Cypress. Cada sistema sob teste possui características distintas: URLs diferentes, ambientes de autenticação próprios, fluxos específicos e dados de teste particulares. A arquitetura escolhida reflete essa heterogeneidade.

---

## 3. Decisão Arquitetural: Um projeto por subpasta

### Alternativas consideradas

| Alternativa | Descrição | Problema |
|---|---|---|
| Tudo na raiz | Uma única configuração para todos os projetos | `baseUrl` única; configs compartilhadas criam acoplamento |
| Organizar por pasta dentro de `cypress/e2e/` | Specs separadas por projeto, mesma instalação | Impossível ter configs e variáveis de ambiente distintas por projeto |
| **Subpasta por projeto (escolhida)** | Cada projeto é uma instalação independente | Maior isolamento; configuração e dependências próprias |
| Monorepo com npm workspaces | Compartilha `node_modules` na raiz via workspaces | Complexidade elevada desnecessária para equipes pequenas |

### Justificativa

Projetos distintos exigem:
- `baseUrl` própria (ambientes diferentes)
- Variáveis de ambiente isoladas (credenciais, tokens)
- Possibilidade de versões de Cypress diferentes por projeto
- Relatórios separados sem interferência entre projetos

A abordagem de subpasta por projeto entrega esse isolamento sem a complexidade de um monorepo.

---

## 4. Stack — Justificativas

### Cypress 15
Runner escolhido por maturidade, documentação extensiva, debugging visual no Cypress App e suporte nativo a interceptação de rede (`cy.intercept`). A versão 15 traz melhorias de performance no modo headless e suporte aprimorado a TypeScript sem configuração extra.

### TypeScript
Tipagem estática elimina uma categoria inteira de bugs em tempo de compilação — seletores errados, propriedades inexistentes em fixtures, retornos não tratados. O custo de configuração é baixo; o ganho em manutenibilidade é alto.

### ESLint + typescript-eslint + eslint-plugin-cypress
Três camadas de análise estática:
1. **typescript-eslint** — regras TypeScript (tipos implícitos, any desnecessário)
2. **eslint-plugin-cypress** — regras específicas de Cypress (proíbe `cy.wait()` com número fixo, detecta seletores frágeis)
3. **eslint-config-prettier** — desativa regras de formatação que conflitam com o Prettier

### Prettier
Formatação automática elimina discussões sobre estilo. Configurado com `singleQuote: true`, sem semicolons e `printWidth: 100`, padrão pragmático para código de testes.

### Mochawesome
Gerador de relatórios HTML com suporte nativo ao reporter do Cypress. O fluxo `json por spec → merge → HTML` permite rodar specs em paralelo e consolidar tudo em um único relatório ao final.

### Faker.js
Geração de dados realistas e aleatórios. Evita fixtures estáticas que acumulam dados obsoletos. Dados gerados dinamicamente reduzem dependência de estado pré-configurado no banco.

### Husky + lint-staged
Git hook de pre-commit que roda ESLint e Prettier apenas nos arquivos staged. Garante que nenhum código com problema de qualidade entre no repositório, sem penalizar o tempo de commit rodando lint em todo o projeto.

### cypress-real-events
O Cypress por padrão simula eventos de mouse e teclado via JavaScript sintético. Alguns componentes UI (drag-and-drop, hover com CSS puro, inputs com listeners nativos) só respondem a eventos reais do sistema operacional. Este plugin emite eventos reais via CDP.

### cypress-wait-until
Esperas condicionais baseadas em predicados (`cy.waitUntil(() => cy.get('.status').contains('Ativo'))`). Alternativa mais expressiva a `cy.wait(número)`, que é um anti-padrão.

---

## 5. Padrão de organização de testes

### Page Object Model (POM)

Cada tela ou componente significativo do sistema tem uma classe em `cypress/support/pages/`. A spec delega a interação à Page Object — não manipula seletores diretamente.

```
cypress/support/pages/
  LoginPage.ts
  DashboardPage.ts
  CheckoutPage.ts
```

**Estrutura de uma Page Object:**

```typescript
export class LoginPage {
  private readonly url = '/login'
  private readonly emailInput = '[data-cy="email"]'
  private readonly passwordInput = '[data-cy="password"]'
  private readonly submitButton = '[data-cy="submit"]'

  visit() {
    cy.visit(this.url)
    return this
  }

  fillEmail(email: string) {
    cy.get(this.emailInput).type(email)
    return this
  }

  fillPassword(password: string) {
    cy.get(this.passwordInput).type(password)
    return this
  }

  submit() {
    cy.get(this.submitButton).click()
    return this
  }
}
```

**Spec usando a Page Object:**

```typescript
import { LoginPage } from '../support/pages/LoginPage'

const login = new LoginPage()

describe('Login', () => {
  it('realiza login com credenciais válidas', () => {
    login.visit().fillEmail('user@email.com').fillPassword('senha123').submit()
    cy.url().should('include', '/dashboard')
  })
})
```

### Convenção de nomenclatura de specs

```
cypress/e2e/
  autenticacao/
    login.cy.ts
    logout.cy.ts
    recuperar-senha.cy.ts
  checkout/
    carrinho.cy.ts
    pagamento.cy.ts
```

### Seletores

Prioridade de seletores (do mais estável ao mais frágil):

| Prioridade | Seletor | Exemplo |
|---|---|---|
| 1 | `data-cy` | `[data-cy="submit-button"]` |
| 2 | `data-testid` | `[data-testid="modal"]` |
| 3 | ARIA roles | `cy.findByRole('button', { name: 'Enviar' })` |
| 4 | ID semântico | `#login-form` |
| 5 | Classe CSS | `.btn-primary` — evitar |
| 6 | XPath | — evitar sempre |

---

## 6. Estratégia de variáveis de ambiente

Duas camadas:

1. **`.env`** — variáveis locais, nunca comitadas
2. **`cypress.config.ts > env`** — valores padrão que podem ser sobrescritos via linha de comando

Acesso dentro dos testes:

```typescript
// Lê de cypress.config.ts > env ou de --env na CLI
Cypress.env('API_URL')
```

Sobrescrita em CI:

```bash
npx cypress run --env API_URL=https://staging.api.com
```

---

## 7. Estratégia de relatórios

```
Execução
  └── cypress/reports/json/
        ├── spec-login.json
        ├── spec-checkout.json
        └── spec-pagamento.json
            ↓
        npm run report:merge
            ↓
        cypress/reports/report.json
            ↓
        npm run report:generate
            ↓
        cypress/reports/html/index.html
```

O relatório HTML contém: taxa de aprovação, duração por teste, screenshots de falhas e histórico de execução.

---

## 8. Fluxo de trabalho recomendado

```
1. Copiar _template/ para nome-do-projeto/
2. npm install
3. Configurar baseUrl e .env
4. Criar Page Objects em cypress/support/pages/
5. Criar specs em cypress/e2e/
6. npm run cy:open  →  validar localmente
7. npm run cy:run   →  execução completa
8. npm run report   →  relatório HTML
9. git add + commit (lint-staged valida automaticamente)
```

---

## 9. Integração com CI/CD

Exemplo de pipeline (GitHub Actions):

```yaml
- name: Run Cypress
  run: npx cypress run --browser chrome
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    API_URL: ${{ secrets.API_URL }}

- name: Generate report
  run: npm run report

- name: Upload report
  uses: actions/upload-artifact@v4
  with:
    name: cypress-report
    path: cypress/reports/html
```

---

## 10. Anti-padrões a evitar

| Anti-padrão | Alternativa |
|---|---|
| `cy.wait(3000)` — espera fixa | `cy.waitUntil()` ou `cy.get().should()` |
| Seletores por classe CSS | `data-cy` attributes |
| Lógica condicional em specs (`if/else`) | Dados de teste determinísticos; separar em specs distintas |
| Testes com dependência de ordem | Cada spec deve ser independente e auto-suficiente |
| Dados hardcoded em specs | Fixtures ou Faker.js |
| `cy.xpath()` desnecessário | Seletores CSS ou ARIA roles |
| Assertions sem mensagem de erro | `.should('exist', 'Elemento X deve existir após login')` |

---

## 11. Evolução planejada

- Integração com Allure Report para histórico de execuções
- Suporte a testes de acessibilidade com `cypress-axe`
- Plugin de cobertura de código com `@cypress/code-coverage`
- Execução paralela com Cypress Cloud ou `--parallel` local
