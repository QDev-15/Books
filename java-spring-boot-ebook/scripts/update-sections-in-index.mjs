#!/usr/bin/env node

/**
 * Script để thêm sections vào navigation index (chapters.json)
 * Đọc từng chapter file và lấy sections, sau đó cập nhật chapters.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../src/data');
const chaptersPath = path.join(dataDir, 'chapters.json');
const sourcesDir = path.join(dataDir, 'sources');

console.log('\n' + '='.repeat(60));
console.log('📚 UPDATE SECTIONS IN NAVIGATION INDEX');
console.log('='.repeat(60) + '\n');

try {
  // Đọc navigation index hiện tại
  console.log('📖 Đọc chapters.json...');
  const navigationIndex = JSON.parse(fs.readFileSync(chaptersPath, 'utf-8'));

  let updatedCount = 0;

  // Xử lý từng tier
  navigationIndex.tiers.forEach(tier => {
    console.log(`\n🏗️  Xử lý Tier ${tier.number}...`);

    // Xử lý từng chapter trong tier
    tier.chapters.forEach(chapter => {
      try {
        // Đọc chapter file
        const chapFile = path.join(
          sourcesDir,
          `tier-${tier.number}`,
          chapter.slug,
          `${chapter.slug}.json`
        );

        if (fs.existsSync(chapFile)) {
          const chapData = JSON.parse(fs.readFileSync(chapFile, 'utf-8'));

          // Cập nhật sections nếu chương chưa có
          if (!chapter.sections || chapter.sections.length === 0) {
            chapter.sections = chapData.sections || [];
            console.log(`   ✓ ${chapter.title} (${chapter.sections.length} sections)`);
            updatedCount++;
          }
        } else {
          console.log(`   ⚠️  File không tìm thấy: ${chapFile}`);
        }
      } catch (error) {
        console.error(`   ❌ Lỗi: ${chapter.title} - ${error.message}`);
      }
    });
  });

  // Lưu lại chapters.json
  console.log('\n📝 Lưu chapters.json...');
  fs.writeFileSync(chaptersPath, JSON.stringify(navigationIndex, null, 2));
  console.log(`   ✓ Cập nhật ${updatedCount} chương với sections\n`);

  console.log('='.repeat(60));
  console.log('✅ HOÀN TẤT: Navigation index đã được cập nhật sections');
  console.log('='.repeat(60) + '\n');
} catch (error) {
  console.error('\n❌ Lỗi:', error.message);
  process.exit(1);
}
