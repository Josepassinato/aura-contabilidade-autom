
-- Create tables for payroll management

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cpf TEXT NOT NULL,
    position TEXT NOT NULL,
    department TEXT,
    hire_date DATE NOT NULL,
    base_salary NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'vacation', 'leave')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll entries table
CREATE TABLE IF NOT EXISTS payroll_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES accounting_clients(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- Format: YYYY-MM
    base_salary NUMERIC(12, 2) NOT NULL,
    gross_salary NUMERIC(12, 2) NOT NULL,
    deductions NUMERIC(12, 2) NOT NULL,
    net_salary NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'processing', 'approved', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll deductions table
CREATE TABLE IF NOT EXISTS payroll_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_entry_id UUID NOT NULL REFERENCES payroll_entries(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('inss', 'irrf', 'fgts', 'loan', 'advance', 'other')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payroll benefits table
CREATE TABLE IF NOT EXISTS payroll_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_entry_id UUID NOT NULL REFERENCES payroll_entries(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('transport', 'meal', 'health', 'education', 'other')),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies

-- Employees table
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accountants can read all employees" 
ON employees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

CREATE POLICY "Accountants can create employees" 
ON employees 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

CREATE POLICY "Accountants can update employees" 
ON employees 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

CREATE POLICY "Accountants can delete employees" 
ON employees 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

-- Clients can view their own employees
CREATE POLICY "Clients can view their own employees" 
ON employees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client'
    AND company_id = client_id::text
  )
);

-- Payroll entries table
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accountants can manage payroll entries" 
ON payroll_entries 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

CREATE POLICY "Clients can view their own payroll entries" 
ON payroll_entries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'client'
    AND company_id = client_id::text
  )
);

-- Payroll deductions table
ALTER TABLE payroll_deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accountants can manage payroll deductions" 
ON payroll_deductions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

CREATE POLICY "Clients can view their own payroll deductions" 
ON payroll_deductions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN payroll_entries pe ON pe.client_id::text = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND pe.id = payroll_entry_id
  )
);

-- Payroll benefits table
ALTER TABLE payroll_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Accountants can manage payroll benefits" 
ON payroll_benefits 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'accountant'
  )
);

CREATE POLICY "Clients can view their own payroll benefits" 
ON payroll_benefits 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN payroll_entries pe ON pe.client_id::text = up.company_id
    WHERE up.user_id = auth.uid() 
    AND up.role = 'client'
    AND pe.id = payroll_entry_id
  )
);
