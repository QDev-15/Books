#!/usr/bin/env python3
"""
Script to convert ebook-content-complete.md to chapters.json
"""

import json
import re
from pathlib import Path

# Chapter data structured
chapters_data = [
    # TIER 1: Java Fundamentals (Chapters 1-9)
    {"id": "chap-1", "number": 1, "title": "OOP Cơ Bản", "tier": 1, "keywords": ["OOP", "Class", "Object", "Inheritance"]},
    {"id": "chap-2", "number": 2, "title": "Collections", "tier": 1, "keywords": ["Collections", "List", "Map", "Set"]},
    {"id": "chap-3", "number": 3, "title": "Generics & Lambda", "tier": 1, "keywords": ["Generics", "Lambda", "Functional"]},
    {"id": "chap-4", "number": 4, "title": "Streams API", "tier": 1, "keywords": ["Streams", "map", "filter", "reduce"]},
    {"id": "chap-5", "number": 5, "title": "Exception Handling", "tier": 1, "keywords": ["Exception", "Try-Catch", "Custom"]},
    {"id": "chap-6", "number": 6, "title": "File I/O & Serialization", "tier": 1, "keywords": ["File", "I/O", "Serialization"]},
    {"id": "chap-7", "number": 7, "title": "Concurrency & Multithreading", "tier": 1, "keywords": ["Thread", "Concurrency", "Synchronization"]},
    {"id": "chap-8", "number": 8, "title": "Maven", "tier": 1, "keywords": ["Maven", "Build", "Dependencies"]},
    {"id": "chap-9", "number": 9, "title": "Java 8+ Features", "tier": 1, "keywords": ["Java8", "Module", "Records"]},

    # TIER 2: Spring Boot Basics (Chapters 10-19)
    {"id": "chap-10", "number": 10, "title": "Spring Boot Introduction", "tier": 2, "keywords": ["SpringBoot", "Auto-config", "Starter"]},
    {"id": "chap-11", "number": 11, "title": "IoC & Dependency Injection", "tier": 2, "keywords": ["IoC", "DI", "Container"]},
    {"id": "chap-12", "number": 12, "title": "Spring Beans & Scopes", "tier": 2, "keywords": ["Beans", "Scope", "Lifecycle"]},
    {"id": "chap-13", "number": 13, "title": "REST API Basics", "tier": 2, "keywords": ["REST", "HTTP", "API"]},
    {"id": "chap-14", "number": 14, "title": "Request/Response Handling", "tier": 2, "keywords": ["Request", "Response", "HTTP"]},
    {"id": "chap-15", "number": 15, "title": "DTO Pattern", "tier": 2, "keywords": ["DTO", "Records", "Mapping"]},
    {"id": "chap-16", "number": 16, "title": "Auto-configuration", "tier": 2, "keywords": ["Auto-config", "Conditional", "Custom"]},
    {"id": "chap-17", "number": 17, "title": "Application Properties", "tier": 2, "keywords": ["Properties", "Config", "YAML"]},
    {"id": "chap-18", "number": 18, "title": "Profiles & Environments", "tier": 2, "keywords": ["Profiles", "Dev", "Prod"]},
    {"id": "chap-19", "number": 19, "title": "Application Startup", "tier": 2, "keywords": ["Startup", "Events", "Context"]},

    # TIER 3: REST & Data Access (Chapters 20-29)
    {"id": "chap-20", "number": 20, "title": "Spring Data JPA Fundamentals", "tier": 3, "keywords": ["JPA", "ORM", "Entity"]},
    {"id": "chap-21", "number": 21, "title": "Repository Pattern", "tier": 3, "keywords": ["Repository", "CRUD", "Query"]},
    {"id": "chap-22", "number": 22, "title": "Relationships & Mapping", "tier": 3, "keywords": ["OneToMany", "ManyToMany", "Mapping"]},
    {"id": "chap-23", "number": 23, "title": "Query Methods & JPQL", "tier": 3, "keywords": ["JPQL", "Query", "Derived"]},
    {"id": "chap-24", "number": 24, "title": "Pagination & Sorting", "tier": 3, "keywords": ["Pagination", "Sort", "Page"]},
    {"id": "chap-25", "number": 25, "title": "Transactions & Isolation", "tier": 3, "keywords": ["Transaction", "ACID", "Isolation"]},
    {"id": "chap-26", "number": 26, "title": "Lazy Loading & Performance", "tier": 3, "keywords": ["LazyLoading", "Performance", "EntityGraph"]},
    {"id": "chap-27", "number": 27, "title": "N+1 Problem & Solutions", "tier": 3, "keywords": ["N+1", "Performance", "JOIN"]},
    {"id": "chap-28", "number": 28, "title": "Connection Pooling", "tier": 3, "keywords": ["HikariCP", "Pool", "Connection"]},
    {"id": "chap-29", "number": 29, "title": "Custom Queries & Native SQL", "tier": 3, "keywords": ["Native", "SQL", "Procedure"]},

    # TIER 4: Security & Authentication (Chapters 30-36)
    {"id": "chap-30", "number": 30, "title": "Spring Security Introduction", "tier": 4, "keywords": ["Security", "Auth", "Config"]},
    {"id": "chap-31", "number": 31, "title": "Authentication Methods", "tier": 4, "keywords": ["Authentication", "FormAuth", "BasicAuth"]},
    {"id": "chap-32", "number": 32, "title": "JWT & Token-based Auth", "tier": 4, "keywords": ["JWT", "Token", "Bearer"]},
    {"id": "chap-33", "number": 33, "title": "OAuth2 & OpenID Connect", "tier": 4, "keywords": ["OAuth2", "OpenID", "Social"]},
    {"id": "chap-34", "number": 34, "title": "Role-based Access Control", "tier": 4, "keywords": ["RBAC", "Roles", "Authority"]},
    {"id": "chap-35", "number": 35, "title": "Method-level Security", "tier": 4, "keywords": ["MethodSecurity", "Annotation", "SpEL"]},
    {"id": "chap-36", "number": 36, "title": "Multi-tenant Applications", "tier": 4, "keywords": ["MultiTenant", "Isolation", "Schema"]},

    # TIER 5: Performance & Caching (Chapters 37-42)
    {"id": "chap-37", "number": 37, "title": "Caching Strategies", "tier": 5, "keywords": ["Cache", "L1", "L2", "L3"]},
    {"id": "chap-38", "number": 38, "title": "Redis Advanced", "tier": 5, "keywords": ["Redis", "PubSub", "Cluster"]},
    {"id": "chap-39", "number": 39, "title": "Database Query Optimization", "tier": 5, "keywords": ["Optimization", "Index", "Tuning"]},
    {"id": "chap-40", "number": 40, "title": "JVM Tuning & GC", "tier": 5, "keywords": ["JVM", "GC", "Heap"]},
    {"id": "chap-41", "number": 41, "title": "Profiling & Benchmarking", "tier": 5, "keywords": ["Profile", "Benchmark", "JMH"]},
    {"id": "chap-42", "number": 42, "title": "Load Testing", "tier": 5, "keywords": ["LoadTest", "JMeter", "Gatling"]},

    # TIER 6: Testing & Quality (Chapters 43-47)
    {"id": "chap-43", "number": 43, "title": "Unit Testing with Mockito", "tier": 6, "keywords": ["UnitTest", "Mockito", "JUnit"]},
    {"id": "chap-44", "number": 44, "title": "Integration Testing", "tier": 6, "keywords": ["Integration", "SpringTest", "MockMvc"]},
    {"id": "chap-45", "number": 45, "title": "Contract Testing", "tier": 6, "keywords": ["ContractTest", "Pact", "Consumer"]},
    {"id": "chap-46", "number": 46, "title": "Chaos Engineering", "tier": 6, "keywords": ["Chaos", "Resilience", "Gremlin"]},
    {"id": "chap-47", "number": 47, "title": "Code Quality & Metrics", "tier": 6, "keywords": ["Quality", "SonarQube", "Metrics"]},

    # TIER 7: APIs & Integration (Chapters 48-53)
    {"id": "chap-48", "number": 48, "title": "gRPC Basics", "tier": 7, "keywords": ["gRPC", "Protobuf", "RPC"]},
    {"id": "chap-49", "number": 49, "title": "GraphQL Introduction", "tier": 7, "keywords": ["GraphQL", "Query", "Schema"]},
    {"id": "chap-50", "number": 50, "title": "WebSockets & Real-time", "tier": 7, "keywords": ["WebSocket", "RealTime", "STOMP"]},
    {"id": "chap-51", "number": 51, "title": "Server-Sent Events (SSE)", "tier": 7, "keywords": ["SSE", "Streaming", "RealTime"]},
    {"id": "chap-52", "number": 52, "title": "Data Pipeline & ETL", "tier": 7, "keywords": ["ETL", "Pipeline", "Batch"]},
    {"id": "chap-53", "number": 53, "title": "Elasticsearch Integration", "tier": 7, "keywords": ["Elasticsearch", "Search", "Index"]},

    # TIER 8: Microservices (Chapters 54-62)
    {"id": "chap-54", "number": 54, "title": "Microservices Architecture", "tier": 8, "keywords": ["Microservices", "Design", "Pattern"]},
    {"id": "chap-55", "number": 55, "title": "Service Communication", "tier": 8, "keywords": ["Communication", "REST", "Message"]},
    {"id": "chap-56", "number": 56, "title": "API Gateway Pattern", "tier": 8, "keywords": ["Gateway", "Routing", "Filter"]},
    {"id": "chap-57", "number": 57, "title": "Service Discovery & Registry", "tier": 8, "keywords": ["Discovery", "Eureka", "Consul"]},
    {"id": "chap-58", "number": 58, "title": "Circuit Breaker & Resilience", "tier": 8, "keywords": ["CircuitBreaker", "Resilience4j", "Fallback"]},
    {"id": "chap-59", "number": 59, "title": "Distributed Tracing", "tier": 8, "keywords": ["Tracing", "Sleuth", "Jaeger"]},
    {"id": "chap-60", "number": 60, "title": "Event Sourcing", "tier": 8, "keywords": ["EventSourcing", "Store", "Replay"]},
    {"id": "chap-61", "number": 61, "title": "CQRS Pattern", "tier": 8, "keywords": ["CQRS", "Separation", "Consistency"]},
    {"id": "chap-62", "number": 62, "title": "Saga Pattern", "tier": 8, "keywords": ["Saga", "Transaction", "Compensation"]},

    # TIER 9: DevOps & Infrastructure (Chapters 63-69)
    {"id": "chap-63", "number": 63, "title": "Docker Advanced", "tier": 9, "keywords": ["Docker", "MultiStage", "Compose"]},
    {"id": "chap-64", "number": 64, "title": "Kubernetes Advanced", "tier": 9, "keywords": ["Kubernetes", "Deployment", "StatefulSet"]},
    {"id": "chap-65", "number": 65, "title": "Infrastructure as Code", "tier": 9, "keywords": ["IaC", "Terraform", "Ansible"]},
    {"id": "chap-66", "number": 66, "title": "CI/CD Pipelines", "tier": 9, "keywords": ["CICD", "Pipeline", "Automation"]},
    {"id": "chap-67", "number": 67, "title": "Monitoring & Observability", "tier": 9, "keywords": ["Monitoring", "Prometheus", "Grafana"]},
    {"id": "chap-68", "number": 68, "title": "Log Aggregation (ELK)", "tier": 9, "keywords": ["Logging", "ELK", "Kibana"]},
    {"id": "chap-69", "number": 69, "title": "Service Mesh (Istio)", "tier": 9, "keywords": ["ServiceMesh", "Istio", "Traffic"]},

    # TIER 10: Advanced Patterns (Chapters 70-81)
    {"id": "chap-70", "number": 70, "title": "Design Patterns in Spring", "tier": 10, "keywords": ["Patterns", "Design", "Spring"]},
    {"id": "chap-71", "number": 71, "title": "SOLID Principles", "tier": 10, "keywords": ["SOLID", "SRP", "OCP"]},
    {"id": "chap-72", "number": 72, "title": "Domain-Driven Design (DDD)", "tier": 10, "keywords": ["DDD", "Domain", "Aggregate"]},
    {"id": "chap-73", "number": 73, "title": "Clean Architecture", "tier": 10, "keywords": ["CleanArch", "Layers", "Dependency"]},
    {"id": "chap-74", "number": 74, "title": "Hexagonal Architecture", "tier": 10, "keywords": ["Hexagonal", "Ports", "Adapters"]},
    {"id": "chap-75", "number": 75, "title": "Event-Driven Patterns", "tier": 10, "keywords": ["EventDriven", "Async", "Pattern"]},
    {"id": "chap-76", "number": 76, "title": "CQRS & Event Sourcing Advanced", "tier": 10, "keywords": ["CQRS", "EventSourcing", "Advanced"]},
    {"id": "chap-77", "number": 77, "title": "Testing Strategies", "tier": 10, "keywords": ["Testing", "Strategy", "Coverage"]},
    {"id": "chap-78", "number": 78, "title": "Database Migration Advanced", "tier": 10, "keywords": ["Migration", "Flyway", "Schema"]},
    {"id": "chap-79", "number": 79, "title": "API Design & REST Standards", "tier": 10, "keywords": ["API", "REST", "Standards"]},
    {"id": "chap-80", "number": 80, "title": "Batch Processing (Spring Batch)", "tier": 10, "keywords": ["Batch", "SpringBatch", "Job"]},
    {"id": "chap-81", "number": 81, "title": "Async Processing & Schedulers", "tier": 10, "keywords": ["Async", "Scheduler", "Task"]},
]

