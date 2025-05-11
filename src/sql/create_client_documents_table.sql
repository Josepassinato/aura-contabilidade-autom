
/*
Esta é uma referência SQL para criar a tabela client_documents no Supabase.
Para executar este SQL, vá ao painel do Supabase e use o SQL Editor.
*/

CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT fk_client
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE CASCADE
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_status ON client_documents(status);

-- Criar função para ser chamada via RPC
CREATE OR REPLACE FUNCTION create_client_documents_table()
RETURNS TEXT AS $$
BEGIN
  -- Verifica se a tabela já existe
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'client_documents'
  ) THEN
    RETURN 'Tabela client_documents já existe';
  END IF;
  
  -- Criar a tabela
  CREATE TABLE client_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Criar índices
  CREATE INDEX idx_client_documents_client_id ON client_documents(client_id);
  CREATE INDEX idx_client_documents_status ON client_documents(status);
  
  RETURN 'Tabela client_documents criada com sucesso';
END;
$$ LANGUAGE plpgsql;
