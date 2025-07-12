#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Berean Bible App - Deployment Checker\n');

let issues = [];
let warnings = [];
let checks = 0;

function checkFile(filePath, description) {
  checks++;
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description}`);
    issues.push(`Missing: ${filePath}`);
    return false;
  }
}

function checkEnvVar(varName) {
  checks++;
  if (process.env[varName]) {
    console.log(`✅ Environment variable ${varName} is set`);
    return true;
  } else {
    console.log(`❌ Environment variable ${varName} is missing`);
    issues.push(`Missing environment variable: ${varName}`);
    return false;
  }
}

// Check essential files
console.log('📁 Checking essential files...');
checkFile('app/package.json', 'package.json exists');
checkFile('app/next.config.js', 'next.config.js exists');
checkFile('app/prisma/schema.prisma', 'Prisma schema exists');
checkFile('app/lib/db.ts', 'Database connection file exists');
checkFile('app/lib/auth.ts', 'Auth configuration exists');

// Check environment files
console.log('\n🔐 Checking environment configuration...');
checkFile('app/.env', '.env file exists');
checkFile('app/.env.local', '.env.local file exists (optional)');

// Check for node_modules
console.log('\n📦 Checking dependencies...');
checkFile('app/node_modules', 'node_modules directory exists');

// Check Prisma client
console.log('\n🗄️ Checking Prisma setup...');
checkFile('app/node_modules/.prisma/client', 'Prisma client generated');

// Check for common issues in Prisma schema
if (fs.existsSync('app/prisma/schema.prisma')) {
  const schemaContent = fs.readFileSync('app/prisma/schema.prisma', 'utf8');
  
  if (schemaContent.includes('output =')) {
    console.log('⚠️  Custom Prisma output path detected (may cause deployment issues)');
    warnings.push('Custom Prisma output path in schema.prisma');
  } else {
    console.log('✅ Prisma schema uses default output path');
    checks++;
  }
}

// Check package.json for postinstall script
if (fs.existsSync('app/package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('app/package.json', 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.postinstall) {
    console.log('✅ postinstall script found in package.json');
    checks++;
  } else {
    console.log('❌ postinstall script missing in package.json');
    issues.push('Missing postinstall script for Prisma generation');
  }
}

// Check for public directory
console.log('\n🌐 Checking public assets...');
checkFile('app/public', 'public directory exists');

// Summary
console.log('\n📊 DEPLOYMENT READINESS SUMMARY');
console.log('================================');
console.log(`✅ Passing checks: ${checks - issues.length}`);
console.log(`❌ Critical issues: ${issues.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);

if (issues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES TO FIX:');
  issues.forEach(issue => console.log(`   • ${issue}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(`   • ${warning}`));
}

if (issues.length === 0) {
  console.log('\n🎉 All critical checks passed! Ready for deployment.');
} else {
  console.log('\n🔧 Please fix the critical issues before deploying.');
  process.exit(1);
}
