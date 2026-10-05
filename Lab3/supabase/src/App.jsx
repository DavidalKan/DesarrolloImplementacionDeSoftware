import { useEffect, useState } from "react";
import "./App.css";
import supabase from "./supabase-client";

const emptyTask = {
  title: "",
  description: "",
  story_points: 0,
  productivity: "",
  status: "To Do",
  start_date: "",
  end_date: "",
  assigned_to_id: "",
  team_id: "",
};

const numberOrNull = (value) => (value === "" ? null : Number(value));

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from("tasks")
      .select("*")
      .or("is_deleted.is.null,is_deleted.eq.false")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(`No se pudieron cargar las tareas: ${queryError.message}`);
    } else {
      setTasks(data ?? []);
      setError("");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };

    void loadTasks();
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setIsSaving(true);
    setError("");
    const taskData = {
      title: form.title.trim(),
      description: form.description.trim(),
      story_points: Number(form.story_points) || 0,
      productivity: numberOrNull(form.productivity),
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      assigned_to_id: numberOrNull(form.assigned_to_id),
      team_id: numberOrNull(form.team_id),
      updated_at: new Date().toISOString(),
    };

    const response = editingId
      ? await supabase.from("tasks").update(taskData).eq("id", editingId)
      : await supabase.from("tasks").insert({ ...taskData, is_deleted: false });

    if (response.error) {
      setError(`No se pudo guardar la tarea: ${response.error.message}`);
    } else {
      setForm(emptyTask);
      setEditingId(null);
      await fetchTasks();
    }
    setIsSaving(false);
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title ?? "",
      description: task.description ?? "",
      story_points: task.story_points ?? 0,
      productivity: task.productivity ?? "",
      status: task.status ?? "To Do",
      start_date: task.start_date ?? "",
      end_date: task.end_date ?? "",
      assigned_to_id: task.assigned_to_id ?? "",
      team_id: task.team_id ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const { error: deleteError } = await supabase
      .from("tasks")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) {
      setError(`No se pudo eliminar la tarea: ${deleteError.message}`);
    } else {
      setTasks((current) => current.filter((task) => task.id !== id));
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyTask);
    setError("");
  };

  const renderDate = (date) => date || "Sin fecha";

  return (
    <main className="tasks-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Lab 3 / Supabase</p>
          <h1>Task board</h1>
        </div>
        <div className="task-count">
          <strong>{tasks.length}</strong>
          <span>tareas activas</span>
        </div>
      </header>

      <section className="content-grid">
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{editingId ? "Editando tarea" : "Nueva tarea"}</p>
              <h2>{editingId ? "Actualiza los detalles" : "Crea una tarea"}</h2>
            </div>
            {editingId && <button type="button" className="text-button" onClick={cancelEdit}>Cancelar</button>}
          </div>

          <label>Título <span>*</span>
            <input value={form.title} maxLength="200" onChange={(event) => updateField("title", event.target.value)} placeholder="Ej. Preparar demo del sprint" required />
          </label>
          <label>Descripción
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Agrega contexto o notas..." rows="4" />
          </label>

          <div className="form-row">
            <label>Story points
              <input type="number" min="0" step="1" value={form.story_points} onChange={(event) => updateField("story_points", event.target.value)} />
            </label>
            <label>Productividad
              <input type="number" min="0" step="0.01" value={form.productivity} onChange={(event) => updateField("productivity", event.target.value)} placeholder="0.00" />
            </label>
          </div>

          <label>Estado
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Blocked</option>
            </select>
          </label>

          <div className="form-row">
            <label>Fecha de inicio
              <input type="date" value={form.start_date} onChange={(event) => updateField("start_date", event.target.value)} />
            </label>
            <label>Fecha de cierre
              <input type="date" value={form.end_date} onChange={(event) => updateField("end_date", event.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>ID responsable
              <input type="number" min="1" step="1" value={form.assigned_to_id} onChange={(event) => updateField("assigned_to_id", event.target.value)} placeholder="Opcional" />
            </label>
            <label>ID equipo
              <input type="number" min="1" step="1" value={form.team_id} onChange={(event) => updateField("team_id", event.target.value)} placeholder="Opcional" />
            </label>
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}
          <button type="submit" className="button primary" disabled={isSaving}>{isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear tarea"}</button>
        </form>

        <section className="task-list-section">
          <div className="list-heading">
            <div><p className="eyebrow">Vista general</p><h2>Tareas activas</h2></div>
            <span className="list-total">{tasks.length}</span>
          </div>
          {isLoading ? <p className="empty-state">Cargando tareas...</p> : tasks.length === 0 ? <p className="empty-state">Aún no hay tareas activas.</p> : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card-top"><span className={`status status-${task.status?.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span><span className="story-points">{task.story_points ?? 0} pts</span></div>
                  <h3>{task.title}</h3>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta"><span>Inicio: {renderDate(task.start_date)}</span><span>Cierre: {renderDate(task.end_date)}</span><span>{task.productivity == null ? "Sin productividad" : `${task.productivity}%`}</span></div>
                  <div className="task-footer"><span>Usuario {task.assigned_to_id ?? "-"} · Equipo {task.team_id ?? "-"}</span><div className="card-actions"><button type="button" className="text-button" onClick={() => handleEdit(task)}>Editar</button><button type="button" className="text-button danger" onClick={() => handleDelete(task.id)}>Eliminar</button></div></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
export default App;