# Editais MEIs - Plataforma de Apoio à Concorrência Pública

## Visão Geral

Aplicativo mobile multiplataforma desenvolvido com React Native e Expo para apoiar MEIs (Microempreendedores Individuais) na participação de licitações públicas municipais, estaduais e federais, conforme a Lei nº 14.133/2021 (Nova Lei de Licitações).

### Objetivo Principal

Democratizar a participação de MEIs em licitações, aumentando propostas submetidas em 50% e a taxa de vitórias via centralização de editais e checklists, gerando impacto económico local e conformidade com a Lei 14.133/2021.

---

## Funcionalidades Principais

**RF01: Busca e Filtro de Editais** — Busca e filtro de editais abertos por região, valor, CNAE e outros critérios. Otimizado para uso em smartphone com navegação por abas e pilhas.

**RF02: Análise Automática de Requisitos** — Checklist interativo da Lei 14.133/2021 com indicadores de elegibilidade. Permite marcar requisitos como concluídos e acompanha o progresso da proposta.

**RF03: Organização de Documentos** — Upload e templates para habilitação. Gerenciamento local para persistência de dados essenciais. Integração com APIs backend para envio de notificações.

**RF04: Alertas e Notificações** — Alertas de prazos e preferências de MEIs. Notificações de oportunidades baseadas em perfil. Acompanhamento de prazos com calendário integrado.

**RF05: Dashboard de Histórico** — Dashboard com histórico resumido de participações e andamento das propostas. Visualização de estatísticas e progresso geral.

---

## Estrutura do Projeto

```
editais-meis-app/
├── src/
│   ├── screens/                    # Telas principais
│   │   ├── HomeScreen.tsx          # Lista de editais
│   │   ├── EditalDetailScreen.tsx  # Detalhes do edital
│   │   ├── DocumentsScreen.tsx     # Gerenciamento de documentos
│   │   ├── ProposalProgressScreen.tsx # Dashboard de progresso
│   │   └── __tests__/              # Testes das telas
│   ├── components/                 # Componentes reutilizáveis
│   ├── navigation/                 # Configuração de navegação
│   ├── types/                      # Definições de tipos TypeScript
│   ├── utils/                      # Funções utilitárias
│   └── styles/                     # Estilos globais
├── assets/                         # Ícones e imagens
├── App.tsx                         # Componente raiz
├── index.js                        # Ponto de entrada
├── package.json                    # Dependências
├── jest.config.js                  # Configuração de testes
├── jest.setup.js                   # Setup de testes
├── TESTE_RELATORIO_SEMANA_13.md   # Relatório de testes
├── GUIA_TESTES_MANUAIS.md         # Guia de testes manuais
└── README.md                       # Este arquivo
```

---

## Tecnologias Utilizadas

O projeto utiliza as seguintes tecnologias e versões:

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.34 | Plataforma de desenvolvimento |
| React Navigation | ^7.2.2 | Navegação entre telas |
| TypeScript | ^5.3.3 | Tipagem estática |
| AsyncStorage | 2.2.0 | Persistência local |
| Jest | - | Framework de testes |
| React Native Testing Library | - | Testes de componentes |

---

## Instalação e Execução

### Pré-requisitos

Antes de começar, certifique-se de ter os seguintes requisitos instalados:

- Node.js 18+ instalado
- npm ou yarn instalado
- Expo CLI instalado: `npm install -g expo-cli`
- Android Studio ou Xcode (para emuladores)

### Passos de Instalação

**1. Clonar o repositório**
```bash
git clone <url-do-repositorio>
cd editais-meis-app
```

**2. Instalar dependências**
```bash
npm install
```

**3. Executar em desenvolvimento**
```bash
# Iniciar Expo
npm start

# Em emulador Android
npm run android

# Em simulador iOS
npm run ios

# Em navegador (web)
npm run web
```

**4. Executar testes**
```bash
# Todos os testes
npm test

# Com cobertura
npm test -- --coverage

# Em modo watch
npm test -- --watch
```

---

## Semana 13: Qualidade e Testes

### Objetivo

A semana 13 foi dedicada à validação de qualidade do aplicativo através de testes automatizados, testes em dispositivos reais e emuladores, e validação de responsividade, acessibilidade e performance.

### Entregas Completadas

O projeto atingiu o status de **Milestone 2: Versão Candidata à Entrega** com as seguintes entregas:

- Testes unitários para todas as telas principais
- Testes de acessibilidade conforme WCAG 2.1 Nível A
- Testes de responsividade para 320px a 768px+
- Testes de performance com renderização < 500ms
- Testes em emuladores Android e iOS
- Cobertura de testes 70%+
- Relatório de testes completo
- Guia de testes manuais

### Documentação da Semana 13

- [Relatório de Testes](./TESTE_RELATORIO_SEMANA_13.md) — Análise detalhada de todos os testes realizados
- [Guia de Testes Manuais](./GUIA_TESTES_MANUAIS.md) — Instruções para testes manuais em dispositivos

### Status Atual

**MILESTONE 2: Versão Candidata à Entrega** ✅

---

## Testes

### Cobertura de Testes

O projeto possui cobertura de testes com as seguintes métricas:

```
Statements   : 70.5% ( 141/200 )
Branches     : 72.3% ( 89/123 )
Functions    : 71.8% ( 56/78 )
Lines        : 70.2% ( 140/199 )
```

### Suites de Testes

O projeto inclui testes para as seguintes telas:

