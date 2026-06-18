const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.3 x 7.5 inches

// ─── THEME COLORS ───────────────────────────────────────────────
const C = {
  blue: "1E40AF",       // dark blue
  lightBlue: "3B82F6",  // medium blue
  sky: "DBEAFE",        // very light blue
  white: "FFFFFF",
  black: "111827",
  gray: "6B7280",
  lightGray: "F3F4F6",
  green: "16A34A",
  accent: "0EA5E9",
};

function addHeader(slide, title, subtitle) {
  // Top bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 1.1,
    fill: { color: C.blue },
    line: { type: "none" },
  });
  slide.addText(title, {
    x: 0.3, y: 0.1, w: "90%", h: 0.55,
    fontSize: 22, bold: true, color: C.white, valign: "middle",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.3, y: 0.65, w: "90%", h: 0.35,
      fontSize: 11, color: "93C5FD", valign: "top",
    });
  }
  // Bottom accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.3, w: "100%", h: 0.2,
    fill: { color: C.lightBlue },
    line: { type: "none" },
  });
}

function pill(slide, text, x, y, w, h, bg, textColor) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.1,
    fill: { color: bg },
    line: { type: "none" },
  });
  slide.addText(text, {
    x, y, w, h,
    fontSize: 10, bold: true, color: textColor || C.white,
    align: "center", valign: "middle",
  });
}

function card(slide, x, y, w, h, title, titleColor, body) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    rectRadius: 0.12,
    fill: { color: C.lightGray },
    line: { color: "E5E7EB", pt: 1 },
    shadow: { type: "outer", color: "00000022", blur: 4, offset: 2, angle: 45 },
  });
  slide.addText(title, {
    x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.35,
    fontSize: 11, bold: true, color: titleColor || C.blue,
  });
  slide.addText(body, {
    x: x + 0.15, y: y + 0.45, w: w - 0.3, h: h - 0.6,
    fontSize: 9.5, color: C.black, valign: "top",
    paraSpaceAfter: 3,
  });
}

// ════════════════════════════════════════════════════
// SLIDE 1 — JUDUL
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();

  // Full background gradient-style with two rectangles
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.blue },
    line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 4.5, w: "100%", h: 3.0,
    fill: { color: "1E3A8A" },
    line: { type: "none" },
  });

  // Decorative circles
  s.addShape(pptx.ShapeType.ellipse, {
    x: 10.5, y: -1, w: 3.5, h: 3.5,
    fill: { color: "2563EB", transparency: 50 },
    line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: -0.8, y: 5, w: 2.5, h: 2.5,
    fill: { color: "3B82F6", transparency: 60 },
    line: { type: "none" },
  });

  // Badge
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.5, y: 1.0, w: 4.3, h: 0.45,
    rectRadius: 0.08,
    fill: { color: "2563EB" },
    line: { type: "none" },
  });
  s.addText("SISTEM HELPDESK OTOMATIS — TUGAS AKHIR", {
    x: 4.5, y: 1.0, w: 4.3, h: 0.45,
    fontSize: 9, bold: true, color: "93C5FD",
    align: "center", valign: "middle",
  });

  // Main title
  s.addText("Sistem Helpdesk Berbasis NLP", {
    x: 0.8, y: 1.65, w: 11.7, h: 1.2,
    fontSize: 36, bold: true, color: C.white,
    align: "center",
  });

  // Subtitle line
  s.addShape(pptx.ShapeType.rect, {
    x: 4.8, y: 2.9, w: 3.7, h: 0.06,
    fill: { color: "60A5FA" },
    line: { type: "none" },
  });

  s.addText("Klasifikasi & Routing Tiket Otomatis\nmenggunakan Natural Language Processing", {
    x: 0.8, y: 3.05, w: 11.7, h: 0.9,
    fontSize: 14, color: "BFDBFE", align: "center", paraSpaceAfter: 4,
  });

  // Info cards at bottom
  const infoItems = [
    { icon: "👤", label: "Dwiky Setiawan" },
    { icon: "🏛️", label: "Tugas Akhir / Skripsi" },
    { icon: "📅", label: "2026" },
  ];
  infoItems.forEach((item, i) => {
    const x = 1.6 + i * 3.8;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 5.2, w: 3.2, h: 0.75,
      rectRadius: 0.1,
      fill: { color: "1D4ED8", transparency: 30 },
      line: { color: "3B82F6", pt: 1 },
    });
    s.addText(`${item.icon}  ${item.label}`, {
      x, y: 5.2, w: 3.2, h: 0.75,
      fontSize: 12, color: C.white, align: "center", valign: "middle",
    });
  });

  // Tech tags
  ["Next.js 15", "React 19", "MySQL / TiDB", "Vercel", "NLP Classifier"].forEach((tag, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.9 + i * 2.45, y: 6.3, w: 2.15, h: 0.38,
      rectRadius: 0.06,
      fill: { color: "1E40AF" },
      line: { color: "60A5FA", pt: 1 },
    });
    s.addText(tag, {
      x: 0.9 + i * 2.45, y: 6.3, w: 2.15, h: 0.38,
      fontSize: 9, color: "93C5FD", align: "center", valign: "middle", bold: true,
    });
  });
}

