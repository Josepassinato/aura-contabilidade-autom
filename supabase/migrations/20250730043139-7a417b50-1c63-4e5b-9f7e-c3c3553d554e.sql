-- Create client_messages table for client-accountant communication
CREATE TABLE public.client_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'accountant')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[],
  read_by_client BOOLEAN NOT NULL DEFAULT false,
  read_by_accountant BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL DEFAULT 'geral'
);

-- Enable RLS
ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for client messages
CREATE POLICY "Clients can view their own messages" 
ON public.client_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = client_messages.client_id::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Clients can create messages for their account" 
ON public.client_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = client_messages.client_id::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Users can update message read status" 
ON public.client_messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = client_messages.client_id::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Create financial_transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
  category TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'processado' CHECK (status IN ('processado', 'pendente', 'cancelado')),
  reference TEXT,
  account TEXT,
  document_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for financial transactions
CREATE POLICY "Clients can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = financial_transactions.client_id::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Accountants can manage transactions" 
ON public.financial_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Create tax_obligations table for tax deadlines
CREATE TABLE public.tax_obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_obligations ENABLE ROW LEVEL SECURITY;

-- Create policies for tax obligations
CREATE POLICY "Clients can view their own tax obligations" 
ON public.tax_obligations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client' 
    AND company_id = tax_obligations.client_id::text
  )
  OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

CREATE POLICY "Accountants can manage tax obligations" 
ON public.tax_obligations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('accountant', 'admin')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_obligations_updated_at
  BEFORE UPDATE ON public.tax_obligations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();