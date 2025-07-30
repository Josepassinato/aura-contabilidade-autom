import { test, expect } from '@playwright/test';

/**
 * Testes E2E para fluxos críticos do sistema contábil
 * Foco em Login + RLS, Upload/Download de Documentos, Lançamentos Contábeis
 */

const TEST_USER_EMAIL = 'teste@contabilidade.com';
const TEST_USER_PASSWORD = 'Teste123!';

test.describe('Fluxos Críticos - Autenticação e RLS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Login completo e verificação de RLS', async ({ page }) => {
    // 1. Acessar página de login
    await page.click('text=Entrar');
    await expect(page).toHaveURL('/login');

    // 2. Fazer login
    await page.fill('input[type="email"]', TEST_USER_EMAIL);
    await page.fill('input[type="password"]', TEST_USER_PASSWORD);
    await page.click('button[type="submit"]');

    // 3. Verificar redirecionamento após login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // 4. Verificar se dados específicos do usuário são carregados (RLS)
    await expect(page.locator('[data-testid="user-specific-data"]')).toBeVisible();
    
    // 5. Tentar acessar dados de outro usuário (deve falhar)
    const response = await page.request.get('/api/admin-only-data');
    expect(response.status()).toBe(403);

    // 6. Verificar logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');
    await expect(page).toHaveURL('/login');
  });

  test('Verificação de permissões por role', async ({ page }) => {
    // Login como contador
    await page.goto('/login');
    await page.fill('input[type="email"]', 'contador@teste.com');
    await page.fill('input[type="password"]', 'Contador123!');
    await page.click('button[type="submit"]');

    // Verificar acesso a funcionalidades de contador
    await expect(page.locator('text=Gerenciar Clientes')).toBeVisible();
    await expect(page.locator('text=Relatórios Avançados')).toBeVisible();

    // Login como cliente
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');
    
    await page.fill('input[type="email"]', 'cliente@teste.com');
    await page.fill('input[type="password"]', 'Cliente123!');
    await page.click('button[type="submit"]');

    // Verificar restrições para cliente
    await expect(page.locator('text=Gerenciar Clientes')).not.toBeVisible();
    await expect(page.locator('text=Meus Documentos')).toBeVisible();
  });
});

