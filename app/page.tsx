'use client'

import { useState, useEffect } from 'react'
import { supabase, Student } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [studentNumber, setStudentNumber] = useState('')
  const [studentName, setStudentName] = useState('')
  const [groupSize, setGroupSize] = useState(4)
  const [groups, setGroups] = useState<Student[][]>([])
  const [loading, setLoading] = useState(false)
  const [groupHistory, setGroupHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadStudents()
    loadGroupHistory()
  }, [])

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Embaralhar para exibição aleatória
      const shuffledStudents = (data || []).sort(() => Math.random() - 0.5)
      setStudents(shuffledStudents)
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error)
    }
  }

  const loadGroupHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_students (
            student_id,
            students (
              student_number,
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setGroupHistory(data || [])
    } catch (error) {
      console.error('Erro ao carregar histórico de grupos:', error)
    }
  }

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentNumber.trim() || !studentName.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([
          {
            student_number: studentNumber.trim(),
            name: studentName.trim()
          }
        ])
        .select()

      if (error) throw error

      const newStudent = data[0]
      
      // Inserir em posição aleatória
      const randomIndex = Math.floor(Math.random() * (students.length + 1))
      const newStudents = [...students]
      newStudents.splice(randomIndex, 0, newStudent)
      
      setStudents(newStudents)
      setStudentNumber('')
      setStudentName('')
      toast.success('Estudante adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error)
      toast.error('Erro ao adicionar estudante. Verifique se o número já não existe.')
    } finally {
      setLoading(false)
    }
  }

  const removeStudent = async (studentId: string) => {
    if (confirm('Tem certeza que deseja remover este estudante?')) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', studentId)

        if (error) throw error

        setStudents(students.filter(student => student.id !== studentId))
        setGroups([]) // Limpar grupos se um estudante for removido
        toast.success('Estudante removido com sucesso!')
      } catch (error) {
        console.error('Erro ao remover estudante:', error)
        toast.error('Erro ao remover estudante.')
      }
    }
  }

  const generateGroups = async () => {
    if (students.length === 0) return

    setLoading(true)
    try {
      // Embaralhar todos os estudantes
      const shuffled = [...students].sort(() => Math.random() - 0.5)
      
      const newGroups: Student[][] = []
      for (let i = 0; i < shuffled.length; i += groupSize) {
        const group = shuffled.slice(i, i + groupSize)
        // Embaralhar dentro de cada grupo também
        group.sort(() => Math.random() - 0.5)
        newGroups.push(group)
      }
      
      // Salvar grupos no banco de dados
      const groupIds: string[] = []
      
      for (let i = 0; i < newGroups.length; i++) {
        const group = newGroups[i]
        
        // Criar grupo no banco
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .insert([{ group_number: i + 1 }])
          .select()
          .single()
        
        if (groupError) throw groupError
        
        groupIds.push(groupData.id)
        
        // Associar estudantes ao grupo
        const groupStudentInserts = group.map(student => ({
          group_id: groupData.id,
          student_id: student.id
        }))
        
        const { error: groupStudentError } = await supabase
          .from('group_students')
          .insert(groupStudentInserts)
        
        if (groupStudentError) throw groupStudentError
      }
      
      setGroups(newGroups)
      await loadGroupHistory() // Recarregar histórico
      toast.success(`${newGroups.length} grupos gerados e salvos com sucesso!`)
    } catch (error) {
      console.error('Erro ao gerar grupos:', error)
      toast.error('Erro ao gerar grupos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Título principal
      doc.setFontSize(20)
      doc.text('Grupos Gerados', 105, 20, { align: 'center' })
      
      let startY = 40

      groups.forEach((group, index) => {
        // Título do grupo
        doc.setFontSize(16)
        doc.text(`Grupo ${index + 1}`, 20, startY)
        startY += 10

        // Preparar dados da tabela
        const tableData = [
          ['Nº DO ALUNO', 'NOME COMPLETO'],
          ...group.map(student => [student.student_number, student.name])
        ]

        // Criar tabela usando autoTable
        if (typeof autoTable === 'function') {
          autoTable(doc, {
            head: [tableData[0]],
            body: tableData.slice(1),
            startY: startY,
            styles: {
              fontSize: 10,
              cellPadding: 3,
            },
            headStyles: {
              fillColor: [240, 240, 240],
              textColor: [0, 0, 0],
              fontStyle: 'bold',
            },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 120 },
            },
            margin: { left: 20, right: 20 },
          })

          // Atualizar posição Y para próxima tabela
          startY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : startY + 50
        } else {
          // Fallback: criar tabela simples se autoTable não estiver disponível
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.text('Nº DO ALUNO', 20, startY)
          doc.text('NOME COMPLETO', 60, startY)
          startY += 10
          
          doc.setFont('helvetica', 'normal')
          group.forEach((student) => {
            doc.text(student.student_number, 20, startY)
            doc.text(student.name, 60, startY)
            startY += 8
          })
          startY += 10
        }

        // Verificar se precisa de nova página
        if (startY > 250) {
          doc.addPage()
          startY = 20
        }
      })

      doc.save('grupos-escola.pdf')
      toast.success('PDF baixado com sucesso!')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast.error('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const clearAll = async () => {
    if (confirm('Tem certeza que deseja remover todos os estudantes?')) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos

        if (error) throw error

        setStudents([])
        setGroups([])
        toast.success('Todos os estudantes foram removidos!')
      } catch (error) {
        console.error('Erro ao limpar estudantes:', error)
        toast.error('Erro ao limpar estudantes.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Gerador de Grupos Escolares
          </h1>
          <p className="text-gray-600">
            Cadastre estudantes e gere grupos aleatórios para atividades
          </p>
        </div>

        {/* Formulário Principal */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <form onSubmit={addStudent} className="space-y-3">
            {/* Número do Estudante */}
            <div>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => {
                  // Aceitar apenas números
                  const value = e.target.value.replace(/\D/g, '')
                  setStudentNumber(value)
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Número do Estudante"
                required
              />
            </div>

            {/* Nome Completo */}
            <div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Nome Completo"
                required
              />
            </div>

            {/* Botões e Configuração */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-black text-white py-1.5 px-3 text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>

              <input
                type="number"
                min="2"
                max="20"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-16 px-1 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-center"
                placeholder="4"
              />

              <button
                type="button"
                onClick={downloadPDF}
                disabled={groups.length === 0}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                PDF
              </button>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={generateGroups}
                disabled={true}
                className="flex-1 bg-gray-400 text-white py-1.5 px-3 text-sm rounded cursor-not-allowed opacity-50 transition-colors"
              >
                Gerar Grupos
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                disabled={true}
                className="flex-1 bg-gray-400 text-white py-1.5 px-3 text-sm rounded cursor-not-allowed opacity-50 transition-colors"
              >
                Ver Histórico
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={true}
                className="flex-1 bg-gray-400 text-white py-1.5 px-3 text-sm rounded cursor-not-allowed opacity-50 transition-colors"
              >
                Limpar
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              {students.length} estudantes
            </div>
          </form>
        </div>

        {/* Lista de Estudantes */}
        {students.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="grid grid-cols-1 gap-1.5">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-white p-1.5 rounded text-xs flex items-center justify-between group hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-800">
                    {student.student_number} - {student.name}
                  </span>
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    title="Remover"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grupos Gerados */}
        {groups.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <div className="grid grid-cols-1 gap-3">
              {groups.map((group, index) => (
                <div key={index} className="bg-white rounded-lg p-2">
                  <h3 className="font-medium text-gray-800 mb-1 text-sm">
                    Grupo {index + 1}
                  </h3>
                  <div className="space-y-0.5">
                    {group.map((student) => (
                      <div
                        key={student.id}
                        className="text-xs text-gray-600 p-0.5"
                      >
                        {student.student_number} - {student.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Histórico de Grupos */}
        {showHistory && groupHistory.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Histórico de Grupos
            </h2>
            <div className="space-y-4">
              {groupHistory.map((group) => (
                <div key={group.id} className="bg-white rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-800">
                      Grupo {group.group_number}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(group.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.group_students?.map((gs: any) => (
                      <div
                        key={gs.student_id}
                        className="text-xs text-gray-600 p-1 bg-gray-50 rounded"
                      >
                        {gs.students?.student_number} - {gs.students?.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}