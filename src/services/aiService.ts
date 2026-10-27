import { CAREERS_INFO } from "../components/chatbot/chatbotData";
import type { EventItem } from "../data/eventos";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

// 1. Construcción del Prompt del Sistema (Contexto oficial de la UTT)
function buildSystemPrompt(eventsList: EventItem[]): string {
  const careersContext = Object.values(CAREERS_INFO)
    .map(
      (c) =>
        `- ${c.name} (${c.shortName}): Duración ${c.duracion}. Requisitos: ${c.requisitos}. Campo laboral: ${c.campoLaboral}. Descripción: ${c.descripcion}`
    )
    .join("\n");

  const eventsContext = eventsList
    .slice(0, 6)
    .map((e) => `- Evento: ${e.title} (${e.date} en ${e.location})`)
    .join("\n");

  return `
Eres el Asistente Virtual Inteligente oficial de la Universidad Tecnológica (UTT).
Tu objetivo es resolver dudas de aspirantes y estudiantes sobre carreras, eventos y vida universitaria de forma amable, clara y concisa.

INFORMACIÓN INSTITUCIONAL VERÍDICA:
- Nivel educativo: Técnico Superior Universitario (TSU) de 3 años y 4 meses (10 cuatrimestres) con continuidad a Ingeniería.
- Modelo educativo: 70% práctico y 30% teórico.
- Estadías profesionales: en el último ciclo se trabaja en una empresa real.

CARRERAS DISPONIBLES:
${careersContext}

AGENDA DE EVENTOS:
${eventsContext}

REGLAS:
1. Responde siempre en español, con tono formal, institucional y profesional.
2. Respuestas breves, directas y claras (máximo 2 párrafos).
3. Usa formato Markdown con negritas (**ejemplo**) para resaltar conceptos clave.
4. ESTRICTAMENTE PROHIBIDO EL USO DE EMOJIS: Mantén una redacción seria y académica en todo momento.
5. NO USES TABLAS (|---|): Organiza la información con viñetas formales (•) o guiones (-).
6. Si preguntan algo ajeno a la universidad o carreras, responda cortésmente que su función es orientar sobre la oferta educativa de la UTT.
`.trim();
}

// 2. Consulta a Groq (Motor Primario)
async function callGroq(
  userPrompt: string,
  systemPrompt: string,
  history: ChatHistoryItem[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Falta VITE_GROQ_API_KEY");

  // Ahorro de tokens: Solo los últimos 3 mensajes
  const recentHistory = history.slice(-3);

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
        ...recentHistory,
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 350,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const err = new Error(errorJson?.error?.message || `HTTP ${response.status}`);
    // Guardamos el status para saber si fue error 429 de Rate Limit
    (err as any).status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No pude generar una respuesta.";
}

// 3. Consulta a Google Gemini (Motor de Respaldo por si Groq llega a 8K)
async function callGemini(
  userPrompt: string,
  systemPrompt: string,
  history: ChatHistoryItem[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta VITE_GEMINI_API_KEY");

  const recentHistory = history.slice(-3);

  // Mapeamos el historial al formato que entiende Gemini (user / model)
  const contents = [
    ...recentHistory.map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.content }],
    })),
    {
      role: "user",
      parts: [{ text: userPrompt }],
    },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 350,
      },
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    throw new Error(errorJson?.error?.message || `Gemini HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta con Gemini.";
}

// 4. Orquestador Inteligente con Fallback Automático
export async function askSmartAI(
  userPrompt: string,
  eventsList: EventItem[],
  history: ChatHistoryItem[] = []
): Promise<string> {
  const systemPrompt = buildSystemPrompt(eventsList);

  try {
    // Intentar con Groq primero (super veloz)
    return await callGroq(userPrompt, systemPrompt, history);
  } catch (groqError: any) {
    console.warn("Groq no pudo responder:", groqError.message);

    // Si fue por límite de tokens (HTTP 429) o cualquier caída de Groq:
    if (groqError.status === 429 || import.meta.env.VITE_GEMINI_API_KEY) {
      console.log("Activando respaldo con Google Gemini (250k tokens)...");
      try {
        return await callGemini(userPrompt, systemPrompt, history);
      } catch (geminiError: any) {
        console.error("Gemini también falló:", geminiError.message);
      }
    }

    return "Tuve un pequeño inconveniente consultando los servidores inteligentes. Por favor intenta de nuevo en unos momentos o consulta nuestras secciones directas :).";
  }
}