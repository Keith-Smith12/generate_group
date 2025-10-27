-- Script para criar as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de estudantes (já deve existir)
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de grupos
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de relacionamento entre grupos e estudantes
CREATE TABLE IF NOT EXISTS group_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

-- 4. Configurar Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_students ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança (permitir todas as operações)
CREATE POLICY "Enable all operations for students" ON students
FOR ALL USING (true);

CREATE POLICY "Enable all operations for groups" ON groups
FOR ALL USING (true);

CREATE POLICY "Enable all operations for group_students" ON group_students
FOR ALL USING (true);

-- 6. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_students_number ON students(student_number);
CREATE INDEX IF NOT EXISTS idx_groups_number ON groups(group_number);
CREATE INDEX IF NOT EXISTS idx_group_students_group_id ON group_students(group_id);
CREATE INDEX IF NOT EXISTS idx_group_students_student_id ON group_students(student_id);