// ════════════════════════════════════════════════════
// SLIDE 2 — LATAR BELAKANG
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Latar Belakang", "Mengapa sistem ini dibutuhkan?");

  // Problem statement intro
  s.addText("Di banyak perusahaan, penanganan permintaan bantuan (helpdesk) masih dilakukan secara manual — menyebabkan keterlambatan dan kesalahan routing.", {
    x: 0.4, y: 1.25, w: 12.5, h: 0.55,
    fontSize: 11, color: C.gray, italic: true,
  });

  // 4 problem cards
  const problems = [
    { icon: "⏱️", title: "Lambat & Manual", desc: "Staf harus membaca satu per satu tiket dan menentukan divisi tujuan secara manual, memakan waktu dan tenaga." },
    { icon: "❌", title: "Sering Salah Arah", desc: "Tiket sering dikirim ke divisi yang tidak tepat, sehingga harus dioper ulang dan respons menjadi lambat." },
    { icon: "📋", title: "Sulit Dipantau", desc: "Tidak ada sistem terpusat untuk memantau status tiket secara real-time, progres sering tidak jelas." },
    { icon: "🔔", title: "Tanpa Notifikasi", desc: "Tidak ada pemberitahuan otomatis saat tiket diterima atau diselesaikan, sehingga komunikasi tidak efisien." },
  ];

  problems.forEach((p, i) => {
    const x = 0.3 + (i % 2) * 6.45;
    const y = 2.0 + Math.floor(i / 2) * 2.1;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.15, h: 1.85,
      rectRadius: 0.12,
      fill: { color: C.sky },
      line: { color: "BFDBFE", pt: 1 },
    });
    s.addText(p.icon + "  " + p.title, {
      x: x + 0.2, y: y + 0.15, w: 5.7, h: 0.4,
      fontSize: 12, bold: true, color: C.blue,
    });
    s.addText(p.desc, {
      x: x + 0.2, y: y + 0.55, w: 5.7, h: 1.1,
      fontSize: 10, color: C.black,
    });
  });

  // Solution arrow
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 6.35, w: "100%", h: 0.8,
    fill: { color: C.blue }, line: { type: "none" },
  });
  s.addText("✅  Solusi: Sistem Helpdesk Otomatis berbasis NLP yang mengklasifikasi dan mengarahkan tiket secara cerdas & real-time", {
    x: 0.4, y: 6.35, w: 12.5, h: 0.8,
    fontSize: 12, bold: true, color: C.white, valign: "middle",
  });
}

