import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { Moon, Sun } from "lucide-react";

type AnimatedThemeTogglerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  duration?: number;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
  };
};

/** Animated light/dark switch inspired by Magic UI's View Transition version. */
export function AnimatedThemeToggler({
  duration = 400,
  className,
  ...props
}: AnimatedThemeTogglerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    // Primera visita: claro. Después conserva la última elección del usuario.
    const dark = localStorage.getItem("utt-dashboard-theme") === "dark";
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  const toggleTheme = () => {
    const nextIsDark = !isDark;
    const applyTheme = () => {
      document.documentElement.classList.toggle("dark", nextIsDark);
      localStorage.setItem("utt-dashboard-theme", nextIsDark ? "dark" : "light");
      setIsDark(nextIsDark);
    };

    const button = buttonRef.current;
    // bind(document) es importante: sin él, Chrome rechaza la llamada al API.
    const startViewTransition = (document as ViewTransitionDocument).startViewTransition?.bind(document);
    if (!button || !startViewTransition) {
      applyTheme();
      return;
    }

    const { top, left, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const transition = startViewTransition(applyTheme);

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
        { duration, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => undefined);
  };

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
