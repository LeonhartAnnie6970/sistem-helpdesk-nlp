# Troubleshooting Guide

## Error EPERM: operation not permitted

Jika terjadi error EPERM saat menjalankan `npm run dev`, ikuti langkah berikut:

### Windows

```bash
# 1. Stop semua proses Node.js
taskkill /F /IM node.exe

# 2. Tunggu 2-3 detik

# 3. Hapus folder .next
rd /s /q .next

# 4. Jalankan dev server
npm run dev
```

### Linux/Mac

```bash
# 1. Stop semua proses Node.js
pkill -9 node

# 2. Tunggu 2-3 detik

# 3. Hapus folder .next
rm -rf .next

# 4. Jalankan dev server
npm run dev
```

### One-liner (Windows PowerShell)

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 3; Remove-Item -Path '.next' -Recurse -Force -ErrorAction SilentlyContinue; npm run dev
```

### Tips Mencegah Error EPERM

1. **Tutup VSCode/IDE** sebelum menjalankan `npm run dev` untuk pertama kali
2. **Jangan membuka banyak terminal** yang menjalankan `npm run dev`
3. **Stop dengan Ctrl+C** sebelum close terminal
4. **Tunggu beberapa detik** setelah stop sebelum run lagi

### Jika Masih Error

Restart komputer Anda, lalu jalankan:
```bash
npm run dev
```
