// # Interfaz gráfica flotante (animaciones, chips de sugerencias, responsive)
import { useEffect, useState, useRef } from "react";
import { getEventsFromSupabase } from "../../services/queries";
import { events as seedEvents, type EventItem } from "../../data/eventos";
import { X, Send, Bot, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleUserMessage, type QuizState, type BotAction } from "./chatbotEngine";


interface ChatMessage {
    id: string;
    sender: "bot" | "user";
    text: string;
    time: string;
    suggestions?: string[];
    action?: BotAction;
    }

    // Función que convierte la sintaxis **texto** en negritas reales en React
    function formatMessageText(text: string) {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
            <strong key={index} className="font-bold text-white tracking-wide">
            {boldText}
            </strong>
        );
        }
        return part;
    });
    }

    export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    // Estado inicial con los eventos de respaldo
    const [realEvents, setRealEvents] = useState<EventItem[]>(seedEvents);
    // Al montar el componente, consulta Supabase una sola vez
    useEffect(() => {
        async function loadEvents() {
        try {
            const data = await getEventsFromSupabase();
            if (data && data.length > 0) {
            setRealEvents(data); // Guarda los eventos reales de la DB en memoria
            }
        } catch (err) {
            console.warn("No se pudieron cargar eventos de Supabase, usando respaldo:", err);
        }
        }
        loadEvents();
    }, []);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [quizState, setQuizState] = useState<QuizState>({
        active: false,
        step: 0,
        scores: { "desarrollo-software": 0, redes: 0, "entornos-virtuales": 0 },
    });

    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mensaje inicial de bienvenida (HU-08)
    const initialMessage: ChatMessage = {
        id: "init-1",
        sender: "bot",
        text: "¡Hola! Bienvenido al portal universitario. ¿En qué te puedo orientar hoy?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        // HU-08 Criterio: 3 accesos rápidos iniciales
        suggestions: ["Conocer carreras", "Ver eventos", "Hablar con el asistente"],
    };

    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);

    // Auto-scroll al recibir un nuevo mensaje
    useEffect(() => {
        if (isOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping, isOpen]);

    const handleSendMessage = (textToSend?: string) => {
        const text = (textToSend || inputText).trim();
        if (!text) return;

        const userMsg: ChatMessage = {
        id: `u-${crypto.randomUUID()}`,
        sender: "user",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInputText("");
        setIsTyping(true);

        // Simula tiempo de respuesta para mayor naturalidad
        // Dentro de handleSendMessage:
            setTimeout(async () => {
        try {
        // 1. Convertimos los mensajes actuales a formato para la IA (omitiendo el saludo inicial)
        const chatHistory = messages
            .filter((m) => m.id !== "init-1")
            .map((m) => ({
            role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
            content: m.text,
            }));

        // 2. Le pasamos chatHistory como 5to argumento a handleUserMessage
        const response = await handleUserMessage(
            text,
            quizState,
            setQuizState,
            realEvents,
            chatHistory
        );
        
        const botMsg: ChatMessage = {
            id: "b-" + Date.now(),
            sender: "bot",
            text: response.text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suggestions: response.suggestions,
            action: response.action,
        };

        setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("No se pudo generar la respuesta del asistente:", error);
            setMessages((prev) => [...prev, {
                id: "b-error-" + Date.now(),
                sender: "bot",
                text: "No pude responder en este momento. Inténtalo de nuevo en unos minutos.",
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }]);
        } finally {
            setIsTyping(false);
        }
        }, 450);
    };

    const handleActionClick = (action: BotAction) => {
        if (!action.url) return;
        if (action.url.startsWith("#")) {
        const el = document.querySelector(action.url);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
        } else {
        navigate(action.url);
        }
    };

    const handleResetChat = () => {
        setQuizState({
        active: false,
        step: 0,
        scores: { "desarrollo-software": 0, redes: 0, "entornos-virtuales": 0 },
        });
        setMessages([initialMessage]);
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
        {/* Botón flotante para abrir/cerrar (HU-08) */}
        {!isOpen && (
            <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-300/30 cursor-pointer"
            aria-label="Abrir asistente virtual"
            >
            <div className="relative">
                <Bot className="w-6 h-6 text-slate-950" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-200"></span>
                </span>
            </div>
            <span className="text-sm font-bold tracking-wide hidden lg:inline">
                Asistente Virtual
            </span>
            </button>
        )}

        {/* Ventana del Chatbot */}
        {isOpen && (
            <div className="w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] flex flex-col rounded-2xl bg-[#09100c] border border-emerald-500/30 shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-200">
            
            {/* Encabezado */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-950/80 via-[#0d1812] to-slate-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Asistente UTT
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>
                    <p className="text-[11px] text-emerald-400/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    En línea • Sin registro
                    </p>
                </div>
                </div>

                <div className="flex items-center gap-1">
                <button
                    onClick={handleResetChat}
                    title="Reiniciar chat"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setIsOpen(false)}
                    title="Cerrar asistente"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
                {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                >
                    <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-xs shadow-md"
                        : "bg-[#132219] text-slate-200 border border-emerald-500/20 rounded-bl-xs shadow-inner"
                    }`}
                    >
                    <p className="whitespace-pre-line leading-relaxed text-[13.5px]">
                        {formatMessageText(msg.text)}
                    </p>

                    {/* Botón de acción / Enlace directo si aplica */}
                    {msg.action && (
                        <button
                        onClick={() => handleActionClick(msg.action!)}
                        className="mt-3 flex items-center justify-between w-full px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 transition-all cursor-pointer"
                        >
                        <span>{msg.action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    )}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {msg.time}
                    </span>

                    {/* Sugerencias automáticas clickeables (HU Sugerencias) */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                        {msg.suggestions.map((sug, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/40 transition-all active:scale-95 cursor-pointer"
                        >
                            {sug}
                        </button>
                        ))}
                    </div>
                    )}
                </div>
                ))}

                {/* Efecto de escribiendo */}
                {isTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#132219] border border-emerald-500/20 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Caja de Entrada de Texto */}
            <form
                onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
                }}
                className="p-3 bg-[#0d1812] border-t border-white/10 flex items-center gap-2"
            >
                <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Haz una pregunta o elige una opción..."
                className="flex-1 bg-slate-900/90 text-white placeholder-slate-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 text-slate-950 transition-colors cursor-pointer"
                aria-label="Enviar mensaje"
                >
                <Send className="w-4 h-4" />
                </button>
            </form>
            </div>
        )}
        </div>
    );
}
