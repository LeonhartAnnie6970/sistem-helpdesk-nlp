-- ============================================================
-- Perbaikan: updated_at yang tidak sengaja ter-bump oleh migration urgensi
-- File: fix-updated-at-after-urgency-migration.sql
--
-- Migration add-ticket-urgency-production.sql (langkah backfill deadline_at)
-- otomatis membuat kolom updated_at ikut ter-refresh ke waktu migration
-- dijalankan (efek ON UPDATE CURRENT_TIMESTAMP bawaan MySQL/TiDB), untuk
-- semua tiket lama yang statusnya masih aktif (bukan resolved/closed).
--
-- Skrip ini mengembalikan updated_at ke perkiraan terbaik: waktu
-- komentar/tanggapan TERAKHIR di tiket itu kalau ada, atau created_at
-- kalau belum pernah ada tanggapan sama sekali. HANYA menyasar tiket
-- yang updated_at-nya persis di rentang waktu migration kemarin.
--
-- CARA PAKAI:
-- 1. Jalankan dulu bagian PREVIEW di bawah, cek daftarnya masuk akal
--    (semua harusnya tiket lama yang aktif, bukan tiket yang memang
--    baru asli diupdate hari ini).
-- 2. Kalau sudah yakin, jalankan bagian UPDATE.
-- 3. Sesuaikan rentang waktu di WHERE kalau ternyata migration Anda
--    dijalankan di jam yang beda dari yang tercatat di sini.
-- ============================================================

-- ---------- PREVIEW (jalankan dulu, cek hasilnya) ----------
SELECT
  t.id,
  t.title,
  t.status,
  t.updated_at AS updated_at_salah,
  t.created_at,
  (SELECT MAX(c.created_at) FROM ticket_comments c WHERE c.ticket_id = t.id) AS last_comment_at,
  COALESCE(
    (SELECT MAX(c.created_at) FROM ticket_comments c WHERE c.ticket_id = t.id),
    t.created_at
  ) AS updated_at_perbaikan
FROM tickets t
WHERE t.updated_at BETWEEN '2026-08-10 07:47:00' AND '2026-08-10 07:50:00';

-- ---------- UPDATE (jalankan setelah preview di atas oke) ----------
UPDATE tickets t
SET t.updated_at = COALESCE(
  (SELECT MAX(c.created_at) FROM ticket_comments c WHERE c.ticket_id = t.id),
  t.created_at
)
WHERE t.updated_at BETWEEN '2026-08-10 07:47:00' AND '2026-08-10 07:50:00';

SELECT 'PERBAIKAN updated_at SELESAI!' AS status;
