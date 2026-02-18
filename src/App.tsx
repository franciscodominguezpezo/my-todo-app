import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import type { Evento, NuevoEvento, Categoria } from "./types/todo";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

function App() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [nuevoEvento, setNuevoEvento] = useState<NuevoEvento>({
    titulo: "",
    categoria: "Trabajo",
  });

  // 1. Mantenemos una versión estable para usar en handleSubmit/editar/borrar
  const refrescarLista = useCallback(async () => {
    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("Error al refrescar:", error.message);
    else if (data) setEventos(data as Evento[]);
  }, []);

  // 2. CORRECCIÓN: Definimos la carga inicial dentro para evitar el warning
  useEffect(() => {
    let montado = true;

    const cargarInicial = async () => {
      const { data, error } = await supabase
        .from("eventos")
        .select("*")
        .order("id", { ascending: false });

      if (montado) {
        if (error) console.error(error.message);
        else if (data) setEventos(data as Evento[]);
      }
    };

    cargarInicial();

    return () => {
      montado = false;
    }; // Cleanup para evitar fugas de memoria
  }, []); // Array vacío: se ejecuta estrictamente una vez

  // --- Lógica de CRUD (Crear, Editar, Borrar siguen igual) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoEvento.titulo.trim()) return;

    const { error } = await supabase.from("eventos").insert([nuevoEvento]);

    if (error) {
      Swal.fire("Error", "No se pudo guardar", "error");
    } else {
      Swal.fire({
        title: "¡Creado!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      setNuevoEvento({ titulo: "", categoria: "Trabajo" });
      refrescarLista();
    }
  };

  const editarEvento = async (evento: Evento) => {
    const { value: nuevoTitulo } = await Swal.fire({
      title: "Editar título",
      input: "text",
      inputValue: evento.titulo,
      showCancelButton: true,
      inputValidator: (value) =>
        !value ? "¡El título no puede estar vacío!" : null,
    });

    if (nuevoTitulo && nuevoTitulo !== evento.titulo) {
      const { error } = await supabase
        .from("eventos")
        .update({ titulo: nuevoTitulo })
        .eq("id", evento.id);

      if (error) Swal.fire("Error", "No se pudo actualizar", "error");
      else refrescarLista();
    }
  };

  const borrarEvento = async (id: string) => {
    const resultado = await Swal.fire({
      title: "¿Eliminar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
    });

    if (resultado.isConfirmed) {
      const { error } = await supabase.from("eventos").delete().eq("id", id);
      if (error) Swal.fire("Error", "No se pudo eliminar", "error");
      else refrescarLista();
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h2 className="text-center mb-4 fw-bold text-primary">
            Agenda de Eventos
          </h2>

          {/* Formulario */}
          <div className="card p-4 shadow-sm mb-4 border-0 bg-light">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-12">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Título del evento..."
                  value={nuevoEvento.titulo}
                  onChange={(e) =>
                    setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })
                  }
                />
              </div>
              <div className="col-md-8">
                <select
                  className="form-select"
                  value={nuevoEvento.categoria}
                  onChange={(e) =>
                    setNuevoEvento({
                      ...nuevoEvento,
                      categoria: e.target.value as Categoria,
                    })
                  }
                >
                  <option value="Deportivos">Deportivos</option>
                  <option value="Formación">Formación</option>
                  <option value="Trabajo">Trabajo</option>
                  <option value="Médicos">Médicos</option>
                </select>
              </div>
              <div className="col-md-4">
                <button type="submit" className="btn btn-primary w-100 fw-bold">
                  Añadir
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Eventos */}
          <div className="list-group shadow-sm">
            {eventos.map((evt) => (
              <div
                key={evt.id}
                className="list-group-item d-flex justify-content-between align-items-center p-3"
              >
                <div className="d-flex flex-column">
                  <span className="fw-bold text-dark">{evt.titulo}</span>
                  <span
                    className={`badge rounded-pill mt-1 ${
                      evt.categoria === "Trabajo"
                        ? "bg-primary"
                        : evt.categoria === "Médicos"
                          ? "bg-danger"
                          : evt.categoria === "Deportivos"
                            ? "bg-success"
                            : "bg-warning text-dark"
                    }`}
                    style={{ width: "fit-content", fontSize: "0.7rem" }}
                  >
                    {evt.categoria}
                  </span>
                </div>
                <div className="btn-group">
                  <button
                    onClick={() => editarEvento(evt)}
                    className="btn btn-outline-secondary btn-sm border-0"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => borrarEvento(evt.id)}
                    className="btn btn-outline-danger btn-sm border-0"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
