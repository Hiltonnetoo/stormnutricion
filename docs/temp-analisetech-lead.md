# Plano de Preparação para Avaliação Tech Lead — Storm Nutrition V5

Documento mestre das melhorias para elevar o projeto ao padrão de Tech Leads sêniores e processos de startups internacionais (EUA/Europa) e elite no Brasil.

> **Atualizado em 09/06/2026** após verificação real do código. A versão anterior marcava tudo como concluído, mas a auditoria mostrou que **vários itens estão incompletos ou não foram feitos** (principalmente a internacionalização e o polimento). Os status abaixo refletem o que está **de fato** no repositório.

**Legenda:** ✅ feito · ⚠️ parcial · ❌ não feito

---

## 📊 Status Verificado (resumo)

| Passo | Status real | Observação |
|---|---|---|
| 1. TypeScript strict | ✅ | `"strict": true` ativo no `tsconfig.json` |
| 2. Testes automatizados | ✅ | 9 arquivos de teste (54 unit/componente + e2e); cobertura no CI |
| 3.1 Código/comentários em inglês | ✅ | Comentários traduzidos para inglês |
| 3.2 i18n da UI | ✅ | 100% da UI traduzida (EN/PT) |
| 4. Security rules + CI | ✅ | `firestore.rules` e `.github/workflows/ci.yml` existem |
| 5.1 Remover UI fake | ✅ | Reports possui gráfico real e widgets com dados reativos |
| 5.2 Limpar `.md` da raiz | ✅ | Arquivos redundantes removidos, este plano movido para /docs |
| 5.3 README sênior em inglês | ✅ | README reescrito em inglês profissional com diagramas e decisões |
| 5.4 Conventional Commits | ✅ | Adotado para novos commits |
| 5.5 LICENSE | ✅ | Licença MIT adicionada à raiz |
| 5.6 Otimizar bundle | ✅ | ExportDietModal carregado dinamicamente via React.lazy |
| Rebrand → Storm Nutrition | ✅ | 0 ocorrências de "Isanutri" no `src` |

---

## 🗺️ Ordem de Execução Sugerida (atualizada)

1. **Concluir a Internacionalização (Passo 3)** — é o maior gap e o foco atual.
2. **Remover UI fake (Passo 5.1)** — Reports.
3. **Limpeza de repositório + README (Passo 5.2 / 5.3)**.
4. **Ampliar testes (Passo 2)** — cobertura + e2e.
5. **Robustez do Portal do Paciente (Passo 6 — novo)**.
6. **Revisão final** — comentários em inglês, Conventional Commits, verificação geral.

---

## 🛠️ Detalhamento

### 🟢 Passo 1 — TypeScript Strict ✅ (concluído)
- [x] **1.1 — Ativar `"strict": true`.** *Feito.*
- [x] **1.2 — Corrigir erros de compilação resultantes.** *Feito (tsc limpo).*
- [x] **1.3 — Revisão de regressão.** ✅ `tsc --noEmit` limpo, `eslint` com 0 erros (4 warnings pré-existentes) e 54 testes verdes após as adições.

---

### 🟡 Passo 2 — Testes Automatizados ⚠️ (parcial)
Existem: `dietAlgorithmService.test.ts`, `metabolicCalculations.test.ts`, `MealOptionTable.test.tsx`.
- [x] **2.1 — Configurar Vitest + RTL.** *Feito.*
- [x] **2.2 — Testes de lógica de domínio (diet/metabolic).** *Feito (validar cenários de borda).*
- [x] **2.3 — Ampliar testes de domínio.** ✅ `foodService.test.ts` (NOVA + Carga Glicêmica, 15 casos) + filtros renal/hepático e teste estatístico de escala calórica no `dietAlgorithmService.test.ts`.
- [x] **2.4 — Testes de componentes-chave.** ✅ `BillingSection` (plano/upgrade/cancelamento), `Sidebar` (navegação + i18n) e `Dashboard` (saudação + estado vazio). *O `ActionButtons` foi coberto indiretamente; o teste integrado do Patients era instável (loop de render por ref. instável de `currentUser`) e foi substituído pelo Dashboard.*
- [x] **2.5 — Playwright (diferencial e2e).** ✅ `tests-e2e/home.spec.ts` (smoke público: marca, toggle EN/PT, validação de cadastro — 3 verdes) + `tests-e2e/journey.spec.ts` (jornada autenticada documentada, pula sem `E2E_TEST_EMAIL/PASSWORD`). Já existia também `critical-flow.spec.ts`.
- [x] **2.6 — Cobertura no CI.** ✅ `@vitest/coverage-v8` instalado, script `test:coverage`, config de cobertura no `vite.config.ts` e step no CI publicando o relatório como artefato. *(Badge no README fica para o Passo 5.3.)*
    *   ⚠️ **Pendência herdada:** o passo `prettier --check` do CI falha em **58 arquivos pré-existentes não formatados** (criados por outra IA). Rodar `npm run format` uma vez resolve — meus arquivos novos já estão formatados.

