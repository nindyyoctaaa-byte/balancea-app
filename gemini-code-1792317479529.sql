-- ============================================================================
-- BALANCEA SMART ACCOUNTING HUB - FULL DATABASE SCHEMA & RLS POLICIES
-- ============================================================================

-- 0. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('guru', 'siswa', 'admin');
CREATE TYPE status_draft_final AS ENUM ('Draft', 'Final');
CREATE TYPE status_lms_pub AS ENUM ('Draft', 'Terbit');
CREATE TYPE tipe_soal_enum AS ENUM ('pg', 'isian', 'uraian');
CREATE TYPE tingkat_kesulitan_enum AS ENUM ('mudah', 'sedang', 'sulit');
CREATE TYPE status_pengerjaan_enum AS ENUM ('berlangsung', 'selesai', 'perlu_review');
CREATE TYPE presensi_status_enum AS ENUM ('hadir', 'izin', 'sakit', 'alpa');

-- 1. TABEL PROFIL USER (LINK TO AUTH.USERS)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    nama_lengkap TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'siswa',
    nip_nisn TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL STRUKTUR AKADEMIK
CREATE TABLE public.fase (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode VARCHAR(5) NOT NULL UNIQUE, -- 'E', 'F'
    nama VARCHAR(50) NOT NULL,
    deskripsi TEXT
);

CREATE TABLE public.kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fase_id UUID REFERENCES public.fase(id) ON DELETE RESTRICT,
    nama_kelas VARCHAR(50) NOT NULL, -- e.g. 'X AKL 1', 'XI AKL 1'
    tahun_ajaran VARCHAR(20) NOT NULL, -- e.g. '2026/2027'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.mapel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fase_id UUID REFERENCES public.fase(id) ON DELETE RESTRICT,
    kode_mapel VARCHAR(20) NOT NULL UNIQUE,
    nama_mapel VARCHAR(100) NOT NULL,
    deskripsi TEXT
);

-- PENUGASAN GURU & SISWA
CREATE TABLE public.guru_kelas_mapel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guru_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guru_id, kelas_id, mapel_id)
);

CREATE TABLE public.siswa_kelas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    tahun_ajaran VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(siswa_id, kelas_id, tahun_ajaran)
);

CREATE TABLE public.identitas_pembelajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sekolah VARCHAR(100) DEFAULT 'SMK Negeri Akuntansi',
    tahun_ajaran VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL, -- 'Ganjil' / 'Genap'
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    guru_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kelas_id, mapel_id, semester, tahun_ajaran)
);

-- 3. MODUL PERANGKAT AJAR (CP, TP, ATP, DOKUMEN)
CREATE TABLE public.cp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    elemen VARCHAR(100) NOT NULL,
    teks_cp TEXT NOT NULL,
    status status_draft_final DEFAULT 'Draft',
    versi INT DEFAULT 1,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cp_id UUID REFERENCES public.cp(id) ON DELETE CASCADE,
    kode_tp VARCHAR(20) NOT NULL, -- e.g. 'TP 1.1'
    teks_tp TEXT NOT NULL,
    elemen_materi TEXT,
    alokasi_jp INT DEFAULT 4,
    kktp_indikator TEXT,
    urutan INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.atp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    status status_draft_final DEFAULT 'Draft',
    versi INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.atp_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    atp_id UUID REFERENCES public.atp(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES public.tp(id) ON DELETE CASCADE,
    semester VARCHAR(10) NOT NULL,
    model_pembelajaran VARCHAR(50) DEFAULT 'Problem-Based Learning',
    urutan INT NOT NULL,
    alokasi_jp INT DEFAULT 4
);

CREATE TABLE public.dokumen_perangkat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    status status_draft_final DEFAULT 'Draft',
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.riwayat_versi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entitas_type VARCHAR(20) NOT NULL, -- 'cp', 'atp', 'dokumen'
    entitas_id UUID NOT NULL,
    versi INT NOT NULL,
    snapshot_json JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MODUL LMS & BANK SOAL
CREATE TABLE public.modul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES public.tp(id) ON DELETE SET NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    urutan INT DEFAULT 1,
    status status_lms_pub DEFAULT 'Draft',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.materi_modul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modul_id UUID REFERENCES public.modul(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    konten_rich_text TEXT NOT NULL,
    urutan INT DEFAULT 1
);

CREATE TABLE public.lampiran_modul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modul_id UUID REFERENCES public.modul(id) ON DELETE CASCADE,
    nama_file VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INT
);

CREATE TABLE public.video_modul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    modul_id UUID REFERENCES public.modul(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    tipe VARCHAR(20) NOT NULL, -- 'youtube', 'drive', 'upload'
    url_or_path TEXT NOT NULL,
    durasi_detik INT DEFAULT 0,
    urutan INT DEFAULT 1
);

