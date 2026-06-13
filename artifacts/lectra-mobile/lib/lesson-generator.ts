export type ShapeType =
  | "sphere" | "cube" | "torus" | "cone" | "cylinder"
  | "icosahedron" | "dodecahedron" | "organic" | "molecule" | "terrain" | "star" | "replicate";

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
  quiz: { question: string; options: string[]; correctIndex: number; explanation: string }[];
}

// ── Topic database ─────────────────────────────────────────────────────────────

type Loc = {
  title: string; subtitle: string; intro: string;
  sections: { heading: string; body: string; bullets: string[]; shapeLabel: string }[];
  vocab: { term: string; meaning: string }[];
  quiz: { q: string; opts: string[]; ci: number; exp: string }[];
};
type TopicDef = {
  shape: ShapeType; colors: [string, string, string];
  id: Loc; en: Loc;
};

const DB: { keys: string[]; def: TopicDef }[] = [
  {
    keys: ["sel hewan", "sel", "cell", "sitoplasma", "organel", "nukleus", "nucleus", "mitokondria"],
    def: {
      shape: "organic", colors: ["#a8d89a", "#f4a8b8", "#88b8e8"],
      id: {
        title: "Struktur Sel Hewan", subtitle: "Menjelajahi organel dan fungsinya",
        intro: "Sel hewan adalah unit dasar kehidupan yang memiliki berbagai organel dengan fungsi spesifik. Setiap organel bekerja sama layaknya pabrik kecil untuk menjaga sel tetap hidup.",
        sections: [
          { heading: "Membran Sel & Sitoplasma", shapeLabel: "Membran",
            body: "Membran sel adalah lapisan ganda fosfolipid yang mengontrol lalu lintas zat masuk dan keluar. Sitoplasma adalah cairan yang mengisi sel.",
            bullets: ["Terdiri dari lapisan ganda fosfolipid", "Bersifat semipermeabel", "Sitoplasma menopang semua organel"] },
          { heading: "Nukleus – Pusat Kendali", shapeLabel: "Nukleus",
            body: "Nukleus menyimpan DNA dan mengatur aktivitas sel melalui transkripsi RNA.",
            bullets: ["Dilapisi membran ganda (envelope nukleus)", "Mengandung kromosom", "Nukleolus mensintesis rRNA"] },
          { heading: "Mitokondria & Organel Lain", shapeLabel: "Mitokondria",
            body: "Mitokondria menghasilkan ATP melalui respirasi seluler, menjadikannya 'pembangkit listrik' sel.",
            bullets: ["Memiliki membran dalam berlipat (krista)", "RE kasar: sintesis protein", "Aparatus Golgi: pengiriman protein"] },
        ],
        vocab: [
          { term: "Organel", meaning: "Struktur kecil dalam sel dengan fungsi khusus." },
          { term: "ATP", meaning: "Adenosin trifosfat — molekul energi sel." },
          { term: "Ribosom", meaning: "Tempat sintesis protein berlangsung." },
          { term: "Membran semipermeabel", meaning: "Membran yang selektif terhadap zat yang melewatinya." },
        ],
        quiz: [
          { q: "Organel mana yang dijuluki 'pembangkit listrik' sel?", opts: ["Nukleus", "Ribosom", "Mitokondria", "Vakuola"], ci: 2, exp: "Mitokondria menghasilkan ATP melalui respirasi seluler." },
          { q: "Apa fungsi utama membran sel?", opts: ["Menyimpan DNA", "Mengontrol lalu lintas zat", "Menghasilkan energi", "Membelah sel"], ci: 1, exp: "Membran sel semipermeabel mengatur pertukaran zat." },
        ],
      },
      en: {
        title: "Animal Cell Structure", subtitle: "Exploring organelles and their functions",
        intro: "Animal cells are the basic units of life, housing specialized organelles that work together like a factory to keep the cell alive and functional.",
        sections: [
          { heading: "Cell Membrane & Cytoplasm", shapeLabel: "Membrane",
            body: "The phospholipid bilayer controls what enters and exits. Cytoplasm provides a gel-like medium for all organelles.",
            bullets: ["Phospholipid bilayer structure", "Semipermeable — selective transport", "Cytoplasm suspends all organelles"] },
          { heading: "Nucleus — Control Center", shapeLabel: "Nucleus",
            body: "The nucleus stores DNA and regulates cell activity through RNA transcription.",
            bullets: ["Double nuclear envelope", "Contains chromosomes with genes", "Nucleolus makes ribosomal RNA"] },
          { heading: "Mitochondria & Other Organelles", shapeLabel: "Mitochondria",
            body: "Mitochondria produce ATP through cellular respiration — they are the cell's powerhouses.",
            bullets: ["Folded inner membranes (cristae)", "Rough ER studded with ribosomes", "Golgi packages and ships proteins"] },
        ],
        vocab: [
          { term: "Organelle", meaning: "A small structure inside the cell with a specific function." },
          { term: "ATP", meaning: "Adenosine triphosphate — the cell's energy molecule." },
          { term: "Ribosome", meaning: "Where protein synthesis takes place." },
          { term: "Semipermeable membrane", meaning: "A membrane that selectively allows substances through." },
        ],
        quiz: [
          { q: "Which organelle is called the 'powerhouse' of the cell?", opts: ["Nucleus", "Ribosome", "Mitochondria", "Vacuole"], ci: 2, exp: "Mitochondria produce ATP through cellular respiration." },
          { q: "What is the main function of the cell membrane?", opts: ["Store DNA", "Control what enters/exits", "Produce energy", "Help cell division"], ci: 1, exp: "The semipermeable membrane regulates substance exchange." },
        ],
      },
    },
  },
  {
    keys: ["tata surya", "planet", "solar system", "astronomi", "matahari", "saturnus", "jupiter", "bumi"],
    def: {
      shape: "sphere", colors: ["#f4a26b", "#88b8e8", "#f5c542"],
      id: {
        title: "Tata Surya & Planet", subtitle: "Delapan planet dan misteri alam semesta",
        intro: "Tata surya terdiri dari Matahari dan delapan planet yang mengorbitinya. Setiap planet memiliki karakteristik unik dari permukaan batu hingga cincin es yang memukau.",
        sections: [
          { heading: "Matahari sebagai Pusat", shapeLabel: "Matahari",
            body: "Matahari mendominasi 99,86% massa tata surya dan menghasilkan energi melalui fusi nuklir.",
            bullets: ["Suhu permukaan ±5.500°C", "Energi dari fusi hidrogen → helium", "Gravitasinya mengikat semua benda"] },
          { heading: "Planet Kebumian", shapeLabel: "Planet Dalam",
            body: "Merkurius, Venus, Bumi, dan Mars memiliki permukaan padat. Bumi satu-satunya dengan kehidupan.",
            bullets: ["Permukaan padat berbatu", "Ukuran relatif kecil", "Bumi: atmosfer dan magnetosfer pelindung"] },
          { heading: "Planet Gas Raksasa", shapeLabel: "Jupiter",
            body: "Jupiter, Saturnus, Uranus, Neptunus adalah planet gas raksasa.",
            bullets: ["Jupiter: 1.300× volume Bumi", "Cincin Saturnus dari miliaran partikel es", "Uranus dan Neptunus kaya es metana"] },
        ],
        vocab: [
          { term: "Fusi nuklir", meaning: "Penggabungan inti atom ringan melepaskan energi besar." },
          { term: "Orbit", meaning: "Jalur melengkung planet mengelilingi Matahari." },
          { term: "Gravitasi", meaning: "Gaya tarik antara benda bermassa." },
          { term: "Atmosfer", meaning: "Lapisan gas menyelimuti planet." },
        ],
        quiz: [
          { q: "Planet mana yang terbesar di tata surya?", opts: ["Saturnus", "Neptunus", "Jupiter", "Uranus"], ci: 2, exp: "Jupiter bervolume ~1.300× Bumi." },
          { q: "Proses apa menghasilkan energi Matahari?", opts: ["Pembakaran", "Fisi nuklir", "Fusi nuklir", "Evaporasi"], ci: 2, exp: "Matahari menghasilkan energi dari fusi nuklir." },
        ],
      },
      en: {
        title: "The Solar System", subtitle: "Eight planets and the mysteries of the universe",
        intro: "Our solar system consists of the Sun and eight orbiting planets, each with unique characteristics from rocky surfaces to spectacular ice rings.",
        sections: [
          { heading: "The Sun at the Center", shapeLabel: "The Sun",
            body: "The Sun holds 99.86% of solar system mass and generates energy through nuclear fusion.",
            bullets: ["Surface ~5,500°C, core ~15 million°C", "Energy from fusing hydrogen into helium", "Gravity holds all solar bodies"] },
          { heading: "Terrestrial Planets", shapeLabel: "Inner Planets",
            body: "Mercury, Venus, Earth, Mars have solid rocky surfaces. Earth is the only known planet with life.",
            bullets: ["Solid, rocky surfaces", "Smaller than gas giants", "Earth has a protective atmosphere & magnetosphere"] },
          { heading: "Gas Giants", shapeLabel: "Jupiter",
            body: "Jupiter, Saturn, Uranus, Neptune are gas giants with no solid surface.",
            bullets: ["Jupiter: ~1,300× Earth's volume", "Saturn's rings: billions of ice particles", "Uranus and Neptune rich in methane ice"] },
        ],
        vocab: [
          { term: "Nuclear fusion", meaning: "Light atomic nuclei combining into heavier ones, releasing energy." },
          { term: "Orbit", meaning: "Curved path a planet follows around the Sun." },
          { term: "Gravity", meaning: "Attractive force between massive objects." },
          { term: "Atmosphere", meaning: "Layer of gas surrounding a planet." },
        ],
        quiz: [
          { q: "Which is the largest planet?", opts: ["Saturn", "Neptune", "Jupiter", "Uranus"], ci: 2, exp: "Jupiter is ~1,300× Earth's volume." },
          { q: "What generates the Sun's energy?", opts: ["Burning", "Fission", "Nuclear fusion", "Evaporation"], ci: 2, exp: "Nuclear fusion of hydrogen into helium." },
        ],
      },
    },
  },
  {
    keys: ["atom", "molekul", "molecule", "kimia", "chemistry", "elektron", "proton", "ikatan", "bohr"],
    def: {
      shape: "molecule", colors: ["#88b8e8", "#f5c542", "#a8d89a"],
      id: {
        title: "Atom & Struktur Kimia", subtitle: "Partikel subatom dan ikatan kimia",
        intro: "Atom adalah unit terkecil materi yang mempertahankan sifat kimianya. Model atom Bohr menggambarkan elektron di orbit tetap mengelilingi inti.",
        sections: [
          { heading: "Partikel Subatom", shapeLabel: "Atom",
            body: "Atom terdiri dari proton dan neutron di inti, dikelilingi elektron di kulit-kulit.",
            bullets: ["Proton bermuatan positif (+)", "Neutron netral", "Elektron bermuatan negatif (−)"] },
          { heading: "Model Atom Bohr", shapeLabel: "Model Bohr",
            body: "Bohr mengusulkan elektron bergerak di orbit melingkar. Perpindahan elektron menghasilkan emisi cahaya.",
            bullets: ["Tiap orbit menampung elektron tertentu", "K(2), L(8), M(18)", "Lompatan elektron → emisi foton"] },
          { heading: "Ikatan Kimia", shapeLabel: "Ikatan",
            body: "Atom bergabung melalui ikatan ion (transfer elektron) atau kovalen (berbagi elektron).",
            bullets: ["NaCl: ikatan ion", "H₂O, CO₂: ikatan kovalen", "Elektron valensi penentu ikatan"] },
        ],
        vocab: [
          { term: "Nomor atom", meaning: "Jumlah proton — menentukan identitas unsur." },
          { term: "Elektron valensi", meaning: "Elektron di kulit terluar, berperan dalam ikatan." },
          { term: "Ikatan kovalen", meaning: "Dua atom berbagi pasangan elektron." },
          { term: "Ion", meaning: "Atom yang kehilangan atau mendapat elektron." },
        ],
        quiz: [
          { q: "Apa yang menentukan identitas suatu unsur?", opts: ["Neutron", "Massa atom", "Jumlah proton", "Elektron valensi"], ci: 2, exp: "Jumlah proton (nomor atom) menentukan identitas unsur." },
          { q: "Jenis ikatan pada H₂O?", opts: ["Ikatan ion", "Ikatan logam", "Ikatan kovalen", "Van der Waals"], ci: 2, exp: "Air terbentuk dari ikatan kovalen O dan H." },
        ],
      },
      en: {
        title: "Atoms & Chemical Structure", subtitle: "Subatomic particles and chemical bonds",
        intro: "Atoms are the smallest units of matter retaining chemical properties. The Bohr model describes electrons orbiting the nucleus in fixed shells.",
        sections: [
          { heading: "Subatomic Particles", shapeLabel: "Atom",
            body: "An atom has protons and neutrons in its nucleus with electrons in shells around it.",
            bullets: ["Protons: positive charge (+)", "Neutrons: no charge", "Electrons: negative charge (−)"] },
          { heading: "The Bohr Model", shapeLabel: "Bohr Model",
            body: "Bohr proposed electrons orbit in fixed shells. Transitions between shells emit or absorb light.",
            bullets: ["Each shell holds a set number of electrons", "K(2), L(8), M(18)", "Electron jumps → photon emission"] },
          { heading: "Chemical Bonds", shapeLabel: "Bond",
            body: "Atoms bond through ionic (electron transfer) or covalent (electron sharing) interactions.",
            bullets: ["NaCl: ionic bond", "H₂O, CO₂: covalent bonds", "Valence electrons determine bonding"] },
        ],
        vocab: [
          { term: "Atomic number", meaning: "Number of protons — defines the element." },
          { term: "Valence electrons", meaning: "Outer-shell electrons that participate in bonding." },
          { term: "Covalent bond", meaning: "Two atoms sharing a pair of electrons." },
          { term: "Ion", meaning: "An atom that has gained or lost electrons." },
        ],
        quiz: [
          { q: "What defines an element's identity?", opts: ["Neutrons", "Atomic mass", "Number of protons", "Valence electrons"], ci: 2, exp: "The atomic number (proton count) defines the element." },
          { q: "What type of bond is in H₂O?", opts: ["Ionic", "Metallic", "Covalent", "Van der Waals"], ci: 2, exp: "Water forms through covalent O–H bonds." },
        ],
      },
    },
  },
  {
    keys: ["fotosintesis", "photosynthesis", "klorofil", "chlorophyll", "tumbuhan", "plant", "cahaya", "glukosa"],
    def: {
      shape: "organic", colors: ["#7BBD81", "#f5c542", "#88b8e8"],
      id: {
        title: "Fotosintesis", subtitle: "Bagaimana tanaman mengubah cahaya menjadi makanan",
        intro: "Fotosintesis adalah proses di mana tumbuhan mengubah energi cahaya matahari, air, dan CO₂ menjadi glukosa dan oksigen.",
        sections: [
          { heading: "Bahan & Produk", shapeLabel: "Kloroplas",
            body: "6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂. Proses berlangsung di kloroplas dalam sel daun.",
            bullets: ["Bahan: CO₂, H₂O, cahaya matahari", "Produk: glukosa (energi) + O₂", "Tempat: kloroplas di sel daun"] },
          { heading: "Reaksi Terang", shapeLabel: "Membran Tilakoid",
            body: "Reaksi terang berlangsung di membran tilakoid. Energi cahaya memecah air dan menghasilkan ATP + NADPH.",
            bullets: ["Klorofil menyerap cahaya merah & biru", "Fotolisis air menghasilkan O₂", "ATP & NADPH terbentuk"] },
          { heading: "Siklus Calvin (Reaksi Gelap)", shapeLabel: "Stroma",
            body: "Di stroma kloroplas, ATP dan NADPH digunakan untuk mengubah CO₂ menjadi glukosa.",
            bullets: ["Tidak memerlukan cahaya langsung", "CO₂ difiksasi menjadi G3P", "G3P diubah menjadi glukosa"] },
        ],
        vocab: [
          { term: "Klorofil", meaning: "Pigmen hijau penyerap cahaya di dalam kloroplas." },
          { term: "Kloroplas", meaning: "Organel tempat fotosintesis berlangsung." },
          { term: "ATP", meaning: "Molekul energi yang dihasilkan pada reaksi terang." },
          { term: "Stroma", meaning: "Cairan dalam kloroplas tempat siklus Calvin berlangsung." },
        ],
        quiz: [
          { q: "Di mana fotosintesis berlangsung?", opts: ["Mitokondria", "Nukleus", "Kloroplas", "Ribosom"], ci: 2, exp: "Fotosintesis terjadi di kloroplas." },
          { q: "Apa produk sampingan fotosintesis yang penting bagi kita?", opts: ["CO₂", "Nitrogen", "Oksigen", "Glukosa"], ci: 2, exp: "Fotosintesis melepaskan O₂ sebagai produk sampingan." },
        ],
      },
      en: {
        title: "Photosynthesis", subtitle: "How plants convert light into food",
        intro: "Photosynthesis is the process by which plants convert sunlight, water, and CO₂ into glucose and oxygen — the foundation of almost all food chains.",
        sections: [
          { heading: "Reactants & Products", shapeLabel: "Chloroplast",
            body: "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. The reaction takes place in chloroplasts inside leaf cells.",
            bullets: ["Inputs: CO₂, H₂O, sunlight", "Outputs: glucose (energy) + O₂", "Location: chloroplasts in leaf cells"] },
          { heading: "Light-Dependent Reactions", shapeLabel: "Thylakoid Membrane",
            body: "Light reactions occur in the thylakoid membrane. Light energy splits water and produces ATP + NADPH.",
            bullets: ["Chlorophyll absorbs red & blue light", "Water photolysis releases O₂", "ATP & NADPH formed"] },
          { heading: "Calvin Cycle (Dark Reactions)", shapeLabel: "Stroma",
            body: "In the stroma, ATP and NADPH are used to fix CO₂ into glucose.",
            bullets: ["Does not directly require light", "CO₂ fixed into G3P molecules", "G3P converted to glucose"] },
        ],
        vocab: [
          { term: "Chlorophyll", meaning: "The green pigment in chloroplasts that absorbs light." },
          { term: "Chloroplast", meaning: "The organelle where photosynthesis takes place." },
          { term: "ATP", meaning: "Energy molecule produced in the light reactions." },
          { term: "Stroma", meaning: "The fluid inside the chloroplast where the Calvin cycle runs." },
        ],
        quiz: [
          { q: "Where does photosynthesis occur?", opts: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"], ci: 2, exp: "Photosynthesis takes place in the chloroplast." },
          { q: "What is the important by-product of photosynthesis?", opts: ["CO₂", "Nitrogen", "Oxygen", "Glucose"], ci: 2, exp: "Photosynthesis releases O₂ as a by-product." },
        ],
      },
    },
  },
  {
    keys: ["dna", "gen", "gene", "kromosom", "chromosome", "rna", "protein", "genetika", "genetics", "helix"],
    def: {
      shape: "molecule", colors: ["#f4a8b8", "#88b8e8", "#a8d89a"],
      id: {
        title: "DNA & Genetika", subtitle: "Cetak biru kehidupan",
        intro: "DNA (asam deoksiribonukleat) adalah molekul yang menyimpan instruksi genetik untuk pertumbuhan, fungsi, dan reproduksi semua makhluk hidup.",
        sections: [
          { heading: "Struktur DNA", shapeLabel: "Untai DNA",
            body: "DNA berbentuk heliks ganda (double helix) dengan dua rantai nukleotida yang saling berpasangan.",
            bullets: ["Basa nitrogen: A-T dan G-C berpasangan", "Tulang punggung: fosfat + deoksiribosa", "4 basa: Adenin, Timin, Guanin, Sitosin"] },
          { heading: "Replikasi & Transkripsi", shapeLabel: "Replikasi",
            body: "Replikasi menyalin DNA sebelum pembelahan sel. Transkripsi mengubah DNA menjadi mRNA.",
            bullets: ["Replikasi: semi-konservatif", "Transkripsi: DNA → mRNA di nukleus", "Translasi: mRNA → protein di ribosom"] },
          { heading: "Pewarisan Sifat", shapeLabel: "Kromosom",
            body: "Gen adalah segmen DNA yang mengkodekan protein tertentu. Kromosom membawa ribuan gen.",
            bullets: ["Manusia: 46 kromosom (23 pasang)", "Alel menentukan fenotipe", "Hukum Mendel: dominan vs resesif"] },
        ],
        vocab: [
          { term: "Nukleotida", meaning: "Unit dasar DNA: basa nitrogen + gula + fosfat." },
          { term: "Gen", meaning: "Segmen DNA pengkode protein atau RNA tertentu." },
          { term: "Kromosom", meaning: "Struktur yang membawa informasi genetik (DNA + protein)." },
          { term: "Alel", meaning: "Varian gen yang menentukan sifat berbeda." },
        ],
        quiz: [
          { q: "Pasangan basa nitrogen yang benar di DNA?", opts: ["A-G dan T-C", "A-T dan G-C", "A-C dan G-T", "A-U dan G-C"], ci: 1, exp: "Adenin berpasangan dengan Timin, Guanin dengan Sitosin." },
          { q: "Berapa jumlah kromosom manusia?", opts: ["23", "44", "46", "48"], ci: 2, exp: "Manusia memiliki 46 kromosom dalam 23 pasang." },
        ],
      },
      en: {
        title: "DNA & Genetics", subtitle: "The blueprint of life",
        intro: "DNA (deoxyribonucleic acid) stores the genetic instructions for growth, function, and reproduction of all living organisms.",
        sections: [
          { heading: "DNA Structure", shapeLabel: "DNA Strand",
            body: "DNA forms a double helix with two nucleotide strands held together by base pairing.",
            bullets: ["Base pairs: A-T and G-C", "Backbone: phosphate + deoxyribose", "4 bases: Adenine, Thymine, Guanine, Cytosine"] },
          { heading: "Replication & Transcription", shapeLabel: "Replication",
            body: "Replication copies DNA before cell division. Transcription converts DNA into mRNA.",
            bullets: ["Replication: semi-conservative", "Transcription: DNA → mRNA in nucleus", "Translation: mRNA → protein at ribosomes"] },
          { heading: "Heredity & Genetics", shapeLabel: "Chromosome",
            body: "Genes are DNA segments encoding specific proteins. Chromosomes carry thousands of genes.",
            bullets: ["Humans: 46 chromosomes (23 pairs)", "Alleles determine phenotype", "Mendel's laws: dominant vs recessive"] },
        ],
        vocab: [
          { term: "Nucleotide", meaning: "Basic DNA unit: nitrogenous base + sugar + phosphate." },
          { term: "Gene", meaning: "A DNA segment encoding a specific protein or RNA." },
          { term: "Chromosome", meaning: "Structure carrying genetic material (DNA + proteins)." },
          { term: "Allele", meaning: "A gene variant determining different traits." },
        ],
        quiz: [
          { q: "Which base pairing is correct in DNA?", opts: ["A-G and T-C", "A-T and G-C", "A-C and G-T", "A-U and G-C"], ci: 1, exp: "Adenine pairs with Thymine; Guanine pairs with Cytosine." },
          { q: "How many chromosomes do humans have?", opts: ["23", "44", "46", "48"], ci: 2, exp: "Humans have 46 chromosomes in 23 pairs." },
        ],
      },
    },
  },
];

// ── Normalizer ─────────────────────────────────────────────────────────────────

export function normalizeLesson(raw: Partial<Lesson>): Lesson {
  const r = raw || {} as Lesson;
  return {
    title: r.title || "Lesson",
    subtitle: r.subtitle || "",
    level: r.level || "All Levels",
    duration: r.duration || "20 min",
    intro: r.intro || "",
    sections: (r.sections || []).slice(0, 5).map((s) => ({
      heading: s?.heading || "Section",
      body: s?.body || "",
      bullets: (s?.bullets || []).slice(0, 4),
      shape: {
        type: s?.shape?.type || "sphere",
        color: s?.shape?.color || "#88b8e8",
        scale: 1,
        detail: 1,
        label: s?.shape?.label || s?.heading || "Shape",
        modelUrl: s?.shape?.modelUrl,
        vertexCount: s?.shape?.vertexCount,
        faceCount: s?.shape?.faceCount,
        modelSource: s?.shape?.modelSource,
      },
    })),
    vocabulary: (r.vocabulary || []).slice(0, 8).map((v) => ({
      term: v?.term || "Term",
      meaning: v?.meaning || "",
    })),
    quiz: (r.quiz || [])
      .filter((q) => q && Array.isArray(q.options) && q.options.length >= 2)
      .slice(0, 6)
      .map((q) => ({
        question: q.question || "",
        options: (q.options || []).slice(0, 4),
        correctIndex: Math.max(0, Math.min(3, q.correctIndex || 0)),
        explanation: q.explanation || "",
      })),
  };
}

// ── Main generator ─────────────────────────────────────────────────────────────

export type ExternalModel = { url: string; vertices: number; faces: number; source: string };

/**
 * Apply a generated 3D model to sections.
 * The first section gets the full model; remaining sections inherit the URL so
 * the viewer can surface an "Open Model" button for the lesson overall.
 */
function applyExternalModel(
  sections: Partial<LessonSection>[],
  model: ExternalModel,
): Partial<LessonSection>[] {
  return sections.map((s, i) => ({
    ...s,
    shape: {
      ...s.shape!,
      modelUrl: model.url,
      vertexCount: i === 0 ? model.vertices : undefined,
      faceCount: i === 0 ? model.faces : undefined,
      modelSource: model.source,
    },
  }));
}

export async function generateLocalLesson(
  topic: string,
  locale: "id" | "en",
  level: string,
  externalModel?: ExternalModel,
): Promise<Lesson> {
  const norm = topic.toLowerCase().trim();
  const match = DB.find((entry) => entry.keys.some((k) => norm.includes(k) || k.includes(norm)));

  if (match) {
    const loc = locale === "en" ? match.def.en : match.def.id;
    const [c1, c2, c3] = match.def.colors;
    let sections: Partial<LessonSection>[] = loc.sections.map((s, i) => ({
      heading: s.heading,
      body: s.body,
      bullets: s.bullets,
      shape: { type: match.def.shape, color: [c1, c2, c3][i % 3], scale: 1, detail: 1, label: s.shapeLabel },
    }));
    if (externalModel) sections = applyExternalModel(sections, externalModel);
    return normalizeLesson({
      title: loc.title,
      subtitle: loc.subtitle,
      level,
      duration: "25 min",
      intro: loc.intro,
      sections: sections as LessonSection[],
      vocabulary: loc.vocab,
      quiz: loc.quiz.map((q) => ({ question: q.q, options: q.opts, correctIndex: q.ci, explanation: q.exp })),
    });
  }

  // Fallback for unknown topics
  const isEn = locale === "en";
  const colors = ["#f5c542", "#88b8e8", "#a8d89a"];
  const shapes: ShapeType[] = ["sphere", "cube", "torus"];
  let fallbackSections: Partial<LessonSection>[] = [
    {
      heading: isEn ? "Core Concepts" : "Konsep Dasar",
      body: isEn ? `${topic} covers fundamental principles that form the basis of scientific understanding.` : `${topic} mencakup prinsip-prinsip dasar yang membentuk pemahaman ilmiah.`,
      bullets: [
        isEn ? "Definition and basic principles" : "Definisi dan prinsip dasar",
        isEn ? "Historical development" : "Perkembangan historis",
        isEn ? "Key terminology" : "Terminologi kunci",
      ],
      shape: { type: shapes[0], color: colors[0], scale: 1, detail: 1, label: isEn ? "Core" : "Inti" },
    },
    {
      heading: isEn ? "Key Principles" : "Prinsip Utama",
      body: isEn ? `The fundamental laws and patterns governing ${topic}.` : `Hukum dan pola yang mengatur ${topic}.`,
      bullets: [
        isEn ? "Fundamental laws and patterns" : "Hukum dan pola fundamental",
        isEn ? "Cause and effect relationships" : "Hubungan sebab akibat",
        isEn ? "How conditions affect behavior" : "Pengaruh kondisi terhadap perilaku",
      ],
      shape: { type: shapes[1], color: colors[1], scale: 1, detail: 1, label: isEn ? "Principles" : "Prinsip" },
    },
    {
      heading: isEn ? "Real-World Applications" : "Aplikasi Nyata",
      body: isEn ? `${topic} has practical applications in technology, medicine, and daily life.` : `${topic} memiliki aplikasi praktis di teknologi, kedokteran, dan kehidupan sehari-hari.`,
      bullets: [
        isEn ? "Technology applications" : "Penerapan di teknologi",
        isEn ? "Connections to other subjects" : "Hubungan dengan mata pelajaran lain",
        isEn ? "Future research directions" : "Arah penelitian masa depan",
      ],
      shape: { type: shapes[2], color: colors[2], scale: 1, detail: 1, label: isEn ? "Applications" : "Aplikasi" },
    },
  ];
  if (externalModel) fallbackSections = applyExternalModel(fallbackSections, externalModel);
  return normalizeLesson({
    title: isEn ? topic : topic,
    subtitle: isEn ? `An introduction to ${topic}` : `Pengantar ${topic}`,
    level,
    duration: "20 min",
    intro: isEn
      ? `${topic} is a fascinating subject with deep connections to science and everyday life.`
      : `${topic} adalah topik yang menarik dengan koneksi mendalam ke sains dan kehidupan sehari-hari.`,
    sections: fallbackSections as LessonSection[],
    vocabulary: [
      { term: topic, meaning: isEn ? "The central concept of this lesson." : "Konsep utama dari pelajaran ini." },
      { term: isEn ? "Principle" : "Prinsip", meaning: isEn ? "A fundamental rule or law." : "Aturan atau hukum dasar." },
      { term: isEn ? "Structure" : "Struktur", meaning: isEn ? "How parts are organized." : "Cara bagian-bagian tersusun." },
      { term: isEn ? "Function" : "Fungsi", meaning: isEn ? "The specific role of a part in a system." : "Peran spesifik suatu bagian dalam sistem." },
    ],
    quiz: [
      {
        question: isEn ? `Which best describes ${topic}?` : `Mana yang paling tepat menggambarkan ${topic}?`,
        options: [
          isEn ? "A fundamental scientific concept" : "Konsep ilmiah yang fundamental",
          isEn ? "Found only in laboratories" : "Hanya ditemukan di laboratorium",
          isEn ? "Unrelated to daily life" : "Tidak berkaitan kehidupan sehari-hari",
          isEn ? "A purely theoretical idea" : "Ide murni teoritis",
        ],
        correctIndex: 0,
        explanation: isEn ? `${topic} is a core concept with broad scientific relevance.` : `${topic} adalah konsep inti yang relevan secara ilmiah.`,
      },
      {
        question: isEn ? `Why is ${topic} important?` : `Mengapa ${topic} penting?`,
        options: [
          isEn ? "It has no practical use" : "Tidak ada kegunaan praktis",
          isEn ? "Builds scientific thinking" : "Membangun pemikiran ilmiah",
          isEn ? "Only historically relevant" : "Hanya relevan secara historis",
          isEn ? "Too complex for everyday use" : "Terlalu kompleks",
        ],
        correctIndex: 1,
        explanation: isEn ? `${topic} builds a foundation for scientific thinking.` : `${topic} membangun fondasi berpikir ilmiah.`,
      },
    ],
  });
}
