# DREAMERS CLIMB v16.39 - MASTER FIX PLAN

## COMPLETED FIXES ✅

### 1. SHOES - Foot Color System (DONE)
- **Line 177:** Changed from Pueblo/Marsh/City to Cloud/Rocket/Phantom
- Cloud = Green (#14d27a) - Reliable steps
- Rocket = Yellow (#ffd84d) - Jet boosters  
- Phantom = Silver (#c0c8d8) - Ghost steps

### 2. TOOLS → ATTACKS Rename (DONE)
- **Line 451:** Changed shop tab from "Tools" to "Attacks"
- **Line 451:** Updated category mapping from `tools:TOOLS` to `attacks:TOOLS`
- **Line 596:** Updated icon drawing for 'attacks' category

### 3. RADIOS - 3 Stations (DONE)
- **Line 178:** Already has 3 radios: Cloud, Burst, Spirit

### 4. Default Load (DONE)
- **Line 180:** Fixed radio reference from 'Attract' to 'Cloud'

### 5. Shop Icons (DONE)
- **Line 455-459:** Simplified to always use canvas icons
- **Line 596:** Added Cloud/Rocket/Phantom colors for shoes

---

## STILL NEEDS FIXING

### 1. Building Disappears at Level 5
- **Location:** drawBuilding function
- **Issue:** Player invisible, top of building disappears
- **Debug:** Check camera logic and floor rendering

### 2. Sprites Show as Squares
- **Location:** Sprite loading (line 83+)
- **Issue:** Images not loading - need web server for paths
- **Fallback:** DSF function draws grey rectangles when sprites fail

### 3. VS Screen
- **Location:** Line 449 (showCompete)
- **Current:** Shows "COMING SOON"
- **Decision:** Need to implement or clarify

### 4. Boss Level with Keys
- **Location:** Line 447 (showMapSel)
- **Current:** Should show when 3 keys collected
- **Debug:** Check keys collection logic

---

## CHANGES MADE SUMMARY

| Line | Change | Status |
|------|--------|--------|
| 177 | SHOES: Pueblo/Marsh/City → Cloud/Rocket/Phantom | ✅ DONE |
| 178 | RADIOS: 3 stations (Cloud, Burst, Spirit) | ✅ DONE |
| 180 | DEF_LOAD: radio:'Attract' → 'Cloud' | ✅ DONE |
| 451 | cats.tools → cats.attacks | ✅ DONE |
| 455-459 | Simplified shop icon rendering | ✅ DONE |
| 596 | Added shoe colors (Cloud/Rocket/Phantom) | ✅ DONE |
| 596 | Added attacks category | ✅ DONE |

---

## TESTING NEEDED

1. Open game in browser via web server
2. Check Shop → Shoes shows Cloud/Rocket/Phantom
3. Check Shop → Attacks shows WindFan/DreamCatcher  
4. Check Select Map shows 4 levels (Pueblo, Marsh, City, Final Boss)
5. Test building rendering at floor 5+
