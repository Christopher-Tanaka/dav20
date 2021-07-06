export class ItemSheetDav20 extends ItemSheet {
    constructor(...args) {
        super(...args);
    
        // Expand the default size of the class sheet
        if ( this.object.data.type === "class" ) {
          this.options.width = this.position.width =  600;
          this.options.height = this.position.height = 680;
        }
      }

    /** @inheritdoc */
	static get defaultOptions() {
	  return foundry.utils.mergeObject(super.defaultOptions, {
      width: 560,
      height: 400,
      classes: ["dav20", "sheet", "item"],
      resizable: true,
      scrollY: [".tab.details"]
    });
  }
     
    /** @override */
    get template () {
        const path = 'systems/dav20/templates/items';
        return `${path}/item-${this.item.data.type}-sheet.html`;
    }

    /** @override */
    getData() {
        const data = super.getData();
        const itemData = data.data;
        data.config = CONFIG.DAV20;

        data.item = itemData;
        data.data = itemData.data;

        return data;
    }
}