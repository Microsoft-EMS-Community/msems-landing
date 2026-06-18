# Defender SOC — scenario bank

All alert cards in the SOC triage game and their single correct response.
Four actions only: **Isolate device**, **Reset creds**, **Block source**,
**Dismiss**. (Escalate was removed for being ambiguous.)

Source of truth: `src/components/soc-game.tsx` (`SCENARIOS`). This file is a
human-readable snapshot for review — update it if you change the bank.

The intended discriminator:

- **Isolate** — malware/ransomware on an endpoint → contain the device.
- **Reset** — an identity/account is compromised → revoke + reset the user.
- **Block** — an external source (sender / IP / URL / domain / egress).
- **Dismiss** — known-benign, approved, or a false positive.

---

## Isolate device

| Card | Alert |
| --- | --- |
| Ransomware on a device | Mass file encryption + shadow-copy deletion on DESKTOP-12 |
| Credential dumper found | Defender caught Mimikatz running on FINANCE-PC |
| Malware executing | Word spawned PowerShell pulling a payload on HR-04 |
| Beacon from one host | Cobalt Strike process active on LAPTOP-07 |
| C2 beacon to APT infra | A host is beaconing to known nation-state command infrastructure |
| ToastedTy found a USB | Mystery USB detonating malware on his laptop |
| Intune device rooted | A managed laptop reports rooted + malware indicators |

## Reset creds

| Card | Alert |
| --- | --- |
| Impossible-travel sign-in | jonas@ signed in from Oslo then Lagos 7 min apart |
| Stolen token replay | A valid session token is being reused from a new ASN |
| Rogue MFA method added | An unknown device registered an authenticator on effie@ |
| Malicious inbox rule | Account is auto-forwarding all mail to an external address |
| Rogue Global Admin | An unknown session just granted an account Global Admin |
| Jonas reused his password | Impossible-travel sign-in on jonasb, yet again |
| Effie clicked the phish | Creds harvested from effie@ after a convincing lure |
| Joël's token got lifted | Session token stolen on the conference Wi-Fi |
| Entra risky user: high | Atypical travel + anonymous IP flagged on m.olsen@ |
| PRT token theft | Primary Refresh Token lifted from an Entra-joined laptop |
| Cloud Apps: TOR IP | MDCA flagged a user signing in from an anonymous TOR proxy |
| Cloud Apps: inbox rule | MDCA found a hidden mail-forwarding rule on a mailbox |

## Block source

| Card | Alert |
| --- | --- |
| Phishing wave | 20 users reported the same credential-harvest sender |
| Password spray | 600 failed sign-ins from 5.188.x.x in 4 min |
| Typosquat clicks | SmartScreen logging repeat clicks to micros0ft-secure.com |
| New C2 domain to block | Threat-intel feed lists a fresh malware C2 domain for the blocklist |
| Trade-secret upload | A tagged trade-secret file is being uploaded to an external site |
| Jay skipped DMARC | No p=reject, so spoofed CEO mail is landing in inboxes |
| Sebastian's RDP brute-forced | A single IP is hammering the login on his exposed box |
| Tenant password spray | Legacy-auth spray hitting Exchange Online from one IP |
| Purview DLP: PII leak | 5,000 customer PII records being emailed to a personal Gmail |
| DLP: card data pasted | Credit-card numbers pasted into an external web form |

## Dismiss

| Card | Alert |
| --- | --- |
| Scheduled EICAR test | The SecOps scanner running its daily test signature |
| Sanctioned admin task | Approved admin running PsExec during the change window |
| Whitelisted vuln scan | Approved scanner tripping the usual port-scan alerts |
| Backup service account | Expected sign-in from the known backup server |
| Phil scheduled this | Sanctioned maintenance during the approved change window |
| Sven's backup job | Known backup service account doing its nightly run |
| Report-only CA policy | A report-only Conditional Access rule logged a would-block |
| Autopilot enrollment | New device enrolling through the approved Autopilot profile |
| Compliance re-sync | Device flicked non-compliant mid-sync, already compliant again |
| Impossible travel (known) | MDCA flag, but it's a frequent traveller on the exclusion list |
| Anon IP = your red team | MDCA anonymous-IP alert traced to the sanctioned pentest |
| DLP false positive | Pattern matched a card number but it's an internal order ID |

---

**Totals:** 7 isolate · 12 reset · 10 block · 12 dismiss = 41 cards.
