'use client';

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./../firebase/firebase.config";

type Task = {
  id: string;
  title: string;
  description: string;
  story_points: number;
  productivity: number | null;
  status: string;
  start_date: string;
  end_date: string;
  assigned_to_id: number | null;
  team_id: number | null;
};

type TaskForm = Omit<Task, "id">;

const emptyTask: TaskForm = {
  title: "",
  description: "",
  story_points: 0,
  productivity: null,
  status: "To Do",
  start_date: "",
  end_date: "",
  assigned_to_id: null,
  team_id: null,
};

const asNumberOrNull = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const asDateInput = (value: unknown) => {
  if (typeof value === "string") return value.slice(0, 10);
  if (value && typeof value === "object" && "toDate" in value) {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toISOString().slice(0, 10);
  }
  return "";
};

export default function Home() {
  const [form, setForm] = useState<TaskForm>(emptyTask);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "tasks"));
      setTasks(
        snapshot.docs
          .filter((task) => task.data().is_deleted !== true)
          .map((task) => {
            const data = task.data();
            return {
              id: task.id,
              title: typeof data.title === "string" ? data.title : "Sin título",
              description: typeof data.description === "string" ? data.description : "",
              story_points: typeof data.story_points === "number" ? data.story_points : 0,
              productivity: asNumberOrNull(data.productivity),
              status: typeof data.status === "string" ? data.status : "To Do",
              start_date: asDateInput(data.start_date),
              end_date: asDateInput(data.end_date),
              assigned_to_id: asNumberOrNull(data.assigned_to_id),
              team_id: asNumberOrNull(data.team_id),
            };
          }),
      );
    } catch {
      setError("No se pudieron cargar las tareas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };

    void loadTasks();
  }, [fetchTasks]);

  const updateField = <K extends keyof TaskForm>(field: K, value: TaskForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setIsSaving(true);
    setError("");
    const taskData = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      updated_at: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "tasks", editingId), taskData);
      } else {
        await addDoc(collection(db, "tasks"), {
          ...taskData,
          is_deleted: false,
          created_at: serverTimestamp(),
        });
      }
      setForm(emptyTask);
      setEditingId(null);
      await fetchTasks();
    } catch {
      setError("No se pudo guardar la tarea. Revisa la conexión con Firebase.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await updateDoc(doc(db, "tasks", id), {
        is_deleted: true,
        updated_at: serverTimestamp(),
      });
      await fetchTasks();
    } catch {
      setError("No se pudo eliminar la tarea.");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      story_points: task.story_points,
      productivity: task.productivity,
      status: task.status,
      start_date: task.start_date,
      end_date: task.end_date,
      assigned_to_id: task.assigned_to_id,
      team_id: task.team_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyTask);
  };

  return (
    <main className="tasks-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace / Delivery</p>
          <h1>Task board</h1>
          <p className="page-subtitle">Administra el trabajo del equipo en un solo lugar.</p>
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
            {editingId && <span className="editing-indicator">Editando</span>}
          </div>

          <label>
            Título <span>*</span>
            <input value={form.title} maxLength={200} onChange={(event) => updateField("title", event.target.value)} placeholder="Ej. Preparar demo del sprint" required />
          </label>
          <label>
            Descripción
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Agrega contexto, criterios o notas..." rows={4} />
          </label>

          <div className="form-row">
            <label>
              Story points
              <input type="number" min="0" step="1" value={form.story_points} onChange={(event) => updateField("story_points", Number(event.target.value))} />
            </label>
            <label>
              Productividad
              <input type="number" min="0" max="999.99" step="0.01" value={form.productivity ?? ""} onChange={(event) => updateField("productivity", event.target.value ? Number(event.target.value) : null)} placeholder="0.00" />
            </label>
          </div>

          <label>
            Estado
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
              <option>Blocked</option>
            </select>
          </label>

          <div className="form-row">
            <label>
              Fecha de inicio
              <input type="date" value={form.start_date} onChange={(event) => updateField("start_date", event.target.value)} />
            </label>
            <label>
              Fecha de cierre
              <input type="date" value={form.end_date} onChange={(event) => updateField("end_date", event.target.value)} />
            </label>
          </div>

          <div className="form-row">
            <label>
              ID responsable
              <input type="number" min="1" step="1" value={form.assigned_to_id ?? ""} onChange={(event) => updateField("assigned_to_id", event.target.value ? Number(event.target.value) : null)} placeholder="Opcional" />
            </label>
            <label>
              ID equipo
              <input type="number" min="1" step="1" value={form.team_id ?? ""} onChange={(event) => updateField("team_id", event.target.value ? Number(event.target.value) : null)} placeholder="Opcional" />
            </label>
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="form-actions">
            {editingId && <button type="button" className="button secondary" onClick={cancelEdit}>Cancelar</button>}
            <button type="submit" className="button primary" disabled={isSaving}>{isSaving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear tarea"}</button>
          </div>
        </form>

        <section className="task-list-section">
          <div className="list-heading">
            <div>
              <p className="eyebrow">Vista general</p>
              <h2>Tareas activas</h2>
            </div>
            <span className="list-total">{tasks.length}</span>
          </div>
          {isLoading ? <p className="empty-state">Cargando tareas...</p> : tasks.length === 0 ? <p className="empty-state">Aún no hay tareas. Crea la primera desde el formulario.</p> : (
            <div className="task-list">
              {tasks.map((task) => (
                <article className="task-card" key={task.id}>
                  <div className="task-card-top">
                    <span className={`status status-${task.status.toLowerCase().replaceAll(" ", "-")}`}>{task.status}</span>
                    <span className="story-points">{task.story_points} pts</span>
                  </div>
                  <h3>{task.title}</h3>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <div className="task-meta">
                    <span>{task.start_date || "Sin inicio"}</span>
                    <span>{task.end_date || "Sin cierre"}</span>
                    <span>{task.productivity === null ? "Sin productividad" : `${task.productivity.toFixed(2)}%`}</span>
                  </div>
                  <div className="task-footer">
                    <span>Usuario {task.assigned_to_id ?? "-"} · Equipo {task.team_id ?? "-"}</span>
                    <div className="card-actions">
                      <button type="button" className="text-button" onClick={() => handleEdit(task)}>Editar</button>
                      <button type="button" className="text-button danger" onClick={() => handleDelete(task.id)}>Eliminar</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