# Build chapters with content
chapters = []
for data in chapters_data:
    chapter = {
        "id": data["id"],
        "number": data["number"],
        "title": data["title"],
        "tier": data["tier"],
        "slug": data["title"].lower().replace(" ", "-").replace("&", "").replace("(", "").replace(")", ""),
        "content": f"# {data['title']}\n\nThis chapter covers: {', '.join(data['keywords'])}\n\nDetailed content and examples coming soon.",
        "sections": [
            {
                "id": f"sec-{data['number']}-1",
                "title": "Introduction",
                "slug": "introduction",
                "level": 2
            }
        ],
        "keywords": data["keywords"]
    }
    chapters.append(chapter)

# Build tableOfContents
toc = []
for tier in range(1, 11):
    tier_chapters = [ch for ch in chapters if ch["tier"] == tier]
    tier_titles = {
        1: "Tầng 1: Java Fundamentals",
        2: "Tầng 2: Spring Boot Basics",
        3: "Tầng 3: REST & Data Access",
        4: "Tầng 4: Security & Authentication",
        5: "Tầng 5: Performance & Caching",
        6: "Tầng 6: Testing & Quality",
        7: "Tầng 7: APIs & Integration",
        8: "Tầng 8: Microservices",
        9: "Tầng 9: DevOps & Infrastructure",
        10: "Tầng 10: Advanced Patterns"
    }
    toc.append({
        "tier": tier,
        "tierTitle": tier_titles[tier],
        "chapters": tier_chapters
    })

# Build final data structure
final_data = {
    "chapters": chapters,
    "tableOfContents": toc,
    "lastUpdated": "2024-08-10",
    "totalChapters": len(chapters),
    "totalTiers": 10
}

# Write to JSON file
output_path = Path(__file__).parent.parent / "src" / "data" / "chapters.json"
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"✅ Generated chapters.json with {len(chapters)} chapters across 10 tiers")
print(f"📁 Output: {output_path}")
