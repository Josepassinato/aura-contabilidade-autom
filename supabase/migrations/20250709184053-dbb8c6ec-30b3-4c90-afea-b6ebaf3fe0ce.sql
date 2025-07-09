-- Criar alguns clientes de exemplo para demonstração
INSERT INTO public.accounting_clients (name, cnpj, email, regime, status) VALUES
('Empresa Exemplo Ltda', '12.345.678/0001-90', 'contato@empresaexemplo.com.br', 'Simples Nacional', 'active'),
('Inovação Tecnológica S.A.', '98.765.432/0001-10', 'admin@inovacaotech.com.br', 'Lucro Presumido', 'active'),
('Comércio Digital ME', '11.222.333/0001-44', 'financeiro@comerciodigital.com.br', 'Simples Nacional', 'active'),
('Consultoria Empresarial Ltda', '44.555.666/0001-77', 'suporte@consultoriaempresarial.com.br', 'Lucro Real', 'active');