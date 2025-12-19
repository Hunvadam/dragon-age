// Dragon Age RPG — Foundry VTT v13 (Legacy API)

// --------------------------------------------
// Race + Class-based level-up distributions
// --------------------------------------------
const DA_LEVEL_TABLE = {
  human: {
    warrior: [ // done
      { min: 1,  max: 5,  attr: "strength" },
      { min: 6, max: 8, attr: "dexterity" },
      { min: 9,  max: 14, attr: "constitution" },
      { min: 15, max: 16, attr: "intelligence" },
      { min: 17, max: 18, attr: "wisdom" },
      { min: 19, max: 20, attr: "charisma" }
    ],
    rogue: [
      { min: 1,  max: 2,  attr: "strength" },
      { min: 3, max: 8, attr: "dexterity" },
      { min: 9,  max: 10, attr: "constitution" },
      { min: 11, max: 13, attr: "intelligence" },
      { min: 14, max: 17, attr: "wisdom" },
      { min: 18, max: 20, attr: "charisma" }
    ],
    mage: [
      { min: 1, max: 2, attr: "dexterity" },
      { min: 3,  max: 4, attr: "constitution" },
      { min: 5, max: 8, attr: "intelligence" },
      { min: 9, max: 13, attr: "wisdom" },
      { min: 14, max: 17, attr: "charisma" },
      { min: 15,  max: 20, attr: "magic" }
    ],
    barbarian: [
      { min: 1,  max: 5,  attr: "strength" },
      { min: 6, max: 8, attr: "dexterity" },
      { min: 9,  max: 14, attr: "constitution" },
      { min: 15, max: 16, attr: "intelligence" },
      { min: 17, max: 18, attr: "wisdom" },
      { min: 19, max: 20, attr: "charisma" }
    ],
    battlewright: [
      { min: 1,  max: 2,  attr: "strength" },
      { min: 3, max: 8, attr: "dexterity" },
      { min: 9,  max: 10, attr: "constitution" },
      { min: 11, max: 13, attr: "intelligence" },
      { min: 14, max: 17, attr: "wisdom" },
      { min: 18, max: 20, attr: "charisma" }
    ],
    champion: [ //done
      { min: 1,  max: 3,  attr: "strength" },
      { min: 4, max: 6, attr: "dexterity" },
      { min: 10,  max: 14, attr: "constitution" },
      { min: 7, max: 9, attr: "wisdom" },
      { min: 15, max: 20, attr: "charisma" }
    ],
    templar: [ //done
      { min: 1,  max: 3,  attr: "strength" },
      { min: 4, max: 6, attr: "dexterity" },
      { min: 7,  max: 9, attr: "constitution" },
      { min: 13, max: 20, attr: "wisdom" },
      { min: 10, max: 12, attr: "charisma" }
    ]
  },

  darkspawn: {
    // Darkspawn warrior: purely physical, no INT-focus
    warrior: [ //done
      { min: 1,  max: 5,  attr: "strength" },
      { min: 11, max: 15, attr: "dexterity" },
      { min: 6,  max: 10, attr: "constitution" },
      { min: 16, max: 20, attr: "wisdom" }
    ],
    rogue: [ //done
      { min: 1,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 10, attr: "strength" },
      { min: 11, max: 14, attr: "constitution" },
      { min: 15, max: 20, attr: "wisdom" }
    ],
    mage: [ //done
      { min: 1, max: 2, attr: "dexterity" },
      { min: 3,  max: 4, attr: "constitution" },
      { min: 5, max: 7, attr: "intelligence" },
      { min: 8, max: 10, attr: "wisdom" },
      { min: 11, max: 13, attr: "charisma" },
      { min: 14, max: 20, attr: "magic" }
    ],
    barbarian: [ //done
      { min: 1,  max: 8,  attr: "strength" },
      { min: 9,  max: 15, attr: "constitution" },
      { min: 16, max: 20, attr: "wisdom" }
    ],
    champion: [ //done
      { min: 1,  max: 3,  attr: "strength" },
      { min: 4, max: 6, attr: "dexterity" },
      { min: 10,  max: 14, attr: "constitution" },
      { min: 7, max: 9, attr: "wisdom" },
      { min: 15, max: 20, attr: "charisma" }
    ]
    // battlewright not defined → will fall back to human.battlewright
  }
};

