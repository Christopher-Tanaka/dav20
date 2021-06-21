import { Dav20ItemSheet } from './items/dav20ItemSheet.js';

Hooks.once("init", function() {
    console.log("dav20 | initialising Dark Ages Vampite 20th Anniversay System");
    
    game.dav20 = {
        Dav20ItemSheet,
        rollItemMacro
      }

    Items.unregisterSheet('core', ItemSheet)
    Items.registerSheet('dav20', Dav20ItemSheet, { makeDefault: true })
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