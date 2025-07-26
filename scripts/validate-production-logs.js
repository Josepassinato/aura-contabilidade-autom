#!/usr/bin/env node

/**
 * Script para validação de logs em produção
 * Verifica se há console.logs remanescentes que comprometem a segurança
 */

const fs = require('fs');
const path = require('path');

// Padrões perigosos para produção
const UNSAFE_PATTERNS = [
  {
    pattern: /console\.log\(/g,
    severity: 'CRITICAL',
    description: 'Console.log expõe dados em produção'
  },
  {
    pattern: /console\.warn\(/g,
    severity: 'HIGH',
    description: 'Console.warn pode expor informações sensíveis'
  },
  {
    pattern: /console\.info\(/g,
    severity: 'MEDIUM',
    description: 'Console.info pode vazar informações'
  },
  {
    pattern: /console\.debug\(/g,
    severity: 'MEDIUM',
    description: 'Console.debug pode expor estado interno'
  },
  {
    pattern: /console\.trace\(/g,
    severity: 'HIGH',
    description: 'Console.trace expõe estrutura interna'
  }
];

// Padrões permitidos (em arquivos específicos)
const ALLOWED_PATTERNS = [
  /console\.error\(/ // Apenas em arquivos de erro crítico
];

// Diretórios para verificar
const DIRECTORIES = [
  'src/components',
  'src/pages', 
  'src/services',
  'src/hooks',
  'src/utils',
];

// Arquivos que podem ter console.error
const ALLOWED_ERROR_FILES = [
  'src/utils/logger.ts',
  'src/components/layout/GlobalErrorBoundary.tsx',
];

function isAllowedErrorFile(filePath) {
  return ALLOWED_ERROR_FILES.some(allowed => filePath.includes(allowed));
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    UNSAFE_PATTERNS.forEach(({ pattern, severity, description }) => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        const lines = content.substring(0, match.index).split('\n');
        violations.push({
          file: filePath,
          line: lines.length,
          severity,
          description,
          match: match[0]
        });
      });
    });
    
    // Verificar console.error em arquivos não permitidos
    if (!isAllowedErrorFile(filePath)) {
      const errorMatches = [...content.matchAll(/console\.error\(/g)];
      errorMatches.forEach(match => {
        const lines = content.substring(0, match.index).split('\n');
        violations.push({
          file: filePath,
          line: lines.length,
          severity: 'HIGH',
          description: 'Console.error em arquivo não autorizado',
          match: match[0]
        });
      });
    }
    
    return violations;
  } catch (error) {
    console.error(`❌ Error scanning ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let allViolations = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      allViolations = allViolations.concat(scanDirectory(fullPath));
    } else if (file.name.match(/\.(ts|tsx|js|jsx)$/)) {
      const violations = scanFile(fullPath);
      allViolations = allViolations.concat(violations);
    }
  }
  
  return allViolations;
}

function generateReport(violations) {
  const severityCounts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };
  
  console.log('\n🔍 RELATÓRIO DE SEGURANÇA - LOGS EM PRODUÇÃO\n');
  console.log('═'.repeat(60));
  
  if (violations.length === 0) {
    console.log('✅ SUCESSO: Nenhuma violação de segurança encontrada!');
    console.log('🔒 O código está seguro para produção.');
    return true;
  }
  
  // Agrupar por severidade
  violations.forEach(v => severityCounts[v.severity]++);
  
  console.log('📊 RESUMO DE VIOLAÇÕES:');
  Object.entries(severityCounts).forEach(([severity, count]) => {
    if (count > 0) {
      const emoji = severity === 'CRITICAL' ? '🚨' : severity === 'HIGH' ? '⚠️' : '⚡';
      console.log(`   ${emoji} ${severity}: ${count} ocorrências`);
    }
  });
  
  console.log('\n📋 DETALHES DAS VIOLAÇÕES:\n');
  
  violations.forEach((violation, index) => {
    const emoji = violation.severity === 'CRITICAL' ? '🚨' : 
                  violation.severity === 'HIGH' ? '⚠️' : '⚡';
    
    console.log(`${emoji} Violação #${index + 1} [${violation.severity}]`);
    console.log(`   📁 Arquivo: ${violation.file}`);
    console.log(`   📍 Linha: ${violation.line}`);
    console.log(`   💬 Código: ${violation.match}`);
    console.log(`   ❗ Problema: ${violation.description}`);
    console.log('');
  });
  
  console.log('🛠️  AÇÕES NECESSÁRIAS:');
  console.log('   1. Execute: npm run migrate-to-logger');
  console.log('   2. Ou execute: npm run cleanup-console-logs');
  console.log('   3. Revise manualmente arquivos críticos');
  console.log('   4. Re-execute este script para validar');
  
  return false;
}

// Executar validação
console.log('🔍 Iniciando validação de segurança para produção...');

let allViolations = [];

DIRECTORIES.forEach(dir => {
  console.log(`📁 Verificando: ${dir}`);
  const violations = scanDirectory(dir);
  allViolations = allViolations.concat(violations);
});

const isSecure = generateReport(allViolations);

// Exit code para CI/CD
process.exit(isSecure ? 0 : 1);