/**
 * Client-safe local lesson generator.
 * NO server imports here — this runs in the browser.
 */

export type ShapeType =
  | "sphere" | "cube" | "torus" | "cone" | "cylinder"
  | "icosahedron" | "dodecahedron" | "organic" | "molecule" | "terrain" | "star" | "replicate"
  | "volcano" | "mountain" | "crystal" | "dna" | "heart" | "brain" | "bone" | "planet";

export interface LessonShape {
  type: ShapeType;
  color: string;
  scale: number;
  detail: number;
  label: string;
  modelUrl?: string;
  vertexCount?: number;
  faceCount?: number;
  modelSource?: string;
}

export interface LessonSection {
  heading: string;
  body: string;
  bullets: string[];
  shape: LessonShape;
}

export interface Lesson {
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  intro: string;
  sections: LessonSection[];
  vocabulary: { term: string; meaning: string }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const SHAPE_TYPES: ShapeType[] = [
  "sphere", "cube", "torus", "cone", "cylinder",
  "icosahedron", "dodecahedron", "organic", "molecule", "terrain", "star", "replicate",
  "volcano", "mountain", "crystal", "dna", "heart", "brain", "bone", "planet",
];

/**
 * Infer the most relevant 3D shape type from a label/heading/topic string.
 * Matches the actual visual object, not just the domain.
 */
export function inferShapeFromLabel(text: string, fallback: ShapeType = "icosahedron"): ShapeType {
  const t = text.toLowerCase();

  // ── Specific objects first (most precise) ─────────────────────────────────

  // Volcano / gunung berapi
  if (t.match(/\b(gunung berapi|volcano|volcan|vulkaan|eruption|erupsi|lava|magma|krakatau|merapi)\b/)) return "volcano";

  // Mountain / peak
  if (t.match(/\b(gunung|mountain|pegunungan|puncak|peak|summit|himalaya|everest|bukit|hill|lereng|slope)\b/)) return "mountain";

  // DNA / helix
  if (t.match(/\b(dna|rna|helix|double helix|nukleotida|nucleotide|kromosom|chromosome|gen |gene)\b/)) return "dna";

  // Heart
  if (t.match(/\b(jantung|heart|cardiac|kardio|ventrikel|ventricle|atrium)\b/)) return "heart";

  // Brain / neuron
  if (t.match(/\b(otak|brain|neuron|saraf|nerve|neural|cerebral|korteks|cortex)\b/)) return "brain";

  // Bone / skeleton
  if (t.match(/\b(tulang|bone|rangka|skeleton|tengkorak|skull|femur|tibia|vertebra|sendi|joint)\b/)) return "bone";

  // Planet / sphere objects
  if (t.match(/\b(planet|saturnus|saturn|jupiter|mars|venus|merkurius|mercury|uranus|neptunus|neptune|bulan|moon|asteroid|meteor|bumi|earth)\b/)) return "planet";

  // Star / sun
  if (t.match(/\b(matahari|sun|solar|bintang|star|galaksi|galaxy|nebula|komet|comet|cahaya|light|foton|photon)\b/)) return "star";

  // Crystal / mineral
  if (t.match(/\b(kristal|crystal|mineral|berlian|diamond|quartz|kuarsa|permata|gem|salt|garam nacl|lattice)\b/)) return "crystal";

  // Molecule / atom
  if (t.match(/\b(molekul|molecule|atom|ion|elektron|electron|proton|neutron|ikatan|bond|senyawa|compound|kimia|chem|h2o|co2|nacl|oksigen|oxygen|hidrogen|hydrogen|karbon|carbon|nitrogen)\b/)) return "molecule";

  // Organic / cell / biology blob
  if (t.match(/\b(sel|cell|organel|organelle|sitoplasma|cytoplasm|nukleus|nucleus|membran|membrane|mitokondria|mitochondria|ribosom|ribosome)\b/)) return "organic";
  if (t.match(/\b(daun|leaf|tumbuhan|plant|akar|root|batang|stem|bunga|flower|buah|fruit|botani|botany)\b/)) return "organic";
  if (t.match(/\b(virus|bakteri|bacteria|mikrob|microb|jamur|fungi|protozoa|amuba|amoeba)\b/)) return "organic";
  if (t.match(/\b(paru|lung|napas|breath|respirasi|respiration|liver|hati|ginjal|kidney)\b/)) return "organic";

  // Terrain / landscape / earth science
  if (t.match(/\b(lempeng|plate|tektonik|tectonic|benua|continent|kerak|crust|mantel|mantle|litosfer|lithosphere)\b/)) return "terrain";
  if (t.match(/\b(peta|map|geografi|geography|topografi|topography|tanah|soil|bumi|earth|samudra|ocean|laut|sea|sungai|river|danau|lake|pantai|beach|pulau|island)\b/)) return "terrain";
  if (t.match(/\b(ekosistem|ecosystem|iklim|climate|cuaca|weather|lingkungan|environment|polusi|pollution|hutan|forest|rawa|swamp)\b/)) return "terrain";

  // Torus / wave / ring
  if (t.match(/\b(gelombang|wave|frekuensi|frequency|getaran|vibration|bunyi|sound|akustik|acoustic|cincin|ring|torus|donat|donut)\b/)) return "torus";
  if (t.match(/\b(magnet|magnetic|medan|field|listrik|electric|arus|current|sirkuit|circuit|jaringan|network|sinyal|signal)\b/)) return "torus";

  // Cylinder / tube
  if (t.match(/\b(silinder|cylinder|tabung|tube|pipa|pipe|batang silinder|prisma bulat)\b/)) return "cylinder";
  if (t.match(/\b(robot|mesin|machine|motor|engine|gear|roda|wheel|teknik|engineering)\b/)) return "cylinder";

  // Cone / pyramid
  if (t.match(/\b(kerucut|cone|piramida|pyramid|segitiga|triangle|apex|puncak kerucut)\b/)) return "cone";

  // Cube / box
  if (t.match(/\b(kubus|cube|balok|cuboid|kotak|box|persegi panjang|rectangular|kristal kubik)\b/)) return "cube";
  if (t.match(/\b(komputer|computer|data|algoritma|algorithm|kode|code|program|software|hardware|server|database)\b/)) return "cube";
  if (t.match(/\b(arsitektur|architecture|bangunan|building|gedung|jembatan|bridge|konstruksi|construction|rumah|house)\b/)) return "cube";
  if (t.match(/\b(ekonomi|economy|perdagangan|trade|pasar|market|keuangan|finance|bank|investasi|investment)\b/)) return "cube";

  // Icosahedron / math / abstract
  if (t.match(/\b(matematika|math|aljabar|algebra|statistik|statistic|probabilitas|probability|kalkulus|calculus|pythagoras)\b/)) return "icosahedron";
  if (t.match(/\b(gravitasi|gravity|gaya|force|gerak|motion|kecepatan|velocity|percepatan|acceleration|fisika|physics)\b/)) return "icosahedron";
  if (t.match(/\b(rangka|skeleton|otot|muscle|tendon|ligamen|ligament|anatomi|anatomy)\b/)) return "bone";

  // Dodecahedron / history / culture
  if (t.match(/\b(sejarah|history|kerajaan|kingdom|kekaisaran|empire|peradaban|civilization|dinasti|dynasty|budaya|culture|seni|art)\b/)) return "dodecahedron";
  if (t.match(/\b(geometri|geometry|simetri|symmetry|pola|pattern|fraktal|fractal|trigonometri|trigonometry)\b/)) return "dodecahedron";
  if (t.match(/\b(energi|energy|panas|heat|suhu|temperature|termal|thermal|kalor|entropi|entropy)\b/)) return "dodecahedron";
  if (t.match(/\b(evolusi|evolution|adaptasi|adaptation|spesies|species|seleksi|selection)\b/)) return "organic";

  return fallback;
}

export function normalizeLesson(raw: Partial<Lesson> | Lesson): Lesson {
  const safeRaw = raw || {} as Lesson;
  return {
    title: safeRaw.title || "Lesson",
    subtitle: safeRaw.subtitle || "",
    level: safeRaw.level || "All Levels",
    duration: safeRaw.duration || "25 min",
    intro: safeRaw.intro || "",
    sections: (safeRaw.sections || []).slice(0, 5).map((s) => ({
      heading: s?.heading || "Section",
      body: s?.body || "",
      bullets: (s?.bullets || []).slice(0, 4),
      shape: {
        type: SHAPE_TYPES.includes(s?.shape?.type as any) ? s?.shape?.type : inferShapeFromLabel(s?.shape?.label || s?.heading || ""),
        color: /^#[0-9a-fA-F]{6}$/.test(s?.shape?.color || "") ? s?.shape?.color : "#f5c542",
        scale: Math.max(0.5, Math.min(2, (s?.shape?.scale) || 1)),
        detail: Math.max(0, Math.min(3, Math.round((s?.shape?.detail) || 1))),
        label: s?.shape?.label || s?.heading || "Shape",
        modelUrl: s?.shape?.modelUrl,
        vertexCount: s?.shape?.vertexCount,
        faceCount: s?.shape?.faceCount,
        modelSource: s?.shape?.modelSource,
      },
    })),
    vocabulary: (safeRaw.vocabulary || []).slice(0, 8).map(v => ({
      term: v?.term || "Term",
      meaning: v?.meaning || ""
    })),
    quiz: (safeRaw.quiz || [])
      .filter((q) => q && Array.isArray(q.options) && q.options.length >= 2)
      .slice(0, 6)
      .map((q) => {
        const opts = (q.options || []).slice(0, 4);
        while (opts.length < 4) opts.push("—");
        return {
          question: q.question || "Question?",
          options: opts,
          correctIndex: Math.max(0, Math.min(3, Math.round(q.correctIndex || 0))),
          explanation: q.explanation || "",
        };
      }),
  };
}

// ─── Topic knowledge base ─────────────────────────────────────────────────────

type TopicLoc = {
  title: string; subtitle: string; intro: string;
  s1: { h: string; body: string; bullets: string[]; label: string };
  s2: { h: string; body: string; bullets: string[]; label: string };
  s3: { h: string; body: string; bullets: string[]; label: string };
  vocab: { term: string; meaning: string }[];
  quiz: { q: string; opts: string[]; ci: number; exp: string }[];
};

type TopicDef = {
  shape: ShapeType;
  color: string; color2: string; color3: string;
  id: TopicLoc;
  en: TopicLoc;
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
      shape: "planet", color: "#f4a26b", color2: "#88b8e8", color3: "#f5c542",
      id: {
        title: "Tata Surya & Planet", subtitle: "Delapan planet dan misteri alam semesta",
        intro: "Tata surya kita terdiri dari Matahari dan delapan planet yang mengorbit mengelilinginya. Setiap planet memiliki karakteristik unik — mulai dari cincin Saturnus yang memukau hingga badai raksasa Jupiter yang telah berlangsung selama ratusan tahun.",
        s1: { h: "Matahari sebagai Pusat", label: "Matahari",
          body: "Matahari adalah bintang berukuran sedang yang mendominasi 99,86% total massa tata surya. Energi Matahari dihasilkan melalui fusi nuklir di intinya.",
          bullets: ["Suhu permukaan ±5.500°C, inti ±15 juta°C", "Menghasilkan energi lewat fusi hidrogen menjadi helium", "Gravitasinya mengikat semua benda di tata surya"] },
        s2: { h: "Planet Kebumian", label: "Planet Dalam",
          body: "Merkurius, Venus, Bumi, dan Mars adalah planet kebumian dengan permukaan padat berbatu. Bumi adalah satu-satunya planet yang diketahui memiliki kehidupan.",
          bullets: ["Permukaan padat dan berkerak", "Ukuran relatif lebih kecil dibanding planet gas", "Bumi memiliki lapisan atmosfer pelindung dan magnetosfer"] },
        s3: { h: "Planet Gas Raksasa", label: "Jupiter",
          body: "Jupiter, Saturnus, Uranus, dan Neptunus adalah planet gas raksasa. Saturnus terkenal dengan cincinnya yang terdiri dari partikel es dan batu.",
          bullets: ["Jupiter adalah planet terbesar — 1.300× volume Bumi", "Cincin Saturnus terdiri dari miliaran partikel es", "Uranus dan Neptunus kaya akan es metana dan amonia"] },
        vocab: [
          { term: "Fusi nuklir", meaning: "Reaksi penggabungan inti atom ringan menjadi atom lebih berat, melepaskan energi besar." },
          { term: "Orbit", meaning: "Jalur melengkung yang ditempuh planet saat mengelilingi Matahari." },
          { term: "Gravitasi", meaning: "Gaya tarik-menarik antara benda bermassa, menjaga planet tetap di orbitnya." },
          { term: "Atmosfer", meaning: "Lapisan gas yang menyelimuti planet." },
        ],
        quiz: [
          { q: "Planet mana yang terbesar di tata surya?", opts: ["Saturnus", "Neptunus", "Jupiter", "Uranus"], ci: 2, exp: "Jupiter adalah planet terbesar dengan volume sekitar 1.300 kali volume Bumi." },
          { q: "Proses apa yang menghasilkan energi Matahari?", opts: ["Pembakaran batu bara", "Fisi nuklir", "Fusi nuklir", "Evaporasi"], ci: 2, exp: "Matahari menghasilkan energi melalui fusi nuklir." },
          { q: "Planet mana yang dikenal dengan cincinnya yang mencolok?", opts: ["Jupiter", "Mars", "Venus", "Saturnus"], ci: 3, exp: "Saturnus memiliki sistem cincin paling menonjol." },
        ],
      },
      en: {
        title: "The Solar System & Planets", subtitle: "Eight planets and the mysteries of the universe",
        intro: "Our solar system consists of the Sun and eight planets orbiting it. Each planet has unique characteristics — from Saturn's stunning rings to Jupiter's centuries-old storm.",
        s1: { h: "The Sun as the Center", label: "The Sun",
          body: "The Sun accounts for 99.86% of the solar system's total mass. Its energy comes from nuclear fusion in its core.",
          bullets: ["Surface ~5,500°C, core ~15 million°C", "Energy from fusing hydrogen into helium", "Gravity binds all solar system bodies"] },
        s2: { h: "Terrestrial Planets", label: "Inner Planets",
          body: "Mercury, Venus, Earth and Mars have solid rocky surfaces. Earth is the only known planet with life.",
          bullets: ["Solid, rocky surfaces", "Smaller than gas giants", "Earth has a protective atmosphere and magnetosphere"] },
        s3: { h: "Gas Giants", label: "Jupiter",
          body: "Jupiter, Saturn, Uranus and Neptune are gas giants. Saturn is famous for its ring system.",
          bullets: ["Jupiter: 1,300× Earth's volume", "Saturn's rings contain billions of ice particles", "Uranus and Neptune are rich in methane ice"] },
        vocab: [
          { term: "Nuclear fusion", meaning: "Light atomic nuclei combining into heavier atoms, releasing energy." },
          { term: "Orbit", meaning: "The curved path a planet follows around the Sun." },
          { term: "Gravity", meaning: "Attractive force between massive objects keeping planets in orbit." },
          { term: "Atmosphere", meaning: "The layer of gas surrounding a planet." },
        ],
        quiz: [
          { q: "Which is the largest planet?", opts: ["Saturn", "Neptune", "Jupiter", "Uranus"], ci: 2, exp: "Jupiter is ~1,300× Earth's volume." },
          { q: "What generates the Sun's energy?", opts: ["Burning coal", "Nuclear fission", "Nuclear fusion", "Evaporation"], ci: 2, exp: "Nuclear fusion of hydrogen into helium." },
          { q: "Which planet has prominent rings?", opts: ["Jupiter", "Mars", "Venus", "Saturn"], ci: 3, exp: "Saturn has the most visible ring system." },
        ],
      },
    },
  },
  {
    keys: ["atom", "molekul", "molecule", "kimia", "chemistry", "ikatan", "elektron", "electron", "proton", "neutron", "bohr"],
    def: {
      shape: "molecule", color: "#88b8e8", color2: "#f5c542", color3: "#a8d89a",
      id: {
        title: "Model Atom & Struktur Kimia", subtitle: "Partikel subatom dan model Bohr",
        intro: "Atom adalah unit terkecil materi yang masih mempertahankan sifat kimianya. Model atom membantu kita memahami mengapa unsur-unsur berperilaku berbeda dan bagaimana ikatan kimia terbentuk.",
        s1: { h: "Partikel Subatom", label: "Atom",
          body: "Setiap atom terdiri dari proton dan neutron di inti, dikelilingi elektron yang bergerak di kulit-kulit. Jumlah proton menentukan identitas unsur.",
          bullets: ["Proton bermuatan positif, neutron netral", "Elektron bermuatan negatif, bermassa sangat kecil", "Nomor atom = jumlah proton = identitas unsur"] },
        s2: { h: "Model Atom Bohr", label: "Model Bohr",
          body: "Niels Bohr mengusulkan elektron bergerak di orbit melingkar dengan energi tertentu. Elektron bisa melompat ke orbit lebih tinggi dengan menyerap energi.",
          bullets: ["Tiap orbit menampung jumlah elektron tertentu", "Perpindahan elektron menghasilkan emisi cahaya", "Nomor kulit: K(2), L(8), M(18)"] },
        s3: { h: "Ikatan Kimia", label: "Ikatan Ion",
          body: "Atom bergabung membentuk molekul melalui ikatan kimia. Ikatan ion terjadi saat transfer elektron, ikatan kovalen saat berbagi elektron.",
          bullets: ["Ikatan ion: transfer elektron (NaCl)", "Ikatan kovalen: berbagi elektron (H₂O, CO₂)", "Elektron valensi menentukan jenis ikatan"] },
        vocab: [
          { term: "Nomor atom", meaning: "Jumlah proton dalam inti; menentukan identitas unsur." },
          { term: "Elektron valensi", meaning: "Elektron di kulit terluar yang berperan dalam ikatan kimia." },
          { term: "Ikatan kovalen", meaning: "Ikatan di mana dua atom berbagi sepasang elektron." },
          { term: "Ion", meaning: "Atom yang kehilangan atau mendapat elektron sehingga bermuatan." },
        ],
        quiz: [
          { q: "Apa yang menentukan identitas suatu unsur?", opts: ["Jumlah neutron", "Massa atom", "Jumlah proton", "Elektron valensi"], ci: 2, exp: "Jumlah proton (nomor atom) menentukan identitas unsur." },
          { q: "Apa yang terjadi saat elektron turun ke orbit lebih rendah?", opts: ["Menyerap energi", "Memancarkan cahaya", "Atom hancur", "Proton bertambah"], ci: 1, exp: "Elektron memancarkan energi dalam bentuk cahaya." },
          { q: "Ikatan apa pada molekul air (H₂O)?", opts: ["Ikatan ion", "Ikatan logam", "Ikatan kovalen", "Van der Waals"], ci: 2, exp: "Air terbentuk dari ikatan kovalen antara H dan O." },
        ],
      },
      en: {
        title: "Atoms & Chemical Structure", subtitle: "Subatomic particles and the Bohr model",
        intro: "Atoms are the smallest units of matter that retain chemical properties. Atomic models help us understand why elements behave differently and how chemical bonds form.",
        s1: { h: "Subatomic Particles", label: "Atom",
          body: "Every atom has protons and neutrons in its nucleus with electrons in shells. The number of protons defines the element.",
          bullets: ["Protons positive, neutrons neutral", "Electrons negative with negligible mass", "Atomic number = protons = element identity"] },
        s2: { h: "The Bohr Atomic Model", label: "Bohr Model",
          body: "Bohr proposed electrons orbit in fixed shells. Electrons jump to higher orbits absorbing energy, fall back emitting light.",
          bullets: ["Each shell holds a max number of electrons", "Electron transitions produce emission spectra", "Shells: K(2), L(8), M(18)"] },
        s3: { h: "Chemical Bonds", label: "Ionic Bond",
          body: "Atoms form molecules via chemical bonds. Ionic bonds transfer electrons; covalent bonds share them.",
          bullets: ["Ionic: electron transfer (NaCl)", "Covalent: electron sharing (H₂O, CO₂)", "Valence electrons determine bond type"] },
        vocab: [
          { term: "Atomic number", meaning: "Number of protons; determines element identity." },
          { term: "Valence electrons", meaning: "Outermost electrons that participate in bonding." },
          { term: "Covalent bond", meaning: "Bond where two atoms share electron pairs." },
          { term: "Ion", meaning: "Atom with gained or lost electrons, giving it a charge." },
        ],
        quiz: [
          { q: "What determines an element's identity?", opts: ["Neutrons", "Atomic mass", "Protons", "Valence electrons"], ci: 2, exp: "Atomic number (proton count) defines the element." },
          { q: "What happens when an electron drops to a lower orbit?", opts: ["Absorbs energy", "Emits light", "Atom breaks", "Protons increase"], ci: 1, exp: "Energy is released as light." },
          { q: "What bond forms in H₂O?", opts: ["Ionic", "Metallic", "Covalent", "Van der Waals"], ci: 2, exp: "Hydrogen and oxygen share electrons (covalent)." },
        ],
      },
    },
  },
  {
    keys: ["lempeng tektonik", "plate tectonics", "gunung berapi", "volcano", "gempa", "earthquake", "geografi", "geography", "peta", "map"],
    def: {
      shape: "mountain", color: "#f4a26b", color2: "#a8d89a", color3: "#88b8e8",
      id: {
        title: "Lempeng Tektonik", subtitle: "Gerak lempeng dan pembentukan benua",
        intro: "Permukaan Bumi terdiri dari lempeng-lempeng tektonik besar yang terus bergerak secara perlahan. Pergerakan ini membentuk pegunungan, palung laut, dan menyebabkan gempa bumi serta letusan gunung berapi.",
        s1: { h: "Struktur Lapisan Bumi", label: "Lapisan Bumi",
          body: "Bumi tersusun atas kerak, mantel, inti luar cair, dan inti dalam padat. Lempeng tektonik adalah bagian kerak dan mantel atas yang disebut litosfer.",
          bullets: ["Kerak benua lebih tebal (30-70 km) dari kerak samudra (5-10 km)", "Mantel kaya magma panas yang bisa mengalir", "Inti luar cair menghasilkan medan magnet Bumi"] },
        s2: { h: "Pergerakan Lempeng", label: "Batas Lempeng",
          body: "Lempeng bergerak karena arus konveksi di mantel. Ada tiga jenis batas lempeng: konvergen, divergen, dan transform.",
          bullets: ["Konvergen: membentuk pegunungan dan palung", "Divergen: membentuk punggung samudra", "Transform: menyebabkan gempa (Sesar San Andreas)"] },
        s3: { h: "Gunung Berapi & Gempa", label: "Gunung Berapi",
          body: "Gunung berapi terbentuk di zona subduksi atau hotspot. Gempa terjadi saat lempeng bergerak tiba-tiba.",
          bullets: ["Magma naik membentuk gunung berapi", "Skala Richter mengukur kekuatan gempa", "Tsunami bisa dipicu gempa bawah laut"] },
        vocab: [
          { term: "Lempeng tektonik", meaning: "Pecahan litosfer yang bergerak di atas mantel yang lebih lunak." },
          { term: "Subduksi", meaning: "Proses satu lempeng menyelam di bawah lempeng lain." },
          { term: "Magma", meaning: "Batuan cair di dalam Bumi yang keluar sebagai lava." },
          { term: "Litosfer", meaning: "Lapisan terluar Bumi terdiri dari kerak dan mantel atas." },
        ],
        quiz: [
          { q: "Apa yang menyebabkan lempeng tektonik bergerak?", opts: ["Rotasi Bumi", "Arus konveksi di mantel", "Tarikan Bulan", "Angin permukaan"], ci: 1, exp: "Arus konveksi di mantel mendorong lempeng bergerak." },
          { q: "Apa yang terbentuk di batas konvergen?", opts: ["Punggung samudra", "Dataran rendah", "Pegunungan dan palung", "Delta sungai"], ci: 2, exp: "Tabrakan lempeng membentuk pegunungan dan palung laut." },
          { q: "Apa nama lapisan kerak + mantel atas?", opts: ["Astenosfer", "Litosfer", "Biosfer", "Hidrosfer"], ci: 1, exp: "Litosfer adalah lapisan kaku terluar Bumi." },
        ],
      },
      en: {
        title: "Plate Tectonics", subtitle: "Plate movement and continent formation",
        intro: "Earth's surface is composed of large tectonic plates in constant slow motion. This drives mountain building, ocean trenches, earthquakes and volcanoes.",
        s1: { h: "Earth's Layered Structure", label: "Earth Layers",
          body: "Earth has a crust, mantle, liquid outer core and solid inner core. Tectonic plates form the lithosphere.",
          bullets: ["Continental crust 30-70 km, oceanic 5-10 km", "Mantle contains flowing hot magma", "Liquid outer core generates Earth's magnetic field"] },
        s2: { h: "Plate Movement", label: "Plate Boundaries",
          body: "Convection currents in the mantle move plates. Three boundary types: convergent, divergent and transform.",
          bullets: ["Convergent: mountains and trenches", "Divergent: mid-ocean ridges", "Transform: major earthquakes (San Andreas)"] },
        s3: { h: "Volcanoes & Earthquakes", label: "Volcano",
          body: "Volcanoes form at subduction zones or hotspots. Earthquakes happen when plates shift suddenly.",
          bullets: ["Magma rises through vents to build volcanoes", "Richter scale measures magnitude", "Undersea quakes can trigger tsunamis"] },
        vocab: [
          { term: "Tectonic plate", meaning: "Large lithosphere fragment moving over the softer mantle." },
          { term: "Subduction", meaning: "One plate diving beneath another." },
          { term: "Magma", meaning: "Molten rock inside Earth that erupts as lava." },
          { term: "Lithosphere", meaning: "Rigid outer Earth layer of crust and upper mantle." },
        ],
        quiz: [
          { q: "What drives tectonic plate movement?", opts: ["Earth's rotation", "Mantle convection", "Moon's pull", "Surface winds"], ci: 1, exp: "Hot mantle convection currents push the plates." },
          { q: "What forms at convergent boundaries?", opts: ["Mid-ocean ridge", "Lowlands", "Mountains and trenches", "River delta"], ci: 2, exp: "Colliding plates form mountains and trenches." },
          { q: "What layer is crust + upper mantle called?", opts: ["Asthenosphere", "Lithosphere", "Biosphere", "Hydrosphere"], ci: 1, exp: "The lithosphere is Earth's rigid outer layer." },
        ],
      },
    },
  },
  {
    keys: ["monyet", "kera", "monkey", "ape", "hewan", "animal", "mamalia", "mammal"],
    def: {
      shape: "organic", color: "#8B4513", color2: "#A0522D", color3: "#D2691E",
      id: {
        title: "Monyet & Hewan Mamalia", subtitle: "Kera, monyet, dan ciri-ciri mamalia",
        intro: "Monyet adalah hewan mamalia yang tergolong dalam ordo Primata. Mereka memiliki otak yang berkembang, tangan yang cekatan, dan hidup di berbagai habitat mulai dari hutan hujan hingga pegunungan.",
        s1: { h: "Ciri-Ciri Primata", label: "Monyet",
          body: "Primata seperti monyet memiliki mata menghadap depan untuk penglihatan stereoskopis, jempol yang bisa dihadapkan (opposable thumb), dan otak yang besar relatif terhadap ukuran tubuh.",
          bullets: ["Penglihatan stereoskopis untuk kedalaman", "Jempol dan jari kaki yang bisa memegang", "Kuku menggantikan cakar"] },
        s2: { h: "Habitat & Perilaku", label: "Habitat",
          body: "Sebagian besar monyet hidup di pohon (arboreal), tetapi beberapa juga hidup di darat (terrestrial). Mereka hidup dalam kelompok sosial dan berkomunikasi dengan suara dan gerakan.",
          bullets: ["Kelompok sosial dengan hierarki", "Komunikasi dengan suara dan isyarat", "Pola makan omnivora (buah, daun, serangga)"] },
        s3: { h: "Peranan di Ekosistem", label: "Ekosistem",
          body: "Monyet membantu penyebaran biji dan mempengaruhi struktur vegetasi. Mereka juga menjadi mangsa bagi predator besar seperti harimau dan elang.",
          bullets: ["Penyebar biji melalui kotoran", "Indikator kesehatan ekosistem", "Bagian dari rantai makanan"] },
        vocab: [
          { term: "Primata", meaning: "Ordo mamalia yang mencakup monyet, kera, dan manusia." },
          { term: "Arboreal", meaning: "Hewan yang hidup di pohon." },
          { term: "Opposable Thumb", meaning: "Jempol yang bisa berhadapan dengan jari lain untuk memegang." },
          { term: "Omnivora", meaning: "Hewan yang memakan tumbuhan dan hewan." },
        ],
        quiz: [
          { q: "Apa ciri khas tangan primata?", opts: ["Cakar tajam", "Jempol yang bisa dihadapkan", "Tidak memiliki jari", "Hanya 4 jari"], ci: 1, exp: "Primata memiliki jempol opposable untuk memegang." },
          { q: "Dimana sebagian besar monyet hidup?", opts: ["Laut", "Padang pasir", "Hutan (pohon)", "Gua"], ci: 2, exp: "Kebanyakan monyet adalah hewan arboreal (hidup di pohon)." },
          { q: "Apa makanan monyet?", opts: ["Hanya daging", "Hanya tumbuhan", "Buah, daun, serangga", "Hanya serangga"], ci: 2, exp: "Monyet adalah omnivora, memakan berbagai jenis makanan." },
        ],
      },
      en: {
        title: "Monkeys & Mammals", subtitle: "Monkeys, apes, and mammalian characteristics",
        intro: "Monkeys are mammals in the primate order. They have large brains, dexterous hands, and live in habitats ranging from rainforests to mountains.",
        s1: { h: "Primate Characteristics", label: "Monkey",
          body: "Primates like monkeys have forward-facing eyes for stereoscopic vision, opposable thumbs, and large brains relative to body size.",
          bullets: ["Stereoscopic vision for depth perception", "Opposable thumbs and big toes for grasping", "Nails instead of claws"] },
        s2: { h: "Habitat & Behavior", label: "Habitat",
          body: "Most monkeys are arboreal (tree-dwelling), but some are terrestrial. They live in social groups and communicate with sounds and gestures.",
          bullets: ["Social groups with hierarchies", "Communication via vocalizations and gestures", "Omnivorous diet (fruit, leaves, insects)"] },
        s3: { h: "Ecosystem Roles", label: "Ecosystem",
          body: "Monkeys help disperse seeds and influence vegetation structure. They are also prey for large predators like tigers and eagles.",
          bullets: ["Seed dispersers through feces", "Indicators of ecosystem health", "Part of the food chain"] },
        vocab: [
          { term: "Primate", meaning: "Mammal order including monkeys, apes, and humans." },
          { term: "Arboreal", meaning: "Tree-dwelling animal." },
          { term: "Opposable Thumb", meaning: "Thumb that can face other fingers for grasping." },
          { term: "Omnivore", meaning: "Animal that eats both plants and animals." },
        ],
        quiz: [
          { q: "What is a key primate hand feature?", opts: ["Sharp claws", "Opposable thumb", "No fingers", "Only 4 fingers"], ci: 1, exp: "Primates have opposable thumbs for grasping." },
          { q: "Where do most monkeys live?", opts: ["Ocean", "Desert", "Forest (trees)", "Caves"], ci: 2, exp: "Most monkeys are arboreal (tree-dwelling)." },
          { q: "What do monkeys eat?", opts: ["Only meat", "Only plants", "Fruit, leaves, insects", "Only insects"], ci: 2, exp: "Monkeys are omnivores, eating a variety of foods." },
        ],
      },
    },
  },
  {
    keys: ["rangka", "tulang", "skeletal", "bone", "anatomi", "anatomy", "sendi", "joint"],
    def: {
      shape: "bone", color: "#fff8e1", color2: "#f4a8b8", color3: "#88b8e8",
      id: {
        title: "Sistem Rangka Manusia", subtitle: "206 tulang yang menopang kehidupan",
        intro: "Rangka manusia dewasa terdiri dari 206 tulang yang membentuk kerangka, melindungi organ vital, dan memungkinkan gerakan. Tulang juga memproduksi sel darah dan menyimpan mineral seperti kalsium.",
        s1: { h: "Fungsi Sistem Rangka", label: "Tulang",
          body: "Tulang-tulang melindungi organ dalam, menjadi tempat melekat otot, memproduksi sel darah merah di sumsum tulang, dan menyimpan kalsium.",
          bullets: ["Penopang dan pemberi bentuk tubuh", "Melindungi otak, jantung, dan paru-paru", "Sumsum tulang merah memproduksi sel darah"] },
        s2: { h: "Jenis-Jenis Tulang", label: "Jenis Tulang",
          body: "Tulang diklasifikasikan berdasarkan bentuk: panjang (femur), pendek (karpal), pipih (tengkorak), dan tak beraturan (vertebra).",
          bullets: ["Tulang panjang mengandung sumsum kuning", "Tulang pipih melindungi organ vital", "Tulang tak beraturan membentuk kolom vertebra"] },
        s3: { h: "Sendi & Jaringan Penunjang", label: "Sendi",
          body: "Sendi adalah titik pertemuan tulang. Sendi sinovial memungkinkan gerakan bebas. Ligamen menghubungkan tulang ke tulang, tendon menghubungkan otot ke tulang.",
          bullets: ["Sendi engsel (lutut, siku): satu arah", "Sendi peluru (bahu, pinggul): segala arah", "Kartilago mencegah tulang saling bergesekan"] },
        vocab: [
          { term: "Sumsum tulang", meaning: "Jaringan lunak di tulang; sumsum merah memproduksi sel darah." },
          { term: "Ligamen", meaning: "Jaringan ikat penghubung tulang ke tulang." },
          { term: "Tendon", meaning: "Jaringan ikat penghubung otot ke tulang." },
          { term: "Kartilago", meaning: "Jaringan lentur yang melapisi ujung tulang di sendi." },
        ],
        quiz: [
          { q: "Berapa jumlah tulang manusia dewasa?", opts: ["186", "196", "206", "216"], ci: 2, exp: "Rangka manusia dewasa terdiri dari tepat 206 tulang." },
          { q: "Di mana sel darah merah diproduksi?", opts: ["Hati", "Ginjal", "Sumsum tulang merah", "Limpa"], ci: 2, exp: "Sel darah merah diproduksi di sumsum tulang merah." },
          { q: "Jaringan apa yang menghubungkan otot ke tulang?", opts: ["Ligamen", "Kartilago", "Tendon", "Sinovial"], ci: 2, exp: "Tendon menghubungkan otot ke tulang." },
        ],
      },
      en: {
        title: "The Human Skeletal System", subtitle: "206 bones that support life",
        intro: "The adult human skeleton has 206 bones forming the body framework, protecting organs and enabling movement. Bones also produce blood cells and store calcium.",
        s1: { h: "Functions of the Skeleton", label: "Bones",
          body: "Bones protect organs, anchor muscles, produce blood cells in marrow, and store calcium and phosphorus.",
          bullets: ["Support and shape the body", "Protect brain, heart and lungs", "Red bone marrow produces blood cells"] },
        s2: { h: "Types of Bones", label: "Bone Types",
          body: "Bones are classified by shape: long (femur), short (carpals), flat (skull), irregular (vertebrae).",
          bullets: ["Long bones contain yellow marrow", "Flat bones protect vital organs", "Irregular bones form the spine"] },
        s3: { h: "Joints & Supporting Tissue", label: "Joints",
          body: "Joints are where bones meet. Synovial joints allow free movement. Ligaments connect bone to bone; tendons connect muscle to bone.",
          bullets: ["Hinge joints (knee, elbow): one direction", "Ball-and-socket (shoulder, hip): full range", "Cartilage prevents bone grinding"] },
        vocab: [
          { term: "Bone marrow", meaning: "Soft tissue inside bones; red marrow produces blood cells." },
          { term: "Ligament", meaning: "Connective tissue connecting bone to bone." },
          { term: "Tendon", meaning: "Connective tissue connecting muscle to bone." },
          { term: "Cartilage", meaning: "Flexible tissue covering bone ends at joints." },
        ],
        quiz: [
          { q: "How many bones in the adult skeleton?", opts: ["186", "196", "206", "216"], ci: 2, exp: "Exactly 206 bones." },
          { q: "Where are red blood cells produced?", opts: ["Liver", "Kidney", "Red bone marrow", "Spleen"], ci: 2, exp: "Red bone marrow produces red blood cells." },
          { q: "What connects muscle to bone?", opts: ["Ligament", "Cartilage", "Tendon", "Synovial"], ci: 2, exp: "Tendons attach muscles to bones." },
        ],
      },
    },
  },
];

