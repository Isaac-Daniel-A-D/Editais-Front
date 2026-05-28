# Instruções de integração do front-end com os dados do back-end

Este front-end foi ajustado para priorizar os dados persistidos pelo back-end do projeto PNCP. No back-end enviado, os registros são salvos no MongoDB Atlas no banco `projeto_pncp`, principalmente nas coleções `contratacoes_<uf>` e `streaming_contratacoes_<uf>`, por exemplo `contratacoes_pe` e `streaming_contratacoes_pe`.

## O que foi alterado

A camada `src/utils/api.ts` agora normaliza diferentes formatos retornados pelo back-end/MongoDB para o tipo `Edital` usado pelas telas do app. A busca considera os campos gravados pelo back, como `numero_controle`, `objeto`, `orgao`, `municipio`, `uf`, `modalidade`, `valor` e `data_abertura`, além de variações comuns vindas diretamente da API do PNCP.

As telas `Proposta` e `Documentos` agora carregam exclusivamente os editais favoritados. Para favoritar, use o botão **Favoritar edital** na lista inicial de editais ou na tela de detalhes. O estado dos favoritos é persistido localmente com `AsyncStorage`.

## Configuração recomendada

A forma mais segura é disponibilizar no back-end uma API HTTP que leia o MongoDB e retorne os editais. O front tentará automaticamente os seguintes caminhos usando `EXPO_PUBLIC_API_URL` como base:

| Caminho | Exemplo |
|---|---|
| `/editais?uf=PE&tamanho=50` | `http://localhost:3000/editais?uf=PE&tamanho=50` |
| `/contratacoes?uf=PE&tamanho=50` | `http://localhost:3000/contratacoes?uf=PE&tamanho=50` |
| `/contratacoes/pe?tamanho=50` | `http://localhost:3000/contratacoes/pe?tamanho=50` |
| `/api/editais?uf=PE&tamanho=50` | `http://localhost:3000/api/editais?uf=PE&tamanho=50` |
| `/api/contratacoes?uf=PE&tamanho=50` | `http://localhost:3000/api/contratacoes?uf=PE&tamanho=50` |

Crie um arquivo `.env` no front-end com, por exemplo:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_EDITAIS_UF=PE
EXPO_PUBLIC_EDITAIS_LIMIT=50
```

## Leitura direta pelo MongoDB Data API

Também foi incluída compatibilidade com MongoDB Atlas Data API para ambientes de desenvolvimento. Se essas variáveis estiverem preenchidas, o front tentará ler diretamente o armazenamento do back-end:

```env
EXPO_PUBLIC_MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/<app-id>/endpoint/data/v1
EXPO_PUBLIC_MONGODB_DATA_API_KEY=<api-key>
EXPO_PUBLIC_MONGODB_DATA_SOURCE=<cluster-ou-data-source>
EXPO_PUBLIC_MONGODB_DATABASE=projeto_pncp
EXPO_PUBLIC_MONGODB_COLLECTION_MODE=both
EXPO_PUBLIC_EDITAIS_UF=PE
EXPO_PUBLIC_EDITAIS_LIMIT=50
```

| Variável | Função |
|---|---|
| `EXPO_PUBLIC_MONGODB_DATABASE` | Banco usado pelo back-end. O padrão é `projeto_pncp`. |
| `EXPO_PUBLIC_MONGODB_COLLECTION_MODE` | `both`, `batch` ou `streaming`. O padrão consulta `contratacoes_pe` e `streaming_contratacoes_pe`. |
| `EXPO_PUBLIC_MONGODB_COLLECTION` | Opcional. Força uma coleção específica, ignorando o modo anterior. |

> Atenção: variáveis `EXPO_PUBLIC_*` ficam embutidas no app Expo. Para produção, prefira a API HTTP do back-end e não exponha chaves administrativas do MongoDB no aplicativo.

## Validação realizada

Foram executados os comandos de validação do front-end:

```bash
npm run typecheck
npm test -- --runInBand
```

Ambos concluíram com sucesso. A suíte de testes existente passou com 4 arquivos de teste e 8 testes.