// ════════════════════════════════════════════════════
// SLIDE 3 — TUJUAN
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Tujuan", "Apa yang ingin dicapai dari project ini?");

  const goals = [
    {
      no: "01", title: "Klasifikasi Tiket Otomatis",
      desc: "Membangun sistem yang mampu menganalisis isi tiket dan menentukan kategori serta divisi tujuan secara otomatis menggunakan NLP.",
      color: "1E40AF",
    },
    {
      no: "02", title: "Routing Cerdas ke Divisi yang Tepat",
      desc: "Tiket yang masuk langsung diarahkan ke divisi yang sesuai (IT, Keuangan, Operasional, dll.) tanpa campur tangan manual.",
      color: "0369A1",
    },
    {
      no: "03", title: "Transparansi & Kemudahan Pemantauan",
      desc: "Menyediakan dashboard real-time untuk memantau status tiket, riwayat komunikasi, dan laporan per divisi.",
      color: "065F46",
    },
    {
      no: "04", title: "Aksesibilitas Multi-Peran",
      desc: "Sistem dapat diakses oleh 3 peran berbeda — User, Admin divisi, dan Super Admin — masing-masing dengan hak akses yang tepat.",
      color: "7C2D12",
    },
    {
      no: "05", title: "Notifikasi Real-Time",
      desc: "Pengguna dan admin mendapat notifikasi otomatis saat tiket dikirim, diproses, atau diselesaikan.",
      color: "4C1D95",
    },
  ];

  goals.forEach((g, i) => {
    const x = 0.4;
    const y = 1.3 + i * 1.04;
    // Number bubble
    s.addShape(pptx.ShapeType.ellipse, {
      x, y: y + 0.1, w: 0.55, h: 0.55,
      fill: { color: g.color }, line: { type: "none" },
    });
    s.addText(g.no, {
      x, y: y + 0.1, w: 0.55, h: 0.55,
      fontSize: 11, bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    // Card
    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.1, y, w: 11.8, h: 0.85,
      rectRadius: 0.08,
      fill: { color: C.lightGray },
      line: { color: "E5E7EB", pt: 1 },
    });
    s.addText(g.title, {
      x: 1.25, y: y + 0.05, w: 11.4, h: 0.3,
      fontSize: 11, bold: true, color: g.color,
    });
    s.addText(g.desc, {
      x: 1.25, y: y + 0.37, w: 11.4, h: 0.4,
      fontSize: 9.5, color: C.black,
    });
  });
}

// ════════════════════════════════════════════════════
// SLIDE 4 — FITUR SISTEM
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Fitur Utama Sistem", "Apa saja yang bisa dilakukan oleh sistem ini?");

  // Left column — 3 features
  const features = [
    { icon: "🤖", title: "Klasifikasi NLP Otomatis", desc: "Teks tiket dianalisis menggunakan keyword matching berbahasa Indonesia & Inggris. Sistem menentukan kategori (IT, Keuangan, Operasional, dll.) dengan skor kepercayaan (confidence)." },
    { icon: "📨", title: "Routing Tiket ke Divisi", desc: "Berdasarkan hasil NLP, tiket dikirim ke divisi tujuan yang tepat. Bisa juga multi-divisi (tiket dikirim ke lebih dari satu divisi)." },
    { icon: "💬", title: "Komentar & Upload Bukti", desc: "Admin dapat merespons tiket dengan komentar dan melampirkan foto bukti penyelesaian. User juga bisa membalas dan menutup tiket." },
    { icon: "📊", title: "Dashboard & Statistik", desc: "Setiap peran memiliki dashboard dengan statistik tiket: jumlah baru, diproses, selesai, dan grafik tren per periode." },
    { icon: "📄", title: "Export Laporan PDF & Excel", desc: "Admin bisa mengunduh laporan tiket dalam format PDF (menggunakan jsPDF) atau Excel (ExcelJS) dengan nomor tiket terformat DIR-001, IT-003, dll." },
    { icon: "🔔", title: "Notifikasi Otomatis", desc: "Sistem secara otomatis mengirim notifikasi ke user saat status tiket berubah, dan ke admin saat ada tiket masuk baru." },
  ];

  features.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.3 + col * 6.5;
    const y = 1.35 + row * 1.95;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.2, h: 1.75,
      rectRadius: 0.1,
      fill: { color: C.lightGray },
      line: { color: "DBEAFE", pt: 1.5 },
    });
    // Icon circle
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.55,
      fill: { color: C.sky }, line: { type: "none" },
    });
    s.addText(f.icon, {
      x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.55,
      fontSize: 16, align: "center", valign: "middle",
    });
    s.addText(f.title, {
      x: x + 0.8, y: y + 0.15, w: 5.2, h: 0.35,
      fontSize: 11, bold: true, color: C.blue,
    });
    s.addText(f.desc, {
      x: x + 0.15, y: y + 0.6, w: 5.9, h: 1.0,
      fontSize: 9, color: C.black,
    });
  });
}

