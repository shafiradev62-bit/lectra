export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(v: string | undefined): v is Locale {
  return v === "id" || v === "en";
}

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "id";
  const l = (navigator.language || "id").toLowerCase();
  return l.startsWith("id") ? "id" : "en";
}

type Dict = {
  nav: { features: string; showcase: string; pricing: string; community: string; cta: string; menu: string };
  hero: {
    title1: string; titleEm: string; title2: string;
    subtitle: string;
    primary: string; demo: string;
    social: string;
    badge1: string; badge2: string;
  };
  subjects: { heading: string; items: string[] };
  why: {
    heading: string; sub: string;
    cards: { tag: string; title: string; desc: string; chip1?: string; chip2?: string }[];
  };
  showcase: {
    a: { tag: string; title: string; body: string; bullets: string[]; cta: string; badge: string };
    b: { tag: string; title: string; body: string; bullets: string[]; cta: string; badge: string };
  };
  pricing: {
    heading: string; sub: string; tag: string; plan: string; per: string;
    perDay: string; trial: string; cta: string; perks: string[];
  };
  finalCta: { title1: string; titleEm: string; sub: string; cta: string };
  footer: { privacy: string; terms: string; contact: string; schools: string };
  create: {
    back: string;
    heading1: string; headingEm: string;
    sub: string;
    topicLabel: string; topicPlaceholder: string;
    levelLabel: string; levels: string[];
    submit: string; loading: string;
    loadingSteps: string[];
    suggestionsLabel: string; suggestions: string[];
    error: string;
    charCount: string;
    historyLabel: string;
    recentEmpty: string;
    photoMode: string;
    topicMode: string;
    photoLabel: string;
    photoHint: string;
    photoSubmit: string;
  };
  lesson: {
    back: string; newLesson: string;
    notFoundTitle: string; notFoundSub: string; notFoundCta: string;
    loading: string;
    section: string; viewAr: string; vertices: string;
    vocab: string; quiz: string;
    correct: string; wrong: string;
    arTag: string; arTitle: string; arSub: string; downloadQr: string; downloadGlb: string; downloadObj: string;
    viewVr: string; openAr: string; pipeline: string;
    share: string; copyLink: string; copied: string; print: string;
    quizScore: string; quizScoreOf: string; quizRetry: string;
    history: string; historyEmpty: string; historyDelete: string; historyOpen: string;
    progressLabel: string;
  };
};

