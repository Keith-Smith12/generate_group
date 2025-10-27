'use client'

import { useState, useEffect } from 'react'
import { supabase, Student } from '../lib/supabase'
import jsPDF from 'jspdf'

export default function Home() {
  const [students, setStudents] = useState<Student[]>([])
  const [studentNumber, setStudentNumber] = useState('')
  const [studentName, setStudentName] = useState('')
  const [groupSize, setGroupSize] = useState(4)
  const [groups, setGroups] = useState<Student[][]>([])
  const [loading, setLoading] = useState(false)

  // Carregar estudantes do Supabase
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Embaralhar a lista de estudantes para exibição aleatória
      const shuffledStudents = (data || []).sort(() => Math.random() - 0.5)
      setStudents(shuffledStudents)
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error)
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

      // Adicionar o novo estudante em uma posição aleatória na lista
      const newStudent = data[0]
      const randomIndex = Math.floor(Math.random() * (students.length + 1))
      const newStudents = [...students]
      newStudents.splice(randomIndex, 0, newStudent)
      
      setStudents(newStudents)
      setStudentNumber('')
      setStudentName('')
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error)
      alert('Erro ao adicionar estudante. Verifique se o número já não existe.')
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
        // Limpar grupos se o estudante removido estava em algum grupo
        setGroups([])
      } catch (error) {
        console.error('Erro ao remover estudante:', error)
        alert('Erro ao remover estudante.')
      }
    }
  }

  const generateGroups = () => {
    if (students.length === 0) return

    // Embaralhar a lista de estudantes de forma mais aleatória
    const shuffled = [...students].sort(() => Math.random() - 0.5)
    const newGroups: Student[][] = []

    // Distribuir estudantes aleatoriamente nos grupos
    for (let i = 0; i < shuffled.length; i += groupSize) {
      const group = shuffled.slice(i, i + groupSize)
      // Embaralhar também dentro de cada grupo
      group.sort(() => Math.random() - 0.5)
      newGroups.push(group)
    }

    setGroups(newGroups)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    // Título principal
    doc.setFontSize(20)
    doc.text('Grupos Gerados', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    groups.forEach((group, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 80) {
        doc.addPage()
        yPosition = 20
      }

      // Título do grupo
      doc.setFontSize(16)
      doc.text(`Grupo ${index + 1}`, 20, yPosition)
      yPosition += 15

      // Cabeçalho da tabela
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      
      // Desenhar linha do cabeçalho
      doc.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 5
      
      // Cabeçalhos das colunas
      doc.text('Nº DO ALUNO', 25, yPosition)
      doc.text('NOME COMPLETO', 80, yPosition)
      yPosition += 8
      
      // Linha separadora
      doc.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 5

      // Dados dos estudantes
      doc.setFont(undefined, 'normal')
      group.forEach((student) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(student.student_number, 25, yPosition)
        doc.text(student.name, 80, yPosition)
        yPosition += 8
      })

      // Linha final do grupo
      doc.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 15
    })

    doc.save('grupos-escola.pdf')
  }

  const clearAll = async () => {
    if (confirm('Tem certeza que deseja apagar todos os estudantes?')) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .neq('id', '')

        if (error) throw error

        setStudents([])
        setGroups([])
      } catch (error) {
        console.error('Erro ao limpar estudantes:', error)
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
                onClick={generateGroups}
                disabled={students.length === 0}
                className="flex-1 bg-green-600 text-white py-1.5 px-3 text-sm rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Gerar Grupos
              </button>
              <button
                onClick={clearAll}
                className="flex-1 bg-red-600 text-white py-1.5 px-3 text-sm rounded hover:bg-red-700 transition-colors"
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
          <div className="bg-gray-50 rounded-lg p-3">
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
      </div>
    </div>
  )
}
