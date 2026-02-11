import { motion } from "framer-motion";

const Globe = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="py-16 px-6"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Operiamo da remoto 🌍
          <br />
          ma le nostre radici sono a <span className="text-primary">Legnano (MI)</span>
        </h2>

        <p className="max-w-3xl mx-auto mb-12 text-lg md:text-xl text-foreground/70">
          Un globo 3D interattivo per mostrarti da dove tutto è iniziato — e ricordare che oggi lavoriamo da ovunque.
        </p>

        <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-glow-intense">
          <iframe
            title="Globo interattivo Cesium"
            src="https://ion.cesium.com/stories/viewer/?id=ded26143-ee86-4056-827c-c10dec8ba9e7"
            className="w-full h-[600px] border-0"
            allow="fullscreen"
            allowFullScreen
          />
        </div>

        <p className="mt-8 text-foreground/60">
          Ruota, esplora e scopri la nostra presenza globale ✨
        </p>
      </div>
    </motion.section>
  );
};

export default Globe;
