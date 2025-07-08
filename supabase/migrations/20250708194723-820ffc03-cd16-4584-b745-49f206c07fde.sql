-- Inserir dados de teste para demonstração (valores corretos)
-- Cliente de exemplo
INSERT INTO accounting_clients (id, name, cnpj, email, regime, status) VALUES 
('11111111-1111-1111-1111-111111111111', 'Empresa Teste LTDA', '12.345.678/0001-90', 'teste@empresa.com', 'SIMPLES_NACIONAL', 'active')
ON CONFLICT (id) DO NOTHING;

-- Funcionários de exemplo
INSERT INTO employees (id, client_id, name, cpf, position, base_salary, hire_date, status) VALUES 
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'João Silva', '123.456.789-10', 'Vendedor', 3500.00, '2024-01-15', 'active'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Maria Santos', '987.654.321-00', 'Gerente', 8500.00, '2023-06-10', 'active')
ON CONFLICT (id) DO NOTHING;

-- Obrigações fiscais de exemplo (status e prioridade corretos)
INSERT INTO obrigacoes_fiscais (id, client_id, nome, tipo, prazo, empresa, status, prioridade) VALUES 
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'DAS Janeiro 2024', 'DAS', '2024-01-20', 'Empresa Teste LTDA', 'pendente', 'alta'),
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'GFIP Janeiro 2024', 'GFIP', '2024-02-07', 'Empresa Teste LTDA', 'concluido', 'media'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'DAS Fevereiro 2024', 'DAS', '2024-02-20', 'Empresa Teste LTDA', 'atrasado', 'alta')
ON CONFLICT (id) DO NOTHING;

-- Dados contábeis processados de exemplo
INSERT INTO processed_accounting_data (id, client_id, period, revenue, expenses, net_income, taxable_income, calculated_taxes) VALUES 
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '2024-01', 45231.89, 12234.12, 32997.77, 32997.77, '{"das": 1500.00, "inss": 800.00, "irpj": 600.00}')
ON CONFLICT (id) DO NOTHING;

-- Documentos de exemplo  
INSERT INTO client_documents (id, client_id, name, title, type, status, size) VALUES 
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'nfe_janeiro_2024.xml', 'Notas Fiscais Janeiro 2024', 'NFE', 'processado', 15432),
('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'balancete_jan24.pdf', 'Balancete Janeiro 2024', 'BALANCETE', 'pendente', 8921)
ON CONFLICT (id) DO NOTHING;

-- Plano de contas básico
INSERT INTO plano_contas (codigo, nome, tipo, grau, natureza, aceita_lancamento) VALUES 
('1', 'ATIVO', 'ATIVO', 1, 'DEVEDORA', false),
('1.1', 'ATIVO CIRCULANTE', 'ATIVO', 2, 'DEVEDORA', false),  
('1.1.01', 'DISPONIBILIDADES', 'ATIVO', 3, 'DEVEDORA', false),
('1.1.01.001', 'CAIXA', 'ATIVO', 4, 'DEVEDORA', true),
('1.1.01.002', 'BANCOS C/MOVIMENTO', 'ATIVO', 4, 'DEVEDORA', true),
('2', 'PASSIVO', 'PASSIVO', 1, 'CREDORA', false),
('2.1', 'PASSIVO CIRCULANTE', 'PASSIVO', 2, 'CREDORA', false),
('2.1.01', 'FORNECEDORES', 'PASSIVO', 3, 'CREDORA', true),
('3', 'RECEITAS', 'RECEITA', 1, 'CREDORA', false),
('3.1', 'RECEITA BRUTA', 'RECEITA', 2, 'CREDORA', true),
('4', 'DESPESAS', 'DESPESA', 1, 'DEVEDORA', false),
('4.1', 'DESPESAS OPERACIONAIS', 'DESPESA', 2, 'DEVEDORA', true)
ON CONFLICT (codigo) DO NOTHING;