test.describe('Fluxos Críticos - Documentos', () => {
  test.beforeEach(async ({ page }) => {
    // Login como contador para testes de documentos
    await page.goto('/login');
    await page.fill('input[type="email"]', 'contador@teste.com');
    await page.fill('input[type="password"]', 'Contador123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Upload e download de documentos', async ({ page }) => {
    // 1. Navegar para seção de documentos
    await page.click('text=Documentos');
    await expect(page).toHaveURL(/\/documents/);

    // 2. Upload de documento
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('e2e/fixtures/documento-teste.pdf');
    
    await page.fill('[data-testid="document-title"]', 'Documento Teste E2E');
    await page.selectOption('[data-testid="document-type"]', 'nota_fiscal');
    await page.click('button[type="submit"]');

    // 3. Verificar se documento foi criado
    await expect(page.locator('text=Documento Teste E2E')).toBeVisible();
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();

    // 4. Download do documento
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-document"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('documento-teste.pdf');

    // 5. Verificar que apenas usuários autorizados podem baixar
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');
    
    // Tentar baixar sem estar logado
    await page.goto('/documents/download/test-doc-id');
    await expect(page).toHaveURL('/login');
  });

  test('Processamento de documentos XML SEFAZ', async ({ page }) => {
    await page.click('text=Integração SEFAZ');
    
    // Upload de XML
    const xmlInput = page.locator('input[accept=".xml"]');
    await xmlInput.setInputFiles('e2e/fixtures/nfe-teste.xml');
    
    await page.click('button:text("Processar XML")');
    
    // Verificar processamento
    await expect(page.locator('text=XML processado com sucesso')).toBeVisible();
    await expect(page.locator('[data-testid="xml-data"]')).toBeVisible();
  });
});

test.describe('Fluxos Críticos - Lançamentos Contábeis', () => {
  test.beforeEach(async ({ page }) => {
    // Login como contador
    await page.goto('/login');
    await page.fill('input[type="email"]', 'contador@teste.com');
    await page.fill('input[type="password"]', 'Contador123!');
    await page.click('button[type="submit"]');
    await page.goto('/lancamentos');
  });

  test('Criação de lançamento contábil e geração de relatório', async ({ page }) => {
    // 1. Criar novo lançamento
    await page.click('button:text("Novo Lançamento")');
    
    await page.fill('[data-testid="lancamento-descricao"]', 'Lançamento Teste E2E');
    await page.fill('[data-testid="lancamento-valor"]', '1000.00');
    await page.selectOption('[data-testid="conta-debito"]', '1.1.01.001');
    await page.selectOption('[data-testid="conta-credito"]', '2.1.01.001');
    
    await page.click('button[type="submit"]');
    
    // 2. Verificar se lançamento foi criado
    await expect(page.locator('text=Lançamento criado com sucesso')).toBeVisible();
    await expect(page.locator('text=Lançamento Teste E2E')).toBeVisible();

    // 3. Gerar relatório DRE
    await page.click('text=Relatórios');
    await page.click('text=DRE');
    
    await page.selectOption('[data-testid="periodo-mes"]', '12');
    await page.selectOption('[data-testid="periodo-ano"]', '2024');
    await page.click('button:text("Gerar Relatório")');
    
    // 4. Verificar geração do relatório
    await expect(page.locator('[data-testid="relatorio-dre"]')).toBeVisible();
    await expect(page.locator('text=1.000,00')).toBeVisible();

    // 5. Download do relatório em PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:text("Download PDF")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('DRE_');
    expect(download.suggestedFilename()).toContain('.pdf');

    // 6. Verificar balancete
    await page.click('text=Balancete');
    await page.click('button:text("Gerar Balancete")');
    
    await expect(page.locator('[data-testid="balancete-table"]')).toBeVisible();
    await expect(page.locator('text=Lançamento Teste E2E')).toBeVisible();
  });

  test('Fechamento mensal automatizado', async ({ page }) => {
    // 1. Iniciar processo de fechamento
    await page.click('text=Fechamento');
    await page.click('button:text("Iniciar Fechamento Mensal")');
    
    // 2. Verificar progresso do fechamento
    await expect(page.locator('[data-testid="fechamento-progress"]')).toBeVisible();
    
    // 3. Aguardar conclusão (pode demorar)
    await page.waitForSelector('text=Fechamento concluído', { timeout: 30000 });
    
    // 4. Verificar relatórios gerados
    await expect(page.locator('text=DRE gerada automaticamente')).toBeVisible();
    await expect(page.locator('text=Balancete de verificação gerado')).toBeVisible();
    
    // 5. Verificar se não há erros de validação
    const errorElements = page.locator('[data-testid="validation-error"]');
    await expect(errorElements).toHaveCount(0);
  });
});

test.describe('Testes de Performance e Robustez', () => {
  test('Performance no carregamento de dados grandes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'contador@teste.com');
    await page.fill('input[type="password"]', 'Contador123!');
    await page.click('button[type="submit"]');
    
    // Medir tempo de carregamento da página de relatórios
    const startTime = Date.now();
    await page.goto('/relatorios');
    
    // Aguardar carregamento completo
    await page.waitForSelector('[data-testid="relatorios-table"]');
    const loadTime = Date.now() - startTime;
    
    // Verificar que carregou em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
    
    // Verificar paginação funciona
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="page-number"]')).toContainText('2');
  });

  test('Tolerância a falhas de rede', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'contador@teste.com');
    await page.fill('input[type="password"]', 'Contador123!');
    await page.click('button[type="submit"]');
    
    // Simular falha de rede
    await page.route('**/api/**', route => route.abort());
    
    // Tentar fazer uma operação
    await page.click('text=Documentos');
    
    // Verificar mensagem de erro amigável
    await expect(page.locator('text=Erro de conexão')).toBeVisible();
    await expect(page.locator('button:text("Tentar Novamente")')).toBeVisible();
    
    // Restaurar conexão
    await page.unroute('**/api/**');
    
    // Tentar novamente
    await page.click('button:text("Tentar Novamente")');
    await expect(page.locator('[data-testid="documents-list"]')).toBeVisible();
  });
});