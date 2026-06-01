# LeadHunter — CRM de Prospecção

CRM simples para prospecção e acompanhamento de leads.

**Backend:** Spring Boot 3 (Java 21) + MongoDB · **Frontend:** React + Vite + TypeScript.

> ☁️ Para hospedar na nuvem (GitHub → MongoDB Atlas → Render → Vercel), siga o **[DEPLOY.md](DEPLOY.md)**.

---

## Pré-requisitos

- **Java 21+**
- **Node.js 18+**
- **Um MongoDB** para o backend usar. Escolha uma opção:
  - **Nuvem (mais fácil, não instala nada):** crie um MongoDB Atlas grátis — veja o passo 2 do [DEPLOY.md](DEPLOY.md) — e use a *connection string*. A mesma string serve para rodar local e em produção.
  - **Local com Docker:** `docker run -d --name mongo -p 27017:27017 mongo:7`
  - **Local instalado:** MongoDB Community Server rodando em `localhost:27017`.
- Maven **não** precisa instalar — o projeto usa o wrapper (`mvnw`).

---

## Como rodar localmente

Abra **dois terminais**: um para o backend, outro para o frontend.

### 1) Backend (porta 8080)

```powershell
cd backend

# Opção A — Mongo local (padrão: mongodb://localhost:27017/leadhunter): só rode
.\mvnw.cmd spring-boot:run

# Opção B — usar o Atlas: defina a variável antes de rodar (PowerShell)
$env:MONGODB_URI="mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/leadhunter?retryWrites=true&w=majority"
.\mvnw.cmd spring-boot:run
```

Na primeira vez demora 1–2 min (baixa as dependências). Quando o banco está **vazio**, o `DataSeeder` cria **10 leads de exemplo** automaticamente.

### 2) Frontend (porta 5173)

```powershell
cd frontend
npm install   # só na primeira vez
npm run dev
```

Abra **http://localhost:5173**. Em desenvolvimento o Vite faz proxy de `/api` → `http://localhost:8080`, então **não** é preciso configurar `VITE_API_URL` localmente.

> 💡 **Atalho no Windows:** se você tiver os scripts `INICIAR.bat` / `iniciar-backend.bat` / `iniciar-frontend.bat` na pasta (eles **não** fazem parte do repositório — são de uso pessoal), basta dar dois cliques em `INICIAR.bat` para subir backend e frontend de uma vez. O backend ainda precisa de um MongoDB acessível.

---

## Estrutura do projeto

### Backend (`backend/src/main/java/com/leadhunter/`)

```
├── LeadhunterApplication.java                       ← ponto de entrada
├── Lead.java                                        ← coleção de leads
├── Interacao.java                                   ← coleção de interações
├── Enums.java                                       ← todos os enums juntos
├── LeadRepository.java / Custom / Impl              ← consultas de Lead (inclui filtros)
├── InteracaoRepository.java                         ← consultas de Interação
├── ApiController.java                               ← TODOS os endpoints da API (/api/...)
├── CorsConfig.java                                  ← libera o frontend (CORS por variável de ambiente)
└── DataSeeder.java                                  ← popula 10 leads de exemplo quando o banco está vazio
```

### Frontend (`frontend/src/`)

```
├── App.tsx, main.tsx, types.ts, index.css
├── components/Layout.tsx            ← sidebar
├── components/ui/*.tsx              ← botão, input, tabela, etc.
├── lib/api.ts                       ← cliente axios (usa VITE_API_URL em produção)
├── lib/utils.ts, lib/status.ts, lib/use-theme.ts
└── pages/
    ├── Dashboard.tsx   ← cards + gráficos
    ├── Leads.tsx       ← tabela + filtros + importar/exportar CSV
    ├── LeadDetail.tsx  ← detalhe + timeline de interações
    └── NewLead.tsx     ← formulário de criação
```

---

## Configuração por variáveis de ambiente

| Onde | Variável | Para que serve |
|---|---|---|
| Backend | `MONGODB_URI` | Connection string do Mongo. Padrão: `mongodb://localhost:27017/leadhunter` |
| Backend | `CORS_ALLOWED_ORIGINS` | Origens liberadas no CORS (separadas por vírgula; aceita curingas). Padrão: `http://localhost:5173,http://localhost:4173` |
| Backend | `PORT` | Porta do servidor. Padrão `8080` (no Render é injetada automaticamente) |
| Frontend | `VITE_API_URL` | URL pública do backend em produção, **sem** `/api` no final. Em dev fica vazio (usa o proxy do Vite) |

---

## Ver os dados e resetar o banco

Os dados ficam no **MongoDB** (não há mais console H2). Para inspecionar, use o **[MongoDB Compass](https://www.mongodb.com/products/compass)** ou o `mongosh`, conectando na mesma URI.

**Zerar tudo e recriar os 10 leads de exemplo:** apague o banco `leadhunter` e reinicie o backend.

```powershell
# Mongo local, via mongosh:
mongosh "mongodb://localhost:27017/leadhunter" --eval "db.dropDatabase()"
```

No Atlas, dá para dropar o banco/coleção pela interface web ou pelo Compass.
