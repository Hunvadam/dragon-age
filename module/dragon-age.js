// Dragon Age RPG — Foundry VTT v13 (Legacy API)

// --------------------------------------------
// Race + Class-based level-up distributions
// --------------------------------------------
const DA_LEVEL_TABLE = {
  human: {
    warrior: [
      { min: 1,  max: 5,  attr: "strength" },
      { min: 6,  max: 10, attr: "constitution" },
      { min: 11, max: 15, attr: "dexterity" },
      { min: 16, max: 20, attr: "intelligence" } // or magic, tweak later
    ],
    rogue: [
      { min: 1,  max: 7,  attr: "dexterity" },
      { min: 8,  max: 13, attr: "intelligence" },
      { min: 14, max: 17, attr: "constitution" },
      { min: 18, max: 20, attr: "charisma" }
    ],
    mage: [
      { min: 1,  max: 8,  attr: "magic" },
      { min: 9,  max: 14, attr: "intelligence" },
      { min: 15, max: 18, attr: "wisdom" },
      { min: 19, max: 20, attr: "constitution" }
    ],
    barbarian: [
      { min: 1,  max: 8,  attr: "strength" },
      { min: 9,  max: 14, attr: "constitution" },
      { min: 15, max: 18, attr: "dexterity" },
      { min: 19, max: 20, attr: "charisma" }
    ],
    battlewright: [
      { min: 1,  max: 7,  attr: "intelligence" },
      { min: 8,  max: 13, attr: "magic" },
      { min: 14, max: 17, attr: "constitution" },
      { min: 18, max: 20, attr: "dexterity" }
    ]
  },

  darkspawn: {
    // Darkspawn warrior: purely physical, no INT-focus
    warrior: [
      { min: 1,  max: 8,  attr: "strength" },
      { min: 9,  max: 15, attr: "constitution" },
      { min: 16, max: 20, attr: "dexterity" }
    ],
    rogue: [
      { min: 1,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 15, attr: "strength" },
      { min: 16, max: 20, attr: "constitution" }
    ],
    mage: [
      // Emissaries: heavy Magic, some CON/DEX
      { min: 1,  max: 10, attr: "magic" },
      { min: 11, max: 15, attr: "constitution" },
      { min: 16, max: 20, attr: "dexterity" }
    ],
    barbarian: [
      { min: 1,  max: 10, attr: "strength" },
      { min: 11, max: 20, attr: "constitution" }
    ]
    // battlewright not defined → will fall back to human.battlewright
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

// --------------------------------------------
// Custom Actor document
// --------------------------------------------
class DragonAgeActor extends Actor {
  /** Prepare derived (computed) data for the actor. */
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system ?? {};
    const attrs = system.attributes ?? {};

    // Ensure derived container exists
    system.derived ??= {};
    const mods = {};

    // Modifier formula: floor((score - 10) / 2)
    for (const [key, value] of Object.entries(attrs)) {
      const score = Number(value) || 0;
      mods[key] = Math.floor((score - 10) / 5);
    }

    system.derived.mods = mods;

    // Here is where we will later auto-calc:
    // - saves
    // - dodge / initiative
    // - HP / stamina / mana etc.
  }

  /** NPC / Actor Level Up logic: level + 2 attribute bumps (race + class) */
  async npcLevelUp() {
    const system = this.system ?? {};
    const race = system.race ?? "human";
    const cls  = system.class ?? "warrior";
    const currentLevel = Number(system.level ?? 1);
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
      const oldVal = Number(system.attributes?.[attr1] ?? 0);
      updates[`system.attributes.${attr1}`] = oldVal + 1;
      gained.push(attr1);
    }

    if (attr2) {
      const base = updates[`system.attributes.${attr2}`] ?? system.attributes?.[attr2] ?? 0;
      const oldVal = Number(base);
      updates[`system.attributes.${attr2}`] = oldVal + 1;
      gained.push(attr2);
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }

    // 4) Chat summary
    let msg = `<strong>${this.name} leveled to ${newLevel}</strong><br>`;
    msg += `Race: ${race}, Class: ${cls}<br>`;
    msg += `Rolls: ${rolls[0]} → <strong>${attr1 ?? "—"}</strong>, ${rolls[1]} → <strong>${attr2 ?? "—"}</strong><br>`;
    if (gained.length) {
      msg += `Increased: ${gained.join(", ")}`;
    }

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: msg,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER
    });

    console.log(`DragonAge | Level Up`, {
      actor: this.name,
      level: newLevel,
      race, cls,
      rolls,
      increases: updates
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
      height: 640
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

    html.find("input, select, textarea").on("change", ev => {
      ev.preventDefault();
      this._onSubmit(ev, { preventClose: true });
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
      height: 640
    });
  }

  async getData(options) {
    const data = await super.getData(options);

    const cls = data.actor.system.class ?? "warrior";

    // Default label
    let label = "Stamina";
    // Mages use Mana (Battlewright uses Stamina)
    if (cls === "mage") label = "Mana";

    data.resourceLabel = label;
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
  }
}

// --------------------------------------------
// System initialization
// --------------------------------------------
Hooks.once("init", async () => {
  console.log("DRAGON-AGE | Initializing (PC/NPC sheets, derived mods, race+class leveling)");

  // Use our custom Actor document class
  CONFIG.Actor.documentClass = DragonAgeActor;

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
});

// --------------------------------------------
// Token defaults
// --------------------------------------------
Hooks.on("preCreateActor", (actor, data) => {
  if (!data.prototypeToken) data.prototypeToken = {};
  foundry.utils.setProperty(data, "prototypeToken.bar1", { attribute: "system.resources.health" });
  foundry.utils.setProperty(data, "prototypeToken.bar2", { attribute: "system.resources.stamina" });
  if (data.type === "pc")  foundry.utils.setProperty(data, "prototypeToken.disposition", 1);
  if (data.type === "npc") foundry.utils.setProperty(data, "prototypeToken.disposition", -1);
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
