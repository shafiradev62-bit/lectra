import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SHAPE_TYPES = ["sphere", "cube", "torus", "cone", "cylinder", "icosahedron", "dodecahedron", "organic", "molecule", "terrain", "star"] as const;

const SectionShape = z.object({
  type: z.enum(SHAPE_TYPES),
  color: z.string(),
  scale: z.number(),
  detail: z.number(),
  label: z.string(),
});

const QuizItem = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number(),
  explanation: z.string(),
});

const LessonSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  level: z.string(),
  duration: z.string(),
  intro: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    body: z.string(),
    bullets: z.array(z.string()),
    shape: SectionShape,
  })),
  vocabulary: z.array(z.object({
    term: z.string(),
    meaning: z.string(),
  })),
  quiz: z.array(QuizItem),
});

export type Lesson = z.infer<typeof LessonSchema>;

function normalizeLesson(raw: Lesson): Lesson {
  return {
    ...raw,
    sections: raw.sections.slice(0, 5).map((s) => ({
      ...s,
      bullets: s.bullets.slice(0, 4),
      shape: {
        type: SHAPE_TYPES.includes(s.shape.type) ? s.shape.type : "sphere",
        color: /^#[0-9a-fA-F]{6}$/.test(s.shape.color) ? s.shape.color : "#f5c542",
        scale: Math.max(0.5, Math.min(2, s.shape.scale || 1)),
        detail: Math.max(0, Math.min(3, Math.round(s.shape.detail || 1))),
        label: s.shape.label || s.heading,
      },
    })),
    vocabulary: raw.vocabulary.slice(0, 8),
    quiz: raw.quiz
      .filter((q) => q.options && q.options.length >= 2)
      .slice(0, 6)
      .map((q) => {
        const opts = q.options.slice(0, 4);
        while (opts.length < 4) opts.push("—");
        return {
          ...q,
          options: opts,
          correctIndex: Math.max(0, Math.min(3, Math.round(q.correctIndex || 0))),
        };
      }),
  };
}

