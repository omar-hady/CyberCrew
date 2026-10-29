---
title: Alert Triage Cheatsheet
description: A compact reminder sheet for hypothesis-driven alert triage and documentation habits in a SOC context.
track: soc-blue-team
difficulty: beginner
type: cheatsheet
tags:
  - triage
  - soc
  - process
featured: true
published: true
pubDate: 2026-10-08
order: 15
---

Use this as a pocket process during lab alerts or shared SIEM walkthroughs. Adapt fields to your team's ticket system.

## Before you open the case

1. Confirm the alert is in scope for your queue (environment, severity, ownership).
2. Note the detection name, source product, and first/last seen timestamps.
3. Capture the initial artifacts: host, user, IP, process, URL, hash — without modifying evidence.

## Triage questions

- **What fired?** Detection logic and which telemetry backed it.
- **Why now?** New activity, volume spike, or a known noisy pattern.
- **Who/what is involved?** Asset criticality, user role, network zone.
- **Is it expected?** Change ticket, admin tooling, vulnerability scan, or business process.
- **What is the blast radius?** Lateral movement indicators, sibling hosts, shared credentials.

## Severity mindset

| Signal | Lean toward |
| --- | --- |
| Privileged account + unusual auth path | Higher |
| Commodity adware on a lab VM | Lower (still document) |
| Confirmed malware + C2 beaconing | Escalate immediately |
| Single failed login, known user, no other signals | Monitor / close with rationale |

## Close or escalate with evidence

Document: hypothesis, actions taken, artifacts reviewed, conclusion, and next steps. Prefer reproducible queries or screenshots over vague summaries. If escalating, include what you already ruled out so the next analyst does not redo your work.