CREATE TABLE public.progres_modul (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    modul_id UUID REFERENCES public.modul(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'belum', -- 'belum', 'sedang', 'selesai'
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(siswa_id, modul_id)
);

CREATE TABLE public.bank_soal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    modul_id UUID REFERENCES public.modul(id) ON DELETE SET NULL,
    tp_id UUID REFERENCES public.tp(id) ON DELETE SET NULL,
    tipe_soal tipe_soal_enum NOT NULL DEFAULT 'pg',
    teks_soal TEXT NOT NULL,
    opsi_json JSONB, -- Array of [{label: 'A', text: '...'}, ...]
    kunci_jawaban TEXT NOT NULL,
    pembahasan TEXT,
    tingkat_kesulitan tingkat_kesulitan_enum DEFAULT 'sedang',
    kategori_siklus VARCHAR(100), -- 'Jurnal Umum', 'Penyesuaian', dll.
    bobot INT DEFAULT 1,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.kuis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    durasi_menit INT DEFAULT 45,
    jadwal_buka TIMESTAMPTZ,
    jadwal_tutup TIMESTAMPTZ,
    jumlah_percobaan INT DEFAULT 1,
    aturan_nilai VARCHAR(20) DEFAULT 'tertinggi', -- 'tertinggi', 'terakhir'
    tampil_pembahasan BOOLEAN DEFAULT TRUE,
    status status_lms_pub DEFAULT 'Draft',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.kuis_soal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kuis_id UUID REFERENCES public.kuis(id) ON DELETE CASCADE,
    soal_id UUID REFERENCES public.bank_soal(id) ON DELETE CASCADE,
    urutan INT DEFAULT 1
);

CREATE TABLE public.percobaan_kuis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kuis_id UUID REFERENCES public.kuis(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    waktu_mulai TIMESTAMPTZ DEFAULT NOW(),
    waktu_selesai TIMESTAMPTZ,
    skor_total NUMERIC(5, 2) DEFAULT 0.0,
    status status_pengerjaan_enum DEFAULT 'berlangsung',
    percobaan_ke INT DEFAULT 1
);

CREATE TABLE public.jawaban_kuis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    percobaan_id UUID REFERENCES public.percobaan_kuis(id) ON DELETE CASCADE,
    soal_id UUID REFERENCES public.bank_soal(id) ON DELETE CASCADE,
    jawaban_siswa TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    skor_diperoleh NUMERIC(5, 2) DEFAULT 0.0,
    catatan_review_guru TEXT
);

-- 5. SIMULATOR JURNAL UMUM
CREATE TABLE public.kasus_simulator (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES public.tp(id) ON DELETE SET NULL,
    judul_kasus VARCHAR(200) NOT NULL,
    deskripsi_transaksi TEXT NOT NULL,
    metode_pencatatan VARCHAR(20) DEFAULT 'bruto', -- 'bruto' / 'neto'
    kunci_jurnal_json JSONB NOT NULL, -- [{akun: '112', pos: 'D', val: 5000000}, ...]
    petunjuk TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.jurnal_simulasi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kasus_id UUID REFERENCES public.kasus_simulator(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    entri_jurnal_json JSONB NOT NULL,
    skor NUMERIC(5, 2) DEFAULT 0.0,
    status_balance BOOLEAN DEFAULT FALSE,
    kategori_kesalahan VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MODUL EVALUASI, GRADEBOOK & DIAGNOSTIK
CREATE TABLE public.pengaturan_bobot_kkm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    kkm_kktp NUMERIC(5, 2) DEFAULT 75.0,
    bobot_lkpd NUMERIC(5, 2) DEFAULT 30.0,
    bobot_simulator NUMERIC(5, 2) DEFAULT 20.0,
    bobot_kuis NUMERIC(5, 2) DEFAULT 20.0,
    bobot_sumatif NUMERIC(5, 2) DEFAULT 30.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(kelas_id, mapel_id)
);

CREATE TABLE public.komponen_nilai (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES public.tp(id) ON DELETE SET NULL,
    nama_komponen VARCHAR(100) NOT NULL, -- e.g. 'UH1', 'Praktik Depresiasi'
    jenis_komponen VARCHAR(20) NOT NULL, -- 'LKPD', 'Simulator', 'Kuis', 'Sumatif'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.nilai_komponen (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    komponen_id UUID REFERENCES public.komponen_nilai(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    nilai NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(komponen_id, siswa_id)
);

CREATE TABLE public.kategori_kesalahan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode VARCHAR(20) NOT NULL UNIQUE,
    nama_tahap VARCHAR(100) NOT NULL, -- e.g. 'Jurnal Penyesuaian'
    deskripsi TEXT
);

CREATE TABLE public.diagnostik_siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES public.tp(id) ON DELETE SET NULL,
    kategori_kesalahan_id UUID REFERENCES public.kategori_kesalahan(id) ON DELETE SET NULL,
    topik_sulit TEXT NOT NULL,
    detail_kesalahan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.paket_remedial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tp_id UUID REFERENCES public.tp(id) ON DELETE SET NULL,
    judul_remedial VARCHAR(200) NOT NULL,
    soal_json JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Diterbitkan', 'Selesai'
    nilai_remedial NUMERIC(5, 2),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.catatan_rapor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    narasi_capaian TEXT NOT NULL,
    rekomendasi TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(siswa_id, kelas_id, mapel_id)
);

-- 7. FITUR TAMBAHAN (PRESENSI & LOG)
CREATE TABLE public.presensi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kelas_id UUID REFERENCES public.kelas(id) ON DELETE CASCADE,
    mapel_id UUID REFERENCES public.mapel(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status presensi_status_enum DEFAULT 'hadir',
    catatan TEXT,
    UNIQUE(kelas_id, mapel_id, siswa_id, tanggal)
);

CREATE TABLE public.log_aktivitas_lms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    aktivitas VARCHAR(100) NOT NULL,
    tipe_entitas VARCHAR(50),
    entitas_id UUID,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HELPER FUNCTIONS FOR SECURITY & RLS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_guru()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'guru'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_siswa_in_kelas(target_kelas_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.siswa_kelas
    WHERE siswa_id = auth.uid() AND kelas_id = target_kelas_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_guru_of_kelas(target_kelas_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guru_kelas_mapel
    WHERE guru_id = auth.uid() AND kelas_id = target_kelas_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TRIGGER AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama_lengkap, role, nip_nisn)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', 'User Baru'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'siswa'),
    NEW.raw_user_meta_data->>'nip_nisn'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru_kelas_mapel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa_kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identitas_pembelajaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atp_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_perangkat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_versi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materi_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lampiran_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progres_modul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuis_soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.percobaan_kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jawaban_kuis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kasus_simulator ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_simulasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_bobot_kkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.komponen_nilai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nilai_komponen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kategori_kesalahan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostik_siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paket_remedial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catatan_rapor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_lms ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view own profile or teachers view students" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.is_guru()
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. PUBLIC READ FOR BASE MASTER DATA
CREATE POLICY "Public master read" ON public.fase FOR SELECT USING (true);
CREATE POLICY "Public mapel read" ON public.mapel FOR SELECT USING (true);
CREATE POLICY "Public kelas read" ON public.kelas FOR SELECT USING (true);

-- 3. PERANGKAT AJAR (CP, TP, ATP, DOKUMEN) RLS
-- Siswa HANYA BISA BACA yang berstatus Final di kelasnya!
CREATE POLICY "Siswa read Final CP" ON public.cp
    FOR SELECT USING (
        status = 'Final' AND public.is_siswa_in_kelas(kelas_id)
    );

CREATE POLICY "Guru CRUD CP" ON public.cp
    FOR ALL USING (public.is_guru());

CREATE POLICY "Siswa read TP linked to Final CP" ON public.tp
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.cp
            WHERE cp.id = tp.cp_id AND cp.status = 'Final' AND public.is_siswa_in_kelas(cp.kelas_id)
        )
    );

