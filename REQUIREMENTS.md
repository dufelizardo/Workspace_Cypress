# Requirements — Workspace Cypress

**Versão:** 1.0  
**Data:** Julho 2026  

---

## 1. Requisitos de Sistema

### Sistema Operacional

| SO | Versão Mínima | Suporte |
|---|---|---|
| Windows | 10 / 11 (64-bit) | Completo |
| macOS | 12 (Monterey)+ | Completo |
| Linux (Ubuntu) | 20.04+ | Completo |

### Hardware

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 núcleos | 4+ núcleos |
| RAM | 4 GB | 8 GB+ |
| Disco | 2 GB livres | 5 GB+ livres |

---

## 2. Requisitos de Software

### Obrigatórios

| Software | Versão Mínima | Verificar |
|---|---|---|
| Node.js | 18.x LTS | `node -v` |
| npm | 9.x | `npm -v` |
| Git | 2.x | `git --version` |

### Browsers suportados pelo Cypress

| Browser | Versão Mínima |
|---|---|
| Chrome | 64+ |
| Edge | 79+ |
| Firefox | 86+ |
| Electron | Incluído no Cypress |

> O Electron é instalado junto com o Cypress e não requer instalação separada.

---

## 3. Requisitos de Ambiente de Desenvolvimento

### IDE recomendada

**Visual Studio Code** com as extensões:

| Extensão | ID | Finalidade |
|---|---|---|
| Cypress | `cypress-io.cypress` | Suporte ao Cypress no VS Code |
| ESLint | `dbaeumer.vscode-eslint` | Feedback inline de lint |
| Prettier | `esbenp.prettier-vscode` | Formatação automática ao salvar |
| TypeScript | Nativo no VS Code | Tipagem e IntelliSense |
| Error Lens | `usernamehw.errorlens` | Erros inline no editor |
| GitLens | `eamodio.gitlens` | Histórico e blame do Git |
| Path Intellisense | `christian-kohler.path-intellisense` | Autocomplete de caminhos |
| DotENV | `mikestead.dotenv` | Highlight de arquivos `.env` |

### Configuração recomendada do VS Code

Criar `.vscode/settings.json` dentro de cada projeto:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.validate": ["typescript"]
}
```

---

## 4. Requisitos de Rede

| Recurso | Necessidade |
|---|---|
| Acesso à internet | Obrigatório na instalação (`npm install`) |
| Acesso ao sistema sob teste | Obrigatório durante execução |
| Proxy corporativo | Configurar `HTTP_PROXY` / `HTTPS_PROXY` se aplicável |
| Cypress Cloud | Opcional (para execução paralela e dashboard) |

---

## 5. Requisitos por Projeto

Ao criar um novo projeto a partir do `_template/`, os seguintes itens devem ser configurados antes da execução dos testes:

### 5.1 Obrigatórios

- [ ] `baseUrl` definida em `cypress.config.ts`
- [ ] `BASE_URL` definida em `.env`
- [ ] Dependências instaladas (`npm install`)
- [ ] Sistema sob teste acessível via rede

### 5.2 Condicionais

| Situação | Ação necessária |
|---|---|
| Testes autenticados | Adicionar `CYPRESS_USERNAME` e `CYPRESS_PASSWORD` no `.env` |
| Testes de API | Definir `API_URL` em `.env` e `cypress.config.ts > env` |
| Banco de dados | Instalar driver (`npm install -D mysql2 / pg / oracledb`) |
| Upload de arquivos | Instalar `cypress-file-upload` |
| XPath | Instalar `@cypress/xpath` |

---

## 6. Requisitos de Qualidade de Código

Todo código submetido ao repositório deve:

- [ ] Passar na verificação do ESLint sem erros (`npm run lint`)
- [ ] Estar formatado conforme o Prettier (`npm run format`)
- [ ] Ter specs escritas em TypeScript (`.cy.ts`)
- [ ] Usar seletores `data-cy` ou `data-testid` como prioridade
- [ ] Não conter `cy.wait()` com valores fixos em milissegundos
- [ ] Ter cada spec independente (sem dependência de ordem de execução)

O pre-commit do Husky verifica lint e formatação automaticamente.

---

## 7. Requisitos de Relatório

Após execução dos testes (`npm run cy:run`):

- [ ] Arquivos JSON gerados em `cypress/reports/json/`
- [ ] Relatório consolidado gerado com `npm run report`
- [ ] Relatório HTML disponível em `cypress/reports/html/index.html`
- [ ] Screenshots de falhas salvas em `cypress/reports/screenshots/`
- [ ] Vídeos de execução salvos em `cypress/reports/videos/`

---

## 8. Requisitos de CI/CD

Para integração em pipeline:

| Requisito | Detalhe |
|---|---|
| Variáveis de ambiente | `BASE_URL`, `API_URL`, credenciais via secrets do CI |
| Browser | Chrome ou Edge disponível no agente de CI |
| Node.js | Versão LTS instalada no agente |
| Artefatos | Relatório HTML e screenshots publicados como artefatos do pipeline |
| Exit code | Pipeline deve falhar se `cypress run` retornar código diferente de 0 |

---

## 9. Dependências do Template

Lista completa de dependências instaladas no `_template/package.json`:

### Testes e automação

```
cypress                       Runner E2E principal
cypress-real-events           Eventos reais de mouse e teclado
cypress-wait-until            Esperas condicionais por predicado
```

### Linguagem e tipagem

```
typescript                    Compilador TypeScript
@types/node                   Tipos para APIs do Node.js
```

### Qualidade de código

```
eslint                        Linter principal
typescript-eslint             Regras TypeScript para ESLint
eslint-plugin-cypress         Regras específicas do Cypress
eslint-config-prettier        Desativa regras de formatação no ESLint
prettier                      Formatador de código
```

### Git hooks

```
husky                         Gerenciador de Git hooks
lint-staged                   Roda lint apenas nos arquivos staged
```

### Geração de dados

```
@faker-js/faker               Dados realistas e aleatórios
uuid                          Geração de UUIDs
dayjs                         Manipulação e formatação de datas
dotenv                        Carregamento de variáveis do .env
```

### Relatórios

```
mochawesome                   Reporter que gera JSON por spec
mochawesome-merge             Consolida JSONs em um único arquivo
mochawesome-report-generator  Gera relatório HTML a partir do JSON consolidado
```
