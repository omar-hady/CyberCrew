---
title: Linux CLI for Security Learners — Session Notes
description: Session outline covering navigation, permissions, processes, and networking basics for security work.
track: general
difficulty: beginner
type: session
tags:
  - linux
  - foundations
  - workshop
featured: false
published: true
pubDate: 2026-09-28
order: 40
---

Foundations session for learners who need a reliable CLI baseline before pentest, SOC, or malware labs.

## Session goals

- Navigate the filesystem without getting lost.
- Read permissions and ownership with intent.
- Inspect processes and open network sockets.
- Capture command output for notes and writeups.

## Suggested agenda (90 minutes)

1. **Shell orientation** — `pwd`, `ls -la`, `cd`, tab completion, history.
2. **Reading the system** — `cat` / `less`, `head` / `tail`, `grep`, pipes.
3. **Permissions** — `ls -l`, user/group/other bits, `chmod` / `chown` concepts (practice on disposable files only).
4. **Processes** — `ps`, `top` or `htop`, signals overview (`kill` carefully in labs).
5. **Networking glance** — `ip a`, `ss -tulpn` (or `netstat` where available), DNS lookup with `dig` or `getent`.
6. **Note-taking habit** — redirect useful output to a dated notes file; never paste secrets into public repos.

## Practice drills

- Find world-writable files under a lab home directory.
- Identify which process is listening on a given port in a container or VM.
- Explain what `rwxr-x---` means for a shared lab script.

## Safety

Work in isolated VMs or containers. Do not run destructive commands (`rm -rf`, disk wipes, firewall flushes) on shared or production hosts.