// --------------------------------------------
// Class progression: base + per-level growth
// HP always scales with CON, stamina/mana with WIS.
// (Numbers are placeholders – feel free to tweak.)
// --------------------------------------------
const DA_CLASS_PROGRESS = {
  warrior: {
    health: {
      base: 25,        // HP at level 1 with CON mod = 0
      perLevel: 8,     // HP gained each level
      perConMod: 2     // extra HP per level per CON modifier
    },
    resource: {
      base: 30,        // Stamina/Mana at level 1 with WIS mod = 0
      perLevel: 12,     // gained each level
      perWisMod: 4     // extra resource per level per WIS modifier
    }
  },

  rogue: {
    health: {
      base: 20,
      perLevel: 6,
      perConMod: 2
    },
    resource: {
      base: 40,
      perLevel: 14,
      perWisMod: 4
    }
  },

  mage: {
    health: {
      base: 15,
      perLevel: 5,
      perConMod: 2
    },
    // Still stored in system.resources.stamina; sheet label shows "Mana"
    resource: {
      base: 50,
      perLevel: 15,
      perWisMod: 4
    }
  },

  barbarian: {
    health: {
      base: 30,
      perLevel: 10,
      perConMod: 2
    },
    resource: {
      base: 30,
      perLevel: 10,
      perWisMod: 4
    }
  },

  battlewright: {
    health: {
      base: 20,
      perLevel: 7,
      perConMod: 2
    },
    resource: {
      base: 40,
      perLevel: 12,
      perWisMod: 4
    }
  },

  champion: {
    health: {
      base: 25,        // HP at level 1 with CON mod = 0
      perLevel: 8,     // HP gained each level
      perConMod: 2     // extra HP per level per CON modifier
    },
    resource: {
      base: 30,        // Stamina/Mana at level 1 with WIS mod = 0
      perLevel: 12,     // gained each level
      perWisMod: 4     // extra resource per level per WIS modifier
    }
  },
  
  templar: {
    health: {
      base: 25,        // HP at level 1 with CON mod = 0
      perLevel: 8,     // HP gained each level
      perConMod: 2     // extra HP per level per CON modifier
    },
    resource: {
      base: 30,        // Stamina/Mana at level 1 with WIS mod = 0
      perLevel: 12,     // gained each level
      perWisMod: 4     // extra resource per level per WIS modifier
    }
  }
};


function getAttributeFromRollByRaceClass(race, cls, roll) {
  const raceKey = race || "human";
  const classKey = cls || "warrior";

  // 1) Try race-specific table
  let raceTable = DA_LEVEL_TABLE[raceKey];
  if (!raceTable) raceTable = DA_LEVEL_TABLE["human"];

  let classTable = raceTable[classKey];

  // 2) If this class is not defined for that race, fall back to human's class
  if (!classTable) {
    const humanTable = DA_LEVEL_TABLE["human"];
    classTable = humanTable[classKey] ?? humanTable["warrior"];
  }

  if (!classTable) return null;

  const entry = classTable.find(e => roll >= e.min && roll <= e.max);
  return entry?.attr ?? null;
}

function getUi(item) {
  const ui = item?.system?.ui ?? {};
  return {
    storageCategory: ui.storageCategory ?? "items",
    equippedSlot: ui.equippedSlot ?? ""
  };
}



// --------------------------------------------
// Custom Actor document
// --------------------------------------------
class DragonAgeActor extends Actor {
  /** Prepare derived (computed) data for the actor. */
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system ?? {};
    const attrs = system.attributes ?? {};

    // ----------------------------------------
    // 1) Attribute modifiers
    // ----------------------------------------
    system.derived ??= {};
    const mods = {};

    // Modifier formula: floor((score - 10) / 5)
    for (const [key, value] of Object.entries(attrs)) {
      const score = Number(value) || 0;
      mods[key] = Math.floor((score - 10) / 5);
    }
    system.derived.mods = mods;

    const level = Math.max(1, Number(system.level ?? 1));
    const cls = system.class ?? "warrior";

    // ----------------------------------------
    // 2) Ensure resource structure exists
    // ----------------------------------------
    system.resources ??= {};
    system.resources.health ??= { value: 0, max: 0 };
    system.resources.stamina ??= { value: 0, max: 0 };

    const prog = DA_CLASS_PROGRESS[cls] ?? DA_CLASS_PROGRESS["warrior"];

