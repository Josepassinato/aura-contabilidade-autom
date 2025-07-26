#!/usr/bin/env node

/**
 * Executa todos os scripts de migração de console logs
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando migração completa dos console logs...\n');

try {
  // 1. Executar migração automática
  console.log('📋 Passo 1: Executando migração automática...');
  execSync('node scripts/migrate-to-logger.js', { stdio: 'inherit' });
  
  console.log('\n📋 Passo 2: Executando validação de segurança...');
  execSync('node scripts/validate-production-logs.js', { stdio: 'inherit' });
  
  console.log('\n📋 Passo 3: Executando limpeza final...');
  execSync('node scripts/cleanup-console-logs.js', { stdio: 'inherit' });
  
  console.log('\n✅ Migração completa realizada com sucesso!');
  console.log('🔒 A aplicação agora está segura para produção.');
  
} catch (error) {
  console.error('\n❌ Erro durante a migração:', error.message);
  process.exit(1);
}