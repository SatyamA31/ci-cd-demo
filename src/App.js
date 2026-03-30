// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>My CI/CD App 🚀 Satyam</h1>
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// my portfollio website details start here -----------------------------------------------------

// ─── Remove default CRA imports (logo.svg and App.css not needed) ───────────
import { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from "framer-motion";

// ─── THEME ───────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#050812",
  surface: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent1: "#7c3aed",
  accent2: "#06b6d4",
  accent3: "#f59e0b",
  text: "#f1f5f9",
  muted: "#94a3b8",
};
const LIGHT = {
  bg: "#f8fafc",
  surface: "rgba(0,0,0,0.04)",
  border: "rgba(0,0,0,0.08)",
  accent1: "#7c3aed",
  accent2: "#0891b2",
  accent3: "#d97706",
  text: "#0f172a",
  muted: "#64748b",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

function useTheme() {
  const [dark, setDark] = useState(true);
  return { theme: dark ? DARK : LIGHT, dark, toggle: () => setDark(d => !d) };
}

// ─── 3D COMPONENTS ───────────────────────────────────────────────────────────
function AnimatedSphere() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.2;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.6, 64, 64]}>
        <MeshDistortMaterial
          color="#7c3aed"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>
      <Sphere args={[2.0, 32, 32]}>
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.08} />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const points = useRef();
  const count = 1200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }
  useFrame(({ clock }) => {
    if (points.current) points.current.rotation.y = clock.getElapsedTime() * 0.03;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#7c3aed" size={0.04} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function ContactOrb() {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.2;
    }
  });
  return (
    <Float speed={1.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.2, 48, 48]}>
        <MeshDistortMaterial
          color="#06b6d4"
          distort={0.5}
          speed={3}
          roughness={0.2}
          metalness={0.9}
        />
      </Sphere>
    </Float>
  );
}

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function Cursor({ theme }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    const move = e => setPos({ x: e.clientX, y: e.clientY });
    const over = e => setHovered(!!e.target.closest("a,button,[data-hover]"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);
  return (
    <>
      <motion.div
        animate={{ x: pos.x - 6, y: pos.y - 6 }}
        transition={{ type: "spring", stiffness: 800, damping: 40 }}
        style={{
          position: "fixed", top: 0, left: 0, width: 12, height: 12,
          borderRadius: "50%", background: theme.accent1,
          pointerEvents: "none", zIndex: 9999, mixBlendMode: "screen",
        }}
      />
      <motion.div
        animate={{ x: pos.x - 20, y: pos.y - 20, scale: hovered ? 1.8 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        style={{
          position: "fixed", top: 0, left: 0, width: 40, height: 40,
          borderRadius: "50%", border: `1px solid ${theme.accent2}`,
          pointerEvents: "none", zIndex: 9998, opacity: 0.5,
        }}
      />
    </>
  );
}

// ─── SCROLL PROGRESS BAR ─────────────────────────────────────────────────────
function ScrollBar({ theme }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 3,
        transformOrigin: "0%", scaleX,
        background: `linear-gradient(90deg, ${theme.accent1}, ${theme.accent2})`,
        zIndex: 1000,
      }}
    />
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function Loading({ theme }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: theme.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", zIndex: 9000,
    }}>
      <div style={{ width: 200, height: 200 }}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <Sphere args={[1, 32, 32]}>
            <MeshDistortMaterial color="#7c3aed" distort={0.6} speed={5} roughness={0} metalness={1} />
          </Sphere>
        </Canvas>
      </div>
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{
          color: theme.muted, marginTop: 16,
          fontFamily: "'Syne', sans-serif", letterSpacing: 4, fontSize: 13,
        }}
      >
        INITIALIZING
      </motion.p>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ theme, dark, toggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["About", "Skills", "Projects", "Experience", "Contact"];
  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 clamp(1rem, 4vw, 4rem)", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        background: scrolled
          ? (dark ? "rgba(5,8,18,0.85)" : "rgba(248,250,252,0.85)")
          : "transparent",
        borderBottom: scrolled ? `1px solid ${theme.border}` : "none",
        transition: "all 0.3s",
      }}
    >
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20,
        background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        SP.
      </span>

      {/* Desktop */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="desktop-nav">
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} data-hover style={{
            color: theme.muted, textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, letterSpacing: 0.5,
            transition: "color 0.2s",
          }}
            onMouseEnter={e => (e.target.style.color = theme.accent2)}
            onMouseLeave={e => (e.target.style.color = theme.muted)}
          >{l}</a>
        ))}
        <button onClick={toggle} data-hover style={{
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: 8, padding: "6px 14px", cursor: "pointer",
          color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13,
        }}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Mobile burger */}
      <button
        className="mobile-burger"
        onClick={() => setMobileOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", color: theme.text, fontSize: 22 }}
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu"
            style={{
              position: "absolute", top: 64, left: 0, right: 0,
              background: dark ? "rgba(5,8,18,0.96)" : "rgba(248,250,252,0.96)",
              backdropFilter: "blur(20px)",
              padding: "1.5rem", display: "flex", flexDirection: "column", gap: 20,
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)} style={{
                color: theme.text, textDecoration: "none",
                fontFamily: "'Syne', sans-serif", fontSize: 18,
              }}>{l}</a>
            ))}
            <button onClick={toggle} style={{
              background: "none", border: "none", color: theme.text,
              textAlign: "left", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 16,
            }}>
              {dark ? "☀️ Light mode" : "🌙 Dark mode"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ theme }) {
  const { scrollY } = useScroll();
  const y       = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="hero" style={{
      position: "relative", height: "100vh", overflow: "hidden",
      display: "flex", alignItems: "center", background: theme.bg,
    }}>
      {/* 3D canvas background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]}   intensity={1.5} color="#7c3aed" />
          <pointLight position={[-5, -5, 5]} intensity={0.8} color="#06b6d4" />
          <Suspense fallback={null}>
            <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1} />
            <ParticleField />
            <AnimatedSphere />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background:
          "radial-gradient(ellipse at 60% 50%, rgba(124,58,237,0.1) 0%, transparent 70%), " +
          "radial-gradient(ellipse at 40% 80%, rgba(6,182,212,0.08) 0%, transparent 60%)",
      }} />

      <motion.div style={{
        y, opacity, position: "relative", zIndex: 2,
        padding: "0 clamp(1.5rem, 6vw, 8rem)", maxWidth: 800,
      }}>
        {/* Availability badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 24,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ color: theme.accent2, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
            Available for opportunities
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(3rem, 7vw, 5.5rem)", lineHeight: 1.05, margin: "0 0 0.2em",
          }}
        >
          <span style={{ color: theme.text }}>Satyam </span>
          <span style={{
            background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Pal</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            color: theme.accent3, marginBottom: 16, letterSpacing: 1,
          }}
        >
          Full Stack Developer · AI Enthusiast
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.7 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
            color: theme.muted, maxWidth: 520, lineHeight: 1.7, marginBottom: 40,
          }}
        >
          Building scalable apps with React, FastAPI, and modern cloud technologies
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
        >
          <a href="#projects" data-hover style={{
            padding: "14px 32px", borderRadius: 12, textDecoration: "none",
            background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
            color: "#fff", fontFamily: "'Syne', sans-serif",
            fontWeight: 600, fontSize: 15, letterSpacing: 0.5,
            boxShadow: "0 0 30px rgba(124,58,237,0.3)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(124,58,237,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.3)"; }}
          >
            View Projects →
          </a>
          <a href="#contact" data-hover style={{
            padding: "14px 32px", borderRadius: 12, textDecoration: "none",
            background: "transparent", border: `1px solid ${theme.border}`,
            color: theme.text, fontFamily: "'Syne', sans-serif",
            fontWeight: 600, fontSize: 15, backdropFilter: "blur(8px)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent2; e.currentTarget.style.color = theme.accent2; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.text; }}
          >
            Contact Me
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
        style={{
          position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
          zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}
      >
        <span style={{ color: theme.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 2 }}>SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${theme.accent1}, transparent)` }}
        />
      </motion.div>
    </section>
  );
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
function Section({ id, children, theme, style = {} }) {
  return (
    <section id={id} style={{
      padding: "clamp(4rem, 8vw, 8rem) clamp(1.5rem, 6vw, 8rem)",
      background: theme.bg, position: "relative", ...style,
    }}>
      {children}
    </section>
  );
}

function SectionTitle({ children, theme }) {
  const ref    = useRef();
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={fadeUp(0)}
      style={{ marginBottom: "clamp(2rem, 5vw, 4rem)" }}
    >
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 3,
        color: theme.accent2, textTransform: "uppercase", display: "block", marginBottom: 8,
      }}>
        ── {typeof children === "string" ? children.split(" ")[0] : ""}
      </span>
      <h2 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: "clamp(2rem, 4vw, 3rem)", color: theme.text, margin: 0, lineHeight: 1.1,
      }}>
        {children}
      </h2>
    </motion.div>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
function About({ theme }) {
  const ref    = useRef();
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const highlights = [
    { icon: "⚡", title: "Frontend",  desc: "React.js, Vue.js, Next.js — pixel-perfect UIs",      color: theme.accent2 },
    { icon: "🔧", title: "Backend",   desc: "FastAPI, Spring Boot — scalable REST APIs",           color: theme.accent1 },
    { icon: "🗄️", title: "Data",      desc: "MySQL, Redis, PostgreSQL — reliable persistence",     color: theme.accent3 },
    { icon: "🤖", title: "AI / ML",   desc: "OpenAI, embeddings, LLM integrations",               color: "#22c55e"     },
  ];

  return (
    <Section id="about" theme={theme}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle theme={theme}>About Me</SectionTitle>
        <div ref={ref} style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "clamp(2rem, 5vw, 5rem)", alignItems: "center",
        }}>
          <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp(0.1)}>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
              color: theme.muted, lineHeight: 1.85, marginBottom: 24,
            }}>
              I'm a passionate{" "}
              <span style={{ color: theme.accent2, fontWeight: 600 }}>Full Stack Developer</span>{" "}
              with a deep love for building elegant, high-performance web applications. I bridge the gap
              between clean frontend experiences and robust backend architectures.
            </p>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
              color: theme.muted, lineHeight: 1.85, marginBottom: 32,
            }}>
              With a growing focus on{" "}
              <span style={{ color: theme.accent1, fontWeight: 600 }}>AI integration</span>,
              I build systems that leverage modern LLMs, semantic search, and intelligent automation —
              turning complex data into intuitive user experiences.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {["React.js", "FastAPI", "Spring Boot", "OpenAI", "Redis", "MySQL"].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  style={{
                    padding: "6px 14px", borderRadius: 100,
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.25)",
                    color: theme.accent1,
                    fontFamily: "'DM Mono', monospace", fontSize: 13,
                  }}
                >{t}</motion.span>
              ))}
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {highlights.map((h, i) => (
              <motion.div
                key={h.title}
                initial="hidden" animate={inView ? "visible" : "hidden"}
                variants={fadeUp(0.2 + i * 0.1)}
                whileHover={{ y: -4 }}
                data-hover
                style={{
                  padding: "clamp(1rem, 2vw, 1.5rem)", borderRadius: 16,
                  background: theme.surface, border: `1px solid ${theme.border}`,
                  backdropFilter: "blur(12px)", cursor: "default", transition: "border-color 0.3s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{h.icon}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, marginBottom: 6, fontSize: 16 }}>{h.title}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", color: theme.muted, fontSize: 13, lineHeight: 1.5 }}>{h.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── SKILLS ───────────────────────────────────────────────────────────────────
const SKILLS = {
  Frontend:        [{ name: "React.js", level: 20 }, { name: "Vue.js", level: 75 }, { name: "Tailwind CSS", level: 20 }],
  Backend:         [{ name: "FastAPI", level: 70 }, { name: "Spring Boot", level: 85 }, { name: "Spring MVC", level: 80 }, { name: "Java", level: 85 }, { name: "REST APIs", level: 92 }],
  Database:        [{ name: "MySQL", level: 85 }, { name: "Redis", level: 78 }, { name: "PostgreSQL", level: 80 }, { name: "MongoDB", level: 40 }],
  "DevOps / Tools":[{ name: "Docker", level: 75 }, { name: "Git / GitHub", level: 80 }, { name: "AWS Basics", level: 68 }, { name: "CI / CD", level: 72 }, { name: "Hibernate", level: 85 }, { name: "BitBucket", level: 60 }, { name: "WINSCP", level: 100 }],
};

function SkillBar({ name, level, color, delay, inView }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", color: "#94a3b8", fontSize: 14 }}>{name}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", color, fontSize: 13 }}>{level}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 10, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ delay: delay + 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%", borderRadius: 10,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            boxShadow: `0 0 8px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

function Skills({ theme }) {
  const ref    = useRef();
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const cats   = Object.keys(SKILLS);
  const colors = [theme.accent2, theme.accent1, theme.accent3, "#22c55e"];

  return (
    <Section id="skills" theme={theme}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle theme={theme}>Skills &amp; Expertise</SectionTitle>
        <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
          {cats.map((cat, ci) => (
            <motion.div
              key={cat}
              initial="hidden" animate={inView ? "visible" : "hidden"}
              variants={fadeUp(ci * 0.1)}
              style={{
                padding: "clamp(1.2rem, 2vw, 2rem)", borderRadius: 20,
                background: theme.surface, border: `1px solid ${theme.border}`,
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 8, height: 32, borderRadius: 4, background: colors[ci], boxShadow: `0 0 12px ${colors[ci]}60` }} />
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, fontSize: 18, margin: 0 }}>{cat}</h3>
              </div>
              {SKILLS[cat].map((s, si) => (
                <SkillBar key={s.name} {...s} color={colors[ci]} delay={ci * 0.1 + si * 0.08} inView={inView} />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
const PROJECTS = [
  { title: "Legal AI",  description: "A RAG-based document Q&A system using OpenAI embeddings, FastAPI, and Vue3. Supports multi-document semantic search with Redis vector caching.", tech: ["Vue3", "FastAPI", "OpenAI", "MySQL"],              category: "AI",      github: "", demo: "#", color: "#7c3aed" },//https://github.com/satyampal
  { title: "Cess Tax Portal(Jharkhand Government)",    description: "A full-stack cess collection portal built using Java Spring Boot, Vue.js frontend, and MySQL database to enable efficient, secure, and real-time tax management.",             tech: ["Vue.js", "Spring Boot", "MySQL", "Fast2Sms"],          category: "Backend", github: "", demo: "#", color: "#06b6d4" },//https://github.com/satyampal
  { title: "DevTrack Dashboard",     description: "Real-time developer analytics dashboard built with Vue.js and FastAPI. Tracks PRs, deployments, and team velocity with beautiful charts.",       tech: ["Vue.js", "FastAPI", "PostgreSQL", "WebSocket"],     category: "React",   github: "", demo: "#", color: "#f59e0b" },//https://github.com/satyampal
  { title: "AI Code Reviewer",       description: "GitHub bot powered by GPT-4 that automatically reviews PRs, suggests improvements, and detects security vulnerabilities.",                       tech: ["Python", "OpenAI", "GitHub API", "FastAPI"],        category: "AI",      github: "", demo: "#", color: "#22c55e" },//https://github.com/satyampal
  { title: "Real-Time Chat App",     description: "Scalable chat platform with React, WebSockets, Redis pub/sub for message broadcasting, and end-to-end encryption.",                             tech: ["React", "Redis", "WebSocket", "Node.js"],           category: "React",   github: "", demo: "#", color: "#ec4899" },//https://github.com/satyampal
  { title: "Cloud Cost Optimizer",   description: "Monitors AWS resource usage, identifies waste using ML models, and generates automated optimization reports.",                                   tech: ["Python", "AWS", "FastAPI", "React"],                category: "Backend", github: "", demo: "#", color: "#f97316" },//https://github.com/satyampal
];

function TiltCard({ children }) {
  const ref = useRef();
  return (
    <div
      ref={ref}
      onMouseMove={e => {
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        ref.current.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      }}
      onMouseLeave={() => { ref.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) scale(1)"; }}
      style={{ transition: "transform 0.15s ease", height: "100%" }}
    >
      {children}
    </div>
  );
}

function Projects({ theme }) {
  const [filter, setFilter] = useState("All");
  const filters  = ["All", "React", "Backend", "AI"];
  const filtered = filter === "All" ? PROJECTS : PROJECTS.filter(p => p.category === filter);
  const ref      = useRef();
  // const inView   = useInView(ref, { once: true, margin: "-80px" });

  return (
    <Section id="projects" theme={theme}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle theme={theme}>Featured Projects</SectionTitle>

        <div ref={ref} style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} data-hover style={{
              padding: "8px 22px", borderRadius: 100, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
              border: `1px solid ${filter === f ? theme.accent1 : theme.border}`,
              background: filter === f ? "rgba(124,58,237,0.2)" : theme.surface,
              color: filter === f ? theme.accent1 : theme.muted,
              transition: "all 0.2s",
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div key={p.title} layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <TiltCard>
                  <div style={{
                    padding: "clamp(1.2rem, 2vw, 2rem)", borderRadius: 20,
                    background: theme.surface, border: `1px solid ${theme.border}`,
                    backdropFilter: "blur(12px)", height: "100%",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
                    <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: p.color + "18", filter: "blur(30px)" }} />
                    <div style={{ position: "relative" }}>
                      <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: theme.text, marginBottom: 10, marginTop: 0 }}>{p.title}</h3>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", color: theme.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{p.description}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                        {p.tech.map(t => (
                          <span key={t} style={{ padding: "3px 10px", borderRadius: 100, background: p.color + "18", border: `1px solid ${p.color}40`, color: p.color, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{t}</span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <a href={p.github} data-hover style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${theme.border}`, color: theme.muted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, transition: "all 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.text; e.currentTarget.style.color = theme.text; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = theme.muted; }}
                        >⌥ GitHub</a>
                        <a href={p.demo} data-hover style={{ padding: "8px 18px", borderRadius: 8, background: p.color + "22", border: `1px solid ${p.color}44`, color: p.color, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, transition: "background 0.2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = p.color + "40"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = p.color + "22"; }}
                        >↗ Live Demo</a>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

// ─── EXPERIENCE / TIMELINE ────────────────────────────────────────────────────
const TIMELINE = [
  { role: "Full Stack Developer", company: "TechCorp Solutions",      period: "2023 – Present", color: "#7c3aed", achievements: ["Led development of microservices architecture serving 500k+ daily users", "Integrated AI-powered search with OpenAI embeddings, reducing query time by 60%", "Built FastAPI services deployed on AWS ECS with Docker Compose"] },
  { role: "Software Engineer",    company: "Startup Labs Pvt. Ltd.",  period: "2022 – 2023",    color: "#06b6d4", achievements: ["Built React frontend dashboards with real-time WebSocket data", "Designed MySQL schemas for transactional banking features", "Reduced API response time by 40% via Redis caching strategies"] },
  { role: "Backend Intern",       company: "CloudBase Inc.",          period: "2021 – 2022",    color: "#f59e0b", achievements: ["Developed REST APIs with Spring Boot serving mobile applications", "Implemented JWT authentication and role-based access control", "Wrote unit/integration tests achieving 85% code coverage"] },
  { role: "B.Tech, Computer Science", company: "NIT Allahabad",       period: "2018 – 2022",    color: "#22c55e", achievements: ["Graduated with distinction — CGPA 8.7/10", "Published paper on NLP-based sentiment analysis", "Core team member of the competitive programming club"] },
];

function Experience({ theme }) {
  const ref    = useRef();
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Section id="experience" theme={theme}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionTitle theme={theme}>Experience &amp; Education</SectionTitle>
        <div ref={ref} style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: `linear-gradient(to bottom, ${theme.accent1}, ${theme.accent2}, transparent)` }} />
          {TIMELINE.map((item, i) => (
            <motion.div key={item.role}
              initial="hidden" animate={inView ? "visible" : "hidden"}
              variants={fadeUp(i * 0.15)}
              style={{ display: "flex", gap: 32, marginBottom: 40 }}
            >
              <div style={{ flexShrink: 0 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: i * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: item.color + "25", border: `2px solid ${item.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 16px ${item.color}40`, position: "relative", zIndex: 1,
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                </motion.div>
              </div>
              <div style={{
                flex: 1, padding: "clamp(1rem, 2vw, 1.5rem)", borderRadius: 16,
                background: theme.surface, border: `1px solid ${theme.border}`,
                backdropFilter: "blur(10px)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, margin: 0, fontSize: 18 }}>{item.role}</h3>
                    <p style={{ color: item.color, fontFamily: "'DM Sans', sans-serif", fontSize: 14, margin: "4px 0 0" }}>{item.company}</p>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 100, background: item.color + "18", border: `1px solid ${item.color}35`, color: item.color, fontFamily: "'DM Mono', monospace", fontSize: 12, whiteSpace: "nowrap" }}>{item.period}</span>
                </div>
                <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                  {item.achievements.map((a, ai) => (
                    <li key={ai} style={{ fontFamily: "'DM Sans', sans-serif", color: theme.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 4 }}>{a}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact({ theme }) {
  const [form, setForm]           = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const ref    = useRef();
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: 12,
    background: theme.surface, border: `1px solid ${theme.border}`,
    color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 15,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  };

  return (
    <Section id="contact" theme={theme}>
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "40%", opacity: 0.35, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[3, 3, 3]} intensity={1} color="#06b6d4" />
          <Suspense fallback={null}>
            <ContactOrb />
            <Stars radius={30} depth={20} count={1000} factor={3} saturation={0} fade />
          </Suspense>
        </Canvas>
      </div>

      <div ref={ref} style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <SectionTitle theme={theme}>Get In Touch</SectionTitle>
        <motion.p
          initial="hidden" animate={inView ? "visible" : "hidden"}
          variants={fadeUp(0.1)}
          style={{ fontFamily: "'DM Sans', sans-serif", color: theme.muted, fontSize: "clamp(1rem, 1.5vw, 1.1rem)", lineHeight: 1.7, marginBottom: 40 }}
        >
          Have an exciting project in mind or just want to say hi? My inbox is always open.
        </motion.p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form"
              initial="hidden" animate={inView ? "visible" : "hidden"}
              variants={fadeUp(0.2)}
              style={{ padding: "clamp(1.5rem, 4vw, 3rem)", borderRadius: 24, background: theme.surface, border: `1px solid ${theme.border}`, backdropFilter: "blur(20px)" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", color: theme.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 6 }}>Name</label>
                  <input style={inputStyle} placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = theme.accent2)}
                    onBlur={e  => (e.target.style.borderColor = theme.border)} />
                </div>
                <div>
                  <label style={{ display: "block", color: theme.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 6 }}>Email</label>
                  <input style={inputStyle} placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    onFocus={e => (e.target.style.borderColor = theme.accent2)}
                    onBlur={e  => (e.target.style.borderColor = theme.border)} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", color: theme.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 6 }}>Message</label>
                <textarea style={{ ...inputStyle, height: 140, resize: "vertical" }} placeholder="Tell me about your project..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  onFocus={e => (e.target.style.borderColor = theme.accent2)}
                  onBlur={e  => (e.target.style.borderColor = theme.border)} />
              </div>
              <button
                onClick={() => { if (form.name && form.email && form.message) setSubmitted(true); }}
                data-hover
                style={{
                  width: "100%", padding: "15px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
                  border: "none", cursor: "pointer", color: "#fff",
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16,
                  boxShadow: "0 0 30px rgba(124,58,237,0.3)", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(124,58,237,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 0 30px rgba(124,58,237,0.3)"; }}
              >
                Send Message ✉️
              </button>

              <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${theme.border}`, display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
                {[
                  { label: "GitHub",   href: "https://github.com/satyampal",         icon: "⌥" },
                  { label: "LinkedIn", href: "https://linkedin.com/in/satyampal",     icon: "✦" },
                  { label: "Email",    href: "mailto:satyam@example.com",             icon: "✉" },
                ].map(s => (
                  <a key={s.label} href={s.href} data-hover style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 18px", borderRadius: 100,
                    border: `1px solid ${theme.border}`,
                    color: theme.muted, textDecoration: "none",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent2; e.currentTarget.style.color = theme.accent2; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border;  e.currentTarget.style.color = theme.muted;   }}
                  >
                    <span>{s.icon}</span> {s.label}
                  </a>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{ padding: "4rem 2rem", textAlign: "center", borderRadius: 24, background: theme.surface, border: "1px solid rgba(34,197,94,0.3)", backdropFilter: "blur(20px)" }}
            >
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: theme.text, fontSize: 24, marginBottom: 12 }}>Message Sent!</h3>
              <p style={{ color: theme.muted, fontFamily: "'DM Sans', sans-serif" }}>Thanks for reaching out. I'll get back to you within 24 hours.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ theme }) {
  return (
    <footer style={{
      background: theme.bg, borderTop: `1px solid ${theme.border}`,
      padding: "clamp(1.5rem, 3vw, 2.5rem) clamp(1.5rem, 6vw, 8rem)",
      display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
    }}>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18,
        background: `linear-gradient(135deg, ${theme.accent1}, ${theme.accent2})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>SP.</span>
      <p style={{ color: theme.muted, fontFamily: "'DM Sans', sans-serif", fontSize: 13, margin: 0 }}>
        © 2024 Satyam Pal · Built with React &amp; Three.js
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        {[{ label: "GitHub", href: "https://github.com/satyampal" }, { label: "LinkedIn", href: "https://linkedin.com/in/satyampal" }].map(s => (
          <a key={s.label} href={s.href} data-hover style={{ color: theme.muted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 13, transition: "color 0.2s" }}
            onMouseEnter={e => (e.target.style.color = theme.accent2)}
            onMouseLeave={e => (e.target.style.color = theme.muted)}
          >{s.label}</a>
        ))}
      </div>
    </footer>
  );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function GlobalStyles({ bg }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
      *, *::before, *::after { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: ${bg}; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.5); border-radius: 2px; }
      @media (max-width: 768px) {
        .desktop-nav   { display: none !important; }
        .mobile-burger { display: block !important; }
      }
      @media (min-width: 769px) {
        .mobile-burger { display: none !important; }
        .mobile-menu   { display: none !important; }
      }
      @media (max-width: 600px) {
        .two-col { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
function App() {
  const { theme, dark, toggle } = useTheme();
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <GlobalStyles bg={theme.bg} />

      {/* Loading screen */}
      <AnimatePresence>
        {loading && (
          <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <Loading theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main app — only render after loading */}
      {!loading && (
        <>
          <Cursor theme={theme} />
          <ScrollBar theme={theme} />
          <Nav theme={theme} dark={dark} toggle={toggle} />
          <main>
            <Hero    theme={theme} dark={dark} />
            <About   theme={theme} />
            <Skills  theme={theme} />
            <Projects theme={theme} />
            <Experience theme={theme} />
            <Contact theme={theme} />
          </main>
          <Footer theme={theme} />
        </>
      )}
    </>
  );
}

export default App;