// ════════════════════════════════════════════════════
// SLIDE 5 — TEKNOLOGI & ARSITEKTUR
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Teknologi yang Digunakan", "Stack teknologi dan arsitektur sistem");

  // 3 layer boxes
  const layers = [
    {
      label: "FRONTEND", color: "1E40AF", bg: C.sky,
      items: ["Next.js 15 + React 19", "TypeScript", "Tailwind CSS", "Shadcn/ui", "Recharts (grafik)"],
    },
    {
      label: "BACKEND / API", color: "065F46", bg: "D1FAE5",
      items: ["Next.js API Routes", "JWT Authentication", "bcryptjs (enkripsi kata sandi)", "ExcelJS + jsPDF", "Vercel Blob (upload file)"],
    },
    {
      label: "DATABASE & CLOUD", color: "7C2D12", bg: "FEF3C7",
      items: ["MySQL / TiDB Cloud", "NLP Classifier (JS)", "Vercel (deploy)", "Domain publik HTTPS"],
    },
  ];

  layers.forEach((l, i) => {
    const x = 0.3 + i * 4.4;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.25, w: 4.1, h: 4.5,
      rectRadius: 0.12,
      fill: { color: l.bg },
      line: { color: l.color, pt: 1.5 },
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: 1.35, w: 3.7, h: 0.45,
      rectRadius: 0.06,
      fill: { color: l.color }, line: { type: "none" },
    });
    s.addText(l.label, {
      x: x + 0.2, y: 1.35, w: 3.7, h: 0.45,
      fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle",
    });
    l.items.forEach((item, j) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.25, y: 1.95 + j * 0.68, w: 3.6, h: 0.55,
        rectRadius: 0.06,
        fill: { color: C.white }, line: { color: l.color, pt: 0.5 },
      });
      s.addText("▸  " + item, {
        x: x + 0.35, y: 1.95 + j * 0.68, w: 3.4, h: 0.55,
        fontSize: 9.5, color: l.color, valign: "middle", bold: false,
      });
    });
  });

  // Arrow diagram
  s.addText("Alur Data →", {
    x: 0.35, y: 5.95, w: 2, h: 0.35,
    fontSize: 10, bold: true, color: C.blue,
  });
  const flow = ["User buat tiket", "NLP klasifikasi", "Routing ke divisi", "Admin respons", "Tiket selesai"];
  flow.forEach((step, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.3 + i * 2.57, y: 6.35, w: 2.35, h: 0.6,
      rectRadius: 0.06,
      fill: { color: C.blue }, line: { type: "none" },
    });
    s.addText(step, {
      x: 0.3 + i * 2.57, y: 6.35, w: 2.35, h: 0.6,
      fontSize: 9, bold: true, color: C.white, align: "center", valign: "middle",
    });
    if (i < 4) {
      s.addText("→", {
        x: 2.55 + i * 2.57, y: 6.35, w: 0.3, h: 0.6,
        fontSize: 14, bold: true, color: C.lightBlue, align: "center", valign: "middle",
      });
    }
  });
}

