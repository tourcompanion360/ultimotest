#!/usr/bin/env node

/**
 * Documentation Update Script
 * 
 * This script helps maintain and update the TourCompanion documentation.
 * It can:
 * - Read git log for recent changes
 * - Update CHANGELOG.md with new entries
 * - Validate documentation completeness
 * - Generate documentation reports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const CONFIG = {
  docsDir: './docs',
  changelogFile: './docs/CHANGELOG.md',
  rootReadme: './README.md',
  version: '1.0.0',
  author: 'Development Team'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getGitLog(days = 7) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];
    
    const log = execSync(`git log --since="${sinceStr}" --pretty=format:"%h|%an|%ad|%s" --date=short`, 
      { encoding: 'utf8' });
    
    return log.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, author, date, message] = line.split('|');
        return { hash, author, date, message };
      });
  } catch (error) {
    log('Error reading git log:', 'red');
    log(error.message, 'red');
    return [];
  }
}

function updateChangelog(commits) {
  if (commits.length === 0) {
    log('No recent commits found.', 'yellow');
    return;
  }

  const changelogPath = CONFIG.changelogFile;
  let changelogContent = '';

  try {
    changelogContent = fs.readFileSync(changelogPath, 'utf8');
  } catch (error) {
    log(`Error reading changelog: ${error.message}`, 'red');
    return;
  }

  // Parse existing changelog
  const lines = changelogContent.split('\n');
  const unreleasedIndex = lines.findIndex(line => line.startsWith('## [Unreleased]'));
  
  if (unreleasedIndex === -1) {
    log('Could not find [Unreleased] section in changelog.', 'red');
    return;
  }

  // Group commits by type
  const changes = {
    added: [],
    changed: [],
    fixed: [],
    removed: [],
    other: []
  };

  commits.forEach(commit => {
    const message = commit.message.toLowerCase();
    if (message.includes('add') || message.includes('create') || message.includes('implement')) {
      changes.added.push(commit);
    } else if (message.includes('change') || message.includes('update') || message.includes('modify')) {
      changes.changed.push(commit);
    } else if (message.includes('fix') || message.includes('resolve') || message.includes('correct')) {
      changes.fixed.push(commit);
    } else if (message.includes('remove') || message.includes('delete') || message.includes('deprecate')) {
      changes.removed.push(commit);
    } else {
      changes.other.push(commit);
    }
  });

  // Generate changelog entry
  const today = new Date().toISOString().split('T')[0];
  let newEntry = `\n### Added\n`;
  
  if (changes.added.length > 0) {
    changes.added.forEach(commit => {
      newEntry += `- ${commit.message} (${commit.hash})\n`;
    });
  } else {
    newEntry += `- No new features added\n`;
  }

  newEntry += `\n### Changed\n`;
  if (changes.changed.length > 0) {
    changes.changed.forEach(commit => {
      newEntry += `- ${commit.message} (${commit.hash})\n`;
    });
  } else {
    newEntry += `- No changes made\n`;
  }

  newEntry += `\n### Fixed\n`;
  if (changes.fixed.length > 0) {
    changes.fixed.forEach(commit => {
      newEntry += `- ${commit.message} (${commit.hash})\n`;
    });
  } else {
    newEntry += `- No fixes applied\n`;
  }

  if (changes.removed.length > 0) {
    newEntry += `\n### Removed\n`;
    changes.removed.forEach(commit => {
      newEntry += `- ${commit.message} (${commit.hash})\n`;
    });
  }

  if (changes.other.length > 0) {
    newEntry += `\n### Other\n`;
    changes.other.forEach(commit => {
      newEntry += `- ${commit.message} (${commit.hash})\n`;
    });
  }

  // Insert new entry after [Unreleased] header
  lines.splice(unreleasedIndex + 1, 0, newEntry);

  // Write updated changelog
  try {
    fs.writeFileSync(changelogPath, lines.join('\n'));
    log(`Updated changelog with ${commits.length} recent commits.`, 'green');
  } catch (error) {
    log(`Error writing changelog: ${error.message}`, 'red');
  }
}

function validateDocumentation() {
  log('Validating documentation completeness...', 'blue');
  
  const requiredFiles = [
    'README.md',
    'ARCHITECTURE.md',
    'DATABASE.md',
    'DEVELOPER_GUIDE.md',
    'COMPONENTS.md',
    'API.md',
    'DEPLOYMENT.md',
    'CHANGELOG.md',
    'TROUBLESHOOTING.md'
  ];

  const missingFiles = [];
  const existingFiles = [];

  requiredFiles.forEach(file => {
    const filePath = path.join(CONFIG.docsDir, file);
    if (fs.existsSync(filePath)) {
      existingFiles.push(file);
      log(`✓ ${file}`, 'green');
    } else {
      missingFiles.push(file);
      log(`✗ ${file}`, 'red');
    }
  });

  log(`\nDocumentation Status:`, 'bright');
  log(`✓ Existing files: ${existingFiles.length}`, 'green');
  log(`✗ Missing files: ${missingFiles.length}`, 'red');

  if (missingFiles.length > 0) {
    log('\nMissing files:', 'yellow');
    missingFiles.forEach(file => log(`  - ${file}`, 'yellow'));
  }

  return { existingFiles, missingFiles };
}

function generateDocumentationReport() {
  log('Generating documentation report...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: CONFIG.version,
    files: {},
    totalSize: 0,
    totalLines: 0
  };

  const docsDir = CONFIG.docsDir;
  const files = fs.readdirSync(docsDir);

  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(docsDir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;

      report.files[file] = {
        size: stats.size,
        lines: lines,
        lastModified: stats.mtime.toISOString()
      };

      report.totalSize += stats.size;
      report.totalLines += lines;
    }
  });

  log('\nDocumentation Report:', 'bright');
  log(`Total files: ${Object.keys(report.files).length}`, 'cyan');
  log(`Total size: ${(report.totalSize / 1024).toFixed(2)} KB`, 'cyan');
  log(`Total lines: ${report.totalLines}`, 'cyan');

  log('\nFile Details:', 'bright');
  Object.entries(report.files).forEach(([file, info]) => {
    log(`${file}: ${info.lines} lines, ${(info.size / 1024).toFixed(2)} KB`, 'blue');
  });

  return report;
}

function checkDocumentationLinks() {
  log('Checking documentation links...', 'blue');
  
  const docsDir = CONFIG.docsDir;
  const files = fs.readdirSync(docsDir);
  const brokenLinks = [];

  files.forEach(file => {
    if (file.endsWith('.md')) {
      const filePath = path.join(docsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Find markdown links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        // Check if it's a relative link to another markdown file
        if (linkUrl.endsWith('.md') && !linkUrl.startsWith('http')) {
          const targetPath = path.join(docsDir, linkUrl);
          if (!fs.existsSync(targetPath)) {
            brokenLinks.push({
              file,
              link: linkUrl,
              text: linkText
            });
          }
        }
      }
    }
  });

  if (brokenLinks.length > 0) {
    log('\nBroken links found:', 'red');
    brokenLinks.forEach(link => {
      log(`  ${link.file}: [${link.text}](${link.link})`, 'red');
    });
  } else {
    log('✓ All documentation links are valid.', 'green');
  }

  return brokenLinks;
}

function main() {
  log('TourCompanion Documentation Update Script', 'bright');
  log('==========================================', 'bright');
  
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'update-changelog':
      log('Updating changelog...', 'blue');
      const commits = getGitLog(7);
      updateChangelog(commits);
      break;

    case 'validate':
      validateDocumentation();
      break;

    case 'report':
      generateDocumentationReport();
      break;

    case 'check-links':
      checkDocumentationLinks();
      break;

    case 'all':
      log('Running all documentation checks...', 'blue');
      validateDocumentation();
      generateDocumentationReport();
      checkDocumentationLinks();
      const recentCommits = getGitLog(7);
      updateChangelog(recentCommits);
      break;

    case 'help':
    default:
      log('\nUsage: node update-docs.js <command>', 'bright');
      log('\nCommands:', 'bright');
      log('  update-changelog  - Update CHANGELOG.md with recent commits', 'cyan');
      log('  validate          - Validate documentation completeness', 'cyan');
      log('  report            - Generate documentation report', 'cyan');
      log('  check-links       - Check for broken documentation links', 'cyan');
      log('  all               - Run all documentation checks', 'cyan');
      log('  help              - Show this help message', 'cyan');
      break;
  }

  log('\nDocumentation update complete!', 'green');
}

// Run the script
main();

export {
  getGitLog,
  updateChangelog,
  validateDocumentation,
  generateDocumentationReport,
  checkDocumentationLinks
};
