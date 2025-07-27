#!/usr/bin/env node

/**
 * Script de migração automática massiva para console logs restantes
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de transformações
const LOG_TRANSFORMATIONS = [
  {
    pattern: /console\.log\(([^)]+)\)/g,
    replacement: 'logger.info($1, undefined, "$COMPONENT")'
  },
  {
    pattern: /console\.warn\(([^)]+)\)/g,
    replacement: 'logger.warn($1, undefined, "$COMPONENT")'
  },
  {
    pattern: /console\.error\(([^)]+)\)/g,
    replacement: 'logger.error($1, undefined, "$COMPONENT")'
  },
  {
    pattern: /console\.info\(([^)]+)\)/g,
    replacement: 'logger.info($1, undefined, "$COMPONENT")'
  },
  {
    pattern: /console\.debug\(([^)]+)\)/g,
    replacement: 'logger.debug($1, undefined, "$COMPONENT")'
  }
];

// Diretórios para processar
const DIRECTORIES = [
  'src/components',
  'src/pages', 
  'src/services',
  'src/hooks',
  'src/utils',
];

// Arquivos para não modificar
const SKIP_FILES = [
  'src/utils/logger.ts',
  'src/components/layout/GlobalErrorBoundary.tsx',
  'scripts/',
];

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skipFile => filePath.includes(skipFile));
}

function getComponentName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName.charAt(0).toUpperCase() + fileName.slice(1);
}

function hasLoggerImport(content) {
  return content.includes('import { logger }') || 
         content.includes('import { log }') ||
         content.includes('from "@/utils/logger"');
}

function addLoggerImport(content) {
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, 'import { logger } from "@/utils/logger";');
  } else {
    lines.unshift('import { logger } from "@/utils/logger";');
  }
  
  return lines.join('\n');
}

function migrateFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return { modified: false, reason: 'skipped' };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasConsoleUsage = false;
    const componentName = getComponentName(filePath);
    
    // Verificar se há console.* calls
    const consolePattern = /console\.(log|warn|error|info|debug)\(/;
    if (!consolePattern.test(content)) {
      return { modified: false, reason: 'no_console' };
    }
    
    hasConsoleUsage = true;
    let transformationsApplied = 0;
    
    // Aplicar transformações
    LOG_TRANSFORMATIONS.forEach(({ pattern, replacement }) => {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        transformationsApplied += matches.length;
        const replacementWithComponent = replacement.replace('$COMPONENT', componentName);
        modifiedContent = modifiedContent.replace(pattern, replacementWithComponent);
      }
    });
    
    // Adicionar import do logger se necessário
    if (hasConsoleUsage && !hasLoggerImport(modifiedContent)) {
      modifiedContent = addLoggerImport(modifiedContent);
    }
    
    // Limpar linhas vazias duplas
    modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`✅ Migrated: ${filePath} (${transformationsApplied} console calls)`);
      return { modified: true, transformations: transformationsApplied };
    }
    
    return { modified: false, reason: 'no_changes' };
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return { modified: false, error: error.message };
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📂 Directory not found: ${dir}`);
    return { processed: 0, modified: 0, transformations: 0 };
  }
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let stats = { processed: 0, modified: 0, transformations: 0 };
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const subStats = processDirectory(fullPath);
      stats.processed += subStats.processed;
      stats.modified += subStats.modified;
      stats.transformations += subStats.transformations;
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      stats.processed++;
      const result = migrateFile(fullPath);
      if (result.modified) {
        stats.modified++;
        stats.transformations += result.transformations || 0;
      }
    }
  }
  
  return stats;
}

console.log('🚀 Executando migração automática massiva...\n');
console.log('📝 Processando console.* -> logger.*\n');

let totalStats = { processed: 0, modified: 0, transformations: 0 };

DIRECTORIES.forEach(dir => {
  console.log(`📁 Processando: ${dir}`);
  const stats = processDirectory(dir);
  totalStats.processed += stats.processed;
  totalStats.modified += stats.modified;
  totalStats.transformations += stats.transformations;
  console.log(`   📄 ${stats.processed} arquivos | ✅ ${stats.modified} migrados | 🔄 ${stats.transformations} transformações\n`);
});

console.log('🎉 Migração automática completada!');
console.log('📊 Estatísticas finais:');
console.log(`   📄 Arquivos processados: ${totalStats.processed}`);
console.log(`   ✅ Arquivos modificados: ${totalStats.modified}`);
console.log(`   🔄 Console.* migrados: ${totalStats.transformations}`);
console.log(`   🔒 Sistema de logging seguro implementado`);

if (totalStats.modified > 0) {
  console.log('\n🚀 Próximos passos:');
  console.log('   1. Executar validação: node scripts/validate-production-logs.js');
  console.log('   2. Testar aplicação para verificar funcionalidade');
  console.log('   3. Build de produção para verificar logs removidos');
} else {
  console.log('\n✨ Todos os arquivos já estão migrados ou não contêm console logs!');
}