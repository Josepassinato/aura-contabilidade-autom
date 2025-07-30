import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E críticos
 */
export default defineConfig({
  testDir: './e2e',
  /* Executar testes em paralelo */
  fullyParallel: true,
  /* Falhar o build se você acidentalmente deixar test.only no código fonte */
  forbidOnly: !!process.env.CI,
  /* Tentar novamente apenas no CI */
  retries: process.env.CI ? 2 : 0,
  /* Optar por não paralelizar no CI */
  workers: process.env.CI ? 1 : undefined,
  /* Configuração de relatórios */
  reporter: 'html',
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar nas ações como `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    
    /* Coleta de traces para o primeiro retry de cada teste com falha */
    trace: 'on-first-retry',
    
    /* Screenshots apenas em falhas */
    screenshot: 'only-on-failure',
    
    /* Gravar vídeos apenas em falhas */
    video: 'retain-on-failure',
  },

  /* Configurar projetos para principais navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes para mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Executar servidor de desenvolvimento local antes de iniciar testes */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});