    // ----------------------------------------
    // 3) Initialize Level 1 from base if nothing is set yet
    //    (base = what they *start* with at level 1)
    // ----------------------------------------
    if (level === 1 && prog) {
      const baseHP  = prog.health?.base   ?? 0;
      const baseRes = prog.resource?.base ?? 0;

      // Only initialize if max is not set or <= 0
      if (!system.resources.health.max || system.resources.health.max <= 0) {
        system.resources.health.max = baseHP;
        if (!system.resources.health.value || system.resources.health.value <= 0) {
          system.resources.health.value = baseHP;
        }
      }

      if (!system.resources.stamina.max || system.resources.stamina.max <= 0) {
        system.resources.stamina.max = baseRes;
        if (!system.resources.stamina.value || system.resources.stamina.value <= 0) {
          system.resources.stamina.value = baseRes;
        }
      }
    }

    // ----------------------------------------
    // 4) Clamp current HP / Resource to their max
    //    (NO formulas here: no level/CON/WIS scaling)
    // ----------------------------------------
    const maxHealth = Number(system.resources.health.max ?? 0);
    const curHealth = Number(system.resources.health.value ?? maxHealth);
    system.resources.health.max   = maxHealth;
    system.resources.health.value = Math.min(curHealth, maxHealth);

    const maxRes = Number(system.resources.stamina.max ?? 0);
    const curRes = Number(system.resources.stamina.value ?? maxRes);
    system.resources.stamina.max   = maxRes;
    system.resources.stamina.value = Math.min(curRes, maxRes);

    // ----------------------------------------
    // 5) Defense: Dodge & Initiative
    // ----------------------------------------
    system.defense ??= {};
    system.initiative ??= {};

    const dexMod = mods.dexterity    ?? 0;
    const conMod = mods.constitution ?? 0;
    const wisMod = mods.wisdom       ?? 0;

    // Your final rules:
    // Dodge = 10 + Dex mod
    system.defense.dodgeBase = 10 + dexMod;

    // Initiative flat bonus = Dex mod
    system.initiative.flat = dexMod;

    // ----------------------------------------
    // 6) Saves: Fortitude / Reflex / Will
    // ----------------------------------------
    system.saves ??= {};

    // Fortitude save = Con mod
    system.saves.fortitude = conMod;

    // Reflex save = Dex mod
    system.saves.reflex = dexMod;

