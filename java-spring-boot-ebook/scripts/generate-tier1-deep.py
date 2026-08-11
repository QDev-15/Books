#!/usr/bin/env python3
"""
Generate chapters.json for Tier 1 with deep-dive Chapter 1
"""
import json
import re
from pathlib import Path

# Read chapter1-deep-dive.md
chapter1_file = Path("src/data/chapter1-deep-dive.md")
chapter1_content = chapter1_file.read_text(encoding='utf-8')

# Chapter 1 sections
chapter1_sections = [
    "Class và Object - Nền Tảng OOP",
    "Khái Niệm Cơ Bản",
    "Constructor - Khởi Tạo Object",
    "Instance Variables - Memory & Initialization",
    "Encapsulation - Ẩn Giấu & Bảo Vệ",
    "Access Modifiers - 4 Levels",
    "Getter & Setter Best Practices",
    "Kế Thừa (Inheritance) - Code Reuse & Hierarchy",
    "Polymorphism - Tính Đa Hình",
    "Abstraction - Ẩn Giấu Phức Tạp",
    "Advanced Topics",
    "Memory & Performance",
    "Comprehensive Exercises"
]

# Build Chapter 1
chapter1 = {
    "id": "chap-1",
    "number": 1,
    "title": "OOP Cơ Bản - DEEP DIVE",
    "tier": 1,
    "slug": "oop-co-ban",
    "content": chapter1_content[:2000] + "...\n\n[Full content available in app]",
    "fullContent": chapter1_content,
    "sections": [
        {
            "id": f"sec-1-{i+1}",
            "title": section,
            "slug": section.lower().replace(" ", "-").replace("(", "").replace(")", "").replace("&", "and").replace("đ", "d")
        }
        for i, section in enumerate(chapter1_sections)
    ],
    "keywords": [
        "Java",
        "OOP",
        "Class",
        "Object",
        "Encapsulation",
        "Inheritance",
        "Polymorphism",
        "Abstraction",
        "Abstract Class",
        "Interface"
    ]
}

# Placeholder for Chapters 2-9
chapters_2_to_9 = [
    {
        "id": "chap-2",
        "number": 2,
        "title": "Collections Framework",
        "tier": 1,
        "slug": "collections-framework",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder - will be replaced with detailed content]",
        "sections": [
            {"id": "sec-2-1", "title": "Array vs Collections", "slug": "array-vs-collections"},
            {"id": "sec-2-2", "title": "List Interface", "slug": "list-interface"},
            {"id": "sec-2-3", "title": "Set Interface", "slug": "set-interface"},
            {"id": "sec-2-4", "title": "Map Interface", "slug": "map-interface"},
            {"id": "sec-2-5", "title": "Queue Interface", "slug": "queue-interface"},
            {"id": "sec-2-6", "title": "Collections Utility", "slug": "collections-utility"}
        ],
        "keywords": ["Collections", "List", "Set", "Map", "Queue"]
    },
    {
        "id": "chap-3",
        "number": 3,
        "title": "Generics & Lambda",
        "tier": 1,
        "slug": "generics-lambda",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-3-1", "title": "Generics", "slug": "generics"},
            {"id": "sec-3-2", "title": "Lambda Expressions", "slug": "lambda-expressions"},
            {"id": "sec-3-3", "title": "Functional Programming", "slug": "functional-programming"}
        ],
        "keywords": ["Generics", "Lambda", "Functional", "Type Safety"]
    },
    {
        "id": "chap-4",
        "number": 4,
        "title": "Streams API",
        "tier": 1,
        "slug": "streams-api",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-4-1", "title": "Stream Fundamentals", "slug": "stream-fundamentals"}
        ],
        "keywords": ["Streams", "Functional", "API", "Pipeline"]
    },
    {
        "id": "chap-5",
        "number": 5,
        "title": "Exception Handling",
        "tier": 1,
        "slug": "exception-handling",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-5-1", "title": "Try-Catch-Finally", "slug": "try-catch-finally"}
        ],
        "keywords": ["Exception", "Error", "Handling", "Validation"]
    },
    {
        "id": "chap-6",
        "number": 6,
        "title": "File I/O & Serialization",
        "tier": 1,
        "slug": "file-io-serialization",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-6-1", "title": "File Operations", "slug": "file-operations"},
            {"id": "sec-6-2", "title": "Serialization", "slug": "serialization"}
        ],
        "keywords": ["File I/O", "Serialization", "Streams", "Data"]
    },
    {
        "id": "chap-7",
        "number": 7,
        "title": "Concurrency & Multithreading",
        "tier": 1,
        "slug": "concurrency-multithreading",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-7-1", "title": "Threads Basics", "slug": "threads-basics"},
            {"id": "sec-7-2", "title": "Synchronization", "slug": "synchronization"},
            {"id": "sec-7-3", "title": "ExecutorService", "slug": "executor-service"}
        ],
        "keywords": ["Threading", "Concurrency", "Synchronization", "Parallel"]
    },
    {
        "id": "chap-8",
        "number": 8,
        "title": "Maven",
        "tier": 1,
        "slug": "maven",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-8-1", "title": "Maven Basics", "slug": "maven-basics"}
        ],
        "keywords": ["Maven", "Build", "Dependencies", "Tools"]
    },
    {
        "id": "chap-9",
        "number": 9,
        "title": "Java 8+ Features",
        "tier": 1,
        "slug": "java-8-features",
        "content": "[To be written with deep-dive content like Chapter 1]",
        "fullContent": "[Placeholder]",
        "sections": [
            {"id": "sec-9-1", "title": "New in Java 8", "slug": "new-in-java-8"},
            {"id": "sec-9-2", "title": "New in Java 9+", "slug": "new-in-java-9"}
        ],
        "keywords": ["Java 8+", "Features", "Modern", "API"]
    }
]

# Combine all chapters
all_chapters = [chapter1] + chapters_2_to_9

# Build table of contents
table_of_contents = [
    {
        "tier": 1,
        "title": "Tầng 1: Java Fundamentals - Deep Dive",
        "chapters": [ch["id"] for ch in all_chapters]
    }
]

# Create final JSON
ebook_data = {
    "chapters": all_chapters,
    "tableOfContents": table_of_contents,
    "metadata": {
        "totalChapters": len(all_chapters),
        "totalTiers": 1,
        "title": "Lộ Trình Java Spring Boot",
        "subtitle": "Cơ Bản Đến Nâng Cao - Deep Dive Edition",
        "version": "1.1.0",
        "note": "Chapter 1 completed with deep-dive content. Chapters 2-9 to be completed with same level of detail."
    }
}

# Write to chapters.json
output_file = Path("src/data/chapters.json")
output_file.write_text(json.dumps(ebook_data, indent=2, ensure_ascii=False), encoding='utf-8')

print(f"✅ Generated chapters.json")
print(f"📁 Output: {output_file}")
print(f"📊 Chapters: {len(all_chapters)}, Tiers: 1")
print(f"📖 Chapter 1: {len(chapter1['fullContent'])} characters (~{len(chapter1['fullContent'])//5} words)")
print(f"🚀 Ready to serve in app!")
