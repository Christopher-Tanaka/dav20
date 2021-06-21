/*

import { preloadHandlebarsTemplates } from './templates.js'
import { VampireActor } from './actors/vampireActor.js'
import { Vampire } from './actors/sheets/vampire.js'

Hooks.once("init", async function() {
    console.log("dav20 | initialising Dark Ages Vampite 20th Anniversay System");

    game.vtm5e = {
        VampireActor,
        rollItemMacro
      }

    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('dav20', VampireActor, { makeDefault: true })
})

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
  */