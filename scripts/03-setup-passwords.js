/**
 * SISTEM HELPDESK NLP SJPL - PASSWORD SETUP
 * File: 03-setup-passwords.js
 *
 * Script ini akan:
 * 1. Generate bcrypt hash untuk password default
 * 2. Update semua user dengan password yang valid
 *
 * Jalankan dengan: node scripts/03-setup-passwords.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Konfigurasi database
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistem_helpdesk_nlp'
};

// Password default untuk semua user
const DEFAULT_PASSWORD = 'admin123';

async function setupPasswords() {
    let connection;

    try {
        console.log('='.repeat(50));
        console.log('SISTEM HELPDESK NLP - PASSWORD SETUP');
        console.log('='.repeat(50));
        console.log('\nConnecting to database...');

        connection = await mysql.createConnection(DB_CONFIG);
        console.log('Connected!\n');

        // Generate bcrypt hash
        console.log(`Generating bcrypt hash for password: ${DEFAULT_PASSWORD}`);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        console.log(`Hash generated: ${hashedPassword.substring(0, 30)}...\n`);

        // Update semua user
        console.log('Updating all users with hashed password...');
        const [result] = await connection.execute(
            'UPDATE users SET password = ?',
            [hashedPassword]
        );
        console.log(`Updated ${result.affectedRows} users\n`);

        // Tampilkan daftar user
        console.log('='.repeat(50));
        console.log('DAFTAR USER YANG BISA LOGIN:');
        console.log('='.repeat(50));
        console.log(`Password: ${DEFAULT_PASSWORD}\n`);

        const [users] = await connection.execute(
            'SELECT email, role, division FROM users WHERE is_active = TRUE ORDER BY role, division'
        );

        // Group by role
        const superAdmins = users.filter(u => u.role === 'super_admin');
        const admins = users.filter(u => u.role === 'admin');
        const regularUsers = users.filter(u => u.role === 'user');

        console.log('SUPER ADMIN (Akses semua data):');
        superAdmins.forEach(u => console.log(`  - ${u.email} (${u.division})`));

        console.log('\nADMIN (Akses data divisi masing-masing):');
        admins.forEach(u => console.log(`  - ${u.email} (${u.division})`));

        console.log('\nUSER (Buat tiket, lihat tiket sendiri):');
        regularUsers.forEach(u => console.log(`  - ${u.email} (${u.division})`));

        console.log('\n' + '='.repeat(50));
        console.log('PASSWORD SETUP COMPLETED!');
        console.log('='.repeat(50));

    } catch (error) {
        console.error('\nERROR:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('\nMySQL tidak berjalan. Pastikan XAMPP MySQL sudah di-start.');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('\nDatabase belum dibuat. Jalankan 01-create-database.sql dulu.');
        }

        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupPasswords();
