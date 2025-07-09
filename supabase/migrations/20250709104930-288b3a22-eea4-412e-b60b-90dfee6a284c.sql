-- Remover políticas muito permissivas em accounting_clients
DROP POLICY IF EXISTS "Allow all access to accounting_clients" ON public.accounting_clients;

-- Criar políticas seguras para accounting_clients
CREATE POLICY "Clients can view their own company data" 
ON public.accounting_clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = accounting_clients.id::text
  )
);

CREATE POLICY "Accountants can view their managed clients" 
ON public.accounting_clients 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Accountants can manage their clients" 
ON public.accounting_clients 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Políticas mais restritivas para generated_reports
DROP POLICY IF EXISTS "Allow users to view reports" ON public.generated_reports;
DROP POLICY IF EXISTS "Allow users to create reports" ON public.generated_reports;

CREATE POLICY "Clients can view reports of their company" 
ON public.generated_reports 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN accounting_clients ac ON ac.id::text = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND ac.id = generated_reports.client_id
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Accountants can create reports" 
ON public.generated_reports 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Política para client_documents
CREATE POLICY "Clients can view documents of their company" 
ON public.client_documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN accounting_clients ac ON ac.id::text = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND ac.id = client_documents.client_id
  )
  OR
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

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

-- Política para obrigacoes_fiscais (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'obrigacoes_fiscais') THEN
    EXECUTE 'CREATE POLICY "Clients can view obligations of their company" 
    ON public.obrigacoes_fiscais 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN accounting_clients ac ON ac.id::text = up.company_id
        WHERE up.user_id = auth.uid() 
        AND up.role = ''client''
        AND ac.id = obrigacoes_fiscais.client_id
      )
      OR
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN (''accountant'', ''admin'')
      )
    )';
    
    EXECUTE 'CREATE POLICY "Accountants can manage fiscal obligations" 
    ON public.obrigacoes_fiscais 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() 
        AND role IN (''accountant'', ''admin'')
      )
    )';
  END IF;
END
$$;