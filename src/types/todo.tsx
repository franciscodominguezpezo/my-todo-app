// Definimos las categorías como un tipo de unión para que TS nos avise de errores
export type Categoria = "Deportivos" | "Formación" | "Trabajo" | "Médicos";

// Interfaz principal del objeto que viene de Supabase
export interface Evento {
  id: string; // Obligatorio al leer de la base de datos
  created_at?: string; // Campo automático de Supabase
  titulo: string;
  categoria: Categoria;
}

// Tipo para cuando estamos creando un evento (sin ID ni fecha aún)
export type NuevoEvento = Omit<Evento, "id" | "created_at">;
