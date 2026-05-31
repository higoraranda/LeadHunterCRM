# Guia de Deploy — LeadHunter (Render + Vercel + MongoDB Atlas)

Arquitetura hospedada:

```
  Vercel (frontend React)  ──HTTPS──►  Render (backend Spring Boot)  ──►  MongoDB Atlas (M0 grátis)
```

---

## 1) Banco de dados — MongoDB Atlas (grátis para sempre)

1. Crie a conta em https://www.mongodb.com/cloud/atlas/register
2. **Create > Cluster > M0 (Free)**. Escolha uma região próxima (ex.: São Paulo / `sa-east-1`).
3. Em **Database Access**, crie um usuário (ex.: `leadhunter`) com senha forte. Anote.
4. Em **Network Access**, adicione `0.0.0.0/0` (permite o Render acessar) — ou os IPs do Render.
5. Em **Database > Connect > Drivers**, copie a *connection string*. Algo como:
   ```
   mongodb+srv://leadhunter:SUA_SENHA@cluster0.xxxxx.mongodb.net/leadhunter?retryWrites=true&w=majority
   ```
   > Inclua o nome do banco (`/leadhunter`) antes do `?`. Substitua `SUA_SENHA`.

---

## 2) Backend — Render (Web Service via Docker)

O repositório já contém [`backend/Dockerfile`](backend/Dockerfile) e [`render.yaml`](render.yaml).

**Opção A — Blueprint (mais rápido):**
1. Suba o projeto para o GitHub.
2. No Render: **New > Blueprint** e selecione o repositório. Ele lê o `render.yaml`.
3. Preencha as variáveis quando solicitado (ver abaixo) e crie.

**Opção B — Manual:**
1. Render: **New > Web Service** > conecte o repositório.
2. **Runtime:** Docker. **Root Directory:** `backend`. (O `Dockerfile` será detectado.)
3. **Instance Type:** Free.
4. **Health Check Path:** `/api/dashboard/funil`

**Variáveis de ambiente (Environment):**

| Chave | Valor |
|---|---|
| `MONGODB_URI` | a connection string do passo 1 |
| `CORS_ALLOWED_ORIGINS` | `https://SEU-PROJETO.vercel.app,https://*.vercel.app` |

> `PORT` é injetado automaticamente pelo Render — não precisa definir.

Ao terminar, a URL do backend será algo como `https://leadhunter-backend.onrender.com`.
Teste: abra `https://leadhunter-backend.onrender.com/api/dashboard/funil` (deve retornar um JSON).

> Observação: no plano free o serviço **hiberna após ~15 min** sem uso e leva ~30–50s para
> "acordar" na primeira requisição. É normal.

---

## 3) Frontend — Vercel

1. No Vercel: **Add New > Project** > importe o repositório.
2. **Root Directory:** `frontend`. (Framework detectado: Vite. Há um `vercel.json` com as rotas SPA.)
3. **Environment Variables:**

   | Chave | Valor |
   |---|---|
   | `VITE_API_URL` | a URL do backend no Render (ex.: `https://leadhunter-backend.onrender.com`) — **sem** `/api` no final |

4. Deploy. A URL final (ex.: `https://leadhunter.vercel.app`) deve ser a mesma que você
   colocou em `CORS_ALLOWED_ORIGINS` no Render.

> Se o domínio da Vercel for diferente do esperado, atualize `CORS_ALLOWED_ORIGINS` no Render
> e faça um *redeploy* do backend.

---

## 4) Rodar localmente (continua funcionando)

**Backend** (precisa de um MongoDB local OU aponte para o Atlas):
```bash
cd backend
# Mongo local em mongodb://localhost:27017/leadhunter  (padrão), ou:
# export MONGODB_URI="mongodb+srv://..."   (PowerShell: $env:MONGODB_URI="...")
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173  (proxy de /api -> http://localhost:8080)
```

Sem `VITE_API_URL`, o frontend usa o proxy do Vite para o backend local.

---

## Resumo das mudanças para a nuvem
- Banco migrado de **H2 (arquivo)** para **MongoDB** (persiste de verdade na nuvem).
- `PORT` e `MONGODB_URI` lidos de variáveis de ambiente.
- CORS configurável por env (`CORS_ALLOWED_ORIGINS`), com suporte a curingas (`*.vercel.app`).
- Frontend lê a URL da API de `VITE_API_URL` (produção) ou usa proxy (dev).
- `Dockerfile`, `render.yaml`, `vercel.json` e `.env.example` adicionados.
