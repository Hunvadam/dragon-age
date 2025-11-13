// Dragon Age RPG — Foundry VTT v13 (Legacy API, stable + saving fixed)

class DragonAgeActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dragon-age", "sheet", "actor"],
      template: "systems/dragon-age/templates/actor/actor-sheet.hbs",
      width: 720,
      height: 640
    });
  }

  /** Called whenever the sheet form is submitted. */
  async _updateObject(event, formData) {
    console.log("🧾 Raw formData:", formData);
    const expanded = foundry.utils.expandObject(formData);
    console.log("🧾 Expanded formData:", expanded);
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
  console.log("DRAGON-AGE | Initializing (Legacy Sheet API, stable)");

  // Register our sheet
  const coll = foundry.documents.collections.Actors;
  coll.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  coll.registerSheet("dragon-age", DragonAgeActorSheet, {
    types: ["pc", "npc"],
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
