// Dragon Age RPG — Foundry VTT v14

import { debug, error, info, warn } from "./dragon-age-logger.js";

// --------------------------------------------
// Race + Class-based level-up distributions
// --------------------------------------------
const DA_LEVEL_TABLE = {
  human: {
    warrior: [
      { min: 1,  max: 5,  attr: "strength" },
      { min: 6,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 14, attr: "constitution" },
      { min: 15, max: 16, attr: "intelligence" },
      { min: 17, max: 18, attr: "wisdom" },
      { min: 19, max: 20, attr: "charisma" }
    ],
    rogue: [
      { min: 1,  max: 2,  attr: "strength" },
      { min: 3,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 10, attr: "constitution" },
      { min: 11, max: 13, attr: "intelligence" },
      { min: 14, max: 17, attr: "wisdom" },
      { min: 18, max: 20, attr: "charisma" }
    ],
    mage: [
      { min: 1,  max: 2,  attr: "dexterity" },
      { min: 3,  max: 4,  attr: "constitution" },
      { min: 5,  max: 8,  attr: "intelligence" },
      { min: 9,  max: 13, attr: "wisdom" },
      { min: 14, max: 17, attr: "charisma" },
      { min: 15, max: 20, attr: "magic" }
    ],
    barbarian: [
      { min: 1,  max: 5,  attr: "strength" },
      { min: 6,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 14, attr: "constitution" },
      { min: 15, max: 16, attr: "intelligence" },
      { min: 17, max: 18, attr: "wisdom" },
      { min: 19, max: 20, attr: "charisma" }
    ],
    battlewright: [
      { min: 1,  max: 2,  attr: "strength" },
      { min: 3,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 10, attr: "constitution" },
      { min: 11, max: 13, attr: "intelligence" },
      { min: 14, max: 17, attr: "wisdom" },
      { min: 18, max: 20, attr: "charisma" }
    ],
    champion: [
      { min: 1,  max: 3,  attr: "strength" },
      { min: 4,  max: 6,  attr: "dexterity" },
      { min: 10, max: 14, attr: "constitution" },
      { min: 7,  max: 9,  attr: "wisdom" },
      { min: 15, max: 20, attr: "charisma" }
    ],
    templar: [
      { min: 1,  max: 3,  attr: "strength" },
      { min: 4,  max: 6,  attr: "dexterity" },
      { min: 7,  max: 9,  attr: "constitution" },
      { min: 13, max: 20, attr: "wisdom" },
      { min: 10, max: 12, attr: "charisma" }
    ]
  },

  darkspawn: {
    warrior: [
      { min: 1,  max: 5,  attr: "strength" },
      { min: 11, max: 15, attr: "dexterity" },
      { min: 6,  max: 10, attr: "constitution" },
      { min: 16, max: 20, attr: "wisdom" }
    ],
    rogue: [
      { min: 1,  max: 8,  attr: "dexterity" },
      { min: 9,  max: 10, attr: "strength" },
      { min: 11, max: 14, attr: "constitution" },
      { min: 15, max: 20, attr: "wisdom" }
    ],
    mage: [
      { min: 1,  max: 2,  attr: "dexterity" },
      { min: 3,  max: 4,  attr: "constitution" },
      { min: 5,  max: 7,  attr: "intelligence" },
      { min: 8,  max: 10, attr: "wisdom" },
      { min: 11, max: 13, attr: "charisma" },
      { min: 14, max: 20, attr: "magic" }
    ],
    barbarian: [
      { min: 1,  max: 8,  attr: "strength" },
      { min: 9,  max: 15, attr: "constitution" },
      { min: 16, max: 20, attr: "wisdom" }
    ],
    champion: [
      { min: 1,  max: 3,  attr: "strength" },
      { min: 4,  max: 6,  attr: "dexterity" },
      { min: 10, max: 14, attr: "constitution" },
      { min: 7,  max: 9,  attr: "wisdom" },
      { min: 15, max: 20, attr: "charisma" }
    ]
    // battlewright not defined → will fall back to human.battlewright
  }
};

