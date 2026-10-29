---
title: Detection Engineering Basics
description: Concepts for writing useful detections — coverage intent, false positives, and validation loops.
track: soc-blue-team
difficulty: intermediate
type: documentation
tags:
  - detection
  - hunting
featured: false
published: true
pubDate: 2026-10-12
order: 30
url: https://attack.mitre.org/resources/get-started/detections-and-analytics/
---

External study reference: [MITRE ATT&CK — Detections and Analytics](https://attack.mitre.org/resources/get-started/detections-and-analytics/). Pair with open detection formats such as [Sigma](https://github.com/SigmaHQ/sigma) when practicing rule intent. Validate destinations before assigning them in workshops.

## Core ideas for learners

- **Intent before syntax** — state what adversary behavior you want to catch and why it matters.
- **Telemetry reality** — a detection is only as good as the logs you actually collect.
- **False positive budget** — noisy rules train analysts to ignore alerts.
- **Validation loop** — generate true-positive tests, tune, and re-test after environment changes.

## Mini exercise

Pick one technique from a public matrix (for example credential dumping concepts in a lab). Write:

1. The behavior in plain language.
2. The data source you would need.
3. A high-level detection idea (not necessarily production SIEM syntax).
4. How you would prove it fires and how you would measure noise.

Bring that writeup to a SOC track session for peer review.
