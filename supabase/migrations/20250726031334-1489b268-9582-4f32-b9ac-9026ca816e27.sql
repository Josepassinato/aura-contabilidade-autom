-- Enable RLS on the remaining table and create policies
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for client_documents
CREATE POLICY "Accountants can manage client documents" 
ON public.client_documents 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Clients can view their own documents" 
ON public.client_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN accounting_clients ac ON ac.id = client_documents.client_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND up.company_id = ac.id::text
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);