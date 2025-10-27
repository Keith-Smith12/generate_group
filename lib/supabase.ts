import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validação das variáveis de ambiente
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida no arquivo .env.local')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida no arquivo .env.local')
}

if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida (começando com http:// ou https://)')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Student {
  id: string
  student_number: string
  name: string
  created_at: string
}

export interface Group {
  id: string
  group_number: number
  created_at: string
  students: Student[]
}

export interface GroupStudent {
  id: string
  group_id: string
  student_id: string
  created_at: string
}