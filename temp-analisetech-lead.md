# Plano de Preparação para Avaliação Tech Lead (Nível Internacional)

Este documento detalha as melhorias necessárias para elevar o projeto **Isanutri V5** ao padrão exigido por Tech Leads seniores e avaliadores de startups internacionais (EUA/Europa) e processos de elite no Brasil.

---

## 🗺️ Ordem de Execução Sugerida

Para maximizar a eficiência, a ordem sugerida prioriza a **estabilidade de código e conformidade** antes da **tradução e internacionalização**, terminando com a **documentação e processos**:

1. **Robustez de Tipagem**: Ativar o modo strict do TypeScript (garante que não há erros silenciosos na lógica).
2. **Qualidade e Testes**: Configurar a infraestrutura de testes unitários e de componente (Vitest + RTL).
3. **Internacionalização**: Traduzir o código e comentários para inglês, depois implementar a UI bilíngue (i18n).
4. **Segurança e Infraestrutura**: Versionar as regras do Firestore e configurar CI/CD (GitHub Actions).
5. **Polimento Visual & Organização**: Remover todo código fake, apagar arquivos temporários da raiz e redigir o README de nível sênior.

---

## 🛠️ Detalhamento das Melhorias

### 🔴 Passo 1: Robustez e Tipagem Estrita (TypeScript Strict)
Atualmente, o compilador do TypeScript está rodando em modo permissivo. Um Tech Lead identifica isso imediatamente olhando o `tsconfig.json`.
- [x] **Ajuste 1.1: Ativar `"strict": true` no `tsconfig.json`.**
    *   *Justificativa*: Força a validação contra valores `null` ou `undefined` não tratados, melhorando a confiabilidade do sistema e eliminando possíveis crashes em produção.
- [x] **Ajuste 1.2: Corrigir erros de compilação resultantes.**
    *   *Justificativa*: Ao ativar o modo strict, o TypeScript emitirá avisos em locais onde variáveis podem ser nulas. É necessário adicionar guards adequados nesses arquivos.

### 🟡 Passo 2: Testes Automatizados (Fator Decisivo)
A ausência total de testes é a falha mais marcante do projeto atual para vagas internacionais.
- [x] **Ajuste 2.1: Configurar Vitest + React Testing Library.**
    *   *Justificativa*: Cria a infraestrutura padrão moderna de testes rápidos no ecossistema React.
- [x] **Ajuste 2.2: Criar Testes Unitários de Lógica de Domínio.**
    *   *Justificativa*: Testar os arquivos `src/services/dietAlgorithmService.ts` (cálculo de porção e macros) e `src/services/metabolicCalculations.ts` (GET, TMB, IMC). Prova que a lógica crítica de saúde funciona sob qualquer cenário.
- [x] **Ajuste 2.3: Criar Testes de Componentes Principais.**
    *   *Justificativa*: Garantir que componentes interativos como `MealOptionTable` ou `Sidebar` renderizem e reajam corretamente a cliques.
- [x] **Ajuste 2.4: Instalar e configurar Playwright (Opcional - Diferencial).**
    *   *Justificativa*: Criar um teste E2E para o fluxo crítico (Login -> Cadastrar Paciente -> Gerar Dieta -> Exportar PDF). Mostra conhecimento avançado de garantia de qualidade.

### 🟢 Passo 3: Internacionalização (Padrão Global)
Para atuar no mercado americano ou startups que miram o exterior, o código deve ser global.
- [x] **Ajuste 3.1: Traduzir nomes de variáveis, funções, componentes e comentários.**
    *   *Justificativa*: Evitar misturar inglês e português no código (ex: `criarPaciente`, `CalcularIMC`). Tudo no editor (incluindo comentários) deve estar em inglês.
- [x] **Ajuste 3.2: Implementar Tradução de UI (i18n) com `react-i18next`.**
    *   *Justificativa*: Extrair as strings estáticas em arquivos `locales/en/common.json` e `locales/pt/common.json`, adicionando um switcher de linguagem EN/PT no header. Mostra domínio sobre internacionalização de produtos.

### 🔵 Passo 4: Segurança e Processo (CI/CD)
Demonstra que você sabe trabalhar sob o fluxo de engenharia de uma equipe real de desenvolvimento.
- [x] **Ajuste 4.1: Versionar as regras de segurança do Firebase (`firestore.rules`).**
    *   *Justificativa*: Mostra cuidado real com a privacidade de dados (ex: impedir que o Nutricionista A leia os pacientes do Nutricionista B no banco de dados).
- [x] **Ajuste 4.2: Configurar pipeline de CI via GitHub Actions.**
    *   *Justificativa*: Rodar automaticamente `npm run format`, `npm run type-check`, `npm run test` e `npm run build` a cada Pull Request. Garante que ninguém integre código quebrado ao repositório principal.

### 🟣 Passo 5: Polimento, Organização e README Sênior
Eliminar o aspecto de "trabalho de faculdade" ou "rascunho".
- [x] **Ajuste 5.1: Remover placeholders e UI Fakes.**
    *   *Justificativa*: Implementar gráficos interativos reais em SVG nas estatísticas mensais (Reports) e atualizar os widgets estáticos para mostrar dados baseados no ambiente.
- [x] **Ajuste 5.2: Limpeza da Raiz do Repositório.**
    *   *Justificativa*: Excluir arquivos temporários (`temp-melhorias.md`, `O que falta fazer.md`, `project-notes.md`, etc.) mantendo a raiz limpa e profissional.
- [x] **Ajuste 5.3: Reescrever o `README.md` em Inglês Acadêmico/Profissional.**
    *   *Justificativa*: O README deve focar em **decisões de engenharia e trade-offs** (ex: o uso de Firebase dinâmico, algoritmos manuais de dietas e gráficos SVG personalizados para performance) em vez de apenas manual de uso.
- [x] **Ajuste 5.4: Adotar Conventional Commits e PRs.**
    *   *Justificativa*: Seguir o fluxo de commits atômicos (`feat:`, `fix:`, `docs:`, `test:`) para demonstrar disciplina profissional na linha do tempo do Git.
