---
title: Static Analysis Primer
description: An introductory path through hashing, strings, headers, and first-pass classification before dynamic work.
track: malware-analysis
difficulty: intermediate
type: documentation
tags:
  - static-analysis
  - triage
featured: false
published: true
pubDate: 2026-10-14
order: 25
---

Static analysis reduces risk before you run anything. Use it to form a hypothesis, then decide whether dynamic analysis is justified in an isolated lab.

## First-pass workflow

1. **Hash** — SHA-256 (and MD5/SHA-1 only if a source still indexes them). Record hashes in notes before renaming files.
2. **File type** — `file`, magic bytes, and packing hints. Treat mismatches between extension and type as suspicious.
3. **Strings** — ASCII/Unicode strings for URLs, paths, registry keys, and commands. Prefer filtered views over dumping everything into chat.
4. **Headers & imports** — PE/ELF structure, sections, import tables. Note anomalous section names or high entropy.
5. **Classify** — family/behavior hypotheses only with evidence; mark confidence (low/medium/high).

## What static analysis is not

It does not prove runtime behavior. Packers, obfuscation, and delayed payloads can hide intent until dynamic analysis in a controlled environment.

## Lab hygiene reminder

Keep samples offline from production networks. Prefer snapshots and host-only networking. Never upload sensitive customer binaries to public sandboxes without authorization.
