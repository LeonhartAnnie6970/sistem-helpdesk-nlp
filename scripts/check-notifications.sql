-- =====================================================
-- Script untuk mengecek data notifikasi
-- =====================================================

USE sistem_helpdesk_nlp;

-- 1. Cek mapping kategori
SELECT '=== CATEGORY MAPPING ===' as info;
SELECT * FROM category_division_mapping;

-- 2. Cek semua admin dan divisinya
SELECT '=== ADMINS ===' as info;
SELECT id, name, email, role, division FROM users WHERE role IN ('admin', 'super_admin') AND is_active = TRUE;

-- 3. Cek semua user biasa dan divisinya
SELECT '=== USERS ===' as info;
SELECT id, name, email, role, division FROM users WHERE role = 'user' AND is_active = TRUE;

-- 4. Cek notifikasi admin
SELECT '=== ADMIN NOTIFICATIONS ===' as info;
SELECT n.*, u.name as admin_name, u.division as admin_division
FROM notifications n
JOIN users u ON n.id_admin = u.id
ORDER BY n.created_at DESC
LIMIT 10;

-- 5. Cek notifikasi user
SELECT '=== USER NOTIFICATIONS ===' as info;
SELECT un.*, u.name as user_name, u.division as user_division
FROM user_notifications un
JOIN users u ON un.id_user = u.id
ORDER BY un.created_at DESC
LIMIT 10;

-- 6. Cek tiket terbaru
SELECT '=== RECENT TICKETS ===' as info;
SELECT id, title, user_division, nlp_category, target_divisions, created_at
FROM tickets
ORDER BY created_at DESC
LIMIT 5;
