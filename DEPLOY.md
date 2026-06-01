# Guia de Deploy — LeadHunter (GitHub + MongoDB Atlas + Render + Vercel)

Arquitetura hospedada:

```
  Vercel (frontend React)  ──HTTPS──►  Render (backend Spring Boot)  ──►  MongoDB Atlas (512 MB grátis)
```

> **Banco:** MongoDB Atlas M0 é **grátis para sempre e NÃO pede cartão de crédito**.
> 512 MB comportam tranquilamente mais de 100 mil leads — para 800 clientes sobra MUITO espaço.
> **Localmente** o app continua usando um Mongo em `localhost` (ou você pode apontar para o Atlas).

A ordem é: **(1) GitHub → (2) MongoDB → (3) Render → (4) Vercel**.

---

## 1) Subir o código para o GitHub

O Render e a Vercel puxam o código do GitHub, então este é o primeiro passo.

### 1.1. Criar o repositório no GitHub
1. Acesse https://github.com/new
2. Nome: `leadhunter` (ou o que preferir). Pode deixar **Private**.
3. **NÃO** marque "Add README/.gitignore/license" (o projeto já tem `.gitignore`).
4. Clique em **Create repository** e deixe a página aberta (vai mostrar a URL do repo).

### 1.2. Enviar o projeto (rode no terminal, dentro da pasta do projeto)

> No Windows, abra o **PowerShell** na pasta do projeto (Shift + botão direito > "Abrir janela do PowerShell aqui").

```powershell
git init
git add .
git commit -m "LeadHunter: app pronto para deploy (MongoDB + Render + Vercel)"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/leadhunter.git
git push -u origin main
```

> Troque `SEU_USUARIO/leadhunter` pela URL que o GitHub mostrou.
> Se pedir login, use seu usuário do GitHub e um **Personal Access Token** como senha
> (GitHub > Settings > Developer settings > Personal access tokens).

Pronto: o código está no GitHub. Toda vez que você fizer `git push`, Render e Vercel
reimplantam automaticamente.

---

## 2) Banco de dados — MongoDB Atlas (grátis, sem cartão)

1. Crie a conta em https://www.mongodb.com/cloud/atlas/register (pode usar Google).
2. **Create a cluster > M0 (Free)**. Provedor/região próximos (ex.: AWS / São Paulo `sa-east-1`). **Create Deployment**.
3. Aparece a janela **Connect**:
   - **Create a database user**: defina um usuário (ex.: `leadhunter`) e uma senha. **Anote a senha.**
   - **Add IP / Network Access**: escolha **Allow access from anywhere** (`0.0.0.0/0`) — necessário para o Render acessar.
4. Depois clique em **Connect > Drivers** (linguagem Java). Copie a *connection string*:
   ```
   mongodb+srv://leadhunter:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Ajuste a string assim (substitua a senha e inclua o nome do banco `leadhunter` antes do `?`):
   ```
   mongodb+srv://leadhunter:SUA_SENHA@cluster0.xxxxx.mongodb.net/leadhunter?retryWrites=true&w=majority
   ```
   Essa string final é o valor de **`MONGODB_URI`** (vai no Render no próximo passo).

---

## 3) Backend — Render (Web Service via Docker)

O repositório já contém [`backend/Dockerfile`](backend/Dockerfile) e [`render.yaml`](render.yaml).

1. Acesse https://render.com e entre com a conta do **GitHub**.
2. **New > Blueprint** > selecione o repositório `leadhunter`. O Render lê o `render.yaml` sozinho.
   - (Alternativa manual: **New > Web Service** > Runtime **Docker**, Root Directory `backend`.)
3. Quando pedir as variáveis de ambiente, preencha:

   | Chave | Valor |
   |---|---|
   | `MONGODB_URI` | a connection string do passo 2 |
   | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app` (depois refine para o seu domínio) |

   > `PORT` é injetado automaticamente pelo Render — não precisa definir.
4. **Create** e aguarde o build (alguns minutos na primeira vez).
5. A URL final será algo como `https://leadhunter-backend.onrender.com`.
   Teste abrindo `https://leadhunter-backend.onrender.com/api/dashboard/funil` — deve retornar um JSON.

> Plano free do Render: o serviço **hiberna após ~15 min** sem uso e leva ~30–50s para
> "acordar" na primeira requisição. É normal.

---

## 4) Frontend — Vercel

1. Acesse https://vercel.com e entre com a conta do **GitHub**.
2. **Add New > Project** > importe o repositório `leadhunter`.
3. **Root Directory:** clique em **Edit** e selecione a pasta **`frontend`**.
   (Framework detectado: Vite. Já existe um `vercel.json` com as rotas da SPA.)
4. Em **Environment Variables**, adicione:

   | Chave | Valor |
   |---|---|
   | `VITE_API_URL` | a URL do backend no Render (ex.: `https://leadhunter-backend.onrender.com`) — **sem** `/api` no final |

5. **Deploy**. A URL final será algo como `https://leadhunter.vercel.app`.
6. **Ajuste o CORS:** volte ao Render > seu serviço > **Environment** e troque `CORS_ALLOWED_ORIGINS`
   pela URL real da Vercel (ex.: `https://leadhunter.vercel.app`). Salve — o backend reinicia sozinho.

Abra a URL da Vercel: o sistema deve carregar e conversar com o backend.

---

## 5) Rodar localmente (continua funcionando)

**Frontend:**
```powershell
cd frontend
npm install
npm run dev   # http://localhost:5173 (proxy de /api -> http://localhost:8080)
```

**Backend** (precisa de um MongoDB local OU aponte para o Atlas):
```powershell
cd backend
# Opção A: Mongo local em mongodb://localhost:27017/leadhunter (padrão)
# Opção B: usar o Atlas -> defina a variável antes de rodar:
#   $env:MONGODB_URI="mongodb+srv://leadhunter:SUA_SENHA@cluster0.xxxxx.mongodb.net/leadhunter?retryWrites=true&w=majority"
./mvnw spring-boot:run
```

Sem `VITE_API_URL`, o frontend usa o proxy do Vite para o backend local.

---

## Atualizações futuras
Qualquer mudança no código:
```powershell
git add .
git commit -m "descrição da mudança"
git push
```
Render e Vercel reimplantam automaticamente.

---

## Resumo das mudanças para a nuvem
- Banco migrado de **H2 (arquivo)** para **MongoDB** (persiste de verdade na nuvem).
- `PORT` e `MONGODB_URI` lidos de variáveis de ambiente.
- CORS configurável por env (`CORS_ALLOWED_ORIGINS`), com suporte a curingas (`*.vercel.app`).
- Frontend lê a URL da API de `VITE_API_URL` (produção) ou usa proxy (dev).
- `Dockerfile`, `render.yaml`, `vercel.json` e `.env.example` adicionados.
