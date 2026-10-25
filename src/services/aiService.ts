import { CAREERS_INFO } from "../components/chatbot/chatbotData";
import type { EventItem } from "../data/eventos";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroqAI(userPrompt: string, eventsList: EventItem[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return "Lo siento, la inteligencia artificial no está configurada en este momento (falta VITE_GROQ_API_KEY).";
  }

  // Preparamos el contexto oficial para que la IA no alucine
  const careersContext = Object.values(CAREERS_INFO)
    .map(
      (c) =>
        `- ${c.name} (${c.shortName}): Duración ${c.duracion}. Requisitos: ${c.requisitos}. Campo laboral: ${c.campoLaboral}. Descripción: ${c.descripcion}`
    )
    .join("\n");

  const eventsContext = eventsList
    .slice(0, 8)
    .map((e) => `- Evento: ${e.title} | Fecha: ${e.date} | Hora: ${e.time} | Lugar: ${e.location} | Descripción: ${e.description}`)
    .join("\n");

  const systemPrompt = `
Eres el Asistente Virtual Inteligente oficial de la Universidad Tecnológica (UTT).
Tu objetivo es resolver dudas de aspirantes y estudiantes sobre carreras, eventos y vida universitaria de forma amable, clara y concisa.

INFORMACIÓN INSTITUCIONAL VERÍDICA:
- Nivel educativo: Técnico Superior Universitario (TSU) de 2 años (6 cuatrimestres) con continuidad a Ingeniería.
- Modelo educativo: 70% práctico y 30% teórico.
- Estadías profesionales: en el 6to cuatrimestre se trabaja en una empresa real.

CARRERAS DISPONIBLES:
${careersContext}

AGENDA DE EVENTOS ACTUALIZADA:
${eventsContext}

REGLAS DE RESPUESTA:
1. Responde siempre en español, con tono cercano, profesional y entusiasta.
2. Respuestas breves y directas (máximo 2 a 3 párrafos cortos).
3. Usa formato Markdown con negritas (**ejemplo**) para resaltar palabras clave.
4. Si te preguntan algo que no tiene nada que ver con la universidad, carreras, tecnología o eventos, responde amablemente que tu función es orientar sobre la oferta educativa y eventos de la UTT.
`.trim();

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Detalle devuelto por Groq:", errorData);
        throw new Error(errorData?.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error consultando Groq AI:", error);
    return "Tuve un pequeño problema consultando al servidor inteligente. Por favor intenta de nuevo en unos segundos.";
  }
}