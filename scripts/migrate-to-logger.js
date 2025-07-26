#!/usr/bin/env node

/**
 * Script para migração automática de console.logs para o sistema de logger
 * Converte chamadas de console para o logger centralizado
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
  // Encontrar a última linha de import
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
    // Se não há imports, adicionar no início
    lines.unshift('import { logger } from "@/utils/logger";');
  }
  
  return lines.join('\n');
}

function migrateFile(filePath) {
  if (shouldSkipFile(filePath)) {
    console.log(`⏭️  Skipping: ${filePath}`);
    return { modified: false };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasConsoleUsage = false;
    const componentName = getComponentName(filePath);
    
    // Verificar se há console.* calls
    const consolePattern = /console\.(log|warn|error|info|debug)\(/;
    if (!consolePattern.test(content)) {
      return { modified: false };
    }
    
    hasConsoleUsage = true;
    
    // Aplicar transformações
    LOG_TRANSFORMATIONS.forEach(({ pattern, replacement }) => {
      const replacementWithComponent = replacement.replace('$COMPONENT', componentName);
      modifiedContent = modifiedContent.replace(pattern, replacementWithComponent);
    });
    
    // Adicionar import do logger se necessário
    if (hasConsoleUsage && !hasLoggerImport(modifiedContent)) {
      modifiedContent = addLoggerImport(modifiedContent);
    }
    
    // Limpar linhas vazias duplas
    modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`✅ Migrated: ${filePath}`);
      return { modified: true };
    }
    
    return { modified: false };
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return { modified: false, error: error.message };
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📂 Directory not found: ${dir}`);
    return { processed: 0, modified: 0 };
  }
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let stats = { processed: 0, modified: 0 };
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const subStats = processDirectory(fullPath);
      stats.processed += subStats.processed;
      stats.modified += subStats.modified;
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      stats.processed++;
      const result = migrateFile(fullPath);
      if (result.modified) {
        stats.modified++;
      }
    }
  }
  
  return stats;
}

console.log('🔄 Starting console.* to logger migration...\n');

let totalStats = { processed: 0, modified: 0 };

DIRECTORIES.forEach(dir => {
  console.log(`📁 Processing: ${dir}`);
  const stats = processDirectory(dir);
  totalStats.processed += stats.processed;
  totalStats.modified += stats.modified;
});

console.log('\n✨ Migration completed!');
console.log('📊 Statistics:');
console.log(`   📄 Files processed: ${totalStats.processed}`);
console.log(`   ✅ Files modified: ${totalStats.modified}`);
console.log(`   🔒 Security enhanced: Console logs removed from production`);
console.log('\n🚀 Next steps:');
console.log('   1. Review the changes');
console.log('   2. Test the application');
console.log('   3. Run production build to verify logger integration');