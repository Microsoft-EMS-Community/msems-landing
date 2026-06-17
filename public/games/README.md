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
| `windows.svg`  | Windows            |
| `azure.svg`    | Microsoft Azure    |

Notes:
- SVG is preferred (crisp at any size). PNG also works if you keep the
  `.svg` filename pointing at it, but better to update the path in
  `src/components/memory-game.tsx` if you switch formats.
- Icons render inside a white rounded tile, so transparent-background icons
  designed for light surfaces look correct.
- The six faces must be visually distinct (it's a memory game).
