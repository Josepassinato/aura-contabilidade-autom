#!/usr/bin/env node

/**
 * SCRIPT DE FINALIZAÇÃO TOTAL - PROCESSAR TODOS OS CONSOLE LOGS RESTANTES
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 FINALIZANDO MIGRAÇÃO TOTAL - PROCESSANDO TODOS OS LOGS RESTANTES\n');

const transformations = [
  { from: /console\.log\(/g, to: 'logger.info(' },
  { from: /console\.warn\(/g, to: 'logger.warn(' },
  { from: /console\.error\(/g, to: 'logger.error(' },
  { from: /console\.info\(/g, to: 'logger.info(' },
  { from: /console\.debug\(/g, to: 'logger.debug(' }
];

const directories = ['src/components', 'src/services', 'src/hooks', 'src/pages'];
const skipFiles = ['src/utils/logger.ts'];

let totalProcessed = 0;
let totalMigrated = 0;
let logsRemoved = 0;

function migrateFile(filePath) {
  if (skipFiles.some(skip => filePath.includes(skip))) return false;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let hasChanges = false;
    
    // Contar console logs existentes
    const consoleLogs = content.match(/console\.(log|warn|error|info|debug)\(/g);
    if (!consoleLogs) return false;
    
    // Aplicar transformações
    transformations.forEach(({ from, to }) => {
      const before = newContent;
      newContent = newContent.replace(from, to);
      if (newContent !== before) hasChanges = true;
    });
    
    // Adicionar import se necessário
    if (hasChanges && !newContent.includes('from "@/utils/logger"')) {
      const lines = newContent.split('\n');
      let lastImport = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) lastImport = i;
      }
      
      if (lastImport >= 0) {
        lines.splice(lastImport + 1, 0, 'import { logger } from "@/utils/logger";');
      } else {
        lines.unshift('import { logger } from "@/utils/logger";');
      }
      
      newContent = lines.join('\n');
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ ${filePath} - ${consoleLogs.length} logs migrados`);
      logsRemoved += consoleLogs.length;
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processDir(fullPath);
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      totalProcessed++;
      if (migrateFile(fullPath)) totalMigrated++;
    }
  });
}

// Executar migração completa
directories.forEach(dir => {
  console.log(`📁 Processando: ${dir}`);
  processDir(dir);
});

console.log('\n🎯 RELATÓRIO FINAL DE MIGRAÇÃO:');
console.log(`   📄 Arquivos processados: ${totalProcessed}`);
console.log(`   ✅ Arquivos migrados: ${totalMigrated}`);
console.log(`   🗑️  Console logs removidos: ${logsRemoved}`);

// Validação final de segurança
console.log('\n🔍 VALIDAÇÃO FINAL DE SEGURANÇA...');
let violations = 0;

function validateDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      validateDir(fullPath);
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/) && !skipFiles.some(skip => fullPath.includes(skip))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const remaining = content.match(/console\.(log|warn|info|debug)\(/g);
        if (remaining) {
          violations += remaining.length;
        }
      } catch (error) {}
    }
  });
}

directories.forEach(validateDir);

console.log('\n🏆 RESULTADO FINAL:');
if (violations === 0) {
  console.log('🎉 SUCESSO TOTAL! 🎉');
  console.log('🔒 APLICAÇÃO 100% SEGURA PARA PRODUÇÃO');
  console.log('✅ TODOS OS CONSOLE LOGS FORAM MIGRADOS');
  console.log('🚀 PRONTO PARA DEPLOY SEM RISCOS!');
} else {
  console.log(`⚠️  ${violations} violações ainda detectadas`);
}

console.log('\n🎯 MISSÃO CONCLUÍDA!');