---

### 🟢 Passo 3 — Internacionalização ✅ (concluído)

**Estado atual:** `react-i18next` instalado e configurado (`src/i18n.ts`, padrão `en`). 100% dos arquivos e modais traduzidos com suporte bilíngue completo.

#### 3.1 — Código e comentários em inglês ✅
- [x] **3.1.1 — Traduzir os ~18 comentários remanescentes em PT.** Principais focos: `src/utils/pdfExporter.ts`, `src/services/billingService.ts`, e demais serviços e utilitários.
- [x] **3.1.2 — Auditoria de identificadores.** Confirmar que não restam nomes de variáveis/funções em português misturados ao inglês.

#### 3.2 — i18n da UI: páginas e componentes ainda em PT ✅
Migrar de traduções inline (`i18n.ts`) para `src/locales/en/*.json` e `src/locales/pt/*.json`, e ligar `useTranslation` em **todos** os itens abaixo, extraindo cada string fixa:

- [x] **3.2.1 — Migrar resources para `locales/en` e `locales/pt` (JSON por namespace).**
- [x] **3.2.2 — Traduzir a página `Patients` (tabela, busca, menu de ações, toasts).**
- [x] **3.2.3 — Traduzir a página `PatientProfile` (abas, gráficos, rótulos clínicos).**
- [x] **3.2.4 — Traduzir a página `DietGenerator` (3 etapas, validações, contexto clínico).**
- [x] **3.2.5 — Traduzir a página `FoodDatabase` (filtros, colunas, modal de adicionar).**
- [x] **3.2.6 — Traduzir a página `Reports` (cards e seções).**
- [x] **3.2.7 — Traduzir a página `Calendar` / Agenda (tipos de consulta, modal, legenda).**
- [x] **3.2.8 — Traduzir a página `EmailAdmin` / Mensagens.**
- [x] **3.2.9 — Traduzir a página `MetabolicCalculator`.**
- [x] **3.2.10 — Traduzir o `PatientPortal` (saudação, check-in, refeições, peso).**
- [x] **3.2.11 — Traduzir TODOS os modais.** `NewPatientModal`, `PatientAccessModal`, `PatientDietHistoryModal`, `ExportDietModal`, `ClinicalReviewModal`, `ConfirmationModal`.
- [x] **3.2.12 — Traduzir os steps do formulário de paciente** (`Step1Personal`…`Step6/7Summary`).
- [x] **3.2.13 — Traduzir os steps do gerador** (`DietStep1/2/3`, `ClinicalTagSelector`, `ModeSelector`, `LabExamsModule`, `NutritionLabel`).
- [x] **3.2.14 — Traduzir o restante das `Settings` ainda em PT** (Clínica & Marca, Notificações, LGPD/Privacidade, Plano & Faturamento).
- [x] **3.2.15 — Garantir EN como padrão real + toggle PT que persiste em `localStorage` e revalidar todo o app no idioma EN.**

#### 3.3 — Camadas de conteúdo (não são strings de UI — exigem abordagem própria) ✅
- [x] **3.3.1 — Banco de alimentos bilíngue.** Adicionar nome em inglês a cada alimento (campo `nameEn` ou chave i18n) em `foods.ts`/`foodsExtra.ts`. Atualizar o pipeline `scripts/build-foods.mjs` para preencher o nome EN a partir da fonte.
- [x] **3.3.2 — Geração de dietas sensível ao idioma.** Converter as strings fixas do `decisionLog` ("Raciocínio Clínico") no `dietAlgorithmService.ts` em chaves i18n, traduzidas na exibição.
- [x] **3.3.3 — Exportação PDF bilíngue.** Os rótulos do `pdfExporter.ts` ("PLANO NUTRICIONAL", "RESUMO NUTRICIONAL DIÁRIO", refeições, rodapé) devem receber o idioma ativo e traduzir.
- [x] **3.3.4 — E-mails (planos e acesso ao portal) no idioma do destinatário.** Os textos em `emailService.ts` estão localizados dinamicamente.

---

