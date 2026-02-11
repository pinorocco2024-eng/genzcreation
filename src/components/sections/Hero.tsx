import { useEffect, useState } from "react";

export const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-[92vh] flex items-center justify-center px-6 pt-28 pb-16 overflow-hidden">
      {/* Overlay contrasto (non blocca click) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/80 via-background/30 to-background/90" />
      <div className="pointer-events-none absolute inset-0 gradient-glow opacity-30" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-10 items-center">
          <div>
            <div
              className={[
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-xl shadow-premium",
                "text-sm text-foreground/70",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
                "transition-all duration-700 ease-out",
              ].join(" ")}
            >
              <span className="w-2 h-2 rounded-full bg-primary shadow-glow" />
              Design futuristico • 3D • performance • conversione
            </div>

            <h1
              className={[
                "mt-6 font-black tracking-tight leading-[0.95]",
                "text-5xl sm:text-6xl lg:text-7xl",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                "transition-all duration-700 ease-out delay-100",
              ].join(" ")}
            >
              <span className="hero-text">Siti web</span>{" "}
              <span className="text-foreground">moderni</span>
              <br />
              <span className="text-foreground/90">con</span>{" "}
              <span className="brand-gradient">effetti 3D</span>
            </h1>

            <p
              className={[
                "mt-6 max-w-2xl text-lg sm:text-xl text-foreground/65 leading-relaxed",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                "transition-all duration-700 ease-out delay-200",
              ].join(" ")}
            >
              Creiamo esperienze digitali ad alto impatto: design premium, animazioni fluide e tecnologia
              all’avanguardia. Un sito che sembra “del futuro”, ma che converte davvero.
            </p>

            <div
              className={[
                "mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                "transition-all duration-700 ease-out delay-300",
              ].join(" ")}
            >
              <a href="#contact" className="btn-premium px-6 py-3 rounded-2xl font-semibold text-primary-foreground">
                Inizia un progetto
              </a>

              <a
                href="#portfolio"
                className="glass-button px-6 py-3 rounded-2xl font-semibold text-foreground hover:shadow-glow"
              >
                Guarda i lavori
              </a>

              <a
                href="#play"
                className="glass-button px-6 py-3 rounded-2xl font-semibold text-foreground hover:shadow-accent"
                title="Vai alla sezione dove puoi giocare col 3D"
              >
                Gioca col 3D
              </a>
            </div>

            <div
              className={[
                "mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                "transition-all duration-700 ease-out delay-500",
              ].join(" ")}
            >
              <div className="rounded-2xl border border-border/50 bg-card/35 backdrop-blur-xl p-4 shadow-premium">
                <div className="text-2xl font-black brand-gradient">3D</div>
                <div className="text-sm text-foreground/60 mt-1">Esperienze immersive</div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/35 backdrop-blur-xl p-4 shadow-premium">
                <div className="text-2xl font-black brand-gradient">UX</div>
                <div className="text-sm text-foreground/60 mt-1">Animazioni premium</div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-card/35 backdrop-blur-xl p-4 shadow-premium">
                <div className="text-2xl font-black brand-gradient">SEO</div>
                <div className="text-sm text-foreground/60 mt-1">Velocità & ranking</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