type ExternalModel = { url: string; vertices: number; faces: number; source: string };

async function attachModels(
  sections: LessonSection[],
  externalModel?: ExternalModel,
): Promise<LessonSection[]> {
  if (externalModel) {
    return sections.map((section) => ({
      ...section,
      shape: {
        ...section.shape,
        type: "replicate" as ShapeType,
        modelUrl: externalModel.url,
        vertexCount: externalModel.vertices,
        faceCount: externalModel.faces,
        modelSource: externalModel.source,
      },
    }));
  }
  try {
    const { generate3DModelBatch } = await import("./ar3d-client");
    const labels = sections.map((s) => s.shape.label);
    const models = await generate3DModelBatch(labels);
    return sections.map((section, index) => {
      const model = models[index];
      return {
        ...section,
        shape: {
          ...section.shape,
          type: "replicate" as ShapeType,
          modelUrl: model?.url ?? section.shape.modelUrl,
          vertexCount: model?.vertices,
          faceCount: model?.faces,
          modelSource: model?.source ?? "ar3d",
        },
      };
    });
  } catch (err) {
    console.warn("[AR3D] Pipeline unavailable:", err);
    return sections;
  }
}

// ─── Main exported function ───────────────────────────────────────────────────

export async function generateLocalLesson(
  topic: string,
  lang: "id" | "en",
  level?: string,
  externalModel?: { url: string; vertices: number; faces: number; source: string },
): Promise<Lesson> {
  const isEn = lang === "en";
  const t = topic.toLowerCase();

  const match = TOPIC_DB.find((entry) => entry.keys.some((k) => t.includes(k)));

  if (match) {
    const d = match.def;
    const loc = d[lang];
    const levelLabel = level ?? (isEn ? "All Levels" : "Semua Tingkat");

    // Infer shape per section from label + heading + body combined
    const s1Text = `${loc.s1.label} ${loc.s1.h} ${loc.s1.body}`;
    const s2Text = `${loc.s2.label} ${loc.s2.h} ${loc.s2.body}`;
    const s3Text = `${loc.s3.label} ${loc.s3.h} ${loc.s3.body}`;

    const s1Type: ShapeType = inferShapeFromLabel(s1Text, d.shape as ShapeType);
    const s2Type: ShapeType = inferShapeFromLabel(s2Text, s1Type === "torus" ? "dodecahedron" : "torus");
    const s3Type: ShapeType = inferShapeFromLabel(s3Text, s1Type === "cube" ? "cylinder" : "cube");
    
    // First create the base lesson
    const baseLesson = {
      title: loc.title,
      subtitle: loc.subtitle,
      level: levelLabel,
      duration: isEn ? "25 min" : "25 menit",
      intro: loc.intro,
      sections: [
        { heading: loc.s1.h, body: loc.s1.body, bullets: loc.s1.bullets, shape: { type: s1Type, color: d.color, scale: 1.2, detail: 2, label: loc.s1.label } },
        { heading: loc.s2.h, body: loc.s2.body, bullets: loc.s2.bullets, shape: { type: s2Type, color: d.color2, scale: 1.0, detail: 1, label: loc.s2.label } },
        { heading: loc.s3.h, body: loc.s3.body, bullets: loc.s3.bullets, shape: { type: s3Type, color: d.color3, scale: 1.1, detail: 1, label: loc.s3.label } },
      ],
      vocabulary: loc.vocab,
      quiz: loc.quiz.map((q) => ({ question: q.q, options: q.opts, correctIndex: q.ci, explanation: q.exp })),
    };

    baseLesson.sections = await attachModels(baseLesson.sections, externalModel);
    return normalizeLesson(baseLesson as Lesson);
  }

  // Generic fallback
  let type: ShapeType = "icosahedron";
  let color = "#f5c542";
  let color2 = "#88b8e8";
  let color3 = "#a8d89a";

  // Determine primary shape using our helper (topic-level)
  type = inferShapeFromLabel(t, "icosahedron");

  // Keep specific color overrides
  if (type === "organic") { color = "#a8d89a"; color2 = "#f4a8b8"; color3 = "#88b8e8"; }
  else if (type === "molecule") { color = "#88b8e8"; color2 = "#f5c542"; color3 = "#a8d89a"; }
  else if (type === "terrain") { color = "#f4a26b"; color2 = "#a8d89a"; color3 = "#88b8e8"; }
  else if (type === "star") { color = "#f5c542"; color2 = "#f4a26b"; color3 = "#f4a8b8"; }
  else if (type === "dodecahedron") { color = "#c9a96e"; color2 = "#f4a8b8"; color3 = "#88b8e8"; }
  else if (type === "icosahedron") { color = "#f4a8b8"; color2 = "#88b8e8"; color3 = "#a8d89a"; }
  else if (type === "cube") { color = "#88b8e8"; color2 = "#a8d89a"; color3 = "#f4a8b8"; }
  else if (type === "cylinder") { color = "#a8d89a"; color2 = "#88b8e8"; color3 = "#f4a8b8"; }
  else if (type === "torus") { color = "#f4a8b8"; color2 = "#88b8e8"; color3 = "#a8d89a"; }
  else if (type === "cone") { color = "#f4a26b"; color2 = "#f5c542"; color3 = "#a8d89a"; }

  const levelLabel = level ?? (isEn ? "All Levels" : "Semua Tingkat");

  // Pick 3 distinct shapes. Section 1 = topic shape. 2 & 3 = complementary shapes
  // so we never show the same shape twice in a lesson.
  const s1Type = type;
  const ALL_VARIED: ShapeType[] = ["torus", "dodecahedron", "icosahedron", "cube", "crystal", "cylinder", "molecule", "terrain", "star", "cone"];
  const s2Type = ALL_VARIED.find(c => c !== s1Type) ?? "torus";
  const s3Type = ALL_VARIED.find(c => c !== s1Type && c !== s2Type) ?? "cube";

  const baseLesson = {
    title: topic,
    subtitle: isEn ? `An interactive deep-dive into ${topic}` : `Jelajahi ${topic} secara interaktif`,
    level: levelLabel,
    duration: isEn ? "25 min" : "25 menit",
    intro: isEn
      ? `This lesson explores the fundamentals of ${topic} through interactive 3D models. By the end, you'll understand the core ideas and their real-world connections.`
      : `Materi ini mengeksplorasi konsep dasar ${topic} melalui model 3D interaktif. Di akhir materi, kamu akan memahami ide-ide inti dan hubungannya dengan dunia nyata.`,
    sections: [
      {
        heading: isEn ? `What is ${topic}?` : `Apa itu ${topic}?`,
        body: isEn
          ? `${topic} is a fundamental concept that plays a key role in understanding the world around us. Its core principles form the foundation for more advanced study and practical applications.`
          : `${topic} adalah konsep fundamental yang memainkan peran penting dalam memahami dunia di sekitar kita. Prinsip-prinsip intinya membentuk dasar untuk studi lanjut dan aplikasi praktis.`,
        bullets: [
          isEn ? `Definition and key properties` : `Definisi dan sifat utama`,
          isEn ? "Historical context and discovery" : "Konteks sejarah dan penemuan",
          isEn ? "Why it matters in science and daily life" : "Mengapa penting dalam sains dan kehidupan",
        ],
        shape: { type, color, scale: 1.2, detail: 2, label: topic },
      },
      {
        heading: isEn ? "Core Principles" : "Prinsip-Prinsip Inti",
        body: isEn
          ? `The core principles governing ${topic} explain how it behaves under different conditions and help predict outcomes.`
          : `Prinsip-prinsip inti ${topic} menjelaskan bagaimana ia berperilaku dalam berbagai kondisi dan membantu memprediksi hasil.`,
        bullets: [
          isEn ? "Fundamental laws and patterns" : "Hukum dan pola fundamental",
          isEn ? "How conditions affect behavior" : "Bagaimana kondisi mempengaruhi perilaku",
          isEn ? "Common misconceptions explained" : "Kesalahpahaman umum yang diluruskan",
        ],
        shape: { type: s2Type, color: color2, scale: 1.0, detail: 1, label: isEn ? "Core Principles" : "Prinsip Inti" },
      },
      {
        heading: isEn ? "Real-World Applications" : "Aplikasi di Dunia Nyata",
        body: isEn
          ? `${topic} has practical applications across technology, medicine and engineering. Understanding these shows why the subject is worth studying.`
          : `${topic} memiliki aplikasi praktis di teknologi, kedokteran, dan teknik. Memahami ini menunjukkan mengapa topik ini layak dipelajari.`,
        bullets: [
          isEn ? "Technology and engineering use cases" : "Penerapan di teknologi dan rekayasa",
          isEn ? "Connections to other subjects" : "Hubungan dengan mata pelajaran lain",
          isEn ? "Future research directions" : "Arah penelitian masa depan",
        ],
        shape: { type: s3Type, color: color3, scale: 1.1, detail: 1, label: isEn ? "Applications" : "Aplikasi" },
      },
    ],
    vocabulary: [
      { term: topic, meaning: isEn ? "The central concept of this lesson." : "Konsep utama dari materi ini." },
      { term: isEn ? "Principle" : "Prinsip", meaning: isEn ? "A fundamental rule or law." : "Aturan atau hukum dasar." },
      { term: isEn ? "Structure" : "Struktur", meaning: isEn ? "The way parts are organized." : "Cara bagian-bagian disusun." },
      { term: isEn ? "Function" : "Fungsi", meaning: isEn ? "The specific role of a part in a system." : "Peran spesifik dari suatu bagian dalam sistem." },
    ],
    quiz: [
      {
        question: isEn ? `Which best describes ${topic}?` : `Mana yang paling tepat menggambarkan ${topic}?`,
        options: [
          isEn ? "A fundamental scientific concept" : "Konsep ilmiah yang fundamental",
          isEn ? "Only found in laboratories" : "Hanya ditemukan di laboratorium",
          isEn ? "Not related to daily life" : "Tidak berkaitan dengan kehidupan sehari-hari",
          isEn ? "A purely theoretical idea" : "Ide yang murni teoritis",
        ],
        correctIndex: 0,
        explanation: isEn ? `${topic} is a core concept with broad scientific relevance.` : `${topic} adalah konsep inti dengan relevansi ilmiah yang luas.`,
      },
      {
        question: isEn ? `Why is ${topic} important?` : `Mengapa ${topic} penting dipelajari?`,
        options: [
          isEn ? "It has no practical use" : "Tidak memiliki kegunaan praktis",
          isEn ? "It builds scientific thinking and problem-solving" : "Membangun pemikiran ilmiah dan pemecahan masalah",
          isEn ? "Only relevant historically" : "Hanya relevan secara historis",
          isEn ? "Too complex for everyday use" : "Terlalu kompleks untuk kehidupan sehari-hari",
        ],
        correctIndex: 1,
        explanation: isEn ? `${topic} builds a foundation for scientific thinking.` : `${topic} membangun fondasi untuk berpikir ilmiah.`,
      },
      {
        question: isEn ? `Best approach to learn ${topic}?` : `Pendekatan terbaik mempelajari ${topic}?`,
        options: [
          isEn ? "Memorizing only" : "Hanya menghafal",
          isEn ? "Ignoring real-world connections" : "Mengabaikan hubungan dunia nyata",
          isEn ? "Combining concepts with observation" : "Menggabungkan konsep dengan pengamatan",
          isEn ? "Reading a single source" : "Membaca satu sumber saja",
        ],
        correctIndex: 2,
        explanation: isEn ? "Linking theory to observation deepens understanding." : "Menghubungkan teori dengan pengamatan memperdalam pemahaman.",
      },
    ],
  };

  baseLesson.sections = await attachModels(baseLesson.sections, externalModel);
  return normalizeLesson(baseLesson as Lesson);
}