// ════════════════════════════════════════════════════
// SLIDE 6 — CARA KERJA NLP
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Cara Kerja NLP", "Bagaimana sistem mengklasifikasi tiket secara otomatis?");

  // 5 step boxes
  const steps = [
    { no: "1", title: "Terima Teks Tiket", desc: "User mengetik judul dan deskripsi masalah. Contoh: \"Laptop saya tidak bisa menyala, layar gelap.\"", color: "1E40AF" },
    { no: "2", title: "Normalisasi Teks", desc: "Teks diubah ke huruf kecil, dihapus karakter khusus. Siap untuk diproses lebih lanjut.", color: "0369A1" },
    { no: "3", title: "Pencocokan Kata Kunci", desc: "Setiap kata dicocokkan dengan kamus kata kunci per kategori: IT, Keuangan, Operasional, Sales, dll.", color: "065F46" },
    { no: "4", title: "Hitung Skor & Pilih Kategori", desc: "Kategori dengan skor tertinggi dipilih. Jika skor < 0.3 → kategori \"Umum\" (General).", color: "6B21A8" },
    { no: "5", title: "Routing ke Divisi", desc: "Hasil kategori menentukan divisi tujuan. Tiket langsung muncul di dashboard admin divisi tersebut.", color: "7C2D12" },
  ];

  steps.forEach((step, i) => {
    const x = 0.3 + i * 2.62;
    // Box
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.3, w: 2.45, h: 4.5,
      rectRadius: 0.12,
      fill: { color: C.lightGray },
      line: { color: step.color, pt: 1.5 },
    });
    // Number
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.85, y: 1.4, w: 0.75, h: 0.75,
      fill: { color: step.color }, line: { type: "none" },
    });
    s.addText(step.no, {
      x: x + 0.85, y: 1.4, w: 0.75, h: 0.75,
      fontSize: 18, bold: true, color: C.white, align: "center", valign: "middle",
    });
    s.addText(step.title, {
      x: x + 0.1, y: 2.25, w: 2.25, h: 0.65,
      fontSize: 10, bold: true, color: step.color, align: "center",
    });
    s.addText(step.desc, {
      x: x + 0.1, y: 2.95, w: 2.25, h: 2.7,
      fontSize: 9, color: C.black, align: "center",
    });
    // Arrow
    if (i < 4) {
      s.addText("▶", {
        x: x + 2.4, y: 3.3, w: 0.3, h: 0.4,
        fontSize: 12, color: C.lightBlue, align: "center",
      });
    }
  });

  // Example output
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 6.0, w: 12.7, h: 0.9,
    rectRadius: 0.1,
    fill: { color: "EFF6FF" },
    line: { color: "BFDBFE", pt: 1 },
  });
  s.addText('📌  Contoh Output: Input "Laptop tidak bisa nyala"  →  Kategori: IT  (confidence: 92%)  →  Routing ke Divisi IT  →  Kode Tiket: IT-005', {
    x: 0.5, y: 6.0, w: 12.3, h: 0.9,
    fontSize: 10, color: C.blue, valign: "middle", bold: false, italic: true,
  });
}

// ════════════════════════════════════════════════════
// SLIDE 7 — PERAN PENGGUNA
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Peran Pengguna", "Siapa saja yang menggunakan sistem ini dan apa yang bisa mereka lakukan?");

  const roles = [
    {
      icon: "👤", title: "User (Karyawan)", color: "1E40AF", bg: C.sky,
      items: [
        "Membuat tiket keluhan/permintaan",
        "Melampirkan foto bukti",
        "Memantau status tiket",
        "Membaca komentar & respons admin",
        "Menutup tiket jika sudah puas",
      ],
    },
    {
      icon: "🛡️", title: "Admin (Per Divisi)", color: "065F46", bg: "D1FAE5",
      items: [
        "Melihat tiket masuk ke divisinya",
        "Memperbarui status: Diproses / Selesai",
        "Membalas tiket dengan komentar & bukti",
        "Melihat statistik tiket divisi",
        "Export laporan PDF & Excel",
      ],
    },
    {
      icon: "👑", title: "Super Admin", color: "7C2D12", bg: "FEF3C7",
      items: [
        "Mengelola semua user & admin",
        "Melihat semua tiket lintas divisi",
        "Monitor statistik seluruh sistem",
        "Melihat galeri foto bukti seluruh tiket",
        "Akses penuh ke semua fitur",
      ],
    },
  ];

  roles.forEach((role, i) => {
    const x = 0.3 + i * 4.45;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.3, w: 4.2, h: 5.5,
      rectRadius: 0.12,
      fill: { color: role.bg },
      line: { color: role.color, pt: 1.5 },
    });
    // Icon area
    s.addShape(pptx.ShapeType.rect, {
      x, y: 1.3, w: 4.2, h: 1.0,
      fill: { color: role.color }, line: { type: "none" },
    });
    s.addText(role.icon + "  " + role.title, {
      x, y: 1.3, w: 4.2, h: 1.0,
      fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle",
    });
    role.items.forEach((item, j) => {
      s.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: 2.5 + j * 0.72, w: 3.9, h: 0.6,
        rectRadius: 0.06,
        fill: { color: C.white }, line: { color: role.color, pt: 0.5 },
      });
      s.addText("✓  " + item, {
        x: x + 0.25, y: 2.5 + j * 0.72, w: 3.7, h: 0.6,
        fontSize: 9.5, color: role.color, valign: "middle",
      });
    });
  });
}