const id: Dict = {
  nav: { features: "Fitur", showcase: "Showcase", pricing: "Harga", community: "Komunitas", cta: "Mulai Membuat", menu: "Menu" },
  hero: {
    title1: "Bikin media belajar yang ", titleEm: "hidup", title2: ", dalam hitungan menit.",
    subtitle: "Lectra mengubah materi pelajaranmu jadi model 3D ber-vertex, pengalaman AR, slide interaktif, dan mini-game — semua berjalan lokal, tanpa API key.",
    primary: "Buat Materi Sekarang", demo: "Lihat Demo",
    social: "Dipakai 1.200+ guru di Indonesia",
    badge1: "cell.obj · 824 vertices", badge2: "AR siap ditampilkan",
  },
  subjects: { heading: "Saya ingin membuat materi tentang", items: ["Biologi","Astronomi","Fisika","Kimia","Matematika","Sejarah","Geografi","Anatomi"] },
  why: {
    heading: "Kenapa guru memilih Lectra?",
    sub: "Semua alat untuk mengajar interaktif jadi satu — tanpa coding, tanpa API key, tanpa pusing.",
    cards: [
      { tag: "3D & VERTEX", title: "Generator 3D lokal", desc: "Ketik topik, dapatkan model 3D lengkap dengan vertex, edge, dan face. Export .obj, .glb, .gltf untuk dipakai di software lain.", chip1: "824 vertices", chip2: "export .glb" },
      { tag: "AR OTOMATIS", title: "Scan, langsung muncul", desc: "Setiap model 3D langsung dapat QR untuk AR. Tempel di buku, murid scan, model muncul di meja mereka.", chip1: "WebAR · no app" },
      { tag: "MEDIA BELAJAR", title: "Slide & worksheet adaptif", desc: "Materi diubah jadi slide interaktif, kuis, dan worksheet yang menyesuaikan tingkat kesulitan kelas.", chip1: "Auto kuis" },
      { tag: "GAME BUILDER", title: "Mini-game tanpa coding", desc: "Ubah topik jadi game playable: drag-drop, quiz arena, simulasi sains. Murid main, guru pantau skor.", chip1: "Score 100%" },
      { tag: "OFFLINE", title: "Jalan di laptop kelas", desc: "Engine ringan, offline-first. Tidak butuh GPU mahal, tidak butuh internet stabil, tidak butuh langganan API." },
      { tag: "KOMUNITAS", title: "Library guru se-Indonesia", desc: "Ribuan template siap pakai dari guru lain. Remix dan sesuaikan dengan kelasmu dalam 2 klik." },
    ],
  },
  showcase: {
    a: {
      tag: "EXPORT VERTEX",
      title: "Model 3D yang benar-benar bisa kamu pakai di mana saja.",
      body: "Lectra tidak cuma menampilkan gambar 3D. Setiap model punya geometri asli — vertex, edge, dan face — yang bisa kamu export ke Blender, Unity, atau software CAD apapun.",
      bullets: ["Export .obj, .glb, .gltf, .stl", "Topology bersih, low-poly siap pakai", "Dilengkapi UV map untuk texture"],
      cta: "Mulai membuat", badge: "1,280 vertices",
    },
    b: {
      tag: "AR OTOMATIS",
      title: "Murid melihat dinosaurus di atas mejanya sendiri.",
      body: "Setiap model otomatis dapat link AR dan QR code. Murid tinggal scan dari HP mereka — tidak perlu install aplikasi, tidak perlu akun.",
      bullets: ["WebAR — buka langsung di browser", "Mendukung iOS dan Android", "Bagikan via link atau QR di buku"],
      cta: "Coba AR", badge: "Scan untuk lihat AR",
    },
  },
  pricing: {
    heading: "Coba semua fitur sekarang, gratis.",
    sub: "Tanpa daftar, tanpa kartu kredit. Langganan hanya kalau kamu mau menyimpan & berbagi lebih banyak.",
    tag: "LECTRA PRO", plan: "Untuk Guru", per: "/ bulan",
    perDay: "≈ Rp650/hari",
    trial: "Semua fitur sudah bisa kamu pakai sekarang tanpa bayar.",
    cta: "Buat materi gratis sekarang",
    perks: [
      "Generator 3D lokal tanpa batas",
      "Export .obj dengan vertex asli — bisa dibuka di Blender",
      "AR viewer + QR untuk semua model",
      "Kuis & worksheet adaptif otomatis",
      "Semua fitur premium dibuka selama beta",
      "Library komunitas guru se-Indonesia",
    ],
  },
  finalCta: { title1: "Mengajar lebih hidup, ", titleEm: "murid lebih ingat", sub: "Bergabunglah dengan ribuan guru yang mengubah cara mereka mengajar dengan Lectra.", cta: "Buat materi pertama kamu" },
  footer: { privacy: "Privasi", terms: "Syarat", contact: "Kontak", schools: "Untuk Sekolah" },
  create: {
    back: "Kembali",
    heading1: "Apa yang ingin kamu ", headingEm: "ajarkan",
    sub: "Lectra akan menyusun materi, model 3D, dan kuis otomatis.",
    topicLabel: "Topik pelajaran",
    topicPlaceholder: "Contoh: Struktur sel hewan dan fungsinya",
    levelLabel: "Tingkat kelas",
    levels: ["SD Kelas 4-6", "SMP Kelas 7-9", "SMA Kelas 10-12"],
    submit: "Buat Materi", loading: "Menyusun materi…",
    loadingSteps: ["Menganalisis topik…", "Menyusun konten…", "Menjalankan AR3D pipeline…", "Optimasi mesh & texture…", "Menyiapkan kuis…", "Hampir selesai…"],
    photoMode: "Upload Foto", topicMode: "Ketik Topik",
    photoLabel: "Upload 4–8 foto objek (HP guru)", photoHint: "Putar objek 360° — hasil 5–10× lebih akurat",
    photoSubmit: "Generate dari Foto",
    suggestionsLabel: "Atau pilih ide siap pakai",
    suggestions: ["Struktur sel hewan", "Tata surya & planet", "Model atom Bohr", "Reaksi asam-basa", "Teorema Pythagoras", "Kerajaan Majapahit", "Lempeng tektonik", "Sistem rangka manusia"],
    error: "Gagal membuat materi",
    charCount: "karakter tersisa",
    historyLabel: "Materi sebelumnya",
    recentEmpty: "Belum ada materi",
  },
  lesson: {
    back: "Kembali", newLesson: "+ Materi baru",
    notFoundTitle: "Materi tidak ditemukan",
    notFoundSub: "Materi mungkin sudah dihapus atau dibuat di perangkat lain.",
    notFoundCta: "Buat materi baru",
    loading: "Memuat…",
    section: "SECTION", viewAr: "Lihat di AR", vertices: "vertices",
    vocab: "Kosakata kunci", quiz: "Cek pemahaman",
    correct: "Benar! ", wrong: "Belum tepat. ",
    arTag: "AR MODE", arTitle: "Scan untuk lihat di mejamu",
    arSub: "Buka kamera HP murid, scan QR di bawah, dan model 3D akan muncul di layar mereka. Tanpa install aplikasi.",
    downloadQr: "Unduh QR", downloadGlb: "Unduh .glb", downloadObj: "Unduh .glb",
    viewVr: "Mode VR", openAr: "Buka AR", pipeline: "AR3D Pipeline",
    share: "Bagikan", copyLink: "Salin Link", copied: "Tersalin!", print: "Cetak",
    quizScore: "Skor kamu", quizScoreOf: "dari", quizRetry: "Ulangi",
    history: "Riwayat Materi", historyEmpty: "Belum ada materi tersimpan.", historyDelete: "Hapus", historyOpen: "Buka",
    progressLabel: "Progres membaca",
  },
};

