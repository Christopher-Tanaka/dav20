export class Dav20ItemSheet extends ItemSheet {
     
    /** @override */
    get template () {
        const path = 'systems/dav20/templates/items'
        return `${path}/item-${this.item.data.type}-sheet.html`
    }
}