    // Will save = Wis mod
    system.saves.will = wisMod;
  }

  /** NPC / Actor Level Up logic: level + 2 attribute bumps (race + class) */
  async npcLevelUp() {
    const race = this.system?.race ?? "human";
    const cls  = this.system?.class ?? "warrior";
    const currentLevel = Number(this.system?.level ?? 1);
    const newLevel = currentLevel + 1;

    // 1) Update the level
    await this.update({ "system.level": newLevel });

    // 2) Roll 2× d20
    const roll1 = await (new Roll("1d20")).evaluate({async: true});
    const roll2 = await (new Roll("1d20")).evaluate({async: true});
    const rolls = [roll1.total, roll2.total];

    // 3) Determine which attributes to increase from race+class table
    const attr1 = getAttributeFromRollByRaceClass(race, cls, rolls[0]);
    const attr2 = getAttributeFromRollByRaceClass(race, cls, rolls[1]);

    const updates = {};
    const gained = [];

    if (attr1) {
      const oldVal = Number(this.system.attributes?.[attr1] ?? 0);
      updates[`system.attributes.${attr1}`] = oldVal + 1;
      gained.push(attr1);
    }

    if (attr2) {
      const base = updates[`system.attributes.${attr2}`] ?? this.system.attributes?.[attr2] ?? 0;
      const oldVal = Number(base);
      updates[`system.attributes.${attr2}`] = oldVal + 1;
      gained.push(attr2);
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }

    // 4) Recompute derived to get up-to-date CON/WIS modifiers *after* attribute bumps
    this.prepareDerivedData?.();
    const s = this.system ?? {};
    const mods = s.derived?.mods ?? {};
    const conMod = mods.constitution ?? 0;
    const wisMod = mods.wisdom ?? 0;

    // 5) Increase max HP and resource ONCE for this level-up
    const prog = DA_CLASS_PROGRESS[cls] ?? DA_CLASS_PROGRESS["warrior"];
    const healthProg   = prog?.health   ?? {};
    const resourceProg = prog?.resource ?? {};

    // HP gain this level
    const hpGain =
      (healthProg.perLevel  ?? 0) +
      (healthProg.perConMod ?? 0) * conMod;

    // Stamina/Mana gain this level
    const resGain =
      (resourceProg.perLevel  ?? 0) +
      (resourceProg.perWisMod ?? 0) * wisMod;

    const oldMaxHP  = Number(s.resources?.health?.max  ?? 0);
    const oldMaxRes = Number(s.resources?.stamina?.max ?? 0);

    const newMaxHP  = Math.max(1, oldMaxHP  + hpGain);
    const newMaxRes = Math.max(0, oldMaxRes + resGain);

    await this.update({
      "system.resources.health.max":   newMaxHP,
      "system.resources.health.value": newMaxHP,   // full heal on level up
      "system.resources.stamina.max":   newMaxRes,
      "system.resources.stamina.value": newMaxRes  // full refill on level up
    });

    // 6) Chat summary
    let msg = `<strong>${this.name} leveled to ${newLevel}</strong><br>`;
    msg += `Race: ${race}, Class: ${cls}<br>`;
    msg += `Rolls: ${rolls[0]} → <strong>${attr1 ?? "—"}</strong>, ${rolls[1]} → <strong>${attr2 ?? "—"}</strong><br>`;
    if (gained.length) {
      msg += `Increased: ${gained.join(", ")}<br>`;
    }
    const poolName = cls === "mage" ? "Mana" : "Stamina";
    msg += `Max HP +${hpGain}, Max ${poolName} +${resGain}.<br>`;
    msg += `Health and ${poolName} fully restored.`;

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: msg,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });

    console.log(`DragonAge | Level Up`, {
      actor: this.name,
      fromLevel: currentLevel,
      toLevel: newLevel,
      race, cls,
      rolls,
      increases: updates,
      hpGain,
      resGain,
      newMaxHP,
      newMaxRes
    });
  }
}
// --------------------------------------------
// PC Actor Sheet
// --------------------------------------------
class DragonAgePCActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dragon-age", "sheet", "actor", "pc"],
      template: "systems/dragon-age/templates/actor/actor-sheet.hbs",
      width: 720,
      height: 640,

      // v13-native tabs support (do NOT use new Tabs() manually)
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  async _updateObject(event, formData) {
    console.log("🧾 Raw formData (PC):", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("🧾 Expanded formData (PC):", expanded);
    await this.document.update(expanded);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Prevent default anchor behavior on tab links (safe)
    html.find(".sheet-tabs [data-tab]").on("click", ev => ev.preventDefault());

    // Autosave on field changes
    html.find("input, select, textarea").on("change", ev => {
      ev.preventDefault();
      this._onSubmit(ev, { preventClose: true });
    });

    // Inventory controls (only if present in your hbs)
    html.find(".item-edit").on("click", ev => {
      ev.preventDefault();
      const li = ev.currentTarget.closest("[data-item-id]");
      const item = this.actor.items.get(li?.dataset?.itemId);
      item?.sheet?.render(true);
    });

    html.find(".item-delete").on("click", async ev => {
      ev.preventDefault();
      const li = ev.currentTarget.closest("[data-item-id]");
      const itemId = li?.dataset?.itemId;
      if (!itemId) return;
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });
  }
}


// --------------------------------------------
// NPC Actor Sheet
// --------------------------------------------
class DragonAgeNPCActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dragon-age", "sheet", "actor", "npc"],
      template: "systems/dragon-age/templates/actor/actor-sheet-npc.hbs",
      width: 720,
      height: 640,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "stats"
        }
      ]
    });
  }

  async getData(options) {
    const data = await super.getData(options);

    const cls = data.actor.system.class ?? "warrior";

    // Resource label: Mana for mages, Stamina otherwise
    data.resourceLabel = (cls === "mage") ? "Mana" : "Stamina";

    // ---- Inventory UI grouping (UI-only fields) ----
    const items = data.items ?? [];

    // Equipped grid mapping: slotKey -> item
    const equippedBySlot = {};
    for (const it of items) {
      const ui = getUi(it);
      if (ui.equippedSlot) equippedBySlot[ui.equippedSlot] = it;
    }
    data.equippedBySlot = equippedBySlot;

    // Storage categories (UI-only)
    const cats = {
      weapons: [],
      equipment: [],
      consumables: [],
      items: [],
      magical: []
    };

    for (const it of items) {
      const ui = getUi(it);

      // If it has an equipped slot, we show it in the grid, not storage
      if (ui.equippedSlot) continue;

      const key = ui.storageCategory || "items";
      (cats[key] ?? cats.items).push(it);
    }

    data.storage = cats;

    // Gold (actor field)
    data.gold = data.actor.system?.currency?.gold ?? 0;

    return data;
  }


  async _updateObject(event, formData) {
    console.log("🧾 Raw formData (NPC):", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("🧾 Expanded formData (NPC):", expanded);
    await this.document.update(expanded);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Autosave
    html.find("input, select, textarea").on("change", ev => {
      ev.preventDefault();
      this._onSubmit(ev, { preventClose: true });
    });

    // Level Up button
    html.find(".npc-level-up").on("click", ev => {
      ev.preventDefault();
      this.actor.npcLevelUp();
    });

    // Inventory controls (only if present in your hbs)
    html.find(".item-edit").on("click", ev => {
      ev.preventDefault();
      const li = ev.currentTarget.closest("[data-item-id]");
      const item = this.actor.items.get(li?.dataset?.itemId);
      item?.sheet?.render(true);
    });

    html.find(".item-delete").on("click", async ev => {
      ev.preventDefault();
      const li = ev.currentTarget.closest("[data-item-id]");
      const itemId = li?.dataset?.itemId;
      if (!itemId) return;
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    });
  }

}

