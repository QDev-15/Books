#!/usr/bin/env node

/**
 * Migration Script: Restructure chapters.json into modular file-based structure
 *
 * Current: Single chapters.json (1.4 MB) with all content embedded
 * Target: Distributed structure with individual chapter files
 *
 * Usage:
 *   node scripts/migrate-chapters-to-modular.mjs --dry-run  (preview only)
 *   node scripts/migrate-chapters-to-modular.mjs            (execute)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');
const dataDir = path.join(__dirname, '../src/data');
const sourcesDir = path.join(dataDir, 'sources');

console.log(`\n${'='.repeat(60)}`);
console.log('📦 CHAPTER DATA MIGRATION: Monolithic → Modular');
console.log(`${'='.repeat(60)}\n`);

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No files will be modified\n');
}

// Helper: Create directory recursively
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper: Extract sections from markdown content
function extractSections(content) {
  const sections = [];
  let sectionId = 0;

  // Match all headings (## and ###)
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // 2 for ##, 3 for ###
    const title = match[2].trim();

    // Create slug from title (remove special chars, lowercase, use hyphens)
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .trim();

    sections.push({
      id: `sec-${sectionId}`,
      title: title,
      slug: slug,
      level: level
    });

    sectionId++;
  }

  return sections;
}

// Helper: Group chapters by tier
function groupChaptersByTier(chapters) {
  const grouped = {};
  chapters.forEach(chapter => {
    if (!grouped[chapter.tier]) {
      grouped[chapter.tier] = [];
    }
    grouped[chapter.tier].push(chapter);
  });
  return grouped;
}

// Helper: Generate tier metadata
function generateTierMetadata(tierNum, chapters) {
  const tierTitles = {
    1: 'Tầng 1: Java Fundamentals',
    2: 'Tầng 2: Spring Boot Basics',
    3: 'Tầng 3: REST & Data Access',
    4: 'Tầng 4: Security & Authentication',
    5: 'Tầng 5: Performance & Caching',
    6: 'Tầng 6: Testing & Quality',
    7: 'Tầng 7: APIs & Integration',
    8: 'Tầng 8: Microservices',
    9: 'Tầng 9: DevOps & Infrastructure',
    10: 'Tầng 10: Advanced Patterns'
  };

  const tierDescriptions = {
    1: 'Nền tảng Java core cần vững trước khi học Spring Boot',
    2: 'Học cách sử dụng Spring Boot để xây dựng ứng dụng cơ bản',
    3: 'Xây dựng REST API với Spring MVC và truy cập dữ liệu',
    4: 'Implement xác thực và phân quyền trong ứng dụng',
    5: 'Tối ưu hiệu năng và caching với Redis',
    6: 'Viết test coverage đầy đủ cho ứng dụng',
    7: 'Tích hợp API với các dịch vụ bên ngoài',
    8: 'Thiết kế kiến trúc microservices với Spring Cloud',
    9: 'DevOps, containerization, deployment, monitoring',
    10: 'Các pattern nâng cao: Reactive, Clean Architecture, Event Sourcing'
  };

  const tierTime = {
    1: '1-2 tuần',
    2: '2-4 tuần',
    3: '1-2 tháng',
    4: '2-3 tháng',
    5: '1-2 tháng',
    6: '1-2 tháng',
    7: '2-3 tháng',
    8: '3-4 tháng',
    9: '2-3 tháng',
    10: '3-4 tháng'
  };

  return {
    id: `tier-${tierNum}`,
    number: tierNum,
    name: tierTitles[tierNum] || `Tầng ${tierNum}`,
    description: tierDescriptions[tierNum] || '',
    estimatedTime: tierTime[tierNum] || 'TBD',
    difficulty: tierNum <= 3 ? 'beginner' : tierNum <= 6 ? 'intermediate' : 'advanced',
    prerequisites: tierNum > 1 ? [`tier-${tierNum - 1}`] : [],
    chapters: chapters.length
  };
}

try {
  // 1. Read current chapters.json
  console.log('📖 Reading current chapters.json...');
  const chaptersPath = path.join(dataDir, 'chapters.json');
  const currentData = JSON.parse(fs.readFileSync(chaptersPath, 'utf-8'));
  const allChapters = currentData.chapters || currentData;

  if (!Array.isArray(allChapters)) {
    throw new Error('chapters.json must contain an array of chapters');
  }

  console.log(`   ✓ Found ${allChapters.length} chapters\n`);

  // 2. Group chapters by tier
  const chaptersByTier = groupChaptersByTier(allChapters);
  const tiers = Object.keys(chaptersByTier).map(Number).sort((a, b) => a - b);

  console.log(`📚 Grouped into ${tiers.length} tiers:`);
  tiers.forEach(tier => {
    console.log(`   Tier ${tier}: ${chaptersByTier[tier].length} chapters`);
  });
  console.log();

  if (isDryRun) {
    console.log('Preview of file structure to be created:');
    console.log(`src/data/`);
    console.log(`├── chapters.json (navigation index)`);
    console.log(`└── sources/`);
    tiers.forEach(tier => {
      console.log(`    ├── tier-${tier}/`);
      console.log(`    │   ├── tier.json`);
      chaptersByTier[tier].slice(0, 2).forEach(ch => {
        console.log(`    │   ├── ${ch.slug}/`);
        console.log(`    │   │   └── ${ch.slug}.json`);
      });
      if (chaptersByTier[tier].length > 2) {
        console.log(`    │   ├── ... (${chaptersByTier[tier].length - 2} more chapters)`);
      }
    });
    console.log('\n✅ Dry run complete. No files modified.\n');
    process.exit(0);
  }

  // 3. Create directory structure and files
  console.log('🏗️  Creating directory structure...\n');

  // Create navigation index
  const navigationIndex = {
    tiers: []
  };

  // Process each tier
  tiers.forEach(tier => {
    const tierDir = path.join(sourcesDir, `tier-${tier}`);
    ensureDir(tierDir);

    const tierChapters = chaptersByTier[tier];

    // Create tier.json
    const tierMetadata = generateTierMetadata(tier, tierChapters);
    const tierMetadataPath = path.join(tierDir, 'tier.json');
    fs.writeFileSync(tierMetadataPath, JSON.stringify(tierMetadata, null, 2));
    console.log(`   ✓ tier-${tier}/tier.json`);

    // Add to navigation index
    const tierIndexEntry = {
      id: `tier-${tier}`,
      number: tier,
      name: tierMetadata.name,
      slug: `tier-${tier}`,
      metadataFile: `sources/tier-${tier}/tier.json`,
      chapters: []
    };

    // Create individual chapter files
    tierChapters.forEach(chapter => {
      const chapDir = path.join(tierDir, chapter.slug);
      ensureDir(chapDir);

      // Extract sections from content
      const sections = extractSections(chapter.content);

      // Create chapter file
      const chapData = {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        tier: chapter.tier,
        slug: chapter.slug,
        keywords: chapter.keywords || [],
        sections: sections,
        content: chapter.content
      };

      const chapPath = path.join(chapDir, `${chapter.slug}.json`);
      fs.writeFileSync(chapPath, JSON.stringify(chapData, null, 2));
      console.log(`   ✓ tier-${tier}/${chapter.slug}/${chapter.slug}.json (sections: ${sections.length})`);

      // Thêm vào danh sách chương của tier (bao gồm sections trong navigation index)
      tierIndexEntry.chapters.push({
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        slug: chapter.slug,
        sections: sections,
        dataFile: `sources/tier-${tier}/${chapter.slug}/${chapter.slug}.json`
      });
    });

    navigationIndex.tiers.push(tierIndexEntry);
  });

  // 4. Write new navigation index chapters.json
  console.log('\n📝 Writing navigation index...');
  const newChaptersPath = path.join(dataDir, 'chapters.json');
  fs.writeFileSync(newChaptersPath, JSON.stringify(navigationIndex, null, 2));
  console.log(`   ✓ chapters.json (navigation index)\n`);

  // 5. Summary statistics
  console.log(`${'='.repeat(60)}`);
  console.log('✅ MIGRATION COMPLETE\n');

  const originalSize = fs.statSync(chaptersPath).size;
  const newSize = fs.statSync(newChaptersPath).size;
  const totalSourceSize = tiers.reduce((sum, tier) => {
    const tierPath = path.join(sourcesDir, `tier-${tier}`);
    return sum + getDirectorySize(tierPath);
  }, 0);

  console.log('📊 Statistics:');
  console.log(`   Original chapters.json: ${(originalSize / 1024).toFixed(2)} KB`);
  console.log(`   New navigation index: ${(newSize / 1024).toFixed(2)} KB`);
  console.log(`   Total sources/: ${(totalSourceSize / 1024).toFixed(2)} KB`);
  console.log(`   Initial load reduction: ${((1 - newSize / originalSize) * 100).toFixed(1)}%\n`);

  console.log('📂 Structure:');
  console.log(`   ${sourcesDir}`);
  console.log(`   Tiers: ${tiers.length}`);
  console.log(`   Chapters: ${allChapters.length}`);
  console.log(`   Total sections: ${allChapters.reduce((sum, ch) => sum + extractSections(ch.content).length, 0)}\n`);

  console.log(`${'='.repeat(60)}\n`);

} catch (error) {
  console.error('\n❌ Migration failed:');
  console.error(`   ${error.message}\n`);
  process.exit(1);
}

// Helper: Calculate directory size recursively
function getDirectorySize(dirPath) {
  let size = 0;
  if (!fs.existsSync(dirPath)) return 0;

  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  files.forEach(file => {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  });
  return size;
}