// --------------------------------------------
// Class progression: base + per-level growth
// --------------------------------------------
const DA_CLASS_PROGRESS = {
  warrior: {
    health:   { base: 25, perLevel: 8,  perConMod: 2 },
    resource: { base: 30, perLevel: 12, perWisMod: 4 }
  },
  rogue: {
    health:   { base: 20, perLevel: 6,  perConMod: 2 },
    resource: { base: 40, perLevel: 14, perWisMod: 4 }
  },
  mage: {
    health:   { base: 15, perLevel: 5,  perConMod: 2 },
    resource: { base: 50, perLevel: 15, perWisMod: 4 }
  },
  barbarian: {
    health:   { base: 30, perLevel: 10, perConMod: 2 },
    resource: { base: 30, perLevel: 10, perWisMod: 4 }
  },
  battlewright: {
    health:   { base: 20, perLevel: 7,  perConMod: 2 },
    resource: { base: 40, perLevel: 12, perWisMod: 4 }
  },
  champion: {
    health:   { base: 25, perLevel: 8,  perConMod: 2 },
    resource: { base: 30, perLevel: 12, perWisMod: 4 }
  },
  templar: {
    health:   { base: 25, perLevel: 8,  perConMod: 2 },
    resource: { base: 30, perLevel: 12, perWisMod: 4 }
  }
};


