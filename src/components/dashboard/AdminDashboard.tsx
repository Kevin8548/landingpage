import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CATEGORY_META, type EventItem } from "../../data/eventos";
import { useEventosStore } from "../../data/eventosStore";
import { setAdminAuthenticated } from "../../lib/adminAuth";
import { AnimatedThemeToggler } from "../ui/AnimatedThemeToggler";
import PreviewMenu from "../ui/PreviewMenu";
import "./Dashboard.css";
import "./DashboardOverrides.css";

const parseISO = (iso: string) =>
  new Date(`${iso}T00:00:00`);

const isValidDate = (d: Date) =>
  !Number.isNaN(d.getTime());

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const daysUntil = (iso: string) => {
  const d = parseISO(iso);

  if (!isValidDate(d)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round(
    (d.getTime() - startOfToday().getTime()) / 86400000
  );
};

const getEventDateParts = (iso: string) => {
  const d = parseISO(iso);

  if (!isValidDate(d)) {
    return {
      day: "--",
      month: "",
    };
  }

  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d
      .toLocaleDateString("es-MX", {
        month: "short",
      })
      .replace(".", "")
      .toUpperCase(),
  };
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { eventItems } = useEventosStore();

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const sorted = useMemo(
    () =>
      [...eventItems].sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    [eventItems]
  );

  const upcoming = useMemo(
    () =>
      sorted.filter(
        (event) => daysUntil(event.date) >= 0
      ),
    [sorted]
  );

  const nextEvent = upcoming[0] ?? sorted[0];

  const summary = useMemo(
    () => [
      {
        label: "Próximos eventos",
        value: upcoming.length,
        icon: CalendarDays,
        tone: "green",
      },
      {
        label: "Total de eventos",
        value: eventItems.length,
        icon: Sparkles,
        tone: "amber",
      },
      {
        label: "Eventos pasados",
        value:
          eventItems.length - upcoming.length,
        icon: Clock3,
        tone: "blue",
      },
    ],
    [eventItems.length, upcoming.length]
  );

  const handleSignOut = () => {
    setAdminAuthenticated(false);
    navigate("/");
  };

  return (
    <main className="dashboard-page">
      <aside
        className={`dashboard-sidebar ${
          isSidebarOpen ? "is-open" : ""
        } ${
          isSidebarCollapsed ? "is-collapsed" : ""
        }`}
      >
        <button
          className="dashboard-sidebar-collapse"
          onClick={() =>
            setSidebarCollapsed((value) => !value)
          }
          aria-label={
            isSidebarCollapsed
              ? "Expandir barra lateral"
              : "Contraer barra lateral"
          }
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>

        <div className="dashboard-brand">
          <span className="dashboard-brand__mark">
            UTT
          </span>

          <span>
            Universidad Tecnológica
            <br />
            de Tlaxcala
          </span>

          <button
            className="dashboard-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={19} />
          </button>
        </div>

        <nav
          className="dashboard-nav"
          aria-label="Navegación del panel"
        >
          <Link
            className="is-active"
            to="/dashboard"
          >
            <LayoutDashboard size={18} />
            Resumen
          </Link>

          <Link to="/dashboard/eventos">
            <CalendarDays size={18} />
            Eventos
            <span>{eventItems.length}</span>
          </Link>
        </nav>

        <div className="dashboard-sidebar__bottom">
          <div className="dashboard-profile">
            <span className="dashboard-avatar">
              AD
            </span>

            <div>
              <strong>Administrador</strong>
              <small>Panel de eventos</small>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="dashboard-signout"
          >
            <LogOut size={17} />
            Salir al sitio
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <button
            className="dashboard-menu-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={21} />
          </button>

          <div className="dashboard-breadcrumb">
            <span>Panel</span>
            <ChevronRight size={14} />
            Resumen
          </div>

          <div className="dashboard-topbar__actions">
            <AnimatedThemeToggler
              className="dashboard-theme-toggle"
            />

            <span className="dashboard-avatar dashboard-avatar--small">
              AD
            </span>
          </div>
        </header>

        <div
          className="dashboard-body"
          id="resumen"
        >
          <div className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">
                <Sparkles size={14} />
                PANEL DE ADMINISTRACIÓN
              </p>

              <h1>
                Hola, Administrador
                <span>.</span>
              </h1>

              <p>
                Consulta lo importante y administra tus
                eventos desde un solo lugar.
              </p>
            </div>

            <div className="dashboard-welcome__actions">
              <PreviewMenu />

              <Link
                className="dashboard-events-link"
                to="/dashboard/eventos"
              >
                <CalendarDays size={14} />
                <span>Ir a eventos</span>
              </Link>
            </div>
          </div>

          <section
            className="dashboard-stats"
            aria-label="Resumen de actividad"
          >
            {summary.map(
              ({
                label,
                value,
                icon: Icon,
                tone,
              }) => (
                <article
                  className="dashboard-stat"
                  key={label}
                >
                  <span
                    className={`dashboard-stat__icon dashboard-stat__icon--${tone}`}
                  >
                    <Icon size={20} />
                  </span>

                  <div>
                    <small>{label}</small>
                    <strong>{value}</strong>
                  </div>

                  <ArrowUpRight size={18} />
                </article>
              )
            )}
          </section>

          <section className="dashboard-feature-grid">
            <article className="dashboard-next-event">
              <div className="dashboard-section-heading">
                <div>
                  <p>EN EL RADAR</p>
                  <h2>Próximo evento</h2>
                </div>

                <Link to="/dashboard/eventos">
                  Ver todos
                </Link>
              </div>

              {nextEvent ? (
                <DashboardNextEvent
                  event={nextEvent}
                />
              ) : (
                <div className="dashboard-empty-state">
                  <CalendarDays size={24} />

                  <p>Aún no hay eventos.</p>

                  <Link to="/dashboard/eventos">
                    Crea el primero
                  </Link>
                </div>
              )}
            </article>

            <article className="dashboard-quick-start">
              <div className="dashboard-section-heading">
                <div>
                  <p>¿QUÉ SIGUE?</p>
                  <h2>
                    Gestiona sin complicarte
                  </h2>
                </div>
              </div>

              <ol>
                <li>
                  <span>01</span>

                  <div>
                    <strong>Crea un evento</strong>
                    <p>
                      Agrega fecha, hora, lugar y
                      público.
                    </p>
                  </div>
                </li>

                <li>
                  <span>02</span>

                  <div>
                    <strong>
                      Revisa su información
                    </strong>
                    <p>
                      Consulta los detalles cuando
                      quieras.
                    </p>
                  </div>
                </li>

                <li>
                  <span>03</span>

                  <div>
                    <strong>
                      Manténlo actualizado
                    </strong>
                    <p>
                      Edita o elimina en la sección
                      Eventos.
                    </p>
                  </div>
                </li>
              </ol>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}

function DashboardNextEvent({
  event,
}: {
  event: EventItem;
}) {
  const date = getEventDateParts(event.date);
  const meta = CATEGORY_META[event.category];

  return (
    <div className="dashboard-next-event__card">
      <div className="dashboard-date-tile">
        <strong>{date.day}</strong>
        <span>{date.month}</span>
      </div>

      <div className="dashboard-next-event__copy">
        <span
          className="dashboard-status"
          style={{ color: meta.color }}
        >
          <i />
          {meta.label}
        </span>

        <h3>{event.title}</h3>

        <p>
          <Clock3 size={15} />
          {event.time}
        </p>

        <p>
          <MapPin size={15} />
          {event.location}
        </p>
      </div>

      <Link
        className="dashboard-arrow-button"
        to="/dashboard/eventos"
        aria-label="Ir a eventos"
      >
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}