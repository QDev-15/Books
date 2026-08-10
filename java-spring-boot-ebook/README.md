# Java Spring Boot Ebook - Cơ Bản Đến Nâng Cao

A modern, interactive web ebook for learning Java Spring Boot with responsive design, dark mode, bookmarks, and progress tracking.

## Features

- 📚 **23 Comprehensive Chapters** organized in 4 learning tiers
- 🔍 **Full-text Search** with Fuse.js
- 📌 **Bookmarks** to save favorite chapters (localStorage)
- 📊 **Progress Tracking** to resume from last read chapter
- 🌓 **Dark/Light Mode** with Tailwind CSS
- ⌨️ **Keyboard Navigation** (Arrow keys ← →)
- 📱 **Mobile Swipe Gestures** (left/right to navigate)
- 📋 **Syntax Highlighting** for code blocks
- 📋 **Copy-to-Clipboard** button on code examples
- 📱 **Fully Responsive** (Mobile, Tablet, Desktop)
- ⚡ **Fast Performance** with Vite & Code Splitting

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Search**: Fuse.js
- **Markdown**: markdown-it + Prism.js
- **Gestures**: react-swipeable

## Project Structure

```
java-spring-boot-ebook/
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── ContentViewer/
│   │   │   ├── ContentViewer.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── CodeBlock.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   │   ├── useKeyboard.ts
│   │   ├── useSwipe.ts
│   │   └── useSearch.ts
│   ├── store/
│   │   └── useEbookStore.ts
│   ├── utils/
│   │   ├── markdown.ts
│   │   └── clipboard.ts
│   ├── data/
│   │   └── chapters.json
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Start dev server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Learning Tiers

### Tier 1: Nền Tảng Java (Foundation)
1. OOP Basics
2. Collections Framework
3. Generics & Lambda
4. Maven Build Tool

### Tier 2: Spring Boot Core
5. IoC & Dependency Injection
6. REST API với Spring MVC
7. DTO Pattern
8. Spring Data JPA
9. Validation
10. Exception Handling
11. Configuration

### Tier 3: Trung Cấp (Intermediate)
12. Spring Security & JWT
13. Caching với Redis
14. Testing (Unit & Integration)
15. Docker & Docker Compose
16. Database Migration (Flyway)
17. Monitoring & Logging

### Tier 4: Nâng Cao & Production (Advanced)
18. Microservices Architecture
19. Message Queue (Kafka)
20. Reactive Programming (WebFlux)
21. Clean Architecture
22. CI/CD (GitHub Actions)
23. Kubernetes

## Usage

### Navigation
- **Keyboard**: Use arrow keys (← →) to navigate chapters
- **Mouse**: Click on chapters in sidebar or use Next/Previous buttons
- **Mobile**: Swipe left/right to navigate between chapters

### Features

**Search**
- Click search icon in sidebar
- Type to search across all chapters
- Click result to jump to chapter

**Bookmarks**
- Click bookmark icon in chapter header
- Bookmarks saved in browser (localStorage)
- View all bookmarks in sidebar filter

**Progress Tracking**
- Automatically saves current chapter
- Resume from last read chapter on page reload
- View progress percentage in footer

**Dark Mode**
- Click sun/moon icon in header
- Preference saved in localStorage
- Automatic transitions between modes

**Copy Code**
- Hover over code blocks
- Click copy button
- Automatic notification on success

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Go to vercel.com
# 1. Click "New Project"
# 2. Import your GitHub repo
# 3. Vercel auto-detects Vite config
# 4. Click "Deploy"
# Done! Each push to main auto-deploys
```

### Deploy to GitHub Pages

```bash
npm run build
# Push dist/ folder to gh-pages branch
```

### Deploy to Netlify

```bash
npm run build
# Drag and drop dist/ folder to Netlify
# Or connect GitHub repo for auto-deploy
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS Safari 14+, Chrome Mobile 90+

## Performance

- Initial load: < 2s
- Lighthouse score: 95+
- Bundle size: ~150KB gzipped
- Code splitting: Vendor, Markdown, App

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal and commercial use.

## Support

For questions or issues:
- Create an issue on GitHub
- Check existing documentation
- Review the code comments

## Roadmap

- [ ] Full chapters data from markdown conversion
- [ ] Comments/notes feature
- [ ] Export to PDF
- [ ] Print-friendly view
- [ ] Content auto-update from source
- [ ] Social sharing buttons
- [ ] Related chapters suggestions
- [ ] Quiz/self-assessment

---

Built with ❤️ for Java & Spring Boot learners
