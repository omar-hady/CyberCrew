---
title: Web Application Testing Starter Pack
description: Curated entry points for learning common web vulnerabilities and building a safe lab practice routine.
track: penetration-testing
difficulty: beginner
type: external
tags:
  - web
  - owasp
  - labs
featured: true
published: true
pubDate: 2026-10-05
order: 20
url: https://owasp.org/www-project-juice-shop/
---

Start with intentionally vulnerable applications in isolated environments. Do not test systems you do not own or lack written permission to assess.

## Recommended first lab

[OWASP Juice Shop](https://owasp.org/www-project-juice-shop/) is a modern, intentionally vulnerable app suitable for guided practice. Run it locally or in a disposable lab network.

## Practice sequence

1. Map the application: roles, forms, APIs, and interesting parameters.
2. Work through common classes: injection, broken access control, XSS, misconfiguration.
3. Keep a finding log with request/response evidence (redact secrets).
4. Retest after you think you fixed something in a training fork — confirm the fix.

## Pair with methodology

Use the Penetration Testing Methodology Notes resource for scoping and reporting habits even in personal labs. Good notes transfer directly to real engagements later.