| Suite | Casos | Status |
|-------|-------|--------|
| HomeScreen | 10 | ✅ PASSOU |
| EditalDetailScreen | 10 | ✅ PASSOU |
| DocumentsScreen | 10 | ✅ PASSOU |
| ProposalProgressScreen | 10 | ✅ PASSOU |

### Executar Testes

```bash
# Todos os testes
npm test

# Teste específico
npm test -- HomeScreen.test.tsx

# Com cobertura
npm test -- --coverage

# Em modo watch
npm test -- --watch
```

---

## Acessibilidade

O aplicativo segue as diretrizes WCAG 2.1 Nível A, implementando as seguintes práticas:

- Labels acessíveis em todos os elementos interativos
- Roles semânticas (button, checkbox, etc)
- Contraste de cores adequado (mínimo 4.5:1)
- Suporte a leitores de tela (TalkBack, VoiceOver)
- Navegação por teclado
- Descrições de estado

---

## Performance

As métricas de performance foram validadas e estão dentro dos limites esperados:

| Métrica | Alvo | Resultado |
|---------|------|-----------|
| Tempo de carregamento | < 3s | ✅ 2.5s |
| Renderização de lista | < 1s | ✅ 0.8s |
| Detalhes do edital | < 500ms | ✅ 400ms |
| Scroll suave | 60 FPS | ✅ 59 FPS |

---

## Responsividade

O aplicativo foi testado em múltiplos tamanhos de tela e orientações:

| Tamanho | Dispositivo | Status |
|---------|-------------|--------|
| 320px | iPhone SE | ✅ PASSOU |
| 480px | Android comum | ✅ PASSOU |
| 768px | iPad | ✅ PASSOU |
| Landscape | Todos | ✅ PASSOU |

---

## Compatibilidade

O aplicativo foi validado em múltiplas plataformas e versões:

| Plataforma | Versões | Status |
|-----------|---------|--------|
| Android | 11, 12, 13 | ✅ Compatível |
| iOS | 15, 16 | ✅ Compatível |
| Web | Chrome, Firefox, Safari | ✅ Compatível |

---

## Integração com Backend

O aplicativo se integra com APIs backend para as seguintes funcionalidades:

- Busca de editais
- Análise de requisitos
- Persistência de dados
- Notificações push
- Autenticação de usuários

### Configuração de API

```typescript
// src/utils/api.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

---

## Segurança

O aplicativo implementa as seguintes práticas de segurança:

- Autenticação local com AsyncStorage
- Validação de entrada de dados
- Tratamento seguro de erros
- Sem armazenamento de senhas em texto plano
- Comunicação HTTPS com backend

---

## Próximos Passos

### Curto Prazo (Semana 14)

1. Testes E2E com Detox
2. CI/CD com GitHub Actions
3. ESLint e Prettier
4. Monitoring com Sentry

### Médio Prazo (Semana 15+)

1. Testes de integração com backend
2. Otimização de bundle size
3. Dark mode
4. Suporte a múltiplos idiomas

### Longo Prazo

1. Integração com PNCP
2. Autenticação com Gov.br
3. Integração com SICAF
4. Notificações push avançadas

---

## Contribuição

Para contribuir com o projeto, siga os passos abaixo:

1. Criar uma branch para sua feature: `git checkout -b feature/minha-feature`
2. Commit suas mudanças: `git commit -am 'Adiciona minha feature'`
3. Push para a branch: `git push origin feature/minha-feature`
4. Abrir um Pull Request

---

## Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo LICENSE para detalhes.

---

## Histórico de Versões

| Versão | Data | Status | Descrição |
|--------|------|--------|-----------|
| 0.1.0 | 31/03 - 04/04 | ✅ Concluída | Descoberta e arquitetura |
| 0.2.0 | 07/04 - 11/04 | ✅ Concluída | UX mobile e prototipagem |
| 0.3.0 | 14/04 - 18/04 | ✅ Concluída | Fundação do app |
| 0.4.0 | 28/04 - 02/05 | ✅ Concluída | Módulo de editais |
| 0.5.0 | 05/05 - 09/05 | ✅ Concluída | Módulo de requisitos |
| 0.6.0 | 12/05 - 16/05 | ✅ Concluída | Alertas e segurança |
| 1.0.0-rc1 | 19/05 - 23/05 | ✅ Concluída | Qualidade e testes (Milestone 2) |

---

**Última Atualização:** 23/05/2026  
**Versão:** 1.0.0-rc1 (Release Candidate)  
**Status:** Pronto para Entrega

---

## Integração com Backend e Fallback Mockado

O projeto foi revisado para consumir o backend **ProjEngDados** por meio do endpoint `/editais`. O frontend adapta os campos retornados pelo backend para o domínio visual do app, preservando busca, filtros, checklist de habilitação, organização de documentos e dashboard de progresso.

A camada `src/utils/api.ts` tenta localizar automaticamente o backend em múltiplas URLs, incluindo `EXPO_PUBLIC_API_URL`, o host detectado pelo Expo, `10.0.2.2:3000` para emulador Android, `localhost:3000` e `127.0.0.1:3000`. Caso nenhuma tentativa responda, o app usa `src/data/mockEditais.ts`, mantendo a aplicação funcional para demonstração e testes.

Para rodar com celular físico, inicie o Expo informando o IP do computador na mesma rede Wi-Fi:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000 npm start
```

Para validar o frontend principal, execute:

```bash
npm run typecheck
```

Consulte também o arquivo `INTEGRACAO.md`, localizado na raiz do pacote entregue, para instruções completas de execução do backend e diagnóstico de rede.
