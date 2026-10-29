---
title: Networking Foundations for Security Learners
description: Practical TCP/IP, ports, DNS, and packet literacy notes for pentest and SOC beginners working in labs.
track: general
difficulty: beginner
type: documentation
tags:
  - networking
  - foundations
  - tcp-ip
featured: false
published: true
pubDate: 2026-10-22
order: 35
url: https://www.rfc-editor.org/rfc/rfc791
---

Security work assumes you can reason about how packets move. Use this as a study scaffold alongside lab traffic — not as a substitute for RFCs or your course materials. A classic reference point is [RFC 791 (Internet Protocol)](https://www.rfc-editor.org/rfc/rfc791); pair it with modern lab observation tools.

## Mental model

1. **Hosts and interfaces** — addresses live on interfaces; routing decides the next hop.
2. **Layers as contracts** — Ethernet/Wi-Fi carry frames; IP routes packets; TCP/UDP deliver to ports; applications speak protocols.
3. **Names vs numbers** — DNS resolves names to addresses; always record both in notes.
4. **Stateful vs connectionless** — TCP handshakes and streams; UDP datagrams; ICMP for control/error messaging.

## Lab checklist

- Identify your lab host’s IPv4/IPv6 addresses and default route (`ip a`, `ip r` or OS equivalent).
- Map listening services and owning processes (`ss -tulpn`).
- Capture a short authorized lab pcap; identify Ethernet, IP, and transport headers for one flow.
- Resolve a hostname with `dig` or `getent hosts` and compare to what a browser would use.

## Security angles to practice

- Why open ports matter for attack surface and for detection.
- How DNS and TLS names show up in telemetry differently from IP destinations.
- Distinguishing expected admin traffic from unexpected outbound connections in a lab SIEM or Zeek/Suricata view.

## Ethics

Only capture or scan networks you own or have explicit written permission to assess. Prefer disposable lab networks and intentionally vulnerable targets.