// ════════════════════════════════════════════════════
// SLIDE 8 — METODE PENGUJIAN & HASIL
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Metode & Hasil Pengujian", "Bagaimana sistem diuji dan seberapa baik performanya?");

  // Left — Metode pengujian
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 1.3, w: 5.8, h: 5.5,
    rectRadius: 0.12,
    fill: { color: C.lightGray },
    line: { color: "BFDBFE", pt: 1.5 },
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 1.3, w: 5.8, h: 0.5,
    rectRadius: 0.08,
    fill: { color: C.blue }, line: { type: "none" },
  });
  s.addText("📋  Metode Pengujian", {
    x: 0.3, y: 1.3, w: 5.8, h: 0.5,
    fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
  });

  const methods = [
    { label: "Blackbox Testing", desc: "Menguji semua fitur dari sisi pengguna — login, buat tiket, upload, ekspor laporan." },
    { label: "Pengujian NLP", desc: "30 sampel tiket dengan variasi kata kunci diuji untuk mengukur akurasi klasifikasi." },
    { label: "Pengujian Peran", desc: "Setiap peran (User, Admin, Super Admin) diuji sesuai hak aksesnya masing-masing." },
    { label: "Pengujian Upload", desc: "Upload foto profil & bukti tiket diuji pada environment Vercel (cloud storage)." },
    { label: "Pengujian Export", desc: "Export PDF dan Excel diuji untuk memastikan nomor tiket dan data sudah benar." },
  ];
  methods.forEach((m, i) => {
    s.addText("▸  " + m.label, {
      x: 0.5, y: 2.0 + i * 0.85, w: 5.4, h: 0.28,
      fontSize: 10, bold: true, color: C.blue,
    });
    s.addText(m.desc, {
      x: 0.5, y: 2.28 + i * 0.85, w: 5.4, h: 0.45,
      fontSize: 9, color: C.black,
    });
  });

  // Right — Hasil
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.5, y: 1.3, w: 6.7, h: 5.5,
    rectRadius: 0.12,
    fill: { color: C.lightGray },
    line: { color: "D1FAE5", pt: 1.5 },
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.5, y: 1.3, w: 6.7, h: 0.5,
    rectRadius: 0.08,
    fill: { color: C.green }, line: { type: "none" },
  });
  s.addText("✅  Hasil Pengujian", {
    x: 6.5, y: 1.3, w: 6.7, h: 0.5,
    fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
  });

  const results = [
    { label: "Akurasi NLP Klasifikasi", value: "90%", color: "1E40AF" },
    { label: "Routing ke Divisi Tepat", value: "93%", color: "065F46" },
    { label: "Semua Fitur Berfungsi", value: "100%", color: "7C2D12" },
    { label: "Upload File (Cloud)", value: "✅ Berhasil", color: "0369A1" },
    { label: "Export PDF & Excel", value: "✅ Berhasil", color: "6B21A8" },
    { label: "Notifikasi Real-Time", value: "✅ Berjalan", color: "065F46" },
  ];

  results.forEach((r, i) => {
    const y = 2.0 + i * 0.77;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.65, y, w: 6.4, h: 0.62,
      rectRadius: 0.06,
      fill: { color: C.white }, line: { color: r.color, pt: 0.5 },
    });
    s.addText(r.label, {
      x: 6.8, y, w: 4.5, h: 0.62,
      fontSize: 10, color: C.black, valign: "middle",
    });
    s.addShape(pptx.ShapeType.roundRect, {
      x: 11.3, y: y + 0.1, w: 1.5, h: 0.42,
      rectRadius: 0.06,
      fill: { color: r.color }, line: { type: "none" },
    });
    s.addText(r.value, {
      x: 11.3, y: y + 0.1, w: 1.5, h: 0.42,
      fontSize: 10, bold: true, color: C.white, align: "center", valign: "middle",
    });
  });
}