function getAttributeFromRollByRaceClass(race, cls, roll) {
  const raceKey = race || "human";
  const classKey = cls || "warrior";

  let raceTable = DA_LEVEL_TABLE[raceKey];
  if (!raceTable) raceTable = DA_LEVEL_TABLE["human"];

  let classTable = raceTable[classKey];
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

function ensureSystemStructure(system) {
  if (!system || typeof system !== "object") return;
  system.attributes ??= {};
  system.derived ??= {};
  system.resources ??= {};
  system.resources.health ??= { value: 0, max: 0 };
  system.resources.stamina ??= { value: 0, max: 0 };
  system.defense ??= {};
  system.initiative ??= {};
  system.saves ??= {};
  system.resistances ??= {};
  system.weapon ??= {};
  system.currency ??= {};
  system.ui ??= {};
}


// --------------------------------------------
// Custom Actor document
// --------------------------------------------
class DragonAgeActor extends Actor {
  prepareDerivedData() {
    super.prepareDerivedData();

    const system = this.system ?? this.data?.system ?? this.data?.data ?? {};
    ensureSystemStructure(system);
    const attrs = system.attributes;

    const mods = {};
    for (const [key, value] of Object.entries(attrs)) {
      const score = Number(value) || 0;
      mods[key] = Math.floor((score - 10) / 5);
    }
    system.derived.mods = mods;

    const level = Math.max(1, Number(system.level ?? 1));
    const cls = system.class ?? "warrior";

    system.resources ??= {};
    system.resources.health ??= { value: 0, max: 0 };
    system.resources.stamina ??= { value: 0, max: 0 };

    const prog = DA_CLASS_PROGRESS[cls] ?? DA_CLASS_PROGRESS["warrior"];

    if (level === 1 && prog) {
      const baseHP  = prog.health?.base   ?? 0;
      const baseRes = prog.resource?.base ?? 0;

      if (!system.resources.health.max || system.resources.health.max <= 0) {
        system.resources.health.max = baseHP;
        if (!system.resources.health.value || system.resources.health.value <= 0)
          system.resources.health.value = baseHP;
      }
      if (!system.resources.stamina.max || system.resources.stamina.max <= 0) {
        system.resources.stamina.max = baseRes;
        if (!system.resources.stamina.value || system.resources.stamina.value <= 0)
          system.resources.stamina.value = baseRes;
      }
    }

    const maxHealth = Number(system.resources.health.max ?? 0);
    const curHealth = Number(system.resources.health.value ?? maxHealth);
    system.resources.health.max   = maxHealth;
    system.resources.health.value = Math.min(curHealth, maxHealth);

    const maxRes = Number(system.resources.stamina.max ?? 0);
    const curRes = Number(system.resources.stamina.value ?? maxRes);
    system.resources.stamina.max   = maxRes;
    system.resources.stamina.value = Math.min(curRes, maxRes);

    system.defense ??= {};
    system.initiative ??= {};

    const dexMod = mods.dexterity    ?? 0;
    const conMod = mods.constitution ?? 0;
    const wisMod = mods.wisdom       ?? 0;

    system.defense.dodgeBase = 10 + dexMod;
    system.initiative.flat   = dexMod;

    system.saves ??= {};
    system.saves.fortitude = conMod;
    system.saves.reflex    = dexMod;
    system.saves.will      = wisMod;
  }

  async npcLevelUp() {
    const race = this.system?.race ?? "human";
    const cls  = this.system?.class ?? "warrior";
    const currentLevel = Number(this.system?.level ?? 1);
    const newLevel = currentLevel + 1;

    await this.update({ "system.level": newLevel });

    const roll1 = await (new Roll("1d20")).evaluate();
    const roll2 = await (new Roll("1d20")).evaluate();
    const rolls = [roll1.total, roll2.total];

    const attr1 = getAttributeFromRollByRaceClass(race, cls, rolls[0]);
    const attr2 = getAttributeFromRollByRaceClass(race, cls, rolls[1]);

    const updates = {};
    const gained  = [];

    if (attr1) {
      const oldVal = Number(this.system.attributes?.[attr1] ?? 0);
      updates[`system.attributes.${attr1}`] = oldVal + 1;
      gained.push(attr1);
    }
    if (attr2) {
      const base   = updates[`system.attributes.${attr2}`] ?? this.system.attributes?.[attr2] ?? 0;
      updates[`system.attributes.${attr2}`] = Number(base) + 1;
      gained.push(attr2);
    }
    if (Object.keys(updates).length > 0) await this.update(updates);

    this.prepareDerivedData?.();
    const s    = this.system ?? {};
    const mods = s.derived?.mods ?? {};
    const conMod = mods.constitution ?? 0;
    const wisMod = mods.wisdom       ?? 0;

    const prog = DA_CLASS_PROGRESS[cls] ?? DA_CLASS_PROGRESS["warrior"];
    const healthProg   = prog?.health   ?? {};
    const resourceProg = prog?.resource ?? {};

    const hpGain  = (healthProg.perLevel  ?? 0) + (healthProg.perConMod  ?? 0) * conMod;
    const resGain = (resourceProg.perLevel ?? 0) + (resourceProg.perWisMod ?? 0) * wisMod;

    const oldMaxHP  = Number(s.resources?.health?.max  ?? 0);
    const oldMaxRes = Number(s.resources?.stamina?.max ?? 0);
    const newMaxHP  = Math.max(1, oldMaxHP  + hpGain);
    const newMaxRes = Math.max(0, oldMaxRes + resGain);

    await this.update({
      "system.resources.health.max":    newMaxHP,
      "system.resources.health.value":  newMaxHP,
      "system.resources.stamina.max":   newMaxRes,
      "system.resources.stamina.value": newMaxRes
    });

    const poolName = cls === "mage" ? "Mana" : "Stamina";
    let msg = `<strong>${this.name} leveled to ${newLevel}</strong><br>`;
    msg += `Race: ${race}, Class: ${cls}<br>`;
    msg += `Rolls: ${rolls[0]} → <strong>${attr1 ?? "—"}</strong>, ${rolls[1]} → <strong>${attr2 ?? "—"}</strong><br>`;
    if (gained.length) msg += `Increased: ${gained.join(", ")}<br>`;
    msg += `Max HP +${hpGain}, Max ${poolName} +${resGain}.<br>`;
    msg += `Health and ${poolName} fully restored.`;

    await ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: msg,
      type: "chat"
    });

    info("Level Up", { actor: this.name, fromLevel: currentLevel, toLevel: newLevel, race, cls, rolls, increases: updates, hpGain, resGain, newMaxHP, newMaxRes });
  }
}


