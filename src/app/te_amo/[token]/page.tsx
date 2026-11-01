"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/* ============================================================
   ⚙️ CONFIGURACIÓN — CAMBIA AQUÍ
   ============================================================ */
const FECHA_INICIO = new Date("2026-10-12T20:30:00"); // ✏️ fecha en que empezaron

const FRASES = [
  "Eres mi persona favorita 💕",
  "Contigo todo es mejor ✨",
  "Me enamoro de ti cada día 🌹",
  "Eres mi lugar seguro 🏡",
  "Te amo más de lo que las palabras pueden decir 💖",
];
/* ============================================================ */

type ClickHeart = { id: number; x: number; y: number; emoji: string };
type BgHeart = {
  id: number;
  left: number;
  size: number;
  duration: number;
  emoji: string;
};

export default function SorpresaPage() {
  const params = useParams();
  const token = params.token as string;

  const [actual, setActual] = useState(0);
  const [modalCarta, setModalCarta] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [btnNoHidden, setBtnNoHidden] = useState(false);
  const [vecesNo, setVecesNo] = useState(0);
  const [btnNoPos, setBtnNoPos] = useState({ x: 0, y: 0 });
  const [btnNoTexto, setBtnNoTexto] = useState("No 😢");
  const [btnSiTexto, setBtnSiTexto] = useState("¡Sí! 💖");
  const [btnSiScale, setBtnSiScale] = useState(1);

  const [maquina, setMaquina] = useState("");
  const [contador, setContador] = useState({
    dias: "0",
    horas: "00",
    minutos: "00",
    segundos: "00",
  });

  const [bgHearts, setBgHearts] = useState<BgHeart[]>([]);
  const [clickHearts, setClickHearts] = useState<ClickHeart[]>([]);
  const [razonesVolteadas, setRazonesVolteadas] = useState<number[]>([]);

  /* ============================================================
     Corazones flotantes de fondo
     ============================================================ */
  useEffect(() => {
    const emojis = ["💗", "💕", "💖", "🌸", "✨", "💞"];
    const spawn = () => {
      setBgHearts((prev) => [
        ...prev.slice(-24),
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 100,
          size: 12 + Math.random() * 20,
          duration: 9 + Math.random() * 12,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    };
    for (let i = 0; i < 16; i++) setTimeout(spawn, i * 420);
    const itv = setInterval(spawn, 1200);
    return () => clearInterval(itv);
  }, []);

  /* ============================================================
     Corazón al hacer clic
     ============================================================ */
  useEffect(() => {
    const emojis = ["💖", "💕", "💗", "✨"];
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const id = Date.now() + Math.random();
      setClickHearts((prev) => [
        ...prev,
        {
          id,
          x: e.clientX,
          y: e.clientY,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
      setTimeout(
        () => setClickHearts((prev) => prev.filter((h) => h.id !== id)),
        1200
      );
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  /* ============================================================
     Máquina de escribir (slide Hero)
     ============================================================ */
  useEffect(() => {
    let idxFrase = 0,
      idxLetra = 0,
      borrando = false;
    let timer: ReturnType<typeof setTimeout>;

    const escribir = () => {
      const frase = FRASES[idxFrase];
      if (!borrando) {
        setMaquina(frase.substring(0, idxLetra + 1));
        idxLetra++;
        if (idxLetra === frase.length) {
          borrando = true;
          timer = setTimeout(escribir, 2100);
          return;
        }
        timer = setTimeout(escribir, 65);
      } else {
        setMaquina(frase.substring(0, idxLetra - 1));
        idxLetra--;
        if (idxLetra === 0) {
          borrando = false;
          idxFrase = (idxFrase + 1) % FRASES.length;
          timer = setTimeout(escribir, 380);
          return;
        }
        timer = setTimeout(escribir, 28);
      }
    };
    timer = setTimeout(escribir, 1500);
    return () => clearTimeout(timer);
  }, []);

  /* ============================================================
     Contador de tiempo juntos
     ============================================================ */
  useEffect(() => {
    const tick = () => {
      let diff = new Date().getTime() - FECHA_INICIO.getTime();
      if (diff < 0) diff = 0;
      const seg = Math.floor(diff / 1000);
      setContador({
        dias: Math.floor(seg / 86400).toLocaleString("es"),
        horas: String(Math.floor((seg % 86400) / 3600)).padStart(2, "0"),
        minutos: String(Math.floor((seg % 3600) / 60)).padStart(2, "0"),
        segundos: String(seg % 60).padStart(2, "0"),
      });
    };
    tick();
    const itv = setInterval(tick, 1000);
    return () => clearInterval(itv);
  }, []);

  /* ============================================================
     Navegación entre slides
     ============================================================ */
  const totalSlides = 7;

  const ir = (n: number) => {
    if (n < 0 || n >= totalSlides || n === actual) return;
    setActual(n);
  };

  /* Teclado */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") ir(actual + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") ir(actual - 1);
      if (e.key === "Escape") setModalCarta(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actual]);

  /* Deslizar con el dedo */
  const x0 = useRef<number | null>(null);
  const y0 = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    x0.current = e.touches[0].clientX;
    y0.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (x0.current === null) return;
    const dx = e.changedTouches[0].clientX - x0.current;
    const dy = e.changedTouches[0].clientY - y0.current!;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
      dx < 0 ? ir(actual + 1) : ir(actual - 1);
    }
    x0.current = null;
    y0.current = null;
  };

  /* ============================================================
     Botón "No" que huye
     ============================================================ */
  const textosNo = [
    "No 😢",
    "¿Segura? 🥺",
    "Piénsalo bien 😭",
    "¡No puedes! 🙈",
    "Ese botón no funciona 😏",
    "Ya ríndete 😜",
  ];
  const textosSi = [
    "¡SÍ! 💖",
    "¡SÍ, TE AMO! 💞",
    "¡SÍ, MIL VECES SÍ! 💘",
    "¡OBVIO QUE SÍ! 🥰",
  ];

  const huir = () => {
    const x = (Math.random() - 0.5) * 260;
    const y = (Math.random() - 0.5) * 170;
    setBtnNoPos({ x, y });
    const v = vecesNo + 1;
    setVecesNo(v);
    setBtnNoTexto(textosNo[v % textosNo.length]);
    setBtnSiScale(Math.min(1 + v * 0.18, 2.2));
    setBtnSiTexto(textosSi[Math.min(v, textosSi.length - 1)]);
  };

  const onSi = () => {
    setRespuesta("¡Yo también te amo, mi vida! 💕♾️");
    setBtnNoHidden(true);
    setBtnSiScale(1.2);
    lluviaDeCorazones();
  };

  /* ============================================================
     Lluvia de corazones
     ============================================================ */
  function lluviaDeCorazones() {
    const emojis = ["💖", "💕", "💗", "❤️", "💞", "🌹", "✨"];
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const id = Date.now() + Math.random();
        setClickHearts((prev) => [
          ...prev,
          {
            id,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight * (0.8 + Math.random() * 0.2),
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
          },
        ]);
        setTimeout(
          () => setClickHearts((prev) => prev.filter((h) => h.id !== id)),
          1200
        );
      }, i * 45);
    }
  }

  /* ============================================================
     Razones (tarjetas que giran)
     ============================================================ */
  const toggleRazon = (i: number) => {
    setRazonesVolteadas((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <>
      {/* Fuentes Google */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;700&family=Poppins:wght@200;300;400;600&display=swap"
        rel="stylesheet"
      />

      {/* Corazones flotantes de fondo */}
      <div className="corazones-fondo">
        {bgHearts.map((h) => (
          <span
            key={h.id}
            className="corazon-fondo"
            style={{
              left: `${h.left}vw`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            {h.emoji}
          </span>
        ))}
      </div>

      {/* Corazones al hacer clic / lluvia */}
      {clickHearts.map((h) => (
        <span
          key={h.id}
          className="corazon-click"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          {h.emoji}
        </span>
      ))}

      {/* ============================================================
          SLIDES
          ============================================================ */}
      <div id="slides" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* -------- 1. HERO -------- */}
        <section className={`slide ${actual === 0 ? "activa" : ""}`}>
          <div className="slide-inner">
            <div className="corona">👑</div>
            <h1>Te Amo</h1>
            <div className="nombre">Mi Geraldine 💕</div>
            <p id="maquina">
              {maquina}
              <span className="cursor" />
            </p>
            <div className="pista">Usa las flechas o desliza →</div>
          </div>
        </section>

        {/* -------- 2. CONTADOR -------- */}
        <section className={`slide ${actual === 1 ? "activa" : ""}`}>
          <div className="slide-inner">
            <h2>Nuestro Tiempo Juntos</h2>
            <p className="subtitulo">
              Desde el 12 de octubre de 2026... y contando 💞
            </p>
            <div className="contador">
              <div className="caja">
                <span className="num">{contador.dias}</span>
                <span className="eti">Días</span>
              </div>
              <div className="caja">
                <span className="num">{contador.horas}</span>
                <span className="eti">Horas</span>
              </div>
              <div className="caja">
                <span className="num">{contador.minutos}</span>
                <span className="eti">Minutos</span>
              </div>
              <div className="caja">
                <span className="num">{contador.segundos}</span>
                <span className="eti">Segundos</span>
              </div>
            </div>
          </div>
        </section>

        {/* -------- 3. RAZONES -------- */}
        <section className={`slide ${actual === 2 ? "activa" : ""}`}>
          <div className="slide-inner">
            <h2>Razones Por Las Que Te Amo</h2>
            <p className="subtitulo">Toca cada tarjeta ✨</p>
            <div className="razones">
              {[
                {
                  emoji: "😍",
                  titulo: "Tu sonrisa",
                  texto:
                    "Porque ilumina todo a tu alrededor. Cuando sonríes, hasta mis días grises se vuelven bonitos.",
                },
                {
                  emoji: "🫂",
                  titulo: "Tus abrazos",
                  texto:
                    "Porque en tus brazos encontré el lugar más seguro del mundo. Ahí todo está bien.",
                },
                {
                  emoji: "😂",
                  titulo: "Tu forma de ser",
                  texto:
                    "Porque me haces reír como nadie, incluso en los días difíciles, y contigo todo es más divertido.",
                },
                {
                  emoji: "💪",
                  titulo: "Tu fuerza",
                  texto:
                    "Porque admiro la mujer tan increíble que eres. Luchas por lo que quieres y nunca te rindes.",
                },
                {
                  emoji: "👀",
                  titulo: "Tu mirada",
                  texto:
                    "Porque cuando me miras siento que soy la persona más afortunada del planeta.",
                },
                {
                  emoji: "🏡",
                  titulo: "Eres mi hogar",
                  texto:
                    "Porque no importa dónde estemos: si estás tú, yo ya estoy en casa.",
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className={`razon ${
                    razonesVolteadas.includes(i) ? "volteada" : ""
                  }`}
                  onClick={() => toggleRazon(i)}
                >
                  <div className="razon-inner">
                    <div className="razon-cara razon-frente">
                      <div className="emoji">{r.emoji}</div>
                      <span>{r.titulo}</span>
                      <small>Toca</small>
                    </div>
                    <div className="razon-cara razon-atras">{r.texto}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------- 4. GALERÍA -------- */}
        <section className={`slide ${actual === 3 ? "activa" : ""}`}>
          <div className="slide-inner">
            <h2>Nuestros Momentos</h2>
            <p className="subtitulo">Cada foto, un recuerdo mi niña hermosa aqui ira nuestras primeras fotos 📸 </p>
            <div className="galeria">
              {["📸", "💞", "🌹", "✨", "🥰", "💕"].map((emoji, i) => (
                <div key={i} className="foto">
                  {emoji}
                  <img
                    src={`/foto${i + 1}.jpg`}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -------- 5. HISTORIA -------- */}

<section className={`slide historia-slide ${actual === 4 ? "activa" : ""}`}>
  <div className="slide-inner historia-inner">
    <h2>Nuestra Historia ❤️</h2>
    <p className="subtitulo">Y pensar que todo comenzó con un proyecto... ✨</p>
    <div className="timeline">
      <div className="momento">
        <h3>Todo comenzó sin esperarlo 💫</h3>
        <div className="fecha">El día que el destino nos presentó</div>
        <p>
          Quién iba a imaginar que un simple proyecto terminaría
          cambiando mi vida de una manera tan bonita. Llegaste sin
          que te estuviera buscando, empezamos a hablar y, desde
          el primer momento en que te vi, hubo algo en ti que me
          encantó. No sé cómo explicarlo, pero tu forma de ser,
          tu sonrisa y esa manera tan tuya de hacer las cosas
          hicieron que quisiera conocerte cada vez más.
          Sin darme cuenta, empezaste a convertirte en alguien
          demasiado especial para mí. ❤️
        </p>
      </div>

      <div className="momento">
        <h3>Nuestra primera cita: una noche de película 🎬</h3>
        <div className="fecha">Mi primera vez en el cine, contigo</div>
        <p>
          ¿Sabes algo? Nunca había ido al cine, y mi primera
          experiencia fue contigo. Y si pudiera volver a vivirla,
          elegiría exactamente el mismo lugar, la misma película
          y, sobre todo, a la misma persona.
          Aunque se suponía que estábamos viendo una película,
          la verdad es que yo tenía algo mucho más bonito frente
          a mis ojos: tú. Estabas tan bonita que creo que pasé
          más tiempo mirándote a ti que mirando la pantalla.
          Estaba nervioso, feliz y con el corazón latiendo a mil.
          Y entonces llegó ese momento tan especial...
          nuestro primer beso. 💋
          No fue solamente un beso, fue uno de esos recuerdos
          que quisiera guardar para siempre en mi corazón.
        </p>
      </div>

      <div className="momento">
        <h3>Y poquito a poquito te volviste mi todo 🥺</h3>
        <div className="fecha">Cuando entendí lo especial que eres</div>
        <p>
          Sin darme cuenta, pasaste de ser una chica que conocí
          por un proyecto a ser la persona en la que pienso
          cuando despierto y antes de dormir.
          Empezaste a formar parte de mis días, de mis sonrisas
          y de mis pensamientos. Me di cuenta de que no quería
          solamente momentos bonitos contigo, quería crear
          muchísimos recuerdos más, acompañarte, cuidarte,
          apoyarte y estar a tu lado en los días buenos y también
          en los difíciles. Porque tú no eres una casualidad
          cualquiera, eres esa bonita coincidencia que agradezco
          haber encontrado. 💗
        </p>
      </div>

      <div className="momento">
        <h3>Hoy, mañana y siempre: te elijo a ti 💍</h3>
        <div className="fecha">Nuestra historia apenas comienza</div>

          <p>
            Geraldine, si algo tengo claro es que quiero seguir
            escribiendo esta historia contigo. Quiero más citas,
            más películas, más besos, más abrazos, más risas y
            muchísimos momentos que algún día podamos recordar
            con una sonrisa.

            No prometo que todos los días serán perfectos, pero
            sí quiero prometerte que mis sentimientos son sinceros
            y que quiero seguir construyendo algo bonito contigo.
            Gracias por llegar a mi vida y hacerla tan especial.

            Si pudiera volver al día en que te conocí, volvería
            a hablarte, volvería a elegirte y volvería a enamorarme
            de ti. Porque entre tantas personas en este mundo,
            qué bonito que mi historia haya comenzado contigo.

            Y ¿sabes qué, mi amor? Yo no quiero que seas solamente
            parte de mi presente, quiero que seas parte de todos
            mis mañanas. Quiero que algún día podamos mirarnos
            vestidos de novios, tomarnos de las manos y recordar
            lo bonito que fue comenzar con aquel proyecto que
            terminó uniéndonos. 💍

            Quiero casarme contigo, bb. Quiero construir un hogar
            a tu lado, despertar contigo, compartir nuestros sueños,
            superar juntos los días difíciles y celebrar cada
            pequeña alegría. Quiero que algún día tengamos una
            familia y podamos contar nuestra historia diciendo:
            "Mira todo lo que comenzó con un simple proyecto". ❤️

            No sé qué nos tiene preparado el futuro, pero sí sé
            que me encantaría vivirlo contigo. Y si la vida me
            diera mil oportunidades de elegir, las mil veces
            volvería a elegirte a ti.

            Te amo, mi Geraldine. Mi presente, mi futuro y
            mi futura esposa. ❤️💍
          </p>

      </div>
    </div>
  </div>
</section>


        {/* -------- 6. CARTA -------- */}
        <section className={`slide ${actual === 5 ? "activa" : ""}`}>
          <div className="slide-inner">
            <h2>Una Carta Para Ti</h2>
            <p className="subtitulo">Escrita con el corazón 💌</p>
            <div className="carta-caja">
              <div className="sobre">💌</div>
              <p className="tx">
                Preparé algo especial para ti.
                <br />
                Ábrelo cuando estés lista.
              </p>
              <button className="btn" onClick={() => setModalCarta(true)}>
                Abrir mi carta
              </button>
            </div>
          </div>
        </section>

        {/* -------- 7. PREGUNTA -------- */}
        <section className={`slide ${actual === 6 ? "activa" : ""}`}>
          <div className="slide-inner">
            <h2>Una última pregunta...</h2>
            <div className="pregunta-grande">¿Me amas? 🥺</div>
            <div className="botones-pregunta">
              <button
                className="btn"
                onClick={onSi}
                style={{
                  transform: `scale(${btnSiScale})`,
                  transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
                }}
              >
                {btnSiTexto}
              </button>
              {!btnNoHidden && (
                <button
                  className="btn"
                  id="btnNo"
                  onMouseEnter={huir}
                  onClick={(e) => {
                    e.preventDefault();
                    huir();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    huir();
                  }}
                  style={{
                    transform: `translate(${btnNoPos.x}px, ${btnNoPos.y}px)`,
                    transition: "transform .3s ease",
                  }}
                >
                  {btnNoTexto}
                </button>
              )}
            </div>
            {respuesta && <p id="respuesta">{respuesta}</p>}
          </div>
        </section>
      </div>

      {/* ============================================================
          NAVEGACIÓN
          ============================================================ */}
      <nav id="nav">
        <button
          className="flecha-nav"
          onClick={() => ir(actual - 1)}
          disabled={actual === 0}
        >
          ‹
        </button>
        <div id="dots">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              className={`dot ${i === actual ? "activo" : ""}`}
              onClick={() => ir(i)}
            />
          ))}
        </div>
        <button
          className="flecha-nav"
          onClick={() => ir(actual + 1)}
          disabled={actual === totalSlides - 1}
        >
          ›
        </button>
      </nav>

      {/* ============================================================
          MODAL DE LA CARTA
          ============================================================ */}
      {modalCarta && (
        <div
          id="modalCarta"
          className="abierto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalCarta(false);
          }}
        >
          <div className="modal-caja">
            <button className="cerrar" onClick={() => setModalCarta(false)}>
              ✕
            </button>
            <div className="carta-texto">
              <p>Mi amor:</p>
              <p>
                No sé exactamente en qué momento dejaste de ser alguien más y te
                convertiste en mi persona favorita. Solo sé que un día empecé a
                pensar en ti al despertar, y ya no pude parar.
              </p>
              <p>
                Gracias por cada risa, por cada abrazo, por quedarte conmigo
                incluso cuando no soy fácil. Gracias por quererme con mis
                defectos y por hacerme querer ser una mejor persona cada día.
              </p>
              <p>
                Si pudiera volver a empezar, te elegiría otra vez. Y si tuviera
                que elegir mil veces más, en todas te escogería a ti.
              </p>
              <p>Te amo más de lo que estas palabras pueden decir. 💕</p>
              <div className="firma">
                Siempre Tuyo ,
                <br />
                Jherson Serna 💖
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ESTILOS
          ============================================================ */}
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
        }
        body {
          font-family: 'Poppins', sans-serif;
          background: linear-gradient(160deg, #fff0f6 0%, #ffe3ee 30%, #f7e2ff 65%, #ffeaf3 100%);
          color: #5c1f3a;
        }

        .corazones-fondo {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .corazon-fondo {
          position: absolute; bottom: -70px; color: #ff8fb8; opacity: 0;
          animation: subir linear infinite; user-select: none;
        }
        @keyframes subir {
          0% { transform: translateY(0) rotate(0deg) scale(.8); opacity: 0; }
          10% { opacity: .5; }
          85% { opacity: .5; }
          100% { transform: translateY(-115vh) rotate(360deg) scale(1.2); opacity: 0; }
        }
        .corazon-click {
          position: fixed; pointer-events: none; z-index: 999;
          font-size: 22px; animation: explota 1.1s ease-out forwards;
        }
        @keyframes explota {
          0% { transform: translate(-50%,-50%) scale(.4); opacity: 1; }
          100% { transform: translate(-50%,-220%) scale(1.6); opacity: 0; }
        }
        @keyframes latir { 0%,100% { transform: scale(1); } 50% { transform: scale(1.22); } }
        @keyframes flotar { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

        .btn {
          font-family: 'Poppins', sans-serif;
          font-size: 1rem; font-weight: 600;
          padding: 14px 38px; border: none; border-radius: 60px;
          background: linear-gradient(135deg,#ff7eb3,#ff4f8b);
          color: #fff; cursor: pointer;
          box-shadow: 0 10px 30px rgba(255,79,139,.45);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .btn:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 16px 40px rgba(255,79,139,.6); }
        .btn:active { transform: scale(.97); }

        #slides { position: fixed; inset: 0; z-index: 1; }
        .slide {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 22px 100px;
          opacity: 0; visibility: hidden;
          transform: translateY(38px) scale(.97);
          transition: opacity .6s ease, transform .6s cubic-bezier(.4,.2,.2,1), visibility .6s;
          overflow-y: auto; overscroll-behavior: contain;
        }
        .slide::-webkit-scrollbar { width: 0; }
        .slide { scrollbar-width: none; }
        .slide.activa { opacity: 1; visibility: visible; transform: none; }
        .slide-inner { width: 100%; max-width: 1000px; margin: auto; }

        .slide h2 {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(1.7rem,5vw,2.6rem);
          text-align: center; color: #c2236b; margin-bottom: 6px;
        }
        .slide .subtitulo {
          text-align: center; color: #a05a7c; font-weight: 300;
          margin-bottom: 26px; font-size: .9rem;
        }

        .corona { font-size: 38px; margin-bottom: 6px; animation: flotar 3s ease-in-out infinite; text-align: center; }
        #maquina {
          font-size: clamp(.95rem,3.2vw,1.2rem);
          color: #a05a7c; font-weight: 300;
          min-height: 2.2em; max-width: 600px; margin: 0 auto; text-align: center;
        }
        #slides .slide:nth-child(1) h1 {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(2.8rem,11vw,6rem);
          line-height: 1.05; text-align: center;
          background: linear-gradient(120deg,#ff2d78,#c2236b,#8a2be2,#ff2d78);
          background-size: 300% 300%;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: degradado 8s ease infinite;
          margin-bottom: 10px;
        }
        @keyframes degradado {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        #slides .slide:nth-child(1) .nombre {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(1.6rem,5.5vw,2.7rem);
          color: #8a2be2; margin-bottom: 18px; text-align: center;
        }
        .cursor {
          display: inline-block; width: 2px; height: 1.1em;
          background: #ff4f8b; margin-left: 3px;
          vertical-align: middle; animation: parpadeo .8s step-end infinite;
        }
        @keyframes parpadeo { 50% { opacity: 0; } }
        .pista {
          margin-top: 34px; text-align: center;
          font-size: .78rem; letter-spacing: 1.5px; text-transform: uppercase;
          color: #c78aa8; font-weight: 600;
          animation: flotar 2s ease-in-out infinite;
        }

        .contador {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 14px; max-width: 700px; margin: 0 auto;
        }
        .contador .caja {
          background: rgba(255,255,255,.78);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.95);
          border-radius: 20px;
          padding: 22px 6px; text-align: center;
          box-shadow: 0 12px 30px rgba(194,35,107,.12);
          transition: transform .3s ease;
        }
        .contador .caja:hover { transform: translateY(-6px); }
        .contador .num {
          display: block; font-family: 'Dancing Script', cursive;
          font-size: clamp(1.6rem,5.5vw,2.6rem);
          font-weight: 700; color: #c2236b; line-height: 1;
        }
        .contador .eti {
          display: block; margin-top: 7px;
          font-size: .65rem; letter-spacing: 2px;
          text-transform: uppercase; color: #a05a7c; font-weight: 600;
        }

        .razones {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 14px; max-width: 820px; margin: 0 auto;
        }
        .razon { perspective: 1200px; height: clamp(120px,17vh,165px); cursor: pointer; }
        .razon-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform .7s cubic-bezier(.4,.2,.2,1);
          transform-style: preserve-3d;
        }
        .razon.volteada .razon-inner { transform: rotateY(180deg); }
        .razon-cara {
          position: absolute; inset: 0;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          border-radius: 20px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 14px; text-align: center;
        }
        .razon-frente {
          background: linear-gradient(135deg,#ff9ec4,#ff5c96);
          color: #fff; box-shadow: 0 12px 28px rgba(255,92,150,.32);
        }
        .razon-frente .emoji { font-size: 28px; margin-bottom: 6px; }
        .razon-frente span { font-weight: 600; font-size: .88rem; line-height: 1.25; }
        .razon-frente small { display: block; margin-top: 6px; opacity: .85; font-size: .62rem; font-weight: 300; }
        .razon-atras {
          background: #fff; transform: rotateY(180deg);
          border: 2px solid #ffd0e2; color: #5c1f3a;
          font-size: .78rem; font-weight: 300; line-height: 1.5;
          box-shadow: 0 12px 28px rgba(194,35,107,.12);
        }

        .galeria {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 12px; max-width: 620px; margin: 0 auto;
        }
        .foto {
          position: relative; aspect-ratio: 1/1;
          border-radius: 18px; overflow: hidden;
          background: linear-gradient(135deg,#ffd6e6,#e9d5ff);
          display: flex; align-items: center; justify-content: center;
          font-size: 34px;
          box-shadow: 0 10px 26px rgba(194,35,107,.15);
          transition: transform .4s ease, box-shadow .4s ease;
        }
        .foto img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .foto:hover { transform: scale(1.05) rotate(-1.5deg); box-shadow: 0 18px 40px rgba(194,35,107,.3); }

        .timeline {
          position: relative; max-width: 620px; margin: 0 auto;
          padding-left: 34px;
        }
        .timeline::before {
          content: ''; position: absolute; left: 8px; top: 6px; bottom: 6px; width: 3px;
          background: linear-gradient(to bottom,#ff7eb3,#c9a0ff); border-radius: 4px;
        }
        .momento { position: relative; margin-bottom: 18px; }
        .momento::before {
          content: '💗'; position: absolute; left: -34px; top: 0;
          font-size: 16px; filter: drop-shadow(0 0 8px rgba(255,120,170,.7));
        }
        .momento h3 {
          font-family: 'Dancing Script', cursive;
          font-size: 1.25rem; color: #c2236b; margin-bottom: 2px; line-height: 1.2;
        }
        .momento .fecha {
          font-size: .62rem; letter-spacing: 1.5px; text-transform: uppercase;
          color: #b4789a; font-weight: 600;
        }
        .momento p { margin-top: 4px; font-weight: 300; line-height: 1.5; color: #6d3350; font-size: .82rem; }

        .carta-caja {
          background: rgba(255,255,255,.85);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.95);
          border-radius: 26px;
          padding: 38px 28px;
          box-shadow: 0 18px 45px rgba(194,35,107,.14);
          max-width: 520px; margin: 0 auto; text-align: center;
        }
        .carta-caja .sobre { font-size: 52px; margin-bottom: 14px; animation: flotar 3s ease-in-out infinite; }
        .carta-caja p.tx { font-weight: 300; color: #a05a7c; font-size: .92rem; margin-bottom: 22px; line-height: 1.6; }

        #modalCarta {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(60,15,36,.65);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 22px;
          opacity: 0; visibility: hidden;
          transition: opacity .45s ease, visibility .45s ease;
        }
        #modalCarta.abierto { opacity: 1; visibility: visible; }
        .modal-caja {
          position: relative;
          background: linear-gradient(160deg,#fffafc,#fff2f7);
          border-radius: 26px;
          padding: 34px 26px;
          max-width: 600px; width: 100%;
          max-height: 84vh; overflow-y: auto;
          box-shadow: 0 26px 70px rgba(60,15,36,.45);
          transform: scale(.9) translateY(20px);
          transition: transform .5s cubic-bezier(.34,1.56,.64,1);
          scrollbar-width: none;
        }
        .modal-caja::-webkit-scrollbar { width: 0; }
        #modalCarta.abierto .modal-caja { transform: scale(1) translateY(0); }
        .modal-caja .cerrar {
          position: absolute; top: 14px; right: 14px;
          width: 36px; height: 36px; border-radius: 50%;
          border: none; cursor: pointer;
          background: #ffe0ec; color: #c2236b;
          font-size: 16px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          transition: transform .25s ease, background .25s;
        }
        .modal-caja .cerrar:hover { transform: rotate(90deg); background: #ffc9de; }
        .carta-texto {
          text-align: left; font-weight: 300; line-height: 1.85;
          color: #5c1f3a; font-size: .95rem;
        }
        .carta-texto p { margin-bottom: 14px; }
        .carta-texto .firma {
          font-family: 'Dancing Script', cursive;
          font-size: 1.7rem; color: #c2236b;
          text-align: right; margin-top: 22px;
        }

        #slides .slide:nth-child(7) .slide-inner { text-align: center; }
        .pregunta-grande {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(2.2rem,8vw,4rem);
          color: #c2236b; margin: 10px 0 34px;
          text-shadow: 0 6px 24px rgba(255,120,170,.35);
        }
        .botones-pregunta {
          display: flex; gap: 20px; flex-wrap: wrap;
          align-items: center; justify-content: center;
          position: relative; min-height: 80px;
        }
        #btnNo {
          background: linear-gradient(135deg,#b9b9c9,#8e8ea3);
          box-shadow: 0 10px 26px rgba(120,120,150,.35);
        }
        #respuesta {
          margin-top: 28px;
          font-family: 'Dancing Script', cursive;
          font-size: clamp(1.5rem,5vw,2.4rem);
          color: #c2236b; min-height: 1.3em;
        }

        #nav {
          position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%);
          z-index: 50;
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.95);
          padding: 7px 12px; border-radius: 60px;
          box-shadow: 0 12px 34px rgba(194,35,107,.2);
        }
        .flecha-nav {
          width: 38px; height: 38px; border-radius: 50%;
          border: none; cursor: pointer;
          background: linear-gradient(135deg,#ff7eb3,#ff4f8b);
          color: #fff; font-size: 19px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 16px rgba(255,79,139,.4);
          transition: transform .25s ease, opacity .25s;
          line-height: 1; padding-bottom: 2px;
        }
        .flecha-nav:hover { transform: scale(1.12); }
        .flecha-nav:disabled { opacity: .3; cursor: default; transform: none; }
        #dots { display: flex; gap: 7px; align-items: center; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #ffc2da; border: none; cursor: pointer; padding: 0;
          transition: all .35s cubic-bezier(.34,1.56,.64,1);
        }
        .dot.activo { width: 24px; border-radius: 20px; background: linear-gradient(135deg,#ff7eb3,#ff4f8b); }

        @media (max-width: 700px) {
          .razones { grid-template-columns: repeat(2,1fr); gap: 10px; }
          .razon { height: clamp(108px,15vh,140px); }
          .razon-frente .emoji { font-size: 22px; }
          .razon-frente span { font-size: .76rem; }
          .razon-atras { font-size: .68rem; padding: 10px; }
          .galeria { max-width: 400px; gap: 9px; }
          .slide { padding: 50px 16px 92px; }
          .contador { gap: 9px; }
          .contador .caja { padding: 16px 4px; border-radius: 16px; }
          .momento p { font-size: .76rem; }
        }
        @media (max-height: 640px) {
          .slide { padding: 36px 16px 86px; }
          .slide h2 { font-size: 1.5rem; }
          .slide .subtitulo { margin-bottom: 16px; font-size: .8rem; }
          .razon { height: 105px; }
          .galeria { max-width: 330px; }
          .carta-caja { padding: 24px 20px; }
        }
          
/* HISTORIA: más espacio arriba y desplazamiento cómodo */
.historia-slide {
  justify-content: flex-start;
  padding-top: 85px;
  padding-bottom: 110px;
  overflow-y: auto;
}

.historia-inner {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding-top: 15px;
  padding-bottom: 25px;
}

.historia-inner h2 {
  margin-bottom: 12px;
}

.historia-inner .subtitulo {
  margin-bottom: 38px;
}

.historia-inner .timeline {
  max-width: 680px;
  margin: 0 auto;
}

.historia-inner .momento {
  margin-bottom: 32px;
}

.historia-inner .momento p {
  line-height: 1.85;
  font-size: .88rem;
  margin-top: 10px;
}

/* Ajustes para celulares */
@media (max-width: 700px) {
  .historia-slide {
    padding: 75px 20px 105px;
  }

  .historia-inner {
    padding-top: 10px;
  }

  .historia-inner .subtitulo {
    margin-bottom: 30px;
  }

  .historia-inner .momento {
    margin-bottom: 28px;
  }

  .historia-inner .momento p {
    font-size: .79rem;
    line-height: 1.8;
  }
}

      `}</style>
    </>
  );
}