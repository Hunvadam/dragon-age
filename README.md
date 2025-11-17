# Dragon Age RPG (Homebrew System)  
### Foundry VTT System for v13.351+

This is a custom tabletop RPG system inspired by **Dragon Age: Origins**, built for **Foundry VTT v13**.  
It provides a lightweight but expandable rules framework with class, race, leveling, attributes, and NPC automation.

---

## Features

### Actor Types
- **PC** (player character) — currently in early development.
- **NPC** (enemy/ally) — fully functional and supports automation.

### Character Data Model
- **Race** selection (e.g., Human, Darkspawn)
- **Class** selection:
  - Warrior  
  - Rogue  
  - Mage  
  - Barbarian  
  - Battlewright  
- **Level** system with a dedicated Level Up button
- **Seven attributes**:
  - Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma, Magic  
- **Automatic attribute modifiers** using the formula:  
modifier = floor((attribute - 10) / 5)

### Leveling System
- Clicking **Level Up**:
- Increases the level
- Rolls two d20s
- Applies attribute increases based on:
  - Race  
  - Class  
  - A configurable distribution table  
- Supports fallback to human distributions when a race/class combination is undefined
- Posts a summary message to chat

### Resources and Derived Values
- **Health** (value/max)
- **Stamina** or **Mana** depending on class
- **Derived attribute modifiers** stored under `system.derived.mods`
- Autosave on all form fields

### Defenses and Combat Stats
- Armor
- Dodge
- Weapon damage
- Resistances: Fire, Cold, Nature, Spirit, Electricity, Blight
- Saves: Fortitude, Reflex, Will
- Initiative (flat bonus) integrated into Foundry's combat tracker

### Token Handling
- Token bars:
- Bar 1 → Health  
- Bar 2 → Stamina/Mana  
- Token disposition defaults:
- PC → Friendly  
- NPC → Hostile  
- Token artwork automatically stays synchronized with the actor image

### NPC Utility
- NPC item table (Name, Cost, Description)
- Supports instant saving on all fields without closing the sheet

---

## Installation

1. Download or clone the repository into:
Data/systems/dragon-age/
2. Restart Foundry VTT (version 13.351 or later).
3. Create or select a world.
4. Choose **Dragon Age RPG** as the system when loading the world.
5. Create an NPC actor to access:
- Race selection  
- Class selection  
- Leveling system  
- Attribute modifiers  
- Derived fields

---

## Roadmap

Planned future features include:

- Completion of PC sheet mechanics
- Auto-calculation of:
- Saves  
- Dodge  
- Initiative  
- Health / Stamina / Mana progression  
- Weapon damage scaling  
- Resistances  
- Class specializations
- Spell schools and spellcasting framework
- Skill system (Tier 1, Tier 2, Tier 3)
- Itemization, crafting, and material tiers
- Companion and camp systems
- Darkspawn affinity and kill-counter mechanics
- Named items and lore-based artifacts from Dragon Age: Origins

---

## Development Notes

- Uses the Foundry VTT **v13 legacy sheet API** (`foundry.appv1.sheets.ActorSheet`)
- PC and NPC sheets are fully separated
- Core logic is implemented in:
module/dragon-age.js
- Templates are located in:
templates/actor/actor-sheet.hbs
templates/actor/actor-sheet-npc.hbs
- Leveling rules are defined under:
DA_LEVEL_TABLE
- Derived data is calculated in:
DragonAgeActor.prepareDerivedData()

---

## Legal Notice

This is a non-commercial fan project inspired by **Dragon Age: Origins**.  
All rights to Dragon Age belong to **BioWare** and **Electronic Arts**.  
This system is intended for private gameplay and educational use only.
