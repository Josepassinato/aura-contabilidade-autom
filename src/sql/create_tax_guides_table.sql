
/*
Esta é uma referência SQL para criar a tabela tax_guides no Supabase.
Para executar este SQL, vá ao painel do Supabase e use o SQL Editor.
*/

CREATE TABLE IF NOT EXISTS tax_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  type TEXT NOT NULL,
  reference TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  bar_code TEXT,
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE CASCADE
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tax_guides_client_id ON tax_guides(client_id);
CREATE INDEX IF NOT EXISTS idx_tax_guides_status ON tax_guides(status);
CREATE INDEX IF NOT EXISTS idx_tax_guides_due_date ON tax_guides(due_date);

-- Criar função para ser chamada via RPC
CREATE OR REPLACE FUNCTION create_tax_guides_table()
RETURNS TEXT AS $$
BEGIN
  -- Verifica se a tabela já existe
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tax_guides'
  ) THEN
    RETURN 'Tabela tax_guides já existe';
  END IF;
  
  -- Criar a tabela
  CREATE TABLE tax_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    type TEXT NOT NULL,
    reference TEXT NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    bar_code TEXT,
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Criar índices
  CREATE INDEX idx_tax_guides_client_id ON tax_guides(client_id);
  CREATE INDEX idx_tax_guides_status ON tax_guides(status);
  CREATE INDEX idx_tax_guides_due_date ON tax_guides(due_date);
  
  RETURN 'Tabela tax_guides criada com sucesso';
END;
$$ LANGUAGE plpgsql;