// --------------------------------------------
// System initialization
// --------------------------------------------
Hooks.once("init", () => {
  info("Initializing Dragon Age RPG system");

  CONFIG.Actor.documentClass = DragonAgeActor;
  CONFIG.ActiveEffect.legacyTransferral = false;
  CONFIG.Combat.initiative.formula  = "1d20 + @initiative.flat";
  CONFIG.Combat.initiative.decimals = 0;

  // Re-register the #select block helper removed in v14.
  // Renders the block, then marks the <option> whose value matches as selected.
  Handlebars.registerHelper("select", function(value, options) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = options.fn(this);
    wrapper.querySelectorAll("option").forEach(opt => {
      if (opt.value === String(value ?? "")) opt.setAttribute("selected", "");
      else opt.removeAttribute("selected");
    });
    return new Handlebars.SafeString(wrapper.innerHTML);
  });

  const { HandlebarsApplicationMixin } = foundry.applications.api;

  function updateBodyHeight(sheet) {
    const form = sheet.element?.querySelector("form");
    const body = form?.querySelector(".sheet-body");
    if (!form || !body) return;
    const winHeaderH = sheet.element.querySelector(".window-header")?.offsetHeight ?? 32;
    const formStyle = getComputedStyle(form);
    const formPadV = parseFloat(formStyle.paddingTop) + parseFloat(formStyle.paddingBottom);
    let fixedH = 0;
    for (const child of form.children) {
      if (child === body) break;
      fixedH += child.getBoundingClientRect().height;
    }
    const availH = (sheet.position.height ?? 700) - winHeaderH - formPadV - fixedH;
    body.style.height = `${Math.max(80, availH)}px`;
    body.style.overflowY = "auto";
  }

  // ----------------------------------------
  // PC Actor Sheet (ApplicationV2)
  // ----------------------------------------
  class DragonAgePCActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {
    static DEFAULT_OPTIONS = {
      classes: ["dragon-age", "sheet", "actor", "pc"],
      position: { width: 720, height: 700 },
      window: { resizable: true },
      form: { submitOnChange: false, closeOnSubmit: false }
    };

    static PARTS = {
      main: { template: "systems/dragon-age/templates/actor/actor-sheet.hbs", scrollable: [".sheet-body"] }
    };

    async _prepareContext(options) {
      return {
        actor: this.actor,
        cssClass: this.isEditable ? "editable" : "locked",
        editable: this.isEditable
      };
    }

    setPosition(pos = {}) {
      const result = super.setPosition(pos);
      updateBodyHeight(this);
      return result;
    }

    _onRender(context, options) {
      super._onRender(context, options);
      updateBodyHeight(this);
      if (this.isEditable) {
        this.element.querySelector("form")?.addEventListener("change", ev => {
          const el = ev.target;
          if (!el?.name) return;
          const value = el.dataset.dtype === "Number" ? Number(el.value) : el.value;
          this.document.update({ [el.name]: value });
        });
      }
      this.element.querySelectorAll(".item-edit").forEach(el => {
        el.addEventListener("click", ev => {
          ev.preventDefault();
          const li = ev.currentTarget.closest("[data-item-id]");
          this.actor.items.get(li?.dataset?.itemId)?.sheet?.render(true);
        });
      });
      this.element.querySelectorAll(".item-delete").forEach(el => {
        el.addEventListener("click", async ev => {
          ev.preventDefault();
          const itemId = ev.currentTarget.closest("[data-item-id]")?.dataset?.itemId;
          if (itemId) await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        });
      });
    }
  }

  // ----------------------------------------
  // NPC Actor Sheet (ApplicationV2)
  // ----------------------------------------
  class DragonAgeNPCActorSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {
    static DEFAULT_OPTIONS = {
      classes: ["dragon-age", "sheet", "actor", "npc"],
      position: { width: 720, height: 780 },
      window: { resizable: true },
      form: { submitOnChange: false, closeOnSubmit: false }
    };

    static PARTS = {
      main: { template: "systems/dragon-age/templates/actor/actor-sheet-npc.hbs", scrollable: [".sheet-body"] }
    };

    tabGroups = { primary: "stats" };

    async _prepareContext(options) {
      const actor = this.actor;
      const cls   = actor.system?.class ?? "warrior";
      const isMage = cls === "mage";
      const items  = actor.items.contents;

      const equippedBySlot = {};
      for (const it of items) {
        const ui = getUi(it);
        if (ui.equippedSlot) equippedBySlot[ui.equippedSlot] = it;
      }

      const storage = { weapons: [], equipment: [], consumables: [], items: [], magical: [] };
      for (const it of items) {
        const ui = getUi(it);
        if (ui.equippedSlot) continue;
        const key = ui.storageCategory || "items";
        (storage[key] ?? storage.items).push(it);
      }

      const abilityItems  = items.filter(i => i.type === "ability");
      const weaponTalents = { active: [], passive: [] };
      const abilities     = { active: [], passive: [] };
      const spells        = { active: [], passive: [] };
      const getCat = it => it.system?.category ?? (isMage ? "spell" : "ability");
      const getAct = it => it.system?.activation ?? "active";
      for (const it of abilityItems) {
        const cat = getCat(it);
        const act = getAct(it);
        if (cat === "weapon") { if (!isMage) (weaponTalents[act] ?? weaponTalents.active).push(it); continue; }
        if (cat === "spell")  { (spells[act]   ?? spells.active).push(it);   continue; }
        (abilities[act] ?? abilities.active).push(it);
      }

      return {
        actor,
        cssClass: this.isEditable ? "editable" : "locked",
        editable: this.isEditable,
        isMage,
        resourceLabel: isMage ? "Mana" : "Stamina",
        equippedBySlot,
        storage,
        gold: actor.system?.currency?.gold ?? 0,
        weaponTalents,
        abilities,
        spells
      };
    }

    setPosition(pos = {}) {
      const result = super.setPosition(pos);
      updateBodyHeight(this);
      return result;
    }

    _onRender(context, options) {
      super._onRender(context, options);
      updateBodyHeight(this);
      if (this.isEditable) {
        this.element.querySelector("form")?.addEventListener("change", ev => {
          const el = ev.target;
          if (!el?.name) return;
          const value = el.dataset.dtype === "Number" ? Number(el.value) : el.value;
          this.document.update({ [el.name]: value });
        });
      }

      // Tabs — DOM-only switching, preserves state in tabGroups across re-renders
      const activeTab = this.tabGroups.primary ?? "stats";
      this.element.querySelectorAll(".tab[data-group='primary']").forEach(t =>
        t.classList.toggle("active", t.dataset.tab === activeTab)
      );
      this.element.querySelectorAll(".sheet-tabs .item[data-tab]").forEach(l => {
        l.classList.toggle("active", l.dataset.tab === activeTab);
        l.addEventListener("click", ev => {
          ev.preventDefault();
          const newTab = ev.currentTarget.dataset.tab;
          this.tabGroups.primary = newTab;
          this.element.querySelectorAll(".tab[data-group='primary']").forEach(t =>
            t.classList.toggle("active", t.dataset.tab === newTab)
          );
          this.element.querySelectorAll(".sheet-tabs .item[data-tab]").forEach(link =>
            link.classList.toggle("active", link.dataset.tab === newTab)
          );
        });
      });

      this.element.querySelector(".npc-level-up")?.addEventListener("click", ev => {
        ev.preventDefault();
        this.actor.npcLevelUp();
      });

      this.element.querySelectorAll(".item-edit").forEach(el => {
        el.addEventListener("click", ev => {
          ev.preventDefault();
          const li = ev.currentTarget.closest("[data-item-id]");
          this.actor.items.get(li?.dataset?.itemId)?.sheet?.render(true);
        });
      });
      this.element.querySelectorAll(".item-delete").forEach(el => {
        el.addEventListener("click", async ev => {
          ev.preventDefault();
          const itemId = ev.currentTarget.closest("[data-item-id]")?.dataset?.itemId;
          if (itemId) await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
        });
      });
    }
  }

  // ----------------------------------------
  // Item Sheet (ApplicationV2)
  // ----------------------------------------
  class DragonAgeItemSheet extends HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheet) {
    static DEFAULT_OPTIONS = {
      classes: ["dragon-age", "sheet", "item"],
      position: { width: 560, height: 640 },
      window: { resizable: true },
      form: { submitOnChange: true, closeOnSubmit: false }
    };

    static PARTS = {
      main: { template: "systems/dragon-age/templates/item/item-sheet.hbs", scrollable: [".sheet-body"] }
    };

    async _prepareContext(options) {
      const item = this.item;
      const tags = item.system?.tags ?? [];
      return {
        item,
        cssClass: this.isEditable ? "editable" : "locked",
        editable: this.isEditable,
        tagsString: Array.isArray(tags) ? tags.join(", ") : String(tags ?? ""),
        effects: item.effects.contents
      };
    }

    async _processSubmitData(event, form, formData) {
      const data = foundry.utils.expandObject(formData.object);
      const rawTags = data.system?.tags;
      if (typeof rawTags === "string") {
        data.system.tags = rawTags.split(",").map(s => s.trim()).filter(Boolean);
      }
      await this.document.update(data);
    }

    _onRender(context, options) {
      super._onRender(context, options);
      if (!this.isEditable) return;
      this.element.querySelectorAll(".effect-control").forEach(el => {
        el.addEventListener("click", async ev => {
          ev.preventDefault();
          const action   = ev.currentTarget.dataset.action;
          const li       = ev.currentTarget.closest("[data-effect-id]");
          const effectId = li?.dataset?.effectId;
          switch (action) {
            case "create":
              return this.document.createEmbeddedDocuments("ActiveEffect", [{
                name: "New Effect", icon: "icons/svg/aura.svg", origin: this.document.uuid
              }]);
            case "edit":
              return this.document.effects.get(effectId)?.sheet?.render(true);
            case "delete":
              if (effectId) return this.document.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
              break;
            case "toggle": {
              const effect = this.document.effects.get(effectId);
              if (effect) return effect.update({ disabled: !effect.disabled });
              break;
            }
          }
        });
      });
    }
  }

  // ----------------------------------------
  // Sheet registration
  // ----------------------------------------
  const ActorColl = foundry.documents.collections.Actors;
  const ItemColl  = foundry.documents.collections.Items;

  ActorColl.registerSheet("dragon-age", DragonAgePCActorSheet, {
    types: ["pc"],
    makeDefault: true
  });
  ActorColl.registerSheet("dragon-age", DragonAgeNPCActorSheet, {
    types: ["npc"],
    makeDefault: true
  });
  ItemColl.registerSheet("dragon-age", DragonAgeItemSheet, {
    types: ["weapon", "equipment", "consumable", "ability"],
    makeDefault: true
  });

  info("Dragon Age sheets registered");
});