const en: Dict = {
  nav: { features: "Features", showcase: "Showcase", pricing: "Pricing", community: "Community", cta: "Start Creating", menu: "Menu" },
  hero: {
    title1: "Build learning media that ", titleEm: "comes alive", title2: ", in minutes.",
    subtitle: "Lectra turns your lesson topics into 3D models with real vertices, AR experiences, interactive slides, and mini-games — all running locally, no API keys.",
    primary: "Create Lesson Now", demo: "Watch Demo",
    social: "Used by 1,200+ teachers worldwide",
    badge1: "cell.obj · 824 vertices", badge2: "AR ready to show",
  },
  subjects: { heading: "I want to build a lesson about", items: ["Biology","Astronomy","Physics","Chemistry","Math","History","Geography","Anatomy"] },
  why: {
    heading: "Why teachers choose Lectra",
    sub: "Every tool for interactive teaching in one place — no code, no API keys, no headaches.",
    cards: [
      { tag: "3D & VERTEX", title: "Local 3D generator", desc: "Type a topic and get a full 3D model with vertices, edges and faces. Export .obj, .glb, .gltf to use anywhere.", chip1: "824 vertices", chip2: "export .glb" },
      { tag: "AUTO AR", title: "Scan, and it appears", desc: "Every 3D model ships with an AR QR code. Stick it in the textbook, students scan, the model lands on their desk.", chip1: "WebAR · no app" },
      { tag: "LEARNING MEDIA", title: "Adaptive slides & worksheets", desc: "Your topic becomes interactive slides, quizzes and worksheets that fit your classroom level.", chip1: "Auto quiz" },
      { tag: "GAME BUILDER", title: "No-code mini-games", desc: "Turn topics into playable games: drag-drop, quiz arena, science sims. Students play, you track the scores.", chip1: "Score 100%" },
      { tag: "OFFLINE", title: "Runs on classroom laptops", desc: "Light engine, offline-first. No expensive GPU, no fast internet, no monthly API bill.", },
      { tag: "COMMUNITY", title: "Global teachers library", desc: "Thousands of ready-made templates from other teachers. Remix and fit to your class in two clicks." },
    ],
  },
  showcase: {
    a: {
      tag: "VERTEX EXPORT",
      title: "3D models you can actually take anywhere.",
      body: "Lectra doesn't just render a picture. Every model has real geometry — vertices, edges and faces — that you can export to Blender, Unity, or any CAD tool.",
      bullets: ["Export .obj, .glb, .gltf, .stl", "Clean low-poly topology", "UV maps included for texturing"],
      cta: "Start creating", badge: "1,280 vertices",
    },
    b: {
      tag: "AUTO AR",
      title: "Students watch a dinosaur stand on their own desk.",
      body: "Every model gets an AR link and a QR code automatically. Students scan from their phone — no app install, no account.",
      bullets: ["WebAR — opens straight in the browser", "Works on iOS and Android", "Share via link or printed QR"],
      cta: "Try AR", badge: "Scan to view AR",
    },
  },
  pricing: {
    heading: "Try every feature right now, free.",
    sub: "No sign-up, no credit card. Subscribe only if you want to save & share more.",
    tag: "LECTRA PRO", plan: "For Teachers", per: "/ month",
    perDay: "≈ $0.05/day",
    trial: "Every feature works for you now — no payment needed.",
    cta: "Build a lesson free now",
    perks: [
      "Unlimited local 3D generation",
      "Export real-vertex .obj — open in Blender",
      "AR viewer + QR for every model",
      "Adaptive quizzes & worksheets",
      "All premium features unlocked during beta",
      "Global teachers community library",
    ],
  },
  finalCta: { title1: "Teach with life, ", titleEm: "students remember more", sub: "Join thousands of teachers transforming how they teach with Lectra.", cta: "Build your first lesson" },
  footer: { privacy: "Privacy", terms: "Terms", contact: "Contact", schools: "For Schools" },
  create: {
    back: "Back",
    heading1: "What do you want to ", headingEm: "teach",
    sub: "Lectra will draft the material, 3D models and quiz automatically.",
    topicLabel: "Lesson topic",
    topicPlaceholder: "Example: Animal cell structure and functions",
    levelLabel: "Grade level",
    levels: ["Grade 4-6", "Grade 7-9", "Grade 10-12"],
    submit: "Build Lesson", loading: "Drafting lesson…",
    loadingSteps: ["Analyzing topic…", "Drafting content…", "Running AR3D pipeline…", "Optimizing mesh & textures…", "Preparing quiz…", "Almost done…"],
    photoMode: "Upload Photos", topicMode: "Type Topic",
    photoLabel: "Upload 4–8 photos of the object", photoHint: "Orbit 360° around object — 5–10× more accurate",
    photoSubmit: "Generate from Photos",
    suggestionsLabel: "Or pick a ready idea",
    suggestions: ["Animal cell structure", "The solar system & planets", "Bohr atomic model", "Acid-base reactions", "Pythagorean theorem", "Ancient Roman empire", "Plate tectonics", "Human skeletal system"],
    error: "Failed to build lesson",
    charCount: "characters left",
    historyLabel: "Previous lessons",
    recentEmpty: "No lessons yet",
  },
  lesson: {
    back: "Back", newLesson: "+ New lesson",
    notFoundTitle: "Lesson not found",
    notFoundSub: "It may have been deleted or created on another device.",
    notFoundCta: "Create a new lesson",
    loading: "Loading…",
    section: "SECTION", viewAr: "View in AR", vertices: "vertices",
    vocab: "Key vocabulary", quiz: "Check understanding",
    correct: "Correct! ", wrong: "Not quite. ",
    arTag: "AR MODE", arTitle: "Scan to see it on your desk",
    arSub: "Open the camera on the student's phone, scan the QR below, and the 3D model appears on their screen. No app install.",
    downloadQr: "Download QR", downloadGlb: "Download .glb", downloadObj: "Download .glb",
    viewVr: "VR Mode", openAr: "Open AR", pipeline: "AR3D Pipeline",
    share: "Share", copyLink: "Copy Link", copied: "Copied!", print: "Print",
    quizScore: "Your score", quizScoreOf: "out of", quizRetry: "Retry",
    history: "Lesson History", historyEmpty: "No saved lessons yet.", historyDelete: "Delete", historyOpen: "Open",
    progressLabel: "Reading progress",
  },
};

export const dict: Record<Locale, Dict> = { id, en };
export type { Dict };
