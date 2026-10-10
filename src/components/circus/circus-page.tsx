import { useEffect, useState, type MouseEvent } from "react";
import { ArrowUp, Star, Volume2, VolumeX } from "lucide-react";
import { setAmbience, stopAmbience } from "@/lib/ambience";
import { pad2, phaseOf, remaining, type Phase } from "@/lib/showtime";
import { Confetti } from "@/components/circus/confetti";

const FACTS = [
  "🎪 LUGAR: Colegio LPC",
  "📅 FECHA: Domingo 11 de octubre de 2026",
  "⏰ HORARIO: 10:00 a. m. – 12:00 p. m.",
] as const;

const CAST = [
  {
    name: "Lumi",
    role: "Payaso alegre",
    img: "/circus/lumi.jpg",
    alt: "Lumi, payaso alegre original con cabello de colores, nariz roja y traje brillante, saludando",
    text: "Cabello de colores, nariz roja y un traje que parece una fiesta andando. Llega saludando, como si ya te conociera.",
  },
  {
    name: "Pío",
    role: "Payaso bromista",
    img: "/circus/pio.jpg",
    alt: "Pío, payaso bromista original con ropa extravagante y una sonrisa traviesa",
    text: "Ropa extravagante, ceja levantada y una flor que no promete quedarse quieta. Su cara ya es una broma amable.",
  },
  {
    name: "Nilo",
    role: "Payaso mágico",
    img: "/circus/nilo.jpg",
    alt: "Nilo, payaso mágico original con sombrero de copa, estrellas y una varita brillante",
    text: "Sombrero de copa, estrellas en el saco y un brillo que no se explica del todo. Invita a mirar dos veces.",
  },
] as const;

const SPOTS = [
  {
    title: "🤡 Risas y payasadas.",
    img: "/circus/risas.jpg",
    alt: "Confeti y serpentinas iluminados sobre la pista del circo",
    text: "El ambiente de una función donde la risa se contagia sola.",
  },
  {
    title: "🎈 Un mundo de colores.",
    img: "/circus/colores.jpg",
    alt: "Ramo de globos rojos, dorados, azules y crema contra el cielo nocturno",
    text: "Globos, luces y cintas que pintan el colegio de celebración.",
  },
  {
    title: "🎩 Magia y sorpresas.",
    img: "/circus/magia.jpg",
    alt: "Sombrero de copa con estrellas y destellos, sin un truco anunciado",
    text: "Brillo, sombreros y ese cosquilleo de no saber qué viene después.",
  },
  {
    title: "🎪 Momentos inolvidables.",
    img: "/circus/momentos.jpg",
    alt: "Interior de una carpa iluminada, con bancas vacías y la pista al fondo",
    text: "Un rato juntos, bajo la carpa, para llevárselo de recuerdo.",
  },
] as const;

function spokenLine(phase: Phase, now: number) {
  if (phase === "live") return "¡EL ESPECTÁCULO ESTÁ COMENZANDO!";
  if (phase === "after") return "¡GRACIAS POR COMPARTIR LA MAGIA DEL CIRCO!";
  const left = remaining(now);
  return `Faltan ${left.days} días, ${left.hours} horas y ${left.minutes} minutos para el espectáculo.`;
}

