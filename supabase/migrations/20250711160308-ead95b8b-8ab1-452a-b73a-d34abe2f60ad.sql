-- Associar clientes existentes ao contador ativo
UPDATE accounting_clients 
SET accountant_id = '4bf3a9ec-57bb-4e13-8d7d-0b7f4ddd0134'
WHERE accountant_id IS NULL;