// --------------------------------------------
// Item Sheet
// --------------------------------------------
class DragonAgeItemSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dragon-age", "sheet", "item"],
      template: "systems/dragon-age/templates/item/item-sheet.hbs",
      width: 560,
      height: 640
    });
  }

  async getData(options) {
    const data = await super.getData(options);

    // Render tags array as a single comma string for easy editing
    const tags = data.item?.system?.tags ?? [];
    data.tagsString = Array.isArray(tags) ? tags.join(", ") : String(tags ?? "");

    // Make sure effects are available to the template/partial
    // (Foundry typically provides `effects`, but we ensure it exists)
    data.effects = data.effects ?? this.document.effects?.contents ?? [];

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Effect controls (create/edit/delete/toggle)
    html.find(".effect-control").on("click", async ev => {
      ev.preventDefault();
      const el = ev.currentTarget;
      const action = el.dataset.action;

      // For edit/delete/toggle we need an effect id from the parent <li>
      const li = el.closest("[data-effect-id]");
      const effectId = li?.dataset?.effectId;

      switch (action) {
        case "create": {
          return this.document.createEmbeddedDocuments("ActiveEffect", [{
            name: "New Effect",
            icon: "icons/svg/aura.svg",
            origin: this.document.uuid
          }]);
        }

        case "edit": {
          const effect = this.document.effects.get(effectId);
          return effect?.sheet?.render(true);
        }

        case "delete": {
          if (!effectId) return;
          return this.document.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
        }

        case "toggle": {
          const effect = this.document.effects.get(effectId);
          if (!effect) return;
          return effect.update({ disabled: !effect.disabled });
        }
      }
    });
  }

  async _updateObject(event, formData) {
    const expanded = foundry.utils.expandObject(formData);

    // Convert "system.tags" from comma string -> array
    const rawTags = expanded.system?.tags;
    if (typeof rawTags === "string") {
      expanded.system.tags = rawTags
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }

    await this.document.update(expanded);
  }
}


// --------------------------------------------
// System initialization
// --------------------------------------------
Hooks.once("init", async () => {
  console.log("DRAGON-AGE | Initializing (PC/NPC sheets, derived mods, race+class leveling)");

  // Use our custom Actor document class
  CONFIG.Actor.documentClass = DragonAgeActor;
  
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Initiative formula (uses system.initiative.flat)
  CONFIG.Combat.initiative.formula  = "1d20 + @initiative.flat";
  CONFIG.Combat.initiative.decimals = 0;

  // Register sheets
  const coll = foundry.documents.collections.Actors;
  coll.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

  coll.registerSheet("dragon-age", DragonAgePCActorSheet, {
    types: ["pc"],
    makeDefault: true
  });

  coll.registerSheet("dragon-age", DragonAgeNPCActorSheet, {
    types: ["npc"],
    makeDefault: true
  });
  
  // Register Item sheets
  const icoll = foundry.documents.collections.Items;
  icoll.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);

  icoll.registerSheet("dragon-age", DragonAgeItemSheet, {
    types: ["weapon", "equipment", "consumable", "ability"],
    makeDefault: true
  });

});

// --------------------------------------------
// Auto-sync token art with actor image
// --------------------------------------------
Hooks.on("updateActor", async (actor, changed) => {
  if (!("img" in (changed ?? {}))) return;

  const newImg = actor.img;

  // 1) Update prototype token texture for future drops
  const currentProto = actor.prototypeToken?.texture?.src;
  if (currentProto !== newImg) {
    await actor.update({ "prototypeToken.texture.src": newImg });
  }

  // 2) Update any placed tokens for this actor in the current scene
  const toUpdate = canvas.tokens.placeables
    .filter(t => t.actor?.id === actor.id)
    .map(t => ({ _id: t.id, "texture.src": newImg }));

  if (toUpdate.length) {
    await canvas.scene.updateEmbeddedDocuments("Token", toUpdate);
  }
});


