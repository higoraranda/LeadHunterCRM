# Modelo de CSV para importação

## Arquivo pronto para usar

Abra o arquivo **`modelo-importacao.csv`** (na mesma pasta) com Excel, Google Sheets ou qualquer editor. Ele já tem 5 exemplos preenchidos e os nomes de coluna corretos.

## Colunas aceitas

O sistema detecta as colunas automaticamente — você pode usar os nomes do Instant Data Scraper do Google Maps **sem mudar nada**:

| Campo no CRM       | Nomes de coluna aceitos (qualquer um funciona)                          |
|--------------------|--------------------------------------------------------------------------|
| Nome do negócio ✳  | `title`, `name`, `businessname`, `nomeNegocio`, `nome`                  |
| Telefone           | `phone`, `phoneNumber`, `telefone`, `tel`, `whatsapp`                    |
| Site               | `website`, `site`, `url`, `webpage`                                      |
| Endereço           | `address`, `endereco`, `fullAddress`                                     |
| Cidade             | `city`, `cidade`                                                         |
| Avaliação (0-5)    | `totalScore`, `rating`, `stars`, `avaliacao`                             |
| Nº de reviews      | `reviewsCount`, `reviews`, `reviewCount`, `numReviews`                   |

✳ = obrigatório. Linhas sem nome do negócio são ignoradas.

Colunas que não se encaixam em nenhum campo são **ignoradas silenciosamente** (não quebram a importação). Então o CSV que o Instant Data Scraper exporta do Google Maps pode ser importado direto, mesmo com dezenas de colunas extras.

## Fluxo recomendado

1. Instale a extensão **Instant Data Scraper** no Chrome
2. Abra o Google Maps e pesquise seu nicho + cidade (ex: `clínica odontológica São Paulo`)
3. Clique na extensão → ela coleta a lista inteira em CSV
4. Abra o LeadHunter → aba **Leads** → botão **Importar CSV**
5. Selecione o arquivo, escolha o **Nicho** (ex: CLINICA_ODONTO) e a **Categoria de serviço** (SITE / AUTOMACAO / COMBO)
6. Clique em Importar. O sistema mostra quantos foram importados e ignorados.

## Dicas

- Todos os leads importados começam com status **NAO_CONTATADO**
- Se a coluna `website` estiver vazia, o status do site vai pra **NAO**; se tiver algo, vai pra **SIM**
- Você pode editar manualmente os leads depois (clicar na linha da tabela)
