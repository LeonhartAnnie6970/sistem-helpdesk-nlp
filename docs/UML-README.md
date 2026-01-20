# UML Diagrams - Sistem Helpdesk NLP SJPL

File `uml-diagrams.puml` berisi semua diagram UML untuk project Sistem Helpdesk NLP SJPL.

## Cara Menggunakan

### 1. Menggunakan PlantText Online
1. Buka https://www.planttext.com/
2. Copy salah satu diagram dari file `uml-diagrams.puml`
3. Paste ke editor PlantText
4. Diagram akan otomatis di-render

### 2. Menggunakan PlantUML Extension di VSCode
1. Install extension "PlantUML" di VSCode
2. Buka file `uml-diagrams.puml`
3. Tekan `Alt+D` untuk preview diagram
4. Export ke PNG/SVG/PDF sesuai kebutuhan

### 3. Menggunakan PlantUML Server
1. Buka https://www.plantuml.com/plantuml/uml/
2. Copy diagram yang diinginkan
3. Paste dan generate

---

## Daftar Diagram

### 1. Use Case Diagram
**Tag:** `@startuml UseCase_Diagram`

Menampilkan semua use case sistem dengan 3 aktor utama:
- **User**: Membuat tiket, melihat tiket, menambah komentar, menutup tiket sendiri
- **Admin**: Semua kemampuan User + mengelola tiket divisi, override NLP, update status
- **Super Admin**: Semua kemampuan Admin + mengelola user, menghapus tiket, export laporan

**Total: 38 Use Cases**

---

### 2. Activity Diagrams

| Diagram | Tag | Deskripsi |
|---------|-----|-----------|
| Login | `@startuml Activity_Login` | Proses login dengan validasi email, password, dan role |
| Register | `@startuml Activity_Register` | Proses registrasi user baru |
| Create Ticket | `@startuml Activity_CreateTicket` | Pembuatan tiket dengan klasifikasi NLP |
| Update Status | `@startuml Activity_UpdateTicketStatus` | Update status tiket oleh Admin |
| Override NLP | `@startuml Activity_OverrideNLP` | Override kategori NLP oleh Admin |
| Delete Ticket | `@startuml Activity_DeleteTicket` | Penghapusan tiket (Super Admin only) |
| Export Report | `@startuml Activity_ExportReport` | Export laporan ke Excel/PDF |
| Notification | `@startuml Activity_NotificationFlow` | Alur sistem notifikasi |
| User Management | `@startuml Activity_UserManagement` | Manajemen user oleh Super Admin |

---

### 3. Sequence Diagrams

| Diagram | Tag | Deskripsi |
|---------|-----|-----------|
| Login | `@startuml Sequence_Login` | Interaksi login user-sistem-database |
| Create Ticket | `@startuml Sequence_CreateTicket` | Alur pembuatan tiket dengan NLP |
| Update Status | `@startuml Sequence_UpdateStatus` | Update status oleh Admin |
| NLP Classification | `@startuml Sequence_NLPClassification` | Proses klasifikasi NLP |
| Export Report | `@startuml Sequence_ExportReport` | Proses export Excel/PDF |
| Notification Polling | `@startuml Sequence_NotificationPolling` | Polling notifikasi real-time |
| User Management | `@startuml Sequence_UserManagement` | CRUD user oleh Super Admin |
| Delete Ticket | `@startuml Sequence_DeleteTicket` | Penghapusan tiket |
| Add Comment | `@startuml Sequence_AddComment` | Menambah komentar pada tiket |

---

### 4. Class Diagrams

| Diagram | Tag | Deskripsi |
|---------|-----|-----------|
| Entities | `@startuml Class_Diagram_Entities` | Entitas database dengan atribut dan method |
| Services | `@startuml Class_Diagram_Services` | Service layer dan API routes |
| Components | `@startuml Class_Diagram_Components` | React components hierarchy |
| NLP System | `@startuml Class_Diagram_NLP` | Arsitektur sistem NLP |

---

### 5. ER Diagram (Entity Relationship)
**Tag:** `@startuml ER_Diagram`

Menampilkan semua tabel database dengan:
- Primary keys dan foreign keys
- Tipe data setiap kolom
- Relasi antar tabel
- Cardinality (1:1, 1:M, M:M)

**Tabel:**
- users
- tickets
- notifications
- user_notifications
- super_admin_notifications
- ticket_comments
- category_division_mapping

---

### 6. State Diagrams

| Diagram | Tag | Deskripsi |
|---------|-----|-----------|
| Ticket | `@startuml State_Ticket` | Lifecycle tiket (new → in_progress → resolved → closed) |
| Notification | `@startuml State_Notification` | Lifecycle notifikasi (created → unread → read) |
| User | `@startuml State_User` | Lifecycle akun user (registered → active → logged in) |

---

### 7. Component Diagram
**Tag:** `@startuml Component_Diagram`

Arsitektur komponen sistem:
- Frontend (Next.js)
- Backend (API Routes)
- NLP Service (Flask)
- Database (MySQL)
- File Storage

---

### 8. Deployment Diagram
**Tag:** `@startuml Deployment_Diagram`

Infrastruktur deployment:
- Client Browser
- Next.js Server (Port 3000)
- Flask Server (Port 8000)
- MySQL Database Server
- File Server (uploads)

---

### 9. Package Diagram
**Tag:** `@startuml Package_Diagram`

Struktur folder project:
- `/app` - Pages dan API routes
- `/components` - UI dan feature components
- `/lib` - Utility functions
- `/nlp_api` - Python NLP service

---

### 10. Communication Diagram
**Tag:** `@startuml Communication_Diagram`

Menampilkan alur komunikasi saat pembuatan tiket dengan numbered messages.

---

## Cara Extract Individual Diagram

Setiap diagram dimulai dengan `@startuml NamaDiagram` dan diakhiri dengan `@enduml`.

Contoh untuk extract Use Case Diagram:
```
@startuml UseCase_Diagram
... (content) ...
@enduml
```

Copy bagian tersebut ke PlantText untuk generate diagram individual.

---

## Mapping Divisi

| Prefix Kode | Divisi |
|-------------|--------|
| IT-XXX | IT |
| ACC-XXX | Akuntansi/Finance |
| OPR-XXX | Operasional |
| SLS-XXX | Sales |
| CS-XXX | Customer Service |
| HR-XXX | HRD |
| DKT-XXX | Direksi/Direktur |
| TKT-XXX | Default (tidak terklasifikasi) |

---

## Role & Permission Matrix

| Resource | Super Admin | Admin | User |
|----------|:-----------:|:-----:|:----:|
| View all tickets | ✓ | ✗ | ✗ |
| View division tickets | ✓ | ✓ | ✗ |
| View own tickets | ✓ | ✓ | ✓ |
| Create ticket | ✓ | ✓ | ✓ |
| Update ticket | ✓ | ✓ | ✗ |
| Close ticket | ✓ | ✗ | ✓ (own) |
| Delete ticket | ✓ | ✗ | ✗ |
| Override NLP | ✓ | ✓ | ✗ |
| Manage users | ✓ | ✗ | ✗ |
| Export reports | ✓ | ✓ | ✗ |
