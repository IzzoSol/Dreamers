# DREAMERS CLIMB v16.39 - MASTER PLAN

**Last Updated:** March 27, 2026
**Status:** IN PROGRESS

---

## CURRENT STATE

### Working Features:
- Game starts and runs
- Basic climbing mechanics
- Building renders (but has floating tile squares issue)
- WindFan and DreamCatcher attacks work (only 2)
- Spring ladder (double jump) is effective

### Issues to Fix:
- Building has floating grey/yellow tile squares
- Only 2 attacks work (WindFan, DreamCatcher)
- Radio has no button/sound/battery
- VS mode is "COMING SOON" not implemented
- 8 radios need to be reduced to 3

---

## UPGRADE PLAN

### 1. BUILDING FIX (Line 540-541)
- REMOVE floating tile overlay code
- This fixes grey/yellow squares on floors

### 2. ATTACKS - Only keep working ones
**Line 178 (TOOLS):**
- KEEP: WindFan (projectile blast), DreamCatcher (charged cannon)
- REMOVE: Paintbrush, Grapple, TimeWatch, ShieldGen, MagnetGlove, GhostLantern
- REASON: Only 'projectile' attack type works in code

### 3. RADIO SYSTEM - 3 Stations with Powers
**Line 177 (RADIOS):**
Replace 8 radios with 3:

| Radio Name | Power | Effect |
|------------|-------|---------|
| Attract | Attract emeralds | Pulls emeralds toward player |
| Repel | Repel debris | Pushes hazards away from player |
| Heal | Heal health | Gradually restores HP over time |

**NEW FEATURES NEEDED:**
- Radio battery/charge system (depletes over time)
- Radio pickup items to recharge
- Radio button in HUD to toggle on/off
- Sound emission when radio plays

### 4. VS MODE - CPU Battle
**Line 449 (showCompete):**
- Implement Team VS (Player vs CPU)
- Like Super Smash Bros style
- CPU can climb and attack
- Allow building in VS mode

### 5. LADDER SYSTEM
- Spring (double jump) is most effective - KEEP
- Other ladders can be simplified or removed

---

## SPRITES AVAILABLE

### Tools/Attacks:
- charged1.png - charged6.png (for WindFan, DreamCatcher)

### Radio:
- PUEBLO RADIO.png (use for all 3 stations)

### Pickups:
- GOLD BAR PUEBLO.png (gold)
- HEALTH HEART SPRITES.png, MARSH HEALTH RESTORE SPRITE PICKUP.png, FOOD HEALTH PUEBLO.png (health)
- Radio recharge pickups (need to add)

---

## IMPLEMENTATION ORDER

### Phase 1: Quick Fixes (Do First)
1. Remove floating tile squares (lines 540-541)
2. Test building works

### Phase 2: Attacks
1. Simplify TOOLS to only WindFan, DreamCatcher
2. Update shop display

### Phase 3: Radio System (Major)
1. Create 3 radio stations with powers
2. Add battery system
3. Add radio button to HUD
4. Add sound capability
5. Add recharge pickups

### Phase 4: VS Mode
1. Implement Team VS (Player vs CPU)
2. Add CPU AI
3. Enable building in VS

---

## CODE LOCATIONS

| Feature | Line(s) |
|---------|---------|
| RADIOS constant | 177 |
| TOOLS constant | 178 |
| drawBuilding | 538-541 |
| showCompete | 449 |
| showShop | 451-486 |
| HUD display | 427-429 |
| Radio effects | 328-331 |

---

## NOTES

- Only WindFan and DreamCatcher work because they have 'projectile' attack type in the code
- Other tools have 'melee', 'hook', 'pulse', 'shield', 'magnet', 'beam' types that aren't implemented
- Radio needs Web Audio API for sound
- Battery depletes based on time active

---

## SPRITE FILES REFERENCE

**Path:** `C:\Users\Brittany\OneDrive\Desktop\THE DREAMERS ECOSYSTEM\sprites\16.39\`

**Available:**
- charged1.png - charged6.png
- PUEBLO RADIO.png
- GOLD BAR PUEBLO.png
- HEALTH HEART SPRITES.png
- MARSH HEALTH RESTORE SPRITE PICKUP.png
- FOOD HEALTH PUEBLO.png