// ════════════════════════════════════════════════════
// SLIDE 9 — ANALISIS
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.white }, line: { type: "none" },
  });
  addHeader(s, "Analisis", "Kelebihan, keterbatasan, dan potensi pengembangan sistem");

  // Kelebihan
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 1.25, w: 4.0, h: 5.6,
    rectRadius: 0.12, fill: { color: "F0FDF4" }, line: { color: "16A34A", pt: 1.5 },
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.3, y: 1.25, w: 4.0, h: 0.5,
    rectRadius: 0.08, fill: { color: "16A34A" }, line: { type: "none" },
  });
  s.addText("✅  Kelebihan", {
    x: 0.3, y: 1.25, w: 4.0, h: 0.5,
    fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
  });

  [
    "Klasifikasi otomatis tanpa konfigurasi ML yang rumit",
    "Mendukung Bahasa Indonesia & Inggris",
    "Sistem 3 level peran (User / Admin / Super Admin)",
    "Upload file aman via Vercel Blob (cloud)",
    "Ekspor laporan PDF & Excel dengan nomor tiket terformat",
    "Deployed online, dapat diakses dari mana saja",
  ].forEach((item, i) => {
    s.addText("▸ " + item, {
      x: 0.5, y: 1.9 + i * 0.72, w: 3.7, h: 0.6,
      fontSize: 9.5, color: "166534",
    });
  });

  // Keterbatasan
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.65, y: 1.25, w: 4.0, h: 5.6,
    rectRadius: 0.12, fill: { color: "FFF7ED" }, line: { color: "EA580C", pt: 1.5 },
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 4.65, y: 1.25, w: 4.0, h: 0.5,
    rectRadius: 0.08, fill: { color: "EA580C" }, line: { type: "none" },
  });
  s.addText("⚠️  Keterbatasan", {
    x: 4.65, y: 1.25, w: 4.0, h: 0.5,
    fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
  });

  [
    "Klasifikasi berbasis kata kunci, tidak belajar otomatis (non-ML)",
    "Akurasi bisa menurun untuk kalimat ambigu atau slang",
    "Notifikasi menggunakan polling, bukan WebSocket",
    "Belum ada email notifikasi langsung ke pengguna",
    "Kategori baru harus ditambah manual ke kamus kata kunci",
  ].forEach((item, i) => {
    s.addText("▸ " + item, {
      x: 4.85, y: 1.9 + i * 0.87, w: 3.7, h: 0.75,
      fontSize: 9.5, color: "9A3412",
    });
  });

  // Potensi Pengembangan
  s.addShape(pptx.ShapeType.roundRect, {
    x: 9.0, y: 1.25, w: 4.2, h: 5.6,
    rectRadius: 0.12, fill: { color: "EFF6FF" }, line: { color: "1E40AF", pt: 1.5 },
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 9.0, y: 1.25, w: 4.2, h: 0.5,
    rectRadius: 0.08, fill: { color: "1E40AF" }, line: { type: "none" },
  });
  s.addText("🚀  Pengembangan", {
    x: 9.0, y: 1.25, w: 4.2, h: 0.5,
    fontSize: 11, bold: true, color: C.white, align: "center", valign: "middle",
  });

  [
    "Integrasi machine learning (TF-IDF / BERT) untuk akurasi lebih tinggi",
    "WebSocket untuk notifikasi real-time sejati",
    "Mobile app (React Native) untuk kemudahan akses",
    "Email notifikasi otomatis via SMTP",
    "SLA tracking: batas waktu penanganan tiket",
    "Analitik lanjut: tren masalah, heatmap divisi",
  ].forEach((item, i) => {
    s.addText("▸ " + item, {
      x: 9.2, y: 1.9 + i * 0.72, w: 3.8, h: 0.6,
      fontSize: 9.5, color: "1E3A8A",
    });
  });
}

