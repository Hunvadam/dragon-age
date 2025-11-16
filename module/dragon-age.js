// Dragon Age RPG — Foundry VTT v13 (Legacy API, stable + saving fixed)

// PC sheet
class DragonAgePCActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dragon-age", "sheet", "actor", "pc"],
      template: "systems/dragon-age/templates/actor/actor-sheet.hbs",
      width: 720,
      height: 640
    });
  }

  /** Called whenever the sheet form is submitted. */
  async _updateObject(event, formData) {
    console.log("🧾 Raw formData (PC):", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("🧾 Expanded formData (PC):", expanded);
    await this.document.update(expanded);
  }

  /** Listen for field changes and trigger a form submit */
  activateListeners(html) {
    super.activateListeners(html);

    // Instant-save when any input changes
    html.find("input, select, textarea").on("change", ev => {
      ev.preventDefault();
      this._onSubmit(ev, { preventClose: true });
    });
  }
}

// NPC sheet – currently identical to PC sheet
class DragonAgeNPCActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dragon-age", "sheet", "actor", "npc"],
      template: "systems/dragon-age/templates/actor/actor-sheet-npc.hbs",
      width: 720,
      height: 640
    });
  }

  /** Called whenever the sheet form is submitted. */
  async _updateObject(event, formData) {
    console.log("🧾 Raw formData (NPC):", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("🧾 Expanded formData (NPC):", expanded);
    await this.document.update(expanded);
  }

  /** Listen for field changes and trigger a form submit */
  activateListeners(html) {
    super.activateListeners(html);

    // Instant-save when any input changes
    html.find("input, select, textarea").on("change", ev => {
      ev.preventDefault();
      this._onSubmit(ev, { preventClose: true });
    });
  }
}

/* -------------------------------------------- */
/*  System initialization                        */
/* -------------------------------------------- */

Hooks.once("init", async () => {
  console.log("DRAGON-AGE | Initializing (Legacy Sheet API, separate PC/NPC sheets)");

  // Register our sheets
  const coll = foundry.documents.collections.Actors;
  coll.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);

  // PC sheet for type "pc"
  coll.registerSheet("dragon-age", DragonAgePCActorSheet, {
    types: ["pc"],
    makeDefault: true
  });

  // NPC sheet for type "npc"
  coll.registerSheet("dragon-age", DragonAgeNPCActorSheet, {
    types: ["npc"],
    makeDefault: true
  });
});

/* -------------------------------------------- */
/*  Token defaults                               */
/* -------------------------------------------- */

Hooks.on("preCreateActor", (actor, data) => {
  if (!data.prototypeToken) data.prototypeToken = {};
  foundry.utils.setProperty(data, "prototypeToken.bar1", { attribute: "system.resources.health" });
  foundry.utils.setProperty(data, "prototypeToken.bar2", { attribute: "system.resources.stamina" });
  if (data.type === "pc") foundry.utils.setProperty(data, "prototypeToken.disposition", 1);
  if (data.type === "npc") foundry.utils.setProperty(data, "prototypeToken.disposition", -1);
});

/* -------------------------------------------- */
/*  Auto-sync token art with actor image        */
/* -------------------------------------------- */

Hooks.on("updateActor", async (actor, changed) => {
  if (!("img" in (changed ?? {}))) return;

  const newImg = actor.img;

  // 1) Update prototype token texture for future drops
  // (Only if it’s different; avoid unnecessary writes)
  const currentProto = actor.prototypeToken?.texture?.src;
  if (currentProto !== newImg) {
    await actor.update({ "prototypeToken.texture.src": newImg });
  }

  // 2) Update any placed tokens for this actor in the current scene
  //    (Both linked and unlinked; remove the second line if you only want linked)
  const toUpdate = canvas.tokens.placeables
    .filter(t => t.actor?.id === actor.id)
    .map(t => ({ _id: t.id, "texture.src": newImg }));

  if (toUpdate.length) {
    await canvas.scene.updateEmbeddedDocuments("Token", toUpdate);
  }
});
