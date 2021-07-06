// Import Modules
import { DAV20 } from './module/config.js';

// Import Documents
import { ItemDav20 } from './module/items/itemEntity.js';
import { VampireActor } from './module/actors/vampireActor.js';

// Import Applications
import { ItemSheetDav20 } from './module/items/itemSheet.js';
import { VampireSheet } from './module/actors/sheets/vampireSheet.js';

Hooks.once("init", function() {
    console.log("dav20 | initialising Dark Ages Vampite 20th Anniversay System");

    game.dav20 = {
        applications: {
            ItemSheetDav20,
            VampireSheet
        },
        config: DAV20,
        entities: {
            ItemDav20,
            VampireActor
        }
    };

    CONFIG.DAV20 = DAV20;
    CONFIG.Item.documentClass = ItemDav20;
    CONFIG.Actor.documentClass = VampireActor;

    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('dav20', ItemSheetDav20, { makeDefault: true, label: "DAV20.SheetClassItem" });

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('dav20', VampireSheet, { makeDefault: true, label: "DAV20.SheetClassActor" });
    
});

function rollItemMacro (itemName) {
    const speaker = ChatMessage.getSpeaker()
    let actor
    if (speaker.token) actor = game.actors.tokens[speaker.token]
    if (!actor) actor = game.actors.get(speaker.actor)
    const item = actor ? actor.items.find(i => i.name === itemName) : null
    if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)
  
    // Trigger the item roll
    return item.roll()
  }

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  });