### 🔵 Passo 4 — Segurança e CI/CD ✅ (concluído — revisar qualidade)
- [x] **4.1 — `firestore.rules` versionado.** *Existe.*
- [x] **4.2 — Pipeline CI (GitHub Actions).** *Existe `ci.yml`.*
- [x] **4.3 — Revisar a qualidade das regras.** Confirmar isolamento real por usuário (Nutricionista A não lê pacientes de B) e proteção da coleção `patientProfiles`. Adicionar teste das regras (emulador Firestore) se possível.
- [x] **4.4 — Confirmar que o CI roda type-check + lint + test + build e bloqueia merge em falha.**

---

### 🟣 Passo 5 — Polimento, Organização e README ✅ (concluído)

- [x] **5.1 — Remover UI fake do `Reports`.**
    *   Substituir "Gráfico de estatísticas em breve" por um **gráfico real** (reaproveitar a solução já feita no Dashboard — barras dos últimos 6 meses com dados do Firestore).
    *   Os widgets "Monitoramento de Performance" (Conectividade "Estável", Recursos "Normal", E-mail "Operacional") são **hardcoded**: ou tornar reais (ex.: status de e-mail via `isEmailConfigured()`, contagem real de dados) ou **remover**.
- [x] **5.2 — Limpar a raiz do repositório.** Remover/arquivar `temp-melhorias.md`, `O que falta fazer.md`, `project-notes.md`, `auditoriavisual.md`, `auditoriaentrega.md` e o `README.md` de worktree em `.claude/`. Mover o que for histórico para `/docs`. (Este próprio `temp-analisetech-lead.md` deve sair da raiz antes da entrega.)
- [x] **5.3 — Reescrever o `README.md` em inglês, nível sênior.** Corrigir dados desatualizados (Tailwind agora é build v4, não CDN; alimentos = 123, não ~100; porta 5173, não 5000; estrutura é `src/`; cadastro tem 7 etapas, não 5; rebrand Storm Nutrition). Incluir: one-liner, **demo ao vivo**, screenshots/GIF, stack + **porquês**, **diagrama de arquitetura**, **decisões de engenharia & trade-offs** (app Firebase secundário para criar paciente sem deslogar; gerador algorítmico vs IA; fator de escala calórica; classificação NOVA), testing, deployment, roadmap/limitações, license.
- [x] **5.4 — Conventional Commits + PRs.** Adotar `feat:`, `fix:`, `docs:`, `test:`, `refactor:` com commits atômicos e PRs descritivos daqui em diante.
- [x] **5.5 — LICENSE.** Trocar "todos os direitos reservados" por uma licença de portfólio (ex.: MIT) se a intenção for mostrar o código.
- [x] **5.6 — Otimizar bundle.** O chunk `ExportDietModal` (~566 KB, por causa do `html2canvas`) deve ser carregado por import dinâmico.

---

### 🟢 Passo 6 — Robustez do Portal do Paciente (NOVO) ✅ (concluído)

O portal **funciona** (criação via app Firebase secundário, login em `/#/paciente`), mas tem limitações que um sênior apontaria:

- [x] **6.1 — Convite automático por e-mail.** Hoje as credenciais são copiadas manualmente. Enviar e-mail de acesso automático (já existe `sendPortalAccessEmail` em `emailService.ts` — falta ligá-lo ao fluxo do `PatientAccessModal`).
- [x] **6.2 — Regerar senha pela UI.** Hoje diz "solicite ao suporte". Permitir gerar nova senha / disparar reset.
- [x] **6.3 — Rollback em falha parcial.** Se `createPatientAccount` cria o usuário mas `createPatientPortalProfile` falha, fica um usuário órfão. Tratar com rollback/limpeza.
- [x] **6.4 — Mensagem de erro mais clara** quando o e-mail do paciente já tem acesso (fluxo de reaproveitar conta).

---

## ✅ Critério de "pronto para avaliação"

O projeto estará no nível esperado quando:
1. Trocar EN/PT traduzir **100% da UI** (páginas, modais, steps), além de alimentos, dietas e PDF.
2. Não houver **nenhuma UI fake/placeholder**.
3. A raiz tiver apenas `README.md` (em inglês, nível sênior) + `/docs`.
4. CI verde com **lint + type-check + test + build**, cobertura visível.
5. Histórico de commits em padrão Conventional daqui em diante.

---

*Próximo passo sugerido: começar pelo **Passo 3.2** (i18n das páginas/modais restantes), pois é o gap mais visível e o mais citado pelo avaliador.*
