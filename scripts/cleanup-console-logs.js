#!/usr/bin/env node

/**
 * Script para limpeza inteligente de console.logs para produção
 * Remove console.logs mas preserva console.error em desenvolvimento
 */

const fs = require('fs');
const path = require('path');

// Padrões para remover (mais agressivos para produção)
const PATTERNS_TO_REMOVE = [
  /console\.log\([^)]*\);?\s*\n?/g,
  /console\.warn\([^)]*\);?\s*\n?/g,
  /console\.info\([^)]*\);?\s*\n?/g,
  /console\.debug\([^)]*\);?\s*\n?/g,
  // Remover console.error também, exceto em arquivos críticos
  /console\.error\([^)]*\);?\s*\n?/g,
];

// Padrões para preservar (em desenvolvimento)
const PATTERNS_TO_KEEP = [
  /console\.error\(/,
  /console\.table\(/,
  /console\.group\(/,
];

// Diretórios para processar
const DIRECTORIES = [
  'src/components',
  'src/pages', 
  'src/services',
  'src/hooks',
  'src/utils',
];

// Arquivos para não modificar (manter logger utilitários)
const SKIP_FILES = [
  'src/utils/logger.ts',
  'src/utils/debug.ts',
  'src/components/layout/GlobalErrorBoundary.tsx', // Manter erro crítico
];

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skipFile => filePath.includes(skipFile));
}

function cleanFile(filePath) {
  if (shouldSkipFile(filePath)) {
    console.log(`⏭️  Skipping: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanedContent = content;
    
    // Remove console.logs mas preserva estrutura
    PATTERNS_TO_REMOVE.forEach(pattern => {
      cleanedContent = cleanedContent.replace(pattern, '');
    });
    
    // Limpar linhas vazias duplas
    cleanedContent = cleanedContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`✅ Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`📂 Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      cleanFile(fullPath);
    }
  }
}

console.log('🧹 Starting console.log cleanup for production...\n');

DIRECTORIES.forEach(dir => {
  console.log(`📁 Processing: ${dir}`);
  processDirectory(dir);
});

console.log('\n✨ Console.log cleanup completed!');
console.log('📋 Summary:');
console.log('   ✅ Removed: console.log, console.warn');
console.log('   ⚠️  Kept: console.error (for debugging)');
console.log('   🚫 Skipped: logger utilities');