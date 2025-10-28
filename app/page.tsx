import { useState } from 'react'

export default function Home() {
  const [students, setStudents] = useState([])
  const [studentNumber, setStudentNumber] = useState('')
  const [studentName, setStudentName] = useState('')
  const [groupSize, setGroupSize] = useState(4)
  const [groups, setGroups] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const addStudent = () => {
    if (!studentNumber.trim() || !studentName.trim()) return

    const newStudent = {
      id: Date.now().toString(),
      student_number: studentNumber.trim(),
      name: studentName.trim()
    }
    
    const randomIndex = Math.floor(Math.random() * (students.length + 1))
    const newStudents = [...students]
    newStudents.splice(randomIndex, 0, newStudent)
    
    setStudents(newStudents)
    setStudentNumber('')
    setStudentName('')
  }

  const removeStudent = (studentId) => {
    if (confirm('Tem certeza que deseja remover este estudante?')) {
      setStudents(students.filter(student => student.id !== studentId))
      setGroups([])
    }
  }

  const generateGroups = () => {
    if (students.length === 0) return

    const shuffled = [...students].sort(() => Math.random() - 0.5)
    
    const newGroups = []
    for (let i = 0; i < shuffled.length; i += groupSize) {
      const group = shuffled.slice(i, i + groupSize)
      group.sort(() => Math.random() - 0.5)
      newGroups.push(group)
    }
    
    setGroups(newGroups)
  }

  const clearAll = () => {
    if (confirm('Tem certeza que deseja remover todos os estudantes?')) {
      setStudents([])
      setGroups([])
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

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={studentNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setStudentNumber(value)
                }}
                onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Número do Estudante"
              />
            </div>

            <div>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Nome Completo"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={addStudent}
                disabled={!studentNumber.trim() || !studentName.trim()}
                className="flex-1 bg-black text-white py-1.5 px-3 text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Adicionar
              </button>

              <input
                type="number"
                min="2"
                max="20"
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                className="w-16 px-1 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 text-center"
              />

              <button
                onClick={() => alert('Funcionalidade de PDF em desenvolvimento')}
                disabled={groups.length === 0}
                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                PDF
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateGroups}
                disabled={students.length === 0}
                className="flex-1 bg-black text-white py-1.5 px-3 text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Gerar Grupos
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex-1 bg-blue-600 text-white py-1.5 px-3 text-sm rounded hover:bg-blue-700 transition-colors"
              >
                {showHistory ? 'Ocultar' : 'Histórico'}
              </button>
              <button
                onClick={clearAll}
                disabled={students.length === 0}
                className="flex-1 bg-red-600 text-white py-1.5 px-3 text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Limpar
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              {students.length} estudantes
            </div>
          </div>
        </div>

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

        {showHistory && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Histórico de Grupos
            </h2>
            <p className="text-sm text-gray-500">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
