# Plan: Restructure Data Architecture - Modular File-Based System

## Context

**Current State:**
- All 50 chapters (~1.4 MB) stored in single `chapters.json` file with full markdown content embedded
- App loads entire JSON at startup using `ebookService` singleton
- Content is monolithic - difficult to maintain, edit, and scale

**Goal:**
Reorganize data into modular file structure where each chapter has its own JSON file, making the data:
- Easier to maintain (edit individual chapters without touching others)
- More scalable (lazy-load content on demand)
- Better organized (folder hierarchy matches learning progression)
- Reusable (API can serve individual chapter data)

**Key Decisions from User Input:**
1. **Loading Strategy**: Dynamic API load (app requests chapters on-demand from files)
2. **Section Extraction**: Auto-extract from markdown headings (## becomes section)
3. **Tier Metadata**: Yes, each tier has `tier.json` with metadata

---

## Proposed Architecture

### Directory Structure

```
src/data/
├── chapters.json (navigation/index only - maps tiers & chapters to file locations)
├── sources/
│   ├── tier-1/
│   │   ├── tier.json (metadata: title, description, estimatedTime, difficulty)
│   │   ├── chap-1/
│   │   │   └── chap-1.json (content + sections)
│   │   ├── chap-2/
│   │   │   └── chap-2.json
│   │   └── ... (chap 3-9)
│   ├── tier-2/
│   │   ├── tier.json
│   │   ├── chap-10/
│   │   ├── chap-11/
│   │   └── ... (chap 10-14)
│   └── ... (tier-3 through tier-10)
```

### File Schemas

**1. `src/data/chapters.json` (Navigation Index)**
```json
{
  "tiers": [
    {
      "id": "tier-1",
      "number": 1,
      "name": "Tầng 1: Java Fundamentals",
      "slug": "tier-1-java-fundamentals",
      "metadataFile": "sources/tier-1/tier.json",
      "chapters": [
        {
          "id": "chap-1",
          "number": 1,
          "title": "OOP Cơ Bản - DEEP DIVE",
          "slug": "oop-co-ban",
          "dataFile": "sources/tier-1/chap-1/chap-1.json"
        },
        ...
      ]
    },
    ... (tier-2 through tier-10)
  ]
}
```

**2. `sources/tier-X/tier.json` (Tier Metadata)**
```json
{
  "id": "tier-1",
  "number": 1,
  "name": "Tầng 1: Java Fundamentals",
  "description": "Nền tảng Java core cần vững trước khi học Spring Boot",
  "estimatedTime": "1-2 tuần",
  "difficulty": "beginner",
  "prerequisites": [],
  "chapters": 9
}
```

**3. `sources/tier-X/chap-N/chap-N.json` (Individual Chapter)**
```json
{
  "id": "chap-1",
  "number": 1,
  "title": "OOP Cơ Bản - DEEP DIVE",
  "tier": 1,
  "slug": "oop-co-ban",
  "keywords": ["OOP", "Class", "Interface", "Polymorphism"],
  "content": "# Chương 1 — OOP Cơ Bản...\n\n## Phần 0 — Tại sao lại cần OOP?...",
  "sections": [
    {
      "id": "phan-0",
      "title": "Phần 0 — Tại sao lại cần OOP?",
      "slug": "phan-0--tai-sao-lai-can-oop",
      "level": 2
    },
    {
      "id": "dieu-1",
      "title": "Điều 1: Tổ chức code",
      "slug": "dieu-1--to-chuc-code",
      "level": 3
    }
  ]
}
```

---

## Implementation Steps

### Phase 1: Generate Modular Data Files (No App Changes)

**1.1 Create data migration script** (`scripts/migrate-chapters-to-modular.js`)
- Read current `chapters.json`
- For each chapter:
  - Extract content into `sources/tier-X/chap-N/chap-N.json`
  - Auto-parse markdown to extract sections (## and ### headings)
  - Maintain all metadata (id, number, title, tier, slug, keywords)
- Generate `sources/tier-X/tier.json` for each tier
- Generate new minimal `chapters.json` as navigation index

**1.2 Output Structure**
```
src/data/
├── chapters.json (500 bytes - just the index)
└── sources/ (distributed ~1.4 MB across ~50 files)
```

### Phase 2: Update App to Load Data Dynamically

**2.1 Modify `ebookService.ts`**
- Add async methods (change from synchronous to promise-based):
  - `async getChapterById(id)` - load from `sources/tier-X/chap-N/chap-N.json`
  - `async getTierMetadata(tierNum)` - load from `sources/tier-X/tier.json`
- Keep navigation methods synchronous (use index):
  - `getAllTiers()` - from chapters.json index
  - `getTableOfContents()` - from chapters.json index
  - `getNextChapter()`, `getPreviousChapter()` - navigation index lookup

**2.2 Update Components to Handle Async Loading**
- `ContentViewer.tsx`: Add loading state while fetching chapter
- `Sidebar/TableOfContents.tsx`: Load tier metadata when expanding tier
- `App.tsx`: Update state management to handle async data

**2.3 Error Handling**
- Add fallback if chapter file not found (404)
- Display loading spinner during fetch
- Cache loaded chapters in memory (LRU cache to prevent re-fetching)

### Phase 3: Implement File-Based Data Loading

**3.1 Create data loader utility** (`src/utils/dataLoader.ts`)
```typescript
class DataLoader {
  private cache: Map<string, Chapter> = new Map()
  
  async loadChapter(tierId: number, chapId: string): Promise<Chapter>
  async loadTierMetadata(tierId: number): Promise<TierMetadata>
  clearCache(): void
}
```

**3.2 Static File Serving**
- Files are served from `public/data/sources/` or `src/data/sources/`
- Vite will bundle them as static assets
- During development: serve via `public/` folder
- Production: include in bundle

### Phase 4: Update Data Flow

**Current Flow:**
```
chapters.json (1.4 MB) → ebookService → store → components
```

**New Flow:**
```
chapters.json (index) → ebookService → dataLoader → fetch individual files → store → components
```

---

## Critical Files to Modify

| File | Changes | Impact |
|------|---------|--------|
| `scripts/migrate-chapters-to-modular.js` | **NEW** - Migration script | One-time data transformation |
| `src/data/chapters.json` | Reduce from 1.4 MB → ~500 bytes (index only) | Major size reduction |
| `src/data/sources/` | **NEW** - Distribute content across 60+ files | Better maintainability |
| `src/services/ebookService.ts` | Add async methods, update loading logic | Data access layer |
| `src/utils/dataLoader.ts` | **NEW** - File-based data loading utility | Core loading logic |
| `src/App.tsx` | Update useState/useEffect for async loading | Handle loading states |
| `src/components/ContentViewer.tsx` | Add loading spinner, error handling | UX for async content |
| `src/store/useEbookStore.ts` | Update for lazy-loaded chapters | State management |
| `vite.config.ts` | Possibly configure asset handling | Build configuration |

---

## Reusable Patterns Found

1. **EbookService Singleton Pattern** (`src/services/ebookService.ts`)
   - Use same pattern for DataLoader
   - Keep navigation methods synchronous (index-based)
   - Make content loading async

2. **Markdown Parsing** (`src/utils/markdown.ts`)
   - Already extracts sections from headings automatically
   - Reuse markdown-it configuration
   - Sections are already properly structured

3. **Type Definitions** (`src/types/index.ts`)
   - `Chapter` interface already supports async loading
   - Add `TierMetadata` interface for tier.json

---

## Benefits of This Approach

| Aspect | Current | New |
|--------|---------|-----|
| **Initial Load** | 1.4 MB all at once | ~500 B (index) + chapters on-demand |
| **Time to Interactive** | Slower (load all data first) | Faster (load index, then chapters) |
| **Edit Friction** | High (edit 1.4 MB file) | Low (edit individual chapter) |
| **Scalability** | Difficult (single monolithic file) | Easy (add new chapter = new file) |
| **API-Readiness** | Not suitable for API | Perfect (serve per-chapter) |
| **Maintainability** | Hard (50 chapters in 1 file) | Easy (50 separate files) |

---

## Verification & Testing

### Test Plan

1. **Data Integrity**
   - [ ] Run migration script, verify no data loss
   - [ ] Compare section counts: old chapters.json vs new files
   - [ ] Verify all keywords preserved
   
2. **App Functionality**
   - [ ] Navigation (prev/next chapter) works
   - [ ] Search still finds content
   - [ ] Table of contents renders sections correctly
   - [ ] Lazy loading works (check DevTools Network tab)
   
3. **Performance**
   - [ ] Initial load time faster
   - [ ] Chapter switching smooth (with cache)
   - [ ] No duplicate fetches (cache working)
   
4. **Edge Cases**
   - [ ] Missing chapter file → graceful error message
   - [ ] Network failure during load → retry or fallback
   - [ ] Rapid navigation → avoid race conditions (abort previous requests)

### How to Verify

```bash
# 1. Run migration (preview)
node scripts/migrate-chapters-to-modular.js --dry-run

# 2. Check file structure
ls -R src/data/sources/

# 3. Run app in dev
npm run dev
# Check DevTools Network tab: should see individual chapter requests

# 4. Test each tier loads correctly
# Click through different tiers, verify sections appear

# 5. Test search
# Search for keyword from Tier 5 (should load that file dynamically)

# 6. Compare file sizes
du -sh src/data/chapters.json src/data/sources/
```

---

## Potential Issues & Mitigations

| Issue | Mitigation |
|-------|-----------|
| Vite doesn't bundle individual JSON files | Use `?raw` import or fetch from public folder |
| Race conditions during rapid navigation | Use AbortController to cancel previous requests |
| Cold start slower if no caching | Implement LRU cache in DataLoader |
| Migration script loses formatting | Test on 1-2 chapters first, verify markdown integrity |
| Tier.json metadata conflicts | Define clear schema, validate before generation |

---

## Additional Recommendations

1. **Add Tier Metadata Display**
   - Show estimated time, difficulty badge in sidebar
   - Help users understand time commitment per tier

2. **Implement Chapter Caching**
   - Keep last 5-10 chapters in memory
   - Preload next chapter on demand

3. **Consider Lazy Sections**
   - Extract and store section headings in chapters.json index
   - Load full content only when chapter is opened

4. **Add Data Validation**
   - Schema validation for tier.json and chap-N.json
   - Fail early if files are malformed

5. **Documentation**
   - Add README in `src/data/sources/` explaining structure
   - Document how to add new chapters

---

## Summary

Plan is **highly feasible**. The proposed modular structure:
- ✅ Aligns with app architecture (already uses singleton service pattern)
- ✅ Auto-extract sections from markdown (already implemented)
- ✅ Improves maintainability & scalability
- ✅ Maintains backward compatibility with existing logic
- ✅ Enables API-driven future extensions

**Recommended execution:** Build migration script first, test with Tier 1, then expand to all tiers.
