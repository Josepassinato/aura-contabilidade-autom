-- Lançamentos contábeis de exemplo
INSERT INTO lancamentos_contabeis (id, client_id, numero_lancamento, data_lancamento, data_competencia, historico, valor_total, origem, status) VALUES 
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '202401001', '2024-01-15', '2024-01-15', 'Venda de produtos - NF 001', 5000.00, 'MANUAL', 'LANCADO'),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '202401002', '2024-01-20', '2024-01-20', 'Pagamento fornecedor XYZ', 2500.00, 'MANUAL', 'LANCADO'),
('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '202401003', '2024-01-25', '2024-01-25', 'Recebimento cliente ABC', 3200.00, 'MANUAL', 'LANCADO')
ON CONFLICT (id) DO NOTHING;

-- Itens dos lançamentos
INSERT INTO lancamentos_itens (lancamento_id, conta_id, tipo_movimento, valor, historico_complementar) VALUES 
-- Lançamento 1: Venda de produtos
((SELECT id FROM lancamentos_contabeis WHERE numero_lancamento = '202401001'), (SELECT id FROM plano_contas WHERE codigo = '1.1.01.001'), 'DEBITO', 5000.00, 'Recebimento à vista'),
((SELECT id FROM lancamentos_contabeis WHERE numero_lancamento = '202401001'), (SELECT id FROM plano_contas WHERE codigo = '3.1'), 'CREDITO', 5000.00, 'Receita de vendas'),

-- Lançamento 2: Pagamento fornecedor  
((SELECT id FROM lancamentos_contabeis WHERE numero_lancamento = '202401002'), (SELECT id FROM plano_contas WHERE codigo = '2.1.01'), 'DEBITO', 2500.00, 'Quitação fornecedor'),
((SELECT id FROM lancamentos_contabeis WHERE numero_lancamento = '202401002'), (SELECT id FROM plano_contas WHERE codigo = '1.1.01.002'), 'CREDITO', 2500.00, 'Pagamento via banco'),

-- Lançamento 3: Recebimento cliente
((SELECT id FROM lancamentos_contabeis WHERE numero_lancamento = '202401003'), (SELECT id FROM plano_contas WHERE codigo = '1.1.01.002'), 'DEBITO', 3200.00, 'Depósito bancário'),
((SELECT id FROM lancamentos_contabeis WHERE numero_lancamento = '202401003'), (SELECT id FROM plano_contas WHERE codigo = '3.1'), 'CREDITO', 3200.00, 'Receita de vendas');