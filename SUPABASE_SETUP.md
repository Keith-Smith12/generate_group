# Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: `generate-group` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

## 2. Configurar Banco de Dados

Após o projeto ser criado, vá para o **SQL Editor** e execute o seguinte comando:

```sql
-- Criar tabela de estudantes
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca rápida
CREATE INDEX idx_students_number ON students(student_number);
CREATE INDEX idx_students_created_at ON students(created_at);
```

## 3. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá para **Settings** > **API**
2. Copie:
   - **Project URL** (URL do projeto)
   - **anon public** key (chave pública)

3. No arquivo `.env.local`, substitua os valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

## 4. Configurar Políticas de Segurança (RLS)

No **SQL Editor**, execute:

```sql
-- Habilitar RLS na tabela students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura e escrita para todos (modo público)
CREATE POLICY "Permitir todas as operações na tabela students" ON students
FOR ALL USING (true);
```

## 5. Testar a Aplicação

1. Execute o projeto:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`
3. Teste adicionando alguns estudantes
4. Gere grupos e baixe o PDF

## Funcionalidades

- ✅ Cadastro de estudantes (número + nome)
- ✅ Geração aleatória de grupos
- ✅ Configuração do tamanho do grupo (2-6 alunos)
- ✅ Exportação para PDF
- ✅ Interface responsiva e moderna
- ✅ Persistência no banco de dados
- ✅ Validação de dados únicos

## Estrutura do Banco

### Tabela `students`
- `id`: UUID (chave primária)
- `student_number`: TEXT (número único do estudante)
- `name`: TEXT (nome do estudante)
- `created_at`: TIMESTAMP (data de criação)