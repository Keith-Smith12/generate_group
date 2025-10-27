# Deploy na Vercel - Gerador de Grupos Escolares

## 📋 Pré-requisitos

1. **Conta na Vercel** - [vercel.com](https://vercel.com)
2. **Projeto no Supabase** - [supabase.com](https://supabase.com)
3. **Repositório no GitHub** (recomendado)

## 🔧 Configuração do Supabase

### 1. Executar Script SQL
Execute o arquivo `database_setup.sql` no SQL Editor do Supabase para criar todas as tabelas necessárias:

- `students` - Tabela de estudantes
- `groups` - Tabela de grupos gerados
- `group_students` - Relacionamento entre grupos e estudantes

### 2. Configurar RLS (Row Level Security)
```sql
-- Habilitar RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (ajuste conforme necessário)
CREATE POLICY "Enable all operations for all users" ON students
FOR ALL USING (true);
```

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o repositório do projeto

### 2. Configurar Variáveis de Ambiente
Na Vercel, vá em **Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

**Onde encontrar:**
- Acesse seu projeto no Supabase
- Vá em **Settings > API**
- Copie a **Project URL** e **anon public** key

### 3. Configurações de Build
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4. Deploy
1. Clique em **Deploy**
2. Aguarde o processo de build
3. Acesse a URL fornecida

## 🔍 Solução de Problemas

### Erro: "NEXT_PUBLIC_SUPABASE_URL não está definida"
- Verifique se as variáveis de ambiente estão configuradas na Vercel
- Certifique-se de que os nomes estão corretos (com NEXT_PUBLIC_)

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme se o RLS está configurado adequadamente

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o Node.js está na versão 18+

## 📁 Arquivos Importantes

- `.env.example` - Exemplo de variáveis de ambiente
- `vercel.json` - Configurações específicas da Vercel
- `.nvmrc` - Versão do Node.js recomendada

## ✅ Checklist de Deploy

- [ ] Tabela `students` criada no Supabase
- [ ] RLS configurado no Supabase
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Build local funcionando (`npm run build`)
- [ ] Deploy realizado com sucesso
- [ ] Aplicação funcionando na URL da Vercel