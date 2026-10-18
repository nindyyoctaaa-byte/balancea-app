-- Storage Policies for perangkat-ajar
CREATE POLICY "Guru upload perangkat" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'perangkat-ajar' AND public.is_guru());

CREATE POLICY "Siswa read perangkat" ON storage.objects
    FOR SELECT USING (bucket_id = 'perangkat-ajar' AND auth.role() = 'authenticated');