// --------------------------------------------
// Active Effects only apply when item is equipped
// --------------------------------------------
async function DA_syncItemEffectsWithEquipped(item) {
  if (!item?.actor) return;
  const equipped = Boolean(item.system?.equipped);
  const effects  = item.effects?.contents ?? [];
  if (!effects.length) return;
  const updates = effects.map(e => ({ _id: e.id, disabled: !equipped }));
  await item.updateEmbeddedDocuments("ActiveEffect", updates);
}

Hooks.on("createItem", async (item) => {
  if (!item?.actor) return;
  await DA_syncItemEffectsWithEquipped(item);
});

Hooks.on("updateItem", async (item, changed) => {
  if (!item?.actor) return;

  const slotFromNested   = changed?.system?.ui?.equippedSlot ?? changed?.system?.equippedSlot;
  const slotFromFlat     = foundry.utils.getProperty(changed, "system.ui.equippedSlot") ?? foundry.utils.getProperty(changed, "system.equippedSlot");
  const slotChanged      = (slotFromNested !== undefined) || (slotFromFlat !== undefined);
  const newSlot          = slotFromNested ?? slotFromFlat;

  if (slotChanged) {
    const shouldEquip = (typeof newSlot === "string") ? newSlot.trim().length > 0 : Boolean(newSlot);
    if (Boolean(item.system?.equipped) !== shouldEquip)
      await item.update({ "system.equipped": shouldEquip }, { render: false });
  }

  const equippedChanged =
    (changed?.system?.equipped !== undefined) ||
    (foundry.utils.getProperty(changed, "system.equipped") !== undefined);

  if (equippedChanged) await DA_syncItemEffectsWithEquipped(item);
});


// --------------------------------------------
// Auto-sync token art with actor image
// --------------------------------------------
Hooks.on("updateActor", async (actor, changed) => {
  if (!("img" in (changed ?? {}))) return;
  const newImg = actor.img;

  const currentProto = actor.prototypeToken?.texture?.src;
  if (currentProto !== newImg)
    await actor.update({ "prototypeToken.texture.src": newImg });

  const toUpdate = canvas.tokens.placeables
    .filter(t => t.actor?.id === actor.id)
    .map(t => ({ _id: t.id, "texture.src": newImg }));

  if (toUpdate.length) await canvas.scene.updateEmbeddedDocuments("Token", toUpdate);
});
