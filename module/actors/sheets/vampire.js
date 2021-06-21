
/**
 * Extend the basic ActorSheet
 * @extends {ActorSheet}
 */
export default class Vampire extends ActorSheet {

    constructor(actor, options) {
        super(actor, options)
        this.locked = true
    }

    /** @override */
    get template() {
        return 'systems/dav20/templates/actors/actor-sheet.html'
    }

}