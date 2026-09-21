import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'lab1-crud-tasks'

const initialTasks = [
  { id: 1, title: 'Definir alcance del laboratorio', category: 'Planeacion', priority: 'Alta', dueDate: '2026-09-24', notes: 'Documentar los casos de uso antes de construir la interfaz.', completed: true },
  { id: 2, title: 'Construir formulario de registros', category: 'Frontend', priority: 'Media', dueDate: '2026-09-28', notes: 'Incluir validaciones y estados de error visibles.', completed: false },
  { id: 3, title: 'Probar flujo de eliminacion', category: 'Calidad', priority: 'Baja', dueDate: '2026-10-02', notes: 'Verificar la confirmacion y la actualizacion de estadisticas.', completed: false },
]

const emptyForm = { title: '', category: 'Frontend', priority: 'Media', dueDate: '', notes: '' }

function readTasks() {
  try {
    const storedTasks = localStorage.getItem(STORAGE_KEY)
    return storedTasks ? JSON.parse(storedTasks) : initialTasks
  } catch {
    return initialTasks
  }
}

function App() {
  const [tasks, setTasks] = useState(readTasks)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const completedCount = tasks.filter((task) => task.completed).length
  const openCount = tasks.length - completedCount
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch = [task.title, task.category, task.notes].join(' ').toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'Todas' || (statusFilter === 'Pendientes' && !task.completed) || (statusFilter === 'Completadas' && task.completed)
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, tasks])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
  }

  function validateForm() {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Escribe un titulo para la tarea.'
    if (!form.dueDate) nextErrors.dueDate = 'Selecciona una fecha limite.'
    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm()
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    if (editingId) {
      setTasks((currentTasks) => currentTasks.map((task) => task.id === editingId ? { ...task, ...form, title: form.title.trim() } : task))
      setNotice('Registro actualizado correctamente.')
    } else {
      setTasks((currentTasks) => [{ ...form, id: Date.now(), title: form.title.trim(), completed: false }, ...currentTasks])
      setNotice('Registro creado correctamente.')
    }
    resetForm()
  }

  function resetForm() {
    setForm(emptyForm)
    setErrors({})
    setEditingId(null)
  }

  function startEditing(task) {
    setForm({ title: task.title, category: task.category, priority: task.priority, dueDate: task.dueDate, notes: task.notes })
    setEditingId(task.id)
    setErrors({})
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleTask(id) {
    setTasks((currentTasks) => currentTasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  }

  function removeTask(id) {
    const task = tasks.find((item) => item.id === id)
    if (!task || !window.confirm(`Eliminar "${task.title}"?`)) return
    setTasks((currentTasks) => currentTasks.filter((item) => item.id !== id))
    setNotice('Registro eliminado.')
  }

  function formatDate(date) {
    if (!date) return 'Sin fecha'
    return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Inicio de Taskroom"><span className="brand-mark">T</span><span>taskroom</span></a>
        <span className="workspace-label">LAB 01 / CRUD</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div><p className="eyebrow">Panel de trabajo</p><h1 id="page-title">Tus tareas,<br /><em>bajo control.</em></h1><p className="intro-copy">Organiza el trabajo del laboratorio en un solo lugar y convierte cada pendiente en progreso visible.</p></div>
        <div className="progress-card"><div className="progress-topline"><span>Progreso total</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{completedCount} completadas <span>/</span> {openCount} pendientes</p></div>
      </section>

      {notice && <div className="notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Cerrar aviso">x</button></div>}

      <section className="workspace">
        <form className="task-form" onSubmit={handleSubmit} noValidate>
          <div className="form-heading"><div><span className="section-number">01</span><h2>{editingId ? 'Editar registro' : 'Nuevo registro'}</h2></div>{editingId && <button type="button" className="text-button" onClick={resetForm}>Cancelar</button>}</div>
          <label htmlFor="title">Titulo <span>*</span></label>
          <input id="title" name="title" value={form.title} onChange={handleChange} placeholder="Ej. Revisar entregables" aria-invalid={Boolean(errors.title)} />
          {errors.title && <small className="field-error">{errors.title}</small>}
          <div className="form-grid"><div><label htmlFor="category">Categoria</label><select id="category" name="category" value={form.category} onChange={handleChange}><option>Frontend</option><option>Planeacion</option><option>Calidad</option><option>Documentacion</option></select></div><div><label htmlFor="priority">Prioridad</label><select id="priority" name="priority" value={form.priority} onChange={handleChange}><option>Alta</option><option>Media</option><option>Baja</option></select></div></div>
          <label htmlFor="dueDate">Fecha limite <span>*</span></label>
          <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} aria-invalid={Boolean(errors.dueDate)} />
          {errors.dueDate && <small className="field-error">{errors.dueDate}</small>}
          <label htmlFor="notes">Notas</label><textarea id="notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Agrega contexto para tu equipo..." rows="4" />
          <button className="primary-button" type="submit">{editingId ? 'Guardar cambios' : 'Agregar tarea'} <span aria-hidden="true">-&gt;</span></button>
        </form>

        <div className="task-list-section">
          <div className="list-heading"><div><span className="section-number">02</span><h2>Todos los registros</h2></div><span className="task-count">{filteredTasks.length} de {tasks.length}</span></div>
          <div className="toolbar"><label className="search-field" htmlFor="search"><span aria-hidden="true">/</span><input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar tareas..." /></label><div className="filter-tabs" role="group" aria-label="Filtrar registros">{['Todas', 'Pendientes', 'Completadas'].map((filter) => <button key={filter} type="button" className={statusFilter === filter ? 'active' : ''} onClick={() => setStatusFilter(filter)}>{filter}</button>)}</div></div>
          {filteredTasks.length === 0 ? <div className="empty-state"><strong>No hay registros que coincidan.</strong><p>Prueba otra busqueda o crea una nueva tarea.</p></div> : <div className="task-list">{filteredTasks.map((task) => <article className={`task-card ${task.completed ? 'is-complete' : ''}`} key={task.id}><button className="check-button" type="button" onClick={() => toggleTask(task.id)} aria-label={task.completed ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`}><span>{task.completed ? '✓' : ''}</span></button><div className="task-content"><div className="task-title-row"><h3>{task.title}</h3><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div><p>{task.notes || 'Sin notas para este registro.'}</p><div className="task-meta"><span>{task.category}</span><span>{formatDate(task.dueDate)}</span></div></div><div className="task-actions"><button type="button" onClick={() => startEditing(task)}>Editar</button><button type="button" onClick={() => removeTask(task.id)}>Eliminar</button></div></article>)}</div>}
        </div>
      </section>
      <footer><span>React + JavaScript</span><span>Persistencia local activa</span></footer>
    </main>
  )
}

export default App