export const generateLesson = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({
      topic: z.string().min(2).max(500),
      level: z.string().optional(),
      language: z.enum(["id", "en"]).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const lang = data.language ?? "id";
    const langName = lang === "id" ? "Bahasa Indonesia" : "English";

    // Fallback local generator if API key is missing
    if (!apiKey) {
      console.log("[generateLesson] No API key found, using Local Smart Generator");
      return { lesson: generateLocalLesson(data.topic, lang) };
    }

    const gateway = createLovableAiGatewayProvider(apiKey);

    const systemPrompt = `You are a powerful 3D learning-media generator for teachers. Produce structured, clear, engaging material in ${langName}.

Return JSON that EXACTLY matches this shape:
- title, subtitle, level (e.g. "Grade 8"), duration (e.g. "30 minutes"), intro (2-3 sentences)
- sections: array of 3-4 objects { heading, body (3-5 sentences), bullets (2-3 strings), shape }
- shape: { type: one of "sphere"|"cube"|"torus"|"cone"|"cylinder"|"icosahedron"|"dodecahedron"|"organic"|"molecule"|"terrain"|"star", color: 6-digit hex like "#f5c542", scale: number 0.8-1.5, detail: integer 1 or 2, label: short 2-4 word string }
- vocabulary: 3-5 objects { term, meaning }
- quiz: 3-4 objects { question, options (EXACTLY 4 strings), correctIndex (integer 0-3), explanation }

Strategic 3D shape selection:
- "organic": Use for biological cells, organs, plants, or anything irregular/natural.
- "molecule": Use for chemical structures, atoms, or clusters.
- "terrain": Use for geography, maps, landscapes, or surfaces.
- "star": Use for suns, stars, sparks, or special highlights.
- "sphere": Planets, eyes, simple balls.
- "torus": Fields, orbits, rings, donuts.
- "cube/cylinder/cone": Man-made objects, crystals, geometric shapes.

Every field is required. Write all visible text in ${langName}.`;

    const prompt = `Topic: ${data.topic}\nLevel: ${data.level ?? "auto"}\n\nBuild a complete lesson per the schema.`;

    const models = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
    let lastErr: unknown = null;

    for (const modelName of models) {
      try {
        const { experimental_output } = await generateText({
          model: gateway(modelName),
          system: systemPrompt,
          prompt,
          experimental_output: Output.object({ schema: LessonSchema }),
        });
        const lesson = normalizeLesson(experimental_output as Lesson);
        if (lesson.sections.length === 0) throw new Error("Empty lesson");
        return { lesson };
      } catch (err) {
        lastErr = err;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[generateLesson] ${modelName} failed:`, msg);
        if (msg.includes("429") || msg.includes("402")) break;
      }
    }

    const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
    if (msg.includes("429")) throw new Error(lang === "id" ? "Rate limit. Coba lagi sebentar." : "Rate limited. Try again shortly.");
    if (msg.includes("402")) throw new Error(lang === "id" ? "Kredit AI habis. Tambahkan kredit di workspace." : "AI credits exhausted. Add credits in workspace.");
    throw new Error(lang === "id"
      ? "Gagal membuat materi. Coba topik yang lebih spesifik."
      : "Couldn't generate lesson. Try a more specific topic.");
  });

// ─── Topic knowledge base ────────────────────────────────────────────────────
type TopicDef = {
  shape: Lesson["sections"][0]["shape"]["type"];
  color: string;
  color2: string;
  color3: string;
  id: {
    title: string; subtitle: string; intro: string;
    s1: { h: string; body: string; bullets: string[]; label: string };
    s2: { h: string; body: string; bullets: string[]; label: string };
    s3: { h: string; body: string; bullets: string[]; label: string };
    vocab: { term: string; meaning: string }[];
    quiz: { q: string; opts: string[]; ci: number; exp: string }[];
  };
  en: {
    title: string; subtitle: string; intro: string;
    s1: { h: string; body: string; bullets: string[]; label: string };
    s2: { h: string; body: string; bullets: string[]; label: string };
    s3: { h: string; body: string; bullets: string[]; label: string };
    vocab: { term: string; meaning: string }[];
    quiz: { q: string; opts: string[]; ci: number; exp: string }[];
  };
};

const TOPIC_DB: { keys: string[]; def: TopicDef }[] = [
  {
    keys: ["sel hewan", "sel", "cell", "sitoplasma", "membran", "nucleus", "nukleus"],
    def: {
      shape: "organic", color: "#a8d89a", color2: "#f4a8b8", color3: "#88b8e8",
      id: {
        title: "Struktur Sel Hewan", subtitle: "Menjelajahi organel dan fungsinya",
        intro: "Sel hewan adalah unit dasar kehidupan yang memiliki berbagai organel dengan fungsi spesifik. Setiap organel bekerja sama layaknya pabrik kecil yang menjaga sel tetap hidup dan berfungsi. Memahami struktur sel membuka pintu pemahaman tentang bagaimana makhluk hidup tumbuh, bernapas, dan berkembang biak.",
        s1: { h: "Membran Sel & Sitoplasma", label: "Membran Sel",
          body: "Membran sel adalah lapisan tipis yang mengelilingi sel dan mengontrol apa yang masuk dan keluar. Sitoplasma adalah cairan yang mengisi ruang sel dan menjadi 'rumah' bagi semua organel.",
          bullets: ["Terdiri dari lapisan ganda fosfolipid", "Bersifat semipermeabel — selektif terhadap zat yang lewat", "Sitoplasma mengandung air, garam, dan protein terlarut"] },
        s2: { h: "Inti Sel (Nukleus)", label: "Nukleus",
          body: "Nukleus adalah pusat kendali sel yang menyimpan informasi genetik dalam bentuk DNA. Di dalamnya terdapat nukleolus yang berperan dalam pembentukan ribosom.",
          bullets: ["Dilapisi membran ganda (envelope nukleus)", "Mengandung kromosom yang membawa gen", "Nukleolus mensintesis RNA ribosomal"] },
        s3: { h: "Mitokondria & Organel Lain", label: "Mitokondria",
          body: "Mitokondria dikenal sebagai 'pembangkit listrik' sel karena menghasilkan ATP melalui respirasi seluler. Organel lain seperti retikulum endoplasma dan aparatus Golgi berperan dalam sintesis dan pengiriman protein.",
          bullets: ["Mitokondria memiliki membran dalam berlipat-lipat (krista)", "RE kasar mengandung ribosom untuk sintesis protein", "Aparatus Golgi mengemas dan mengirim protein ke tujuan"] },
        vocab: [
          { term: "Organel", meaning: "Struktur kecil di dalam sel dengan fungsi khusus, seperti mitokondria dan nukleus." },
          { term: "Membran semipermeabel", meaning: "Membran yang hanya dapat dilewati oleh zat-zat tertentu." },
          { term: "ATP", meaning: "Adenosin trifosfat — molekul energi utama yang dihasilkan mitokondria." },
          { term: "Ribosom", meaning: "Organel kecil tempat sintesis protein berlangsung." },
          { term: "Sitoplasma", meaning: "Cairan kental di dalam sel yang menopang organel." },
        ],
        quiz: [
          { q: "Organel mana yang dijuluki 'pembangkit listrik' sel?", opts: ["Nukleus", "Ribosom", "Mitokondria", "Vakuola"], ci: 2, exp: "Mitokondria menghasilkan ATP melalui proses respirasi seluler." },
          { q: "Apa fungsi utama membran sel?", opts: ["Menyimpan DNA", "Mengontrol lalu lintas zat masuk/keluar", "Menghasilkan energi", "Membantu pembelahan sel"], ci: 1, exp: "Membran sel bersifat semipermeabel dan mengatur pertukaran zat." },
          { q: "Di mana informasi genetik sel disimpan?", opts: ["Sitoplasma", "Ribosom", "Mitokondria", "Nukleus"], ci: 3, exp: "DNA yang menyimpan informasi genetik terletak di dalam nukleus." },
        ],
      },
      en: {
        title: "Animal Cell Structure", subtitle: "Exploring organelles and their functions",
        intro: "Animal cells are the fundamental units of life, each containing specialized organelles that work together like a tiny factory. Understanding cell structure unlocks how living organisms grow, breathe, and reproduce.",
        s1: { h: "Cell Membrane & Cytoplasm", label: "Cell Membrane",
          body: "The cell membrane is a thin phospholipid bilayer surrounding the cell, controlling what enters and exits. The cytoplasm fills the cell with a gel-like fluid that suspends all organelles.",
          bullets: ["Made of a phospholipid bilayer", "Semipermeable — selectively allows substances through", "Cytoplasm contains water, salts and dissolved proteins"] },
        s2: { h: "The Nucleus", label: "Nucleus",
          body: "The nucleus is the cell's control center, housing genetic information as DNA. Inside, the nucleolus manufactures ribosomal RNA for protein synthesis.",
          bullets: ["Surrounded by a double nuclear envelope", "Contains chromosomes that carry genes", "Nucleolus synthesizes ribosomal RNA"] },
        s3: { h: "Mitochondria & Other Organelles", label: "Mitochondria",
          body: "Mitochondria are the cell's power plants, producing ATP through cellular respiration. The endoplasmic reticulum and Golgi apparatus handle protein synthesis and delivery.",
          bullets: ["Mitochondria have folded inner membranes (cristae)", "Rough ER is studded with ribosomes for protein synthesis", "Golgi apparatus packages and ships proteins to their destinations"] },
        vocab: [
          { term: "Organelle", meaning: "A small structure inside the cell with a specific function, like mitochondria or the nucleus." },
          { term: "Semipermeable membrane", meaning: "A membrane that only allows certain substances to pass through." },
          { term: "ATP", meaning: "Adenosine triphosphate — the main energy molecule produced by mitochondria." },
          { term: "Ribosome", meaning: "A tiny organelle where protein synthesis takes place." },
          { term: "Cytoplasm", meaning: "The gel-like fluid inside the cell that suspends organelles." },
        ],
        quiz: [
          { q: "Which organelle is called the 'powerhouse' of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], ci: 2, exp: "Mitochondria produce ATP through cellular respiration." },
          { q: "What is the main function of the cell membrane?", opts: ["Store DNA", "Control what enters and exits the cell", "Produce energy", "Help cell division"], ci: 1, exp: "The cell membrane is semipermeable and regulates substance exchange." },
          { q: "Where is the cell's genetic information stored?", opts: ["Cytoplasm", "Ribosome", "Mitochondria", "Nucleus"], ci: 3, exp: "DNA, which stores genetic information, is located inside the nucleus." },
        ],
      },
    },
  },
  {
    keys: ["tata surya", "planet", "solar system", "astronomi", "astronomy", "saturnus", "jupiter", "mars", "venus"],
    def: {
      shape: "sphere", color: "#f4a26b", color2: "#88b8e8", color3: "#f5c542",
      id: {
        title: "Tata Surya & Planet", subtitle: "Delapan planet dan misteri alam semesta",
        intro: "Tata surya kita terdiri dari Matahari dan delapan planet yang mengorbit mengelilinginya. Setiap planet memiliki karakteristik unik — mulai dari cincin Saturnus yang memukau hingga badai raksasa Jupiter yang telah berlangsung selama ratusan tahun. Memahami tata surya membantu kita mengenal posisi Bumi di alam semesta.",
        s1: { h: "Matahari sebagai Pusat", label: "Matahari",
          body: "Matahari adalah bintang berukuran sedang yang mendominasi 99,86% total massa tata surya. Energi Matahari dihasilkan melalui fusi nuklir di intinya, di mana atom hidrogen bergabung membentuk helium dan melepaskan energi luar biasa.",
          bullets: ["Suhu permukaan ±5.500°C, inti ±15 juta°C", "Menghasilkan energi lewat fusi hidrogen menjadi helium", "Gravitasinya mengikat semua benda di tata surya"] },
        s2: { h: "Planet Kebumian (Terrestrial)", label: "Planet Dalam",
          body: "Merkurius, Venus, Bumi, dan Mars adalah planet kebumian dengan permukaan padat berbatu. Bumi adalah satu-satunya planet yang diketahui memiliki kehidupan, didukung oleh air cair dan atmosfer yang tepat.",
          bullets: ["Permukaan padat dan berkerak", "Ukuran relatif lebih kecil dibanding planet gas", "Bumi memiliki lapisan atmosfer pelindung dan magnetosfer"] },
        s3: { h: "Planet Gas Raksasa", label: "Jupiter",
          body: "Jupiter, Saturnus, Uranus, dan Neptunus adalah planet gas raksasa dengan massa jauh lebih besar dari planet kebumian. Saturnus terkenal dengan cincinnya yang terdiri dari partikel es dan batu.",
          bullets: ["Jupiter adalah planet terbesar — 1.300× volume Bumi", "Cincin Saturnus terdiri dari miliaran partikel es", "Uranus dan Neptunus kaya akan es metana dan amonia"] },
        vocab: [
          { term: "Fusi nuklir", meaning: "Reaksi penggabungan inti atom ringan menjadi atom lebih berat, melepaskan energi besar." },
          { term: "Orbit", meaning: "Jalur melengkung yang ditempuh planet saat mengelilingi Matahari." },
          { term: "Gravitasi", meaning: "Gaya tarik-menarik antara benda bermassa, menjaga planet tetap di orbitnya." },
          { term: "Magnetosfer", meaning: "Lapisan medan magnet yang melindungi Bumi dari radiasi berbahaya." },
          { term: "Atmosfer", meaning: "Lapisan gas yang menyelimuti planet." },
        ],
        quiz: [
          { q: "Planet mana yang terbesar di tata surya?", opts: ["Saturnus", "Neptunus", "Jupiter", "Uranus"], ci: 2, exp: "Jupiter adalah planet terbesar dengan volume sekitar 1.300 kali volume Bumi." },
          { q: "Proses apa yang menghasilkan energi Matahari?", opts: ["Pembakaran batu bara", "Fisi nuklir", "Fusi nuklir", "Evaporasi"], ci: 2, exp: "Matahari menghasilkan energi melalui fusi nuklir, yaitu penggabungan atom hidrogen menjadi helium." },
          { q: "Planet mana yang dikenal dengan cincinnya yang mencolok?", opts: ["Jupiter", "Mars", "Venus", "Saturnus"], ci: 3, exp: "Saturnus memiliki sistem cincin paling menonjol yang terdiri dari partikel es dan batu." },
        ],
      },
      en: {
        title: "The Solar System & Planets", subtitle: "Eight planets and the mysteries of the universe",
        intro: "Our solar system consists of the Sun and eight planets orbiting it. Each planet has unique characteristics — from Saturn's stunning rings to Jupiter's storm that has raged for hundreds of years. Understanding the solar system helps us grasp Earth's place in the cosmos.",
        s1: { h: "The Sun as the Center", label: "The Sun",
          body: "The Sun is a medium-sized star that accounts for 99.86% of the solar system's total mass. Its energy comes from nuclear fusion in its core, where hydrogen atoms fuse into helium and release tremendous amounts of energy.",
          bullets: ["Surface temperature ~5,500°C, core ~15 million°C", "Energy produced by fusing hydrogen into helium", "Its gravity binds all bodies in the solar system"] },
        s2: { h: "Terrestrial Planets", label: "Inner Planets",
          body: "Mercury, Venus, Earth and Mars are terrestrial planets with solid, rocky surfaces. Earth is the only known planet with life, supported by liquid water and a suitable atmosphere.",
          bullets: ["Solid, rocky surfaces", "Relatively smaller than gas giants", "Earth has a protective atmosphere and magnetosphere"] },
        s3: { h: "Gas Giants", label: "Jupiter",
          body: "Jupiter, Saturn, Uranus and Neptune are gas giants far more massive than terrestrial planets. Saturn is famous for its rings made of billions of ice and rock particles.",
          bullets: ["Jupiter is the largest planet — 1,300× Earth's volume", "Saturn's rings contain billions of ice particles", "Uranus and Neptune are rich in methane and ammonia ice"] },
        vocab: [
          { term: "Nuclear fusion", meaning: "A reaction where light atomic nuclei combine into heavier atoms, releasing enormous energy." },
          { term: "Orbit", meaning: "The curved path a planet follows as it travels around the Sun." },
          { term: "Gravity", meaning: "The attractive force between massive objects, keeping planets in their orbits." },
          { term: "Magnetosphere", meaning: "The magnetic field layer that shields Earth from harmful radiation." },
          { term: "Atmosphere", meaning: "The layer of gas surrounding a planet." },
        ],
        quiz: [
          { q: "Which is the largest planet in the solar system?", opts: ["Saturn", "Neptune", "Jupiter", "Uranus"], ci: 2, exp: "Jupiter is the largest planet, with a volume about 1,300 times that of Earth." },
          { q: "What process generates the Sun's energy?", opts: ["Burning coal", "Nuclear fission", "Nuclear fusion", "Evaporation"], ci: 2, exp: "The Sun generates energy through nuclear fusion, fusing hydrogen atoms into helium." },
          { q: "Which planet is famous for its prominent rings?", opts: ["Jupiter", "Mars", "Venus", "Saturn"], ci: 3, exp: "Saturn has the most striking ring system, made of ice and rock particles." },
        ],
      },
    },
  },
  {
    keys: ["atom", "molekul", "molecule", "kimia", "chemistry", "ikatan", "electron", "elektron", "proton", "neutron", "bohr"],
    def: {
      shape: "molecule", color: "#88b8e8", color2: "#f5c542", color3: "#a8d89a",
      id: {
        title: "Model Atom & Struktur Kimia", subtitle: "Partikel subatom dan model Bohr",
        intro: "Atom adalah unit terkecil materi yang masih mempertahankan sifat kimianya. Meski tidak bisa dilihat dengan mata telanjang, model atom membantu kita memahami mengapa unsur-unsur berperilaku berbeda-beda dan bagaimana ikatan kimia terbentuk.",
        s1: { h: "Partikel Subatom", label: "Atom",
          body: "Setiap atom terdiri dari proton dan neutron di inti (nukleus), dikelilingi elektron yang bergerak di kulit-kulit (orbit). Jumlah proton menentukan identitas unsur — disebut nomor atom.",
          bullets: ["Proton bermuatan positif, neutron netral", "Elektron bermuatan negatif, bermassa sangat kecil", "Nomor atom = jumlah proton = identitas unsur"] },
        s2: { h: "Model Atom Bohr", label: "Model Bohr",
          body: "Niels Bohr mengusulkan bahwa elektron bergerak di orbit melingkar dengan energi tertentu di sekitar inti. Elektron bisa 'melompat' ke orbit lebih tinggi dengan menyerap energi, atau turun kembali sambil memancarkan cahaya.",
          bullets: ["Tiap orbit (kulit) menampung jumlah elektron tertentu", "Perpindahan elektron menghasilkan emisi spektrum cahaya", "Nomor kulit: K(2), L(8), M(18)…"] },
        s3: { h: "Ikatan Kimia", label: "Ikatan Ion",
          body: "Atom bergabung membentuk molekul melalui ikatan kimia. Ikatan ion terjadi saat satu atom menyerahkan elektron ke atom lain. Ikatan kovalen terjadi saat dua atom berbagi pasangan elektron.",
          bullets: ["Ikatan ion: transfer elektron (misal: NaCl)", "Ikatan kovalen: berbagi elektron (misal: H₂O, CO₂)", "Jumlah elektron valensi menentukan jenis ikatan"] },
        vocab: [
          { term: "Nomor atom", meaning: "Jumlah proton dalam inti atom; menentukan identitas unsur." },
          { term: "Elektron valensi", meaning: "Elektron di kulit terluar atom yang berperan dalam pembentukan ikatan kimia." },
          { term: "Ikatan kovalen", meaning: "Ikatan kimia di mana dua atom berbagi sepasang elektron." },
          { term: "Ion", meaning: "Atom yang telah kehilangan atau mendapatkan elektron sehingga bermuatan listrik." },
          { term: "Isomer", meaning: "Molekul dengan rumus kimia sama tetapi susunan atom berbeda." },
        ],
        quiz: [
          { q: "Apa yang menentukan identitas suatu unsur kimia?", opts: ["Jumlah neutron", "Massa atom", "Jumlah proton", "Jumlah elektron valensi"], ci: 2, exp: "Jumlah proton (nomor atom) menentukan identitas unsur." },
          { q: "Apa yang terjadi ketika elektron berpindah ke orbit lebih rendah?", opts: ["Menyerap energi", "Memancarkan cahaya", "Atom hancur", "Proton bertambah"], ci: 1, exp: "Saat elektron turun ke orbit lebih rendah, ia memancarkan energi dalam bentuk cahaya." },
          { q: "Ikatan apa yang terjadi pada molekul air (H₂O)?", opts: ["Ikatan ion", "Ikatan logam", "Ikatan kovalen", "Ikatan van der Waals"], ci: 2, exp: "Air terbentuk dari ikatan kovalen antara hidrogen dan oksigen yang berbagi elektron." },
        ],
      },
      en: {
        title: "Atoms & Chemical Structure", subtitle: "Subatomic particles and the Bohr model",
        intro: "Atoms are the smallest units of matter that still retain their chemical properties. Though invisible to the naked eye, atomic models help us understand why elements behave differently and how chemical bonds form.",
        s1: { h: "Subatomic Particles", label: "Atom",
          body: "Every atom has protons and neutrons in its nucleus, surrounded by electrons moving in shells. The number of protons defines the element's identity — called the atomic number.",
          bullets: ["Protons are positively charged, neutrons are neutral", "Electrons are negatively charged with negligible mass", "Atomic number = number of protons = element identity"] },
        s2: { h: "The Bohr Atomic Model", label: "Bohr Model",
          body: "Niels Bohr proposed that electrons orbit the nucleus in fixed circular shells with defined energy levels. Electrons can 'jump' to higher orbits by absorbing energy, then fall back emitting light.",
          bullets: ["Each shell holds a specific maximum number of electrons", "Electron transitions produce emission spectra", "Shell numbers: K(2), L(8), M(18)…"] },
        s3: { h: "Chemical Bonds", label: "Ionic Bond",
          body: "Atoms join to form molecules through chemical bonds. Ionic bonds occur when one atom transfers electrons to another. Covalent bonds occur when two atoms share electron pairs.",
          bullets: ["Ionic bond: electron transfer (e.g. NaCl)", "Covalent bond: electron sharing (e.g. H₂O, CO₂)", "Valence electron count determines bond type"] },
        vocab: [
          { term: "Atomic number", meaning: "The number of protons in an atom's nucleus; determines the element's identity." },
          { term: "Valence electrons", meaning: "Electrons in the outermost shell that participate in chemical bonding." },
          { term: "Covalent bond", meaning: "A chemical bond where two atoms share a pair of electrons." },
          { term: "Ion", meaning: "An atom that has gained or lost electrons, giving it an electrical charge." },
          { term: "Isomer", meaning: "Molecules with the same chemical formula but different atomic arrangements." },
        ],
        quiz: [
          { q: "What determines a chemical element's identity?", opts: ["Number of neutrons", "Atomic mass", "Number of protons", "Number of valence electrons"], ci: 2, exp: "The number of protons (atomic number) defines the element's identity." },
          { q: "What happens when an electron drops to a lower orbit?", opts: ["It absorbs energy", "It emits light", "The atom breaks apart", "Protons increase"], ci: 1, exp: "When an electron drops to a lower orbit, it releases energy as light." },
          { q: "What type of bond forms in water (H₂O)?", opts: ["Ionic bond", "Metallic bond", "Covalent bond", "Van der Waals"], ci: 2, exp: "Water is formed by covalent bonds between hydrogen and oxygen sharing electrons." },
        ],
      },
    },
  },
  {
    keys: ["lempeng tektonik", "plate tectonics", "gunung berapi", "volcano", "gempa", "earthquake", "bumi", "earth", "geografi", "geography", "peta", "map", "terrain"],
    def: {
      shape: "terrain", color: "#f4a26b", color2: "#a8d89a", color3: "#88b8e8",
      id: {
        title: "Lempeng Tektonik", subtitle: "Gerak lempeng dan pembentukan benua",
        intro: "Permukaan Bumi terdiri dari lempeng-lempeng tektonik besar yang terus bergerak secara perlahan. Pergerakan ini membentuk pegunungan, palung laut, dan menjadi penyebab gempa bumi serta letusan gunung berapi yang kita rasakan hingga kini.",
        s1: { h: "Struktur Lapisan Bumi", label: "Lapisan Bumi",
          body: "Bumi tersusun atas kerak (crust), mantel (mantle), inti luar yang cair, dan inti dalam yang padat. Lempeng tektonik adalah bagian dari kerak dan mantel atas yang disebut litosfer.",
          bullets: ["Kerak benua lebih tebal (30-70 km) dari kerak samudra (5-10 km)", "Mantel kaya magma panas yang bisa mengalir", "Inti luar cair menghasilkan medan magnet Bumi"] },
        s2: { h: "Pergerakan Lempeng", label: "Batas Lempeng",
          body: "Lempeng-lempeng bergerak karena arus konveksi di mantel. Ada tiga jenis batas lempeng: konvergen (saling mendekati), divergen (saling menjauh), dan transform (bergeser sejajar).",
          bullets: ["Konvergen: membentuk pegunungan dan palung laut", "Divergen: membentuk punggung samudra (mid-ocean ridge)", "Transform: menyebabkan gempa bumi dahsyat (misal: Sesar San Andreas)"] },
        s3: { h: "Gunung Berapi & Gempa Bumi", label: "Gunung Berapi",
          body: "Gunung berapi terbentuk di zona subduksi atau hotspot di tengah lempeng. Gempa bumi terjadi saat lempeng bergerak tiba-tiba dan melepaskan energi yang tersimpan dalam batuan.",
          bullets: ["Magma naik melalui celah dan membentuk gunung berapi", "Skala Richter mengukur kekuatan gempa", "Tsunami bisa dipicu oleh gempa bawah laut"] },
        vocab: [
          { term: "Lempeng tektonik", meaning: "Pecahan besar litosfer yang terus bergerak di atas lapisan mantel yang lebih lembek." },
          { term: "Subduksi", meaning: "Proses di mana satu lempeng menyelam di bawah lempeng lain." },
          { term: "Magma", meaning: "Batuan cair di dalam Bumi yang keluar sebagai lava saat gunung berapi meletus." },
          { term: "Konveksi", meaning: "Pergerakan melingkar fluida panas karena perbedaan suhu, menggerakkan lempeng tektonik." },
          { term: "Litosfer", meaning: "Lapisan terluar Bumi yang terdiri dari kerak dan mantel atas yang padat." },
        ],
        quiz: [
          { q: "Apa yang menyebabkan lempeng tektonik bergerak?", opts: ["Rotasi Bumi", "Arus konveksi di mantel", "Tarikan Bulan", "Angin di permukaan"], ci: 1, exp: "Arus konveksi panas di mantel mendorong lempeng tektonik untuk bergerak." },
          { q: "Apa yang terbentuk di batas lempeng konvergen?", opts: ["Punggung samudra", "Dataran rendah", "Pegunungan dan palung", "Delta sungai"], ci: 2, exp: "Saat dua lempeng bertabrakan, salah satu menyelam (subduksi) dan membentuk palung, yang lain terangkat membentuk pegunungan." },
          { q: "Apa nama lapisan yang terdiri dari kerak dan mantel atas?", opts: ["Astenosfer", "Litosfer", "Biosfer", "Hidrosfer"], ci: 1, exp: "Litosfer adalah lapisan kaku terluar Bumi yang terdiri dari kerak dan mantel atas." },
        ],
      },
      en: {
        title: "Plate Tectonics", subtitle: "Plate movement and continent formation",
        intro: "Earth's surface is made up of large tectonic plates that are constantly moving. This movement shapes mountains, ocean trenches, and drives earthquakes and volcanic eruptions we experience today.",
        s1: { h: "Earth's Layered Structure", label: "Earth Layers",
          body: "Earth is made of the crust, mantle, liquid outer core and solid inner core. Tectonic plates are part of the crust and upper mantle, together called the lithosphere.",
          bullets: ["Continental crust is thicker (30-70 km) than oceanic crust (5-10 km)", "The mantle contains hot magma that can flow", "The liquid outer core generates Earth's magnetic field"] },
        s2: { h: "Plate Movement", label: "Plate Boundaries",
          body: "Plates move because of convection currents in the mantle. There are three types of plate boundaries: convergent (moving together), divergent (moving apart) and transform (sliding past each other).",
          bullets: ["Convergent: forms mountains and ocean trenches", "Divergent: forms mid-ocean ridges", "Transform: causes major earthquakes (e.g. San Andreas Fault)"] },
        s3: { h: "Volcanoes & Earthquakes", label: "Volcano",
          body: "Volcanoes form at subduction zones or hotspots within plates. Earthquakes occur when plates move suddenly and release stored energy in rocks.",
          bullets: ["Magma rises through vents and builds volcanoes", "The Richter scale measures earthquake magnitude", "Tsunamis can be triggered by underwater earthquakes"] },
        vocab: [
          { term: "Tectonic plate", meaning: "A large fragment of the lithosphere that moves slowly over the softer mantle." },
          { term: "Subduction", meaning: "The process where one plate dives beneath another." },
          { term: "Magma", meaning: "Molten rock inside the Earth that erupts as lava from volcanoes." },
          { term: "Convection", meaning: "Circular movement of hot fluid driven by temperature differences, which moves tectonic plates." },
          { term: "Lithosphere", meaning: "The rigid outer layer of Earth consisting of the crust and upper mantle." },
        ],
        quiz: [
          { q: "What causes tectonic plates to move?", opts: ["Earth's rotation", "Convection currents in the mantle", "The Moon's pull", "Surface winds"], ci: 1, exp: "Hot convection currents in the mantle push tectonic plates to move." },
          { q: "What forms at a convergent plate boundary?", opts: ["Mid-ocean ridge", "Lowlands", "Mountains and trenches", "River delta"], ci: 2, exp: "When two plates collide, one subducts forming a trench, while the other is pushed up forming mountains." },
          { q: "What is the name of the layer made of crust and upper mantle?", opts: ["Asthenosphere", "Lithosphere", "Biosphere", "Hydrosphere"], ci: 1, exp: "The lithosphere is the rigid outer layer of Earth consisting of the crust and upper mantle." },
        ],
      },
    },
  },
  {
    keys: ["rangka", "tulang", "skeletal", "bone", "anatomi", "anatomy", "sendi", "joint"],
    def: {
      shape: "icosahedron", color: "#fff8e1", color2: "#f4a8b8", color3: "#88b8e8",
      id: {
        title: "Sistem Rangka Manusia", subtitle: "206 tulang yang menopang kehidupan",
        intro: "Rangka manusia dewasa terdiri dari 206 tulang yang membentuk kerangka tubuh, melindungi organ vital, dan memungkinkan gerakan. Selain fungsi mekanis, tulang juga memproduksi sel darah dan menyimpan mineral penting seperti kalsium.",
        s1: { h: "Fungsi Sistem Rangka", label: "Tulang",
          body: "Rangka tidak hanya sebagai penopang tubuh. Tulang-tulang bekerja sama untuk melindungi organ dalam, menjadi tempat melekat otot, memproduksi sel darah merah di sumsum tulang, dan menyimpan kalsium serta fosfor.",
          bullets: ["Penopang dan pemberi bentuk tubuh", "Melindungi otak, jantung, dan paru-paru", "Sumsum tulang merah memproduksi sel darah"] },
        s2: { h: "Jenis-Jenis Tulang", label: "Jenis Tulang",
          body: "Tulang diklasifikasikan berdasarkan bentuknya menjadi tulang panjang (femur), tulang pendek (karpal), tulang pipih (tulang tengkorak), dan tulang tak beraturan (vertebra).",
          bullets: ["Tulang panjang mengandung sumsum kuning (lemak)", "Tulang pipih melindungi organ vital", "Tulang tak beraturan membentuk kolom vertebra"] },
        s3: { h: "Sendi & Jaringan Penunjang", label: "Sendi",
          body: "Sendi adalah titik pertemuan antara dua tulang atau lebih. Sendi sinovial (seperti lutut dan siku) memungkinkan gerakan bebas, dilumasi cairan sinovial. Ligamen menghubungkan tulang ke tulang, sedangkan tendon menghubungkan otot ke tulang.",
          bullets: ["Sendi engsel (lutut, siku): gerakan satu arah", "Sendi peluru (bahu, pinggul): gerakan ke segala arah", "Kartilago mencegah tulang saling bergesekan"] },
        vocab: [
          { term: "Sumsum tulang", meaning: "Jaringan lunak di dalam tulang; sumsum merah memproduksi sel darah." },
          { term: "Ligamen", meaning: "Jaringan ikat yang menghubungkan tulang satu dengan tulang lainnya." },
          { term: "Tendon", meaning: "Jaringan ikat yang menghubungkan otot ke tulang." },
          { term: "Kartilago", meaning: "Jaringan pengikat lentur yang melapisi ujung tulang di sendi." },
          { term: "Vertebra", meaning: "Tulang-tulang kecil yang menyusun tulang belakang (kolom vertebra)." },
        ],
        quiz: [
          { q: "Berapa jumlah tulang pada rangka manusia dewasa?", opts: ["186", "196", "206", "216"], ci: 2, exp: "Rangka manusia dewasa terdiri dari tepat 206 tulang." },
          { q: "Di mana sel darah merah diproduksi?", opts: ["Hati", "Ginjal", "Sumsum tulang merah", "Limpa"], ci: 2, exp: "Sel darah merah diproduksi di sumsum tulang merah yang terdapat dalam tulang spons." },
          { q: "Jaringan apa yang menghubungkan otot ke tulang?", opts: ["Ligamen", "Kartilago", "Tendon", "Sinovial"], ci: 2, exp: "Tendon adalah jaringan ikat kuat yang menghubungkan otot ke tulang." },
        ],
      },
      en: {
        title: "The Human Skeletal System", subtitle: "206 bones that support life",
        intro: "The adult human skeleton consists of 206 bones that form the body's framework, protect vital organs and enable movement. Beyond mechanics, bones also produce blood cells and store minerals like calcium and phosphorus.",
        s1: { h: "Functions of the Skeletal System", label: "Bones",
          body: "The skeleton does far more than hold the body up. Bones protect internal organs, anchor muscles, produce red blood cells in the marrow, and store calcium and phosphorus.",
          bullets: ["Support and shape the body", "Protect the brain, heart and lungs", "Red bone marrow produces blood cells"] },
        s2: { h: "Types of Bones", label: "Bone Types",
          body: "Bones are classified by shape: long bones (femur), short bones (carpals), flat bones (skull), and irregular bones (vertebrae).",
          bullets: ["Long bones contain yellow marrow (fat)", "Flat bones protect vital organs", "Irregular bones form the vertebral column"] },
        s3: { h: "Joints & Supporting Tissue", label: "Joints",
          body: "A joint is where two or more bones meet. Synovial joints (like the knee and elbow) allow free movement, lubricated by synovial fluid. Ligaments connect bone to bone; tendons connect muscle to bone.",
          bullets: ["Hinge joints (knee, elbow): one-directional movement", "Ball-and-socket joints (shoulder, hip): full range of motion", "Cartilage prevents bones from grinding together"] },
        vocab: [
          { term: "Bone marrow", meaning: "Soft tissue inside bones; red marrow produces blood cells." },
          { term: "Ligament", meaning: "Connective tissue that connects bone to bone." },
          { term: "Tendon", meaning: "Connective tissue that connects muscle to bone." },
          { term: "Cartilage", meaning: "Flexible connective tissue that covers bone ends at joints." },
          { term: "Vertebra", meaning: "One of the small bones making up the spinal column." },
        ],
        quiz: [
          { q: "How many bones does the adult human skeleton have?", opts: ["186", "196", "206", "216"], ci: 2, exp: "The adult human skeleton has exactly 206 bones." },
          { q: "Where are red blood cells produced?", opts: ["Liver", "Kidney", "Red bone marrow", "Spleen"], ci: 2, exp: "Red blood cells are produced in the red bone marrow found in spongy bone." },
          { q: "What tissue connects muscle to bone?", opts: ["Ligament", "Cartilage", "Tendon", "Synovial"], ci: 2, exp: "Tendons are strong connective tissues that attach muscles to bones." },
        ],
      },
    },
  },
];

function matchTopic(t: string): { def: TopicDef; lang: "id" | "en" } | null {
  const lower = t.toLowerCase();
  for (const entry of TOPIC_DB) {
    if (entry.keys.some((k) => lower.includes(k))) {
      return { def: entry.def, lang: lower.match(/[a-z]/) ? "en" : "id" };
    }
  }
  return null;
}

/** Smart local generator for offline/no-key usage */
export function generateLocalLesson(topic: string, lang: "id" | "en", level?: string): Lesson {
  const isEn = lang === "en";
  const t = topic.toLowerCase();

  // Try to match a known topic from the knowledge base
  const match = TOPIC_DB.find((entry) => entry.keys.some((k) => t.includes(k)));

  if (match) {
    const d = match.def;
    const loc = d[lang];
    const levelLabel = level ?? (isEn ? "All Levels" : "Semua Tingkat");
    return normalizeLesson({
      title: loc.title,
      subtitle: loc.subtitle,
      level: levelLabel,
      duration: isEn ? "25 min" : "25 menit",
      intro: loc.intro,
      sections: [
        { heading: loc.s1.h, body: loc.s1.body, bullets: loc.s1.bullets, shape: { type: d.shape, color: d.color, scale: 1.2, detail: 2, label: loc.s1.label } },
        { heading: loc.s2.h, body: loc.s2.body, bullets: loc.s2.bullets, shape: { type: "torus", color: d.color2, scale: 1.0, detail: 1, label: loc.s2.label } },
        { heading: loc.s3.h, body: loc.s3.body, bullets: loc.s3.bullets, shape: { type: "icosahedron", color: d.color3, scale: 1.1, detail: 1, label: loc.s3.label } },
      ],
      vocabulary: loc.vocab,
      quiz: loc.quiz.map((q) => ({ question: q.q, options: q.opts, correctIndex: q.ci, explanation: q.exp })),
    });
  }

  // Generic fallback — smarter shape/color inference
  let type: Lesson["sections"][0]["shape"]["type"] = "sphere";
  let color = "#f5c542";
  let color2 = "#88b8e8";
  let color3 = "#a8d89a";

  if (t.includes("sel") || t.includes("cell") || t.includes("organ") || t.includes("daun") || t.includes("leaf") || t.includes("tumbuhan") || t.includes("plant")) {
    type = "organic"; color = "#a8d89a";
  } else if (t.includes("atom") || t.includes("molekul") || t.includes("molecule") || t.includes("kimia") || t.includes("chem") || t.includes("reaksi") || t.includes("reaction")) {
    type = "molecule"; color = "#88b8e8";
  } else if (t.includes("gunung") || t.includes("mountain") || t.includes("bumi") || t.includes("earth") || t.includes("peta") || t.includes("map") || t.includes("tanah") || t.includes("soil")) {
    type = "terrain"; color = "#f4a26b";
  } else if (t.includes("bintang") || t.includes("star") || t.includes("matahari") || t.includes("sun") || t.includes("galaksi") || t.includes("galaxy")) {
    type = "star"; color = "#f5c542";
  } else if (t.includes("sejarah") || t.includes("history") || t.includes("kerajaan") || t.includes("kingdom") || t.includes("perang") || t.includes("war")) {
    type = "dodecahedron"; color = "#c9a96e";
  } else if (t.includes("matematika") || t.includes("math") || t.includes("geometri") || t.includes("geometry") || t.includes("pythagoras")) {
    type = "icosahedron"; color = "#f4a8b8";
  }

  const levelLabel = level ?? (isEn ? "All Levels" : "Semua Tingkat");

  return normalizeLesson({
    title: topic,
    subtitle: isEn ? `An interactive deep-dive into ${topic}` : `Jelajahi ${topic} secara interaktif`,
    level: levelLabel,
    duration: isEn ? "25 min" : "25 menit",
    intro: isEn
      ? `This lesson explores the fundamentals and key concepts of ${topic} through interactive 3D models and structured explanations. By the end, you'll have a clear understanding of the core ideas and how they connect to the world around us.`
      : `Materi ini mengeksplorasi konsep dasar dan penting dari ${topic} melalui model 3D interaktif dan penjelasan yang terstruktur. Di akhir materi, kamu akan memiliki pemahaman yang jelas tentang ide-ide inti dan bagaimana hubungannya dengan dunia di sekitar kita.`,
    sections: [
      {
        heading: isEn ? `What is ${topic}?` : `Apa itu ${topic}?`,
        body: isEn
          ? `${topic} is a fundamental concept that plays a key role in understanding the world around us. Its core principles form the foundation for more advanced study and practical applications in everyday life.`
          : `${topic} adalah konsep fundamental yang memainkan peran penting dalam memahami dunia di sekitar kita. Prinsip-prinsip intinya membentuk dasar untuk studi yang lebih lanjut dan aplikasi praktis dalam kehidupan sehari-hari.`,
        bullets: [
          isEn ? `Definition and key properties of ${topic}` : `Definisi dan sifat utama ${topic}`,
          isEn ? "Historical context and discovery" : "Konteks sejarah dan penemuannya",
          isEn ? "Why it matters in science and daily life" : "Mengapa penting dalam ilmu pengetahuan dan kehidupan sehari-hari",
        ],
        shape: { type, color, scale: 1.2, detail: 2, label: topic },
      },
      {
        heading: isEn ? "Core Principles" : "Prinsip-Prinsip Inti",
        body: isEn
          ? `The core principles governing ${topic} explain how it behaves under different conditions. Understanding these rules helps predict outcomes and solve related problems.`
          : `Prinsip-prinsip inti yang mengatur ${topic} menjelaskan bagaimana ia berperilaku dalam kondisi yang berbeda. Memahami aturan-aturan ini membantu memprediksi hasil dan memecahkan masalah terkait.`,
        bullets: [
          isEn ? "Fundamental laws and patterns" : "Hukum dan pola fundamental",
          isEn ? "How conditions affect behavior" : "Bagaimana kondisi mempengaruhi perilaku",
          isEn ? "Common misconceptions explained" : "Kesalahpahaman umum yang dijelaskan",
        ],
        shape: { type: "torus", color: color2, scale: 1.0, detail: 1, label: isEn ? "Core Principles" : "Prinsip Inti" },
      },
      {
        heading: isEn ? "Real-World Applications" : "Aplikasi di Dunia Nyata",
        body: isEn
          ? `${topic} has numerous practical applications that affect technology, medicine, engineering and daily life. Recognizing these applications deepens understanding and shows why the subject is worth studying.`
          : `${topic} memiliki banyak aplikasi praktis yang mempengaruhi teknologi, kedokteran, teknik, dan kehidupan sehari-hari. Mengenali aplikasi-aplikasi ini memperdalam pemahaman dan menunjukkan mengapa topik ini layak dipelajari.`,
        bullets: [
          isEn ? "Technology and engineering use cases" : "Penerapan di teknologi dan rekayasa",
          isEn ? "Connections to other subjects" : "Hubungan dengan mata pelajaran lain",
          isEn ? "Future research directions" : "Arah penelitian masa depan",
        ],
        shape: { type: "icosahedron", color: color3, scale: 1.1, detail: 1, label: isEn ? "Applications" : "Aplikasi" },
      },
    ],
    vocabulary: [
      { term: topic, meaning: isEn ? `The central concept of this lesson.` : `Konsep utama dari materi ini.` },
      { term: isEn ? "Principle" : "Prinsip", meaning: isEn ? "A fundamental rule or law that explains behavior." : "Aturan atau hukum dasar yang menjelaskan suatu perilaku." },
      { term: isEn ? "Structure" : "Struktur", meaning: isEn ? "The way parts are organized and relate to each other." : "Cara bagian-bagian disusun dan saling berhubungan." },
      { term: isEn ? "Function" : "Fungsi", meaning: isEn ? "The specific role or purpose of a part within a system." : "Peran atau tujuan spesifik dari suatu bagian dalam sebuah sistem." },
    ],
    quiz: [
      {
        question: isEn ? `Which of the following best describes ${topic}?` : `Mana yang paling tepat menggambarkan ${topic}?`,
        options: [
          isEn ? `A fundamental concept in science` : `Konsep fundamental dalam ilmu pengetahuan`,
          isEn ? `Only found in laboratories` : `Hanya ditemukan di laboratorium`,
          isEn ? `Not related to daily life` : `Tidak berkaitan dengan kehidupan sehari-hari`,
          isEn ? `A purely theoretical idea` : `Sebuah ide yang murni teoritis`,
        ],
        correctIndex: 0,
        explanation: isEn
          ? `${topic} is a core concept with broad scientific and real-world relevance.`
          : `${topic} adalah konsep inti dengan relevansi ilmiah dan dunia nyata yang luas.`,
      },
      {
        question: isEn ? `Why is studying ${topic} important?` : `Mengapa mempelajari ${topic} penting?`,
        options: [
          isEn ? `It has no practical use` : `Tidak memiliki kegunaan praktis`,
          isEn ? `It helps us understand and apply key scientific principles` : `Membantu kita memahami dan menerapkan prinsip ilmiah utama`,
          isEn ? `It is only relevant in history` : `Hanya relevan dalam sejarah`,
          isEn ? `It is too complex for everyday use` : `Terlalu kompleks untuk penggunaan sehari-hari`,
        ],
        correctIndex: 1,
        explanation: isEn
          ? `Understanding ${topic} builds a foundation for scientific thinking and practical problem-solving.`
          : `Memahami ${topic} membangun fondasi untuk berpikir ilmiah dan pemecahan masalah praktis.`,
      },
      {
        question: isEn ? `What approach helps best when learning about ${topic}?` : `Pendekatan apa yang paling membantu dalam mempelajari ${topic}?`,
        options: [
          isEn ? `Memorizing only` : `Hanya menghafal`,
          isEn ? `Ignoring its real-world connections` : `Mengabaikan hubungannya dengan dunia nyata`,
          isEn ? `Combining concepts with hands-on observation` : `Menggabungkan konsep dengan pengamatan langsung`,
          isEn ? `Reading a single source` : `Membaca dari satu sumber`,
        ],
        correctIndex: 2,
        explanation: isEn
          ? `Linking theory to observation deepens understanding and retention.`
          : `Menghubungkan teori dengan pengamatan memperdalam pemahaman dan daya ingat.`,
      },
    ],
  });
}
