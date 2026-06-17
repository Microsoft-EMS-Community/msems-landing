# Memory game card icons

The memory match game uses these six files as the card faces (6 pairs).
The committed versions are simple placeholder tiles. **To use the official
Microsoft product icons, replace each file with the official SVG, keeping the
same filename.** No code change needed.

| File           | Product            |
| -------------- | ------------------ |
| `intune.svg`   | Microsoft Intune   |
| `entra.svg`    | Microsoft Entra ID |
| `defender.svg` | Microsoft Defender |
| `purview.svg`  | Microsoft Purview  |
| `copilot.svg`  | Microsoft Copilot  |
| `teams.svg`    | Microsoft Teams    |

Notes:
- SVG is preferred (crisp at any size). PNG also works if you keep the
  `.svg` filename pointing at it, but better to update the path in
  `src/components/memory-game.tsx` if you switch formats.
- Each product also has an `accent` colour in `memory-game.tsx` that tints its
  card tile, so the (mostly blue) official icons stay easy to tell apart. If
  you swap a product, give it a distinct accent there too.
- Icons render inside a tinted rounded tile, so transparent-background icons
  designed for light surfaces look correct.