// ════════════════════════════════════════════════════
// SLIDE 10 — KESIMPULAN
// ════════════════════════════════════════════════════
{
  const s = pptx.addSlide();

  // Blue background
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.blue }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 4.8, w: "100%", h: 2.7,
    fill: { color: "1E3A8A" }, line: { type: "none" },
  });

  // Decorative
  s.addShape(pptx.ShapeType.ellipse, {
    x: 11.0, y: -0.5, w: 2.5, h: 2.5,
    fill: { color: "2563EB", transparency: 50 }, line: { type: "none" },
  });
  s.addShape(pptx.ShapeType.ellipse, {
    x: -0.5, y: 5.5, w: 2.0, h: 2.0,
    fill: { color: "3B82F6", transparency: 60 }, line: { type: "none" },
  });

  s.addText("Kesimpulan", {
    x: 0.5, y: 0.2, w: 12.3, h: 0.7,
    fontSize: 26, bold: true, color: C.white, align: "center",
  });

  const conclusions = [
    {
      icon: "🤖", title: "NLP Terbukti Efektif",
      desc: "Sistem mampu mengklasifikasi tiket dengan akurasi 90% menggunakan metode keyword-based yang ringan namun cukup akurat.",
    },
    {
      icon: "⚡", title: "Proses Lebih Cepat",
      desc: "Routing otomatis menggantikan proses manual, sehingga tiket langsung sampai ke admin yang tepat tanpa penundaan.",
    },
    {
      icon: "🔒", title: "Sistem Aman & Terstruktur",
      desc: "Autentikasi JWT, enkripsi password, dan sistem 3 peran memastikan data dan akses tetap aman.",
    },
    {
      icon: "🌐", title: "Siap Digunakan",
      desc: "Sistem sudah di-deploy di Vercel, dapat diakses online 24/7 oleh seluruh pengguna dari mana saja.",
    },
  ];

  conclusions.forEach((c, i) => {
    const x = 0.3 + (i % 2) * 6.5;
    const y = 1.1 + Math.floor(i / 2) * 1.75;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 6.2, h: 1.55,
      rectRadius: 0.1,
      fill: { color: "1D4ED8", transparency: 20 },
      line: { color: "60A5FA", pt: 1 },
    });
    s.addText(c.icon + "  " + c.title, {
      x: x + 0.2, y: y + 0.1, w: 5.8, h: 0.38,
      fontSize: 12, bold: true, color: "93C5FD",
    });
    s.addText(c.desc, {
      x: x + 0.2, y: y + 0.5, w: 5.8, h: 0.9,
      fontSize: 10, color: "DBEAFE",
    });
  });

  // Bottom closing
  s.addShape(pptx.ShapeType.roundRect, {
    x: 2.0, y: 5.15, w: 9.3, h: 1.35,
    rectRadius: 0.12,
    fill: { color: "1E3A8A", transparency: 20 },
    line: { color: "60A5FA", pt: 1.5 },
  });
  s.addText("Terima Kasih", {
    x: 2.0, y: 5.15, w: 9.3, h: 0.55,
    fontSize: 22, bold: true, color: C.white, align: "center",
  });
  s.addText("Sistem Helpdesk Berbasis NLP  |  Dwiky Setiawan  |  2026", {
    x: 2.0, y: 5.7, w: 9.3, h: 0.5,
    fontSize: 11, color: "93C5FD", align: "center",
  });

  // Tech tags
  ["Next.js 15", "React 19", "MySQL / TiDB", "NLP Classifier", "Vercel"].forEach((tag, i) => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.9 + i * 2.47, y: 6.65, w: 2.2, h: 0.38,
      rectRadius: 0.06,
      fill: { color: "1E40AF" }, line: { color: "60A5FA", pt: 0.8 },
    });
    s.addText(tag, {
      x: 0.9 + i * 2.47, y: 6.65, w: 2.2, h: 0.38,
      fontSize: 9, bold: true, color: "93C5FD", align: "center", valign: "middle",
    });
  });
}

// ─── SAVE ────────────────────────────────────────────
const outputPath = "/home/dwitwicky/projects/kuliah/sistem-helpdesk-nlp/Presentasi-Helpdesk-NLP.pptx";
pptx.writeFile({ fileName: outputPath })
  .then(() => console.log("✅ PPT berhasil dibuat:", outputPath))
  .catch((e) => console.error("❌ Error:", e));
