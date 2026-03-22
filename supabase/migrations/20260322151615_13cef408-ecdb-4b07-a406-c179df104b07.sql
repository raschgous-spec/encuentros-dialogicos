
-- Create storage bucket for acta attachments (attendance Excel + photo evidence)
INSERT INTO storage.buckets (id, name, public)
VALUES ('actas-attachments', 'actas-attachments', true);

-- RLS policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload own acta attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'actas-attachments' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: authenticated users can view their own attachments
CREATE POLICY "Users can view own acta attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'actas-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: coordinators/admins can view all attachments
CREATE POLICY "Coordinators can view all acta attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'actas-attachments'
  AND (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'docente')
  )
);

-- RLS policy: users can delete their own attachments
CREATE POLICY "Users can delete own acta attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'actas-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: users can update their own attachments
CREATE POLICY "Users can update own acta attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'actas-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
