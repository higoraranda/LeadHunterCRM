# LeadHunter — CRM de Prospecção

## Como rodar

**Dê dois cliques em `INICIAR.bat`.** Espere 1–2 minutos (primeira vez) e o navegador abre em http://localhost:5173.

Para parar: feche as 2 janelas pretas.

---

## Estrutura (bem simples)

### Backend (`backend/`) — 7 arquivos Java
```
backend/src/main/java/com/leadhunter/
├── LeadhunterApplication.java   ← ponto de entrada
├── Lead.java                    ← tabela de leads
├── Interacao.java               ← tabela de interações
├── Enums.java                   ← todos os enums juntos
├── LeadRepository.java          ← consultas de Lead
├── InteracaoRepository.java     ← consultas de Interação
├── ApiController.java           ← TODOS os endpoints da API
└── DataSeeder.java              ← popula 10 leads de exemplo na 1ª vez
```

### Frontend (`frontend/`)
```
frontend/src/
├── App.tsx, main.tsx, types.ts, index.css
├── components/Layout.tsx          ← sidebar
├── components/ui/*.tsx            ← botão, input, tabela, etc
├── lib/api.ts, lib/utils.ts
└── pages/
    ├── Dashboard.tsx   ← cards + 3 gráficos
    ├── Leads.tsx       ← tabela + filtros + import/export
    ├── LeadDetail.tsx  ← detalhe + timeline
    └── NewLead.tsx     ← formulário de criação
```

---

## Pré-requisitos (uma vez só)

- **Java 21+** — você já tem (Zulu 25)
- **Node.js 18+** — você já tem
- Maven o projeto baixa sozinho, não precisa instalar.

---

## Links úteis (com o sistema rodando)

- **Sistema:** http://localhost:5173
- **Banco de dados (console H2):** http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:./data/leadhunter`, usuário `sa`, sem senha

## Apagar tudo e começar do zero

Delete a pasta `backend/data/` e rode o `INICIAR.bat` de novo. Os 10 leads de exemplo são recriados.