CREATE POLICY "Guru CRUD TP" ON public.tp FOR ALL USING (public.is_guru());

CREATE POLICY "Siswa read Final ATP" ON public.atp
    FOR SELECT USING (status = 'Final' AND public.is_siswa_in_kelas(kelas_id));

CREATE POLICY "Guru CRUD ATP" ON public.atp FOR ALL USING (public.is_guru());

-- 4. LMS MODUL & KUIS RLS
-- Siswa HANYA BISA BACA modul Terbit
CREATE POLICY "Siswa read Terbit Modul" ON public.modul
    FOR SELECT USING (
        status = 'Terbit' AND public.is_siswa_in_kelas(kelas_id)
    );

CREATE POLICY "Guru CRUD Modul" ON public.modul FOR ALL USING (public.is_guru());

CREATE POLICY "Siswa read Terbit Kuis" ON public.kuis
    FOR SELECT USING (
        status = 'Terbit' AND public.is_siswa_in_kelas(kelas_id)
    );

CREATE POLICY "Guru CRUD Kuis" ON public.kuis FOR ALL USING (public.is_guru());

-- 5. PERCOBAAN & JAWABAN KUIS (Siswa Hanya Milik Sendiri)
CREATE POLICY "Siswa CRUD own quiz attempt" ON public.percobaan_kuis
    FOR ALL USING (siswa_id = auth.uid());

CREATE POLICY "Guru View all quiz attempts" ON public.percobaan_kuis
    FOR SELECT USING (public.is_guru());

CREATE POLICY "Siswa CRUD own quiz answers" ON public.jawaban_kuis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.percobaan_kuis
            WHERE percobaan_kuis.id = jawaban_kuis.percobaan_id AND percobaan_kuis.siswa_id = auth.uid()
        )
    );

CREATE POLICY "Guru CRUD all quiz answers" ON public.jawaban_kuis
    FOR ALL USING (public.is_guru());

-- 6. GRADEBOOK & NILAI RLS
CREATE POLICY "Siswa view own nilai" ON public.nilai_komponen
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "Guru CRUD nilai" ON public.nilai_komponen
    FOR ALL USING (public.is_guru());

CREATE POLICY "Siswa view own catatan rapor" ON public.catatan_rapor
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "Guru CRUD catatan rapor" ON public.catatan_rapor
    FOR ALL USING (public.is_guru());