// # Cerebro del bot (detección de intenciones, búsqueda de eventos, test vocacional)
import { events, type EventItem } from "../../data/eventos";
import { askSmartAI, type ChatHistoryItem } from "../../services/aiService";
import {
  CAREERS_INFO,
  VOCATIONAL_QUESTIONS,
  CAREER_PROFILES,
  DEFAULT_SUGGESTIONS,
  CONCEPT_FAQS,
  type CareerQuickInfo,
} from "./chatbotData";


export interface BotAction {
  label: string;
  url?: string;
  payload?: string;
}

export interface BotResponse {
  text: string;
  suggestions: string[];
  action?: BotAction;
  isQuiz?: boolean;
  quizStep?: number;
}

export interface QuizState {
  active: boolean;
  step: number;
  scores: {
    "desarrollo-software": number;
    "redes": number;
    "entornos-virtuales": number;
  };
}

// Función auxiliar para quitar acentos y normalizar texto
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export async function handleUserMessage(
  rawInput: string,
  quizState: QuizState,
  setQuizState: React.Dispatch<React.SetStateAction<QuizState>>,
  currentEvents: EventItem[] = events,
  history: ChatHistoryItem[] = []
): Promise<BotResponse> {
  const input = normalize(rawInput);


  if (
    input === "ver plan de estudios" ||
    input === "plan de estudios" ||
    input === "materias" ||
    input === "reticula"
  ) {
    return {
      text: "¿De cuál de nuestras 3 carreras te gustaría conocer el plan de estudios y materias clave?",
      suggestions: [
        "Plan de Desarrollo de Software",
        "Plan de Redes y Ciberseguridad",
        "Plan de Entornos Virtuales",
      ],
      action: {
        label: "Ver sección de carreras",
        url: "#carreras",
      },
    };
  }
    // -------------------------------------------------------------
  // 1. GESTIÓN DEL FLUJO VOCACIONAL DINÁMICO
  // -------------------------------------------------------------
  if (quizState.active) {
    // Si el usuario decide salir antes y ver su resultado en la pregunta 3 o 4
    if (input.includes("ver resultado") || input.includes("resultado ahora") || input.includes("calcular")) {
      return finishQuizAndShowResult(quizState.scores, setQuizState);
    }

    const currentQ = VOCATIONAL_QUESTIONS[quizState.step];
    
    // Buscar la opción elegida por texto o por número (1, 2, 3)
    let selectedOption = currentQ.options.find(
      (opt) => normalize(opt.text) === input || input.includes(normalize(opt.text).slice(0, 15))
    );

    const numChoice = parseInt(rawInput, 10);
    if (!selectedOption && !isNaN(numChoice) && numChoice >= 1 && numChoice <= currentQ.options.length) {
      selectedOption = currentQ.options[numChoice - 1];
    }

    if (!selectedOption) {
      return {
        text: `Por favor, elige una de las opciones para continuar:`,
        suggestions: currentQ.options.map((o) => o.text),
        isQuiz: true,
        quizStep: quizState.step,
      };
    }

    // Acumular puntos de la opción
    const newScores = { ...quizState.scores };
    Object.entries(selectedOption.points).forEach(([career, pts]) => {
      const key = career as keyof typeof newScores;
      newScores[key] = (newScores[key] || 0) + (pts || 0);
    });

    const nextStep = quizState.step + 1;

    // Si llegó a la pregunta 3 (ya tiene suficiente información para una predicción):
    if (nextStep === 3) {
      setQuizState({ active: true, step: nextStep, scores: newScores });
      const nextQ = VOCATIONAL_QUESTIONS[nextStep];
      return {
        text: `*¡Ya detecto una inclinación clara en tu perfil!* Puedes ver tu resultado ahora mismo o responder 2 preguntas más para afinarlo al 100%:\n\n${nextQ.question}`,
        suggestions: [
          ...nextQ.options.map((o) => o.text),
          "Ver mi resultado ahora :) ", // Botón de salida rapida
        ],
        isQuiz: true,
        quizStep: nextStep,
      };
    }

    // Si aún quedan preguntas
    if (nextStep < VOCATIONAL_QUESTIONS.length) {
      setQuizState({ active: true, step: nextStep, scores: newScores });
      const nextQ = VOCATIONAL_QUESTIONS[nextStep];
      return {
        text: nextQ.question,
        suggestions: nextQ.options.map((o) => o.text),
        isQuiz: true,
        quizStep: nextStep,
      };
    }

    // Si completó las 5 preguntas
    return finishQuizAndShowResult(newScores, setQuizState);
  }

  function finishQuizAndShowResult(
    scores: { "desarrollo-software": number; redes: number; "entornos-virtuales": number },
    setQuizState: React.Dispatch<React.SetStateAction<QuizState>>
  ): BotResponse {
    setQuizState({
      active: false,
      step: 0,
      scores: { "desarrollo-software": 0, redes: 0, "entornos-virtuales": 0 },
    });

    const totalPointsEarned = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

    // Ordenar por puntaje
    const sortedCareers = (Object.keys(scores) as Array<keyof typeof scores>)
      .map((key) => {
        const pts = scores[key];
        const percentage = Math.min(Math.round((pts / totalPointsEarned) * 100), 96);
        return {
          key,
          percentage: percentage < 25 ? 25 : percentage,
          info: CAREERS_INFO[key],
          profile: CAREER_PROFILES[key],
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const winner = sortedCareers[0];
    const runnerUp = sortedCareers[1];

    const resultMessage = `
  **¡Diagnóstico Vocacional Completado!**

  **Carrera Recomendada:**
  **${winner.info.name}**
  **Afinidad con tu perfil:** **${winner.percentage}%**

  **${winner.profile.title}**
  ${winner.profile.justification}

  **Tus fortalezas clave:**
  ${winner.profile.strengths.map((s: string) => `• ${s}`).join("\n")}

  **Tu segunda mejor opción:**
  **${runnerUp.info.shortName}** (${runnerUp.percentage}% de afinidad).

  **Duración:** ${winner.info.duracion}
  `.trim();

    return {
      text: resultMessage,
      suggestions: [
        `Ver plan de ${winner.info.shortName}`,
        `Ver plan de ${runnerUp.info.shortName}`,
        "Ver eventos",
        "Reiniciar test",
      ],
      action: {
        label: `Explorar ${winner.info.shortName}`,
        url: winner.info.link,
      },
    };
  }
  // -------------------------------------------------------------
  // 2. ACTIVAR ORIENTACIÓN VOCACIONAL 
  // -------------------------------------------------------------
  if (
    input.includes("orientacion") ||
    input.includes("vocacional") ||
    input.includes("que carrera") ||
    input.includes("no se que estudiar") ||
    input.includes("test") ||
    input.includes("ayudame a elegir")
  ) {
    setQuizState({
      active: true,
      step: 0,
      scores: { "desarrollo-software": 0, redes: 0, "entornos-virtuales": 0 },
    });

    const firstQ = VOCATIONAL_QUESTIONS[0];
    return {
      text: `**Orientación Vocacional**\nTe haré unas preguntas dinámicas para recomendarte la carrera ideal para tu perfil.\n\n${firstQ.question}`,
      suggestions: firstQ.options.map((o) => o.text),
      isQuiz: true,
      quizStep: 0,
    };
  }
    // -------------------------------------------------------------
  // PREGUNTAS CLAVE Y CONCEPTOS (¿Qué es un hackathon?, ¿Qué es un congreso?, etc.)
  // -------------------------------------------------------------
  const isQuestioningConcept =
    input.includes("que es") ||
    input.includes("que significa") ||
    input.includes("de que trata") ||
    input.includes("en que consiste") ||
    input.includes("explicame");

  // Buscamos si el mensaje coincide con alguna de las preguntas clave
  const matchedFAQ = CONCEPT_FAQS.find((faq) => {
    // Si pregunta explícitamente "que es..." o si escribe directamente la palabra clave
    return faq.keywords.some((kw) => {
      const normalizedKW = normalize(kw);
      return input.includes(normalizedKW);
    });
  });

  if (matchedFAQ && (isQuestioningConcept || input === normalize(matchedFAQ.question) || matchedFAQ.keywords.some((k) => input === normalize(k)))) {
    return {
      text: matchedFAQ.answer,
      suggestions: matchedFAQ.suggestions,
      action: matchedFAQ.action,
    };
  }

  // -------------------------------------------------------------
  // 3. CONSULTAS SOBRE EVENTOS (HU-09)
  // -------------------------------------------------------------
  if (
    input.includes("evento") ||
    input.includes("actividad") ||
    input.includes("taller") ||
    input.includes("hackathon") ||
    input.includes("conferencia") ||
    input.includes("torneo") ||
    input.includes("feria")
  ) {
    // Si solo pide ver eventos generales
   if (input === "ver eventos" || input === "eventos" || input === "que eventos hay") {
        if (currentEvents.length === 0) {
            return {
            text: "Por el momento no hay eventos programados en el calendario institucional. Te invitamos a estar atento a próximos avisos.",
            suggestions: ["Conocer carreras", "Orientación vocacional"],
            };
        }
        const proximos = currentEvents.slice(0, 3);
        const lista = proximos
            .map((e) => `• **${e.title}** (${e.date}) - ${e.location}`)
            .join("\n");
        return {
            text: `**Próximos eventos destacados:**\n\n${lista}\n\n¿Deseas información específica de alguno de ellos?`,
            suggestions: [proximos[1]?.title || "Eventos", "Conocer carreras", "Orientación vocacional"],
            action: {
            label: "Ir a la sección de eventos",
            url: "#eventos",
            },
        };
    }
    

    // Buscar evento específico por nombre o categoría dentro de la DB
    
    const found = currentEvents.find((e) => {
        const titleNorm = normalize(e.title);
        const catNorm = normalize(e.category);
        return (
            input.includes(titleNorm) ||
            titleNorm.includes(input.replace("evento", "").trim()) ||
            input.includes(catNorm)
        );
    });

    if (found) {
      return {
        text: `**${found.title}**\n\n` +
          `**Fecha y hora:** ${found.date} a las ${found.time} hrs\n` +
          `**Ubicación:** ${found.location}\n` +
          `**Categoría:** ${found.category.toUpperCase()}\n` +
          `**Dirigido a:** Toda la comunidad estudiantil y aspirantes.\n\n` +
          `**Descripción:** ${found.description}`,
        suggestions: ["Ver otros eventos", "Conocer carreras", "Orientación vocacional"],
        action: {
          label: "Ver cartelera de eventos",
          url: "#eventos",
        },
      };
    } else {
      // Evento no encontrado amablemente (Criterio HU-09)
      return {
        text: "Lo siento, no encontré un evento con ese nombre o categoría en la agenda actual. Te sugiero consultar la sección completa de eventos para conocer todas las fechas confirmadas.",
        suggestions: ["Ver eventos", "Conocer carreras", "Hablar con el asistente"],
        action: {
          label: "Explorar eventos",
          url: "#eventos",
        },
      };
    }
  }

    // -------------------------------------------------------------
  // 4. CONSULTAS SOBRE CARRERAS (HU-11)
  // -------------------------------------------------------------
  // 1. Descartar términos comunes que NO son la carrera universitaria
  const isFalsePositive =
    input.includes("redes sociales") ||
    input.includes("red social") ||
    input.includes("red wifi") ||
    input.includes("clases virtuales") ||
    input.includes("aula virtual") ||
    input.includes("campus virtual");

  let targetCareerKey: string | null = null;

  if (!isFalsePositive) {
    // Detectamos si se refiere específicamente a una de las 3 carreras
    if (
      input === "desarrollo de software" ||
      input === "software" ||
      input.includes("carrera de software") ||
      (input.includes("software") && (input.includes("duracion") || input.includes("requisito") || input.includes("campo laboral")))
    ) {
      targetCareerKey = "desarrollo-software";
    } else if (
      input === "redes" ||
      input === "redes y ciberseguridad" ||
      input.includes("carrera de redes") ||
      input.includes("ciberseguridad") ||
      (input.includes("redes") && (input.includes("duracion") || input.includes("requisito") || input.includes("campo laboral")))
    ) {
      targetCareerKey = "redes";
    } else if (
      input === "entornos virtuales" ||
      input === "entornos" ||
      input.includes("carrera de entornos") ||
      (input.includes("entornos") && (input.includes("duracion") || input.includes("requisito") || input.includes("campo laboral")))
    ) {
      targetCareerKey = "entornos-virtuales";
    }
  }

  // Si pregunta por la lista general de carreras (ej. clic en el botón "Conocer carreras")
  if (
    input === "conocer carreras" ||
    input === "carreras" ||
    input.includes("que carreras hay") ||
    input.includes("oferta educativa")
  ) {
    return {
      text: "Contamos con **3 carreras de Técnico Superior Universitario (TSU)** con continuidad a Ingeniería:\n\n" +
        "1.**Desarrollo de Software Multiplataforma**\n" +
        "2.**Redes y Ciberseguridad**\n" +
        "3.**Entornos Virtuales y Negocios Digitales**\n\n" +
        "¿Sobre cuál te gustaría conocer duración, campo laboral o requisitos?",
      suggestions: [
        "Desarrollo de Software",
        "Redes y Ciberseguridad",
        "Entornos Virtuales",
      ],
      action: {
        label: "Ver sección de carreras",
        url: "#carreras",
      },
    };
  }

  // Si detectó una carrera específica:
  if (targetCareerKey) {
    const info = CAREERS_INFO[targetCareerKey];

    // Pregunta concreta por Plan de Estudios / Materias
    if (
      input.includes("plan") ||
      input.includes("materia") ||
      input.includes("asignatura") ||
      input.includes("reticula") ||
      input.includes("que llevan") ||
      input.includes("que materias")
    ) {
      return getStudyPlanResponse(targetCareerKey, info);
    }

    // Pregunta concreta por Duración
    if (input.includes("duracion") || input.includes("tiempo") || input.includes("cuanto dura") || input.includes("cuatrimestre")) {
      return {
        text: `La carrera de **${info.shortName}** tiene una duración de **${info.duracion}** (modalidad cuatrimestral intensiva con estadía profesional).`,
        suggestions: ["Requisitos de ingreso", "Campo laboral", "Ver plan de estudios"],
        action: {
          label: `Plan de ${info.shortName}`,
          url: info.link,
        },
      };
    }

    // Pregunta concreta por Requisitos
    if (input.includes("requisito") || input.includes("necesito") || input.includes("admision") || input.includes("entrar")) {
      return {
        text: `**Requisitos para ${info.shortName}:**\n${info.requisitos}`,
        suggestions: ["Proceso de admisión", "Duración", "Campo laboral"],
        action: {
          label: "Ver proceso de aspirantes",
          url: "/aspirantes",
        },
      };
    }

    // Pregunta concreta por Campo Laboral
    if (input.includes("campo") || input.includes("laboral") || input.includes("trabajo") || input.includes("donde trabajar")) {
      return {
        text: `**Campo laboral de ${info.shortName}:**\n${info.campoLaboral}`,
        suggestions: ["Duración", "Ver plan de estudios", "Orientación vocacional"],
        action: {
          label: `Conocer más de ${info.shortName}`,
          url: info.link,
        },
      };
    }

    // Solo mostramos la ficha resumen completa si fue una consulta directa o clic de botón
    const isDirectIntent =
      input === info.shortName.toLowerCase() ||
      input === info.name.toLowerCase() ||
      input === targetCareerKey ||
      input === "redes" ||
      input === "entornos" ||
      input === "software" ||
      input.startsWith("conocer ") ||
      input.startsWith("hablame de ") ||
      input.startsWith("informacion de ");

    if (isDirectIntent) {
      return {
        text: `**${info.name}**\n\n` +
          `**¿De qué trata?** ${info.descripcion}\n` +
          `**Duración:** ${info.duracion}\n` +
          `**Campo laboral:** ${info.campoLaboral}`,
        suggestions: ["Duración", "Requisitos", "Otras carreras"],
        action: {
          label: `Ver página de ${info.shortName}`,
          url: info.link,
        },
      };
    }

    // SI NO ES UNA CONSULTA DIRECTA (es una duda conversacional como "¿En entornos enseñan Blender?"):
    // No hacemos return aquí; dejamos que el flujo continúe hacia Groq AI para que responda con IA.
  }

  // -------------------------------------------------------------
  // 5. SALUDOS Y ACCESOS RÁPIDOS INICIALES (HU-08)
  // -------------------------------------------------------------
  if (input.includes("hola") || input.includes("buenos") || input.includes("buenas") || input === "hablar con el asistente") {
    return {
      text: "¡Hola! Soy el asistente virtual inteligente de la universidad. Estoy aquí para resolver tus dudas sobre nuestras carreras, eventos y proceso de admisión.",
      suggestions: ["Conocer carreras", "Ver eventos", "Orientación vocacional"],
    };
  }

  // -------------------------------------------------------------
  // 6. INTELIGENCIA ARTIFICIAL CON GROQ (Para preguntas abiertas o variaciones)
  // -------------------------------------------------------------
  try {
    const aiAnswer = await askSmartAI(rawInput, currentEvents, history);
    return {
      text: aiAnswer,
      suggestions: ["Conocer carreras", "Ver eventos", "Orientación vocacional"],
    };
  } catch {
    return {
      text: "Disculpa, no dispongo de esa información exacta en este momento. Te invito a explorar nuestras secciones especializadas o realizar el test vocacional.",
      suggestions: DEFAULT_SUGGESTIONS,
      action: {
        label: "Ir al inicio",
        url: "/",
      },
    };
  }
}

// Presentación formal e institucional del plan de estudios
function getStudyPlanResponse(careerKey: string, info: CareerQuickInfo): BotResponse {
  let highlights = "";

  if (careerKey === "desarrollo-software") {
    highlights = `
**Ciclos de Fundamentos:**
• Fundamentos de Programación y Lógica
• Fundamentos de Redes
• Bases de Datos Relacionales (SQL)
• Matemáticas y Física

**Ciclos de Especialización y Desarrollo:**
• Programación Estructurada y Orientada a Objetos
• Desarrollo de Aplicaciones Web
• Desarrollo de Aplicaciones Móviles (Android e iOS)
• Tópicos de Calidad para el Diseño de Software
• Proyectos Integradores I y II

**Ciclos de Integración y Titulación:**
• Aplicaciones Web Orientadas a Servicios y APIs
• Bases de Datos Avanzadas
• Estadía Profesional en el Sector Productivo
`.trim();
  } else if (careerKey === "redes") {
    highlights = `
**Ciclos de Fundamentos e Infraestructura:**
• Fundamentos de Redes y Telecomunicaciones
• Conmutación y Enrutamiento de Redes
• Sistemas Operativos y Arquitectura de Servidores
• Cableado Estructurado

**Ciclos de Seguridad y Administración:**
• Ciberseguridad y Criptografía
• Seguridad Perimetral y Redes Privadas Virtuales (VPN)
• Administración de Servidores Linux y Windows
• Proyectos Integradores I y II

**Ciclos de Auditoría y Titulación:**
• Auditoría de Seguridad en Tecnologías de la Información
• Computación en la Nube y Virtualización
• Estadía Profesional en el Sector Productivo
`.trim();
  } else {
    highlights = `
**Ciclos de Fundamentos y Diseño Digital:**
• Principios de Modelado 3D, Iluminación y Texturizado
• Diseño de Interfaces y Experiencia de Usuario (UI/UX)
• Animación y Gráficos Digitales
• Fundamentos de Negocios Digitales

**Ciclos de Tecnologías Inmersivas:**
• Programación en Motores de Videojuegos y Simulación
• Desarrollo de Aplicaciones en Realidad Virtual y Aumentada
• Modelado 3D Avanzado e Interacción en Tiempo Real
• Proyectos Integradores I y II

**Ciclos de Estrategia Digital y Titulación:**
• Estrategias de Comercio y Marketing Digital
• Simulación Aplicada al Sector Productivo
• Estadía Profesional en el Sector Productivo
`.trim();
  }

  return {
    text: `**Plan de Estudios — ${info.name}**\n**Duración:** ${info.duracion} (Modelo 70% práctico y 30% teórico).\n\n${highlights}\n\nPuede consultar la retícula completa y asignaturas por cuatrimestre a través del siguiente enlace:`,
    suggestions: ["Requisitos de ingreso", "Campo laboral", "Conocer carreras"],
    action: {
      label: `Ver plan curricular de ${info.shortName}`,
      url: info.link,
    },
  };
}