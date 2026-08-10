#!/usr/bin/env python3
"""
Generate chapters.json for Tier 1 from markdown content
"""
import json
import re
from pathlib import Path

# Read tier1-full-content.md
md_file = Path("src/data/tier1-full-content.md")
content = md_file.read_text(encoding='utf-8')

# Define Tier 1 chapters
chapters_data = {
    1: {
        "title": "OOP Cơ Bản",
        "sections": [
            "Class và Object",
            "Encapsulation (Đóng Gói)",
            "Kế Thừa (Inheritance)",
            "Polymorphism (Tính Đa Hình)",
            "Abstraction"
        ]
    },
    2: {
        "title": "Collections Framework",
        "sections": [
            "Array vs Collections",
            "List Interface",
            "Set Interface",
            "Map Interface",
            "Queue Interface",
            "Collections Utility Class"
        ]
    },
    3: {
        "title": "Generics & Lambda",
        "sections": [
            "Generics",
            "Lambda Expressions",
            "Functional Programming Patterns"
        ]
    },
    4: {
        "title": "Streams API",
        "sections": [
            "Stream Fundamentals"
        ]
    },
    5: {
        "title": "Exception Handling",
        "sections": [
            "Try-Catch-Finally"
        ]
    },
    6: {
        "title": "File I/O & Serialization",
        "sections": [
            "File Operations",
            "Serialization"
        ]
    },
    7: {
        "title": "Concurrency & Multithreading",
        "sections": [
            "Threads Basics",
            "Synchronization",
            "ExecutorService & Thread Pools"
        ]
    },
    8: {
        "title": "Maven",
        "sections": [
            "Maven Basics"
        ]
    },
    9: {
        "title": "Java 8+ Features",
        "sections": [
            "New in Java 8",
            "New in Java 9+"
        ]
    }
}

# Extract content for each chapter from markdown
def extract_chapter_content(md_content, chapter_num, chapter_info):
    # Find "## Chương X: ..." section
    pattern = rf"## Chương {chapter_num}:.*?(?=## Chương \d+:|## Summary|$)"
    match = re.search(pattern, md_content, re.DOTALL)

    if match:
        chapter_text = match.group(0)
        return chapter_text.strip()
    return f"Chapter {chapter_num}: {chapter_info['title']}"

# Build chapters array
chapters = []
chapter_id = 1

for tier_chapter_num in range(1, 10):  # 1-9
    chapter_info = chapters_data[tier_chapter_num]

    chapter_content = extract_chapter_content(content, tier_chapter_num, chapter_info)

    chapter = {
        "id": f"chap-{chapter_id}",
        "number": chapter_id,
        "title": chapter_info["title"],
        "tier": 1,
        "slug": chapter_info["title"].lower().replace(" ", "-").replace("&", "and").replace("(", "").replace(")", "").replace("đ", "d").replace("ơ", "o").replace("ư", "u"),
        "content": chapter_content[:1000] + "...",  # Preview first 1000 chars
        "fullContent": chapter_content,
        "sections": [
            {
                "id": f"sec-{chapter_id}-{i+1}",
                "title": section,
                "slug": section.lower().replace(" ", "-").replace("(", "").replace(")", "")
            }
            for i, section in enumerate(chapter_info["sections"])
        ],
        "keywords": [
            "Java",
            chapter_info["title"],
            *chapter_info["sections"][:3]
        ]
    }

    chapters.append(chapter)
    chapter_id += 1

# Build table of contents
table_of_contents = [
    {
        "tier": 1,
        "title": "Tầng 1: Java Fundamentals",
        "chapters": [ch["id"] for ch in chapters]
    }
]

# Create final JSON structure
ebook_data = {
    "chapters": chapters,
    "tableOfContents": table_of_contents,
    "metadata": {
        "totalChapters": len(chapters),
        "totalTiers": 1,
        "title": "Lộ Trình Java Spring Boot",
        "subtitle": "Cơ Bản Đến Nâng Cao"
    }
}

# Write to chapters.json
output_file = Path("src/data/chapters.json")
output_file.write_text(json.dumps(ebook_data, indent=2, ensure_ascii=False), encoding='utf-8')

print(f"✅ Generated chapters.json with {len(chapters)} chapters")
print(f"📁 Output: {output_file}")
print(f"📊 Chapters: {len(chapters)}, Tiers: 1")