function ShowClock() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) {
    return (
      <>
        <p className="sr-only">Calculando el tiempo para el espectáculo.</p>
        <div className="clock" aria-hidden="true">
          {["Días", "Horas", "Minutos", "Segundos"].map((label) => (
            <div className="unit" key={label}>
              <span className="num">––</span>
              <span className="lbl">{label}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  const phase = phaseOf(now);
  const left = remaining(now);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {spokenLine(phase, now)}
      </p>
      {phase === "before" ? (
        <div className="clock" aria-hidden="true">
          <div className="unit">
            <span className="num">{pad2(left.days)}</span>
            <span className="lbl">Días</span>
          </div>
          <div className="unit">
            <span className="num">{pad2(left.hours)}</span>
            <span className="lbl">Horas</span>
          </div>
          <div className="unit">
            <span className="num">{pad2(left.minutes)}</span>
            <span className="lbl">Minutos</span>
          </div>
          <div className="unit">
            <span className="num">{pad2(left.seconds)}</span>
            <span className="lbl">Segundos</span>
          </div>
        </div>
      ) : (
        <p className="phase-banner">
          {phase === "live"
            ? "¡EL ESPECTÁCULO ESTÁ COMENZANDO!"
            : "¡GRACIAS POR COMPARTIR LA MAGIA DEL CIRCO!"}
        </p>
      )}
    </>
  );
}

export function CircusPage() {
  const [sound, setSound] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => stopAmbience(), []);

  function enterShow() {
    document.getElementById("espectaculo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.dispatchEvent(new Event("circus-burst"));
  }

  function moveStage(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.setProperty("--px", x.toFixed(3));
    event.currentTarget.style.setProperty("--py", y.toFixed(3));
  }

  function resetStage(event: MouseEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty("--px", "0");
    event.currentTarget.style.setProperty("--py", "0");
  }

  function tiltTicket(event: MouseEvent<HTMLElement>) {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    event.currentTarget.style.transform = `rotateY(${(x * 12).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`;
  }

  function resetTicket(event: MouseEvent<HTMLElement>) {
    event.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg)";
  }

  function toggleSound() {
    const next = !sound;
    setSound(next);
    try {
      setAmbience(next);
    } catch {
      setSound(false);
      stopAmbience();
    }
  }

  return (
    <div className="page">
      <div className="sky" aria-hidden="true" />
      <div className="sky-b" aria-hidden="true" />
      <div className="balloons" aria-hidden="true">
        <span className="balloon" />
        <span className="balloon" />
        <span className="balloon" />
        <span className="balloon" />
        <span className="balloon" />
        <span className="balloon" />
      </div>
      <Confetti />

      <div className="content">
      <div className="awning" aria-hidden="true" />
      <header className="nav">
        <a className="brand" href="#inicio">
          Gran Circo LPC
        </a>
        <button
          type="button"
          className="nav-sound"
          aria-pressed={sound}
          aria-label={sound ? "Silenciar sonido ambiental" : "Activar sonido ambiental"}
          onClick={toggleSound}
        >
          <span className="icon-swap">
            <Volume2 className={sound ? "icon-on" : "icon-off"} aria-hidden="true" />
            <VolumeX className={sound ? "icon-off" : "icon-on"} aria-hidden="true" />
          </span>
        </button>
        <nav className="nav-links" aria-label="Secciones">
          <a href="#espectaculo">Función</a>
          <a href="#elenco">Elenco</a>
          <a href="#diversion">Fiesta</a>
          <a href="#boleto">Boleto</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="wrap">
            <h1 className="hero-title rise d1">¡BIENVENIDOS AL GRAN CIRCO!</h1>
            <p className="hero-sub rise d2">¡La diversión llega al Colegio LPC!</p>
            <p className="hero-lead rise d3">
              Prepárate para disfrutar de una presentación llena de alegría, humor y magia.
            </p>

            <div className="stage rise d4" onMouseMove={moveStage} onMouseLeave={resetStage}>
              <div className="stage-clown left">
                <div className="shift-a">
                  <img className="bob" src="/circus/lumi.jpg" alt="" width={720} height={1080} />
                </div>
              </div>
              <div className="stage-tent">
                <div className="shift-tent">
                  <div className="tent-frame">
                    <img
                      src="/circus/tent.jpg"
                      alt="Carpa roja y crema del Gran Circo, con luces doradas y la entrada iluminada"
                      width={1400}
                      height={788}
                      fetchPriority="high"
                    />
                  </div>
                </div>
              </div>
              <div className="stage-clown right">
                <div className="shift-b">
                  <img className="bob" src="/circus/nilo.jpg" alt="" width={720} height={1080} />
                </div>
              </div>
            </div>

            <div className="facts rise d5">
              {FACTS.map((fact) => (
                <p className="fact" key={fact}>
                  {fact}
                </p>
              ))}
            </div>

            <div className="sign rise d6" aria-hidden="false">
              <p>¡ENTRADA TOTALMENTE GRATIS!</p>
            </div>

            <div className="cta-row rise d6">
              <button type="button" className="cta" onClick={enterShow}>
                🎟️ ¡ENTRAR AL CIRCO!
              </button>
            </div>
          </div>
        </section>

        <section className="section" id="espectaculo">
          <div className="wrap">
            <h2>La función</h2>
            <p className="lede">
              El reloj cuenta hasta el domingo en punto, hora de Guatemala. Cuando abra el telón, y cuando se
              cierre, el mensaje cambia solo.
            </p>
            <ShowClock />
            <div className="ficha">
              {FACTS.map((fact) => (
                <p key={fact}>{fact}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="elenco">
          <div className="wrap">
            <h2>Tres payasos, cero copias</h2>
            <p className="lede">
              Personajes originales de esta invitación. No vienen de una película ni de una marca: nacieron para
              recibir al Colegio LPC.
            </p>
            <div className="grid-3">
              {CAST.map((clown) => (
                <article className="cast-card" key={clown.name}>
                  <div className="cast-figure">
                    <img className="bob" src={clown.img} alt={clown.alt} width={720} height={1080} />
                  </div>
                  <div className="cast-copy">
                    <h3>{clown.name}</h3>
                    <p className="role">{clown.role}</p>
                    <p>{clown.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="diversion">
          <div className="wrap">
            <h2>¡UN MUNDO LLENO DE DIVERSIÓN!</h2>
            <p className="lede">
              Un vistazo al ambiente del espectáculo. No es una lista de actos confirmados: es la sensación de
              llegar a la carpa.
            </p>
            <div className="grid-4">
              {SPOTS.map((spot) => (
                <article className="spot" key={spot.title}>
                  <img src={spot.img} alt={spot.alt} width={900} height={900} loading="lazy" />
                  <div className="spot-copy">
                    <h3>{spot.title}</h3>
                    <p>{spot.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="boleto">
          <div className="wrap">
            <h2>Tu recuerdo de la función</h2>
            <p className="lede">
              Un boleto para mirar, girar y guardar en la memoria. No abre una fila ni aparta un asiento.
            </p>
            <div className="ticket-scene">
              <article
                className="ticket"
                onMouseMove={tiltTicket}
                onMouseLeave={resetTicket}
                aria-label="Boleto decorativo del Gran Circo LPC"
              >
                <span className="notch top" aria-hidden="true" />
                <span className="notch bot" aria-hidden="true" />
                <div className="ticket-side">
                  <div className="stars" aria-hidden="true">
                    <Star />
                    <Star />
                    <Star />
                    <Star />
                    <Star />
                  </div>
                  <h3>GRAN CIRCO LPC</h3>
                </div>
                <div>
                  <p className="when">DOMINGO 11 DE OCTUBRE</p>
                  <p className="when">10:00 A. M. – 12:00 P. M.</p>
                  <p className="price">PRECIO: Q0.00 — GRATIS</p>
                  <p className="fine">
                    Recuerdo visual de la invitación. No es una entrada oficial y no reserva lugares.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot wrap">
        <p>
          <strong>Colegio LPC</strong>
          <br />
          Domingo 11 de octubre de 2026 · 10:00 a. m. – 12:00 p. m. · Entrada libre
        </p>
      </footer>

      {showTop ? (
        <div className="dock">
          <button
            type="button"
            className="dock-btn"
            aria-label="Volver al inicio"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp aria-hidden="true" />
          </button>
        </div>
      ) : null}
      </div>
    </div>
  );
}
