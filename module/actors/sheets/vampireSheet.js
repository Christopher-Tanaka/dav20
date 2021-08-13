
/**
 * Extend the basic ActorSheet
 * @extends {ActorSheet}
 */

Handlebars.registerHelper("keys", function (context, options) {
  var ret = [];

  return ret;
});


export class VampireSheet extends ActorSheet {

  constructor(...args) {
    super(...args);
  }



  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 1024,
      height: 700,
      classes: ["dav20", "sheet", "actor"],
      resizable: true,
      popOut: true,
      scrollY: [".tab.details"],
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    return 'systems/dav20/templates/actors/actor-sheet.html'
  }

  activateListeners(html) {
    console.log("dav20 | activating listeners...");

    super.activateListeners(html)

    this._setupDotCounters(html)
    this._setupResourceCounters(html)
    this._setupHealthCounters(html)

    html.find('.resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-health-step').click(this._onHealthCounterClick.bind(this))
    html.find('.resource-counter-step').click(this._onSquareCounterClick.bind(this))
    // Rollable Vampire abilities.
    html.find('.abilityCheck').click(this._onAbilityCheckDialog.bind(this))
    html.find('.disciplineCheck').click(this._onDisciplineCheckDialog.bind(this))
    html.find('.attributeCheck').click(this._onAttributeCheckDialog.bind(this))
    html.find('.attackCheck').click(this._onAttackCkeckDialog.bind(this))
     
    // Owned Item management
     html.find('.item-create').click(this._onItemCreate.bind(this));
     html.find('.item-edit').click(this._onItemEdit.bind(this));
     html.find('.item-delete').click(this._onItemDelete.bind(this));

    if (!this.options.editable) {
      console.log("dav20 | sheet is not editable");
      return
    }

    console.log("dav20 | listener activated");
  }

  /** @override */
  getData() {
    const data = super.getData()
    const actorData = data.data
    data.config = CONFIG.DAV20

    let powers = data.items.filter(function (item) { return item.type == "power" })
    let weapons = data.items.filter(function (item) { return item.type == "weapon" })
    let armors = data.items.filter(function (item) { return item.type == "armor" })
    let meritsAndFlaws = data.items.filter(function (item) { return item.type == "merits&flaws" })

    this._formatWeaponsTypes(weapons)
    this._formatArmorTypes(armors)

    const disciplines = this._formatDisciplinesAndPowers(data, powers)
    this._formatMeritsAndFlaws(data, meritsAndFlaws)

    actorData.data.disciplines = disciplines
    actorData.data.weapons = weapons
    actorData.data.armors = armors

    data.actor = actorData
    data.data = actorData.data

    // Owned Items
    data.items = actorData.items
    for (let i of data.items) {
      const item = this.actor.items.get(i._id)
      i.labels = item.labels
    }

    return data
  }

  _formatDisciplinesAndPowers(data, powers) {
    const disciplines = new Map()

    powers.forEach(power => {
      const key = power.data.props.disciplineTree

      if (disciplines.has(key)) {
        disciplines.get(key).powers.push(power)
      } else {
        const value = {
          level: 1,
          label: power.data.props.disciplineTree,
          powers: []
        }

        value.powers.push(power)
        disciplines.set(key, value)
      }

    });

    // Sort the spellbook by section level
    const sorted = Object.fromEntries(disciplines)

    return sorted
  }

  _formatWeaponsTypes(weapons) {

    weapons.forEach(item => {

      if (typeof item.data.weapon !== 'undefined') {
        switch (item.data.weapon.concealment) {
          case 'Pouch': 
            item.data.weapon.concealmentDesc = game.i18n.localize('WeaponConcealment.Pouch');
            break;
          case 'LooseClothing': 
            item.data.weapon.concealmentDesc = game.i18n.localize('WeaponConcealment.LooseClothing'); 
            break;
          case 'LongCloak': 
            item.data.weapon.concealmentDesc = game.i18n.localize('WeaponConcealment.LongCloak'); 
            break;
          case 'MayNotBeConcealed': 
            item.data.weapon.concealmentDesc = game.i18n.localize('WeaponConcealment.MayNotBeConcealed'); 
            break;
          default:
            item.data.weapon.concealmentDesc = '';
        }
  
        switch (item.data.weapon.damageType) {
          case 'Bashing':
            item.data.weapon.damageTypesDesc = game.i18n.localize('WeaponDamageType.Bashing');
            break;
          case 'Lethal':
            item.data.weapon.damageTypesDesc = game.i18n.localize('WeaponDamageType.Lethal');
            break;
          case 'Aggravated':
            item.data.weapon.damageTypesDesc = game.i18n.localize('WeaponDamageType.Aggravated');
            break;
        }
      }
    })
  }

  _formatArmorTypes(armors) {
    armors.forEach(item => {

      if (typeof item.data.armor !== 'undefined') {
        switch (item.data.armor.armorClass) {
          case 'ClassOne':
            item.data.armor.armorClassDesc = game.i18n.localize('Armor.ClassOne')
            break
          case 'ClassTwo':
            item.data.armor.armorClassDesc = game.i18n.localize('Armor.ClassTwo')
            break
          case 'ClassThree':
            item.data.armor.armorClassDesc = game.i18n.localize('Armor.ClassThree')
            break
          case 'ClassFour':
            item.data.armor.armorClassDesc = game.i18n.localize('Armor.ClassFour')
            break
          case 'ClassFive':
            item.data.armor.armorClassDesc = game.i18n.localize('Armor.ClassFive')
            break
          default:
            item.data.armor.armorClassDesc = ''
            break
        }
      }
    })
  }

  _formatMeritsAndFlaws(data, meritsAndFlaws) {

    data.merits = meritsAndFlaws.filter(function (item) {
      const merits = item.data.meritsAndFlaws.meritsOrFlaws == "Merits"
      return merits
    })

    data.flaws = meritsAndFlaws.filter(function (item) {return item.data.meritsAndFlaws.meritsOrFlaws == "Flaws"})
  }

  _onDotCounterEmpty(event) {
    const actorData = this.actor.data.toObject(false);

    console.log("dav20 | _onDotCounterEmpty");
    event.preventDefault()
    if (this.locked) return
    const element = event.currentTarget
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-empty')

    steps.removeClass('active')
    this._assignToActorField(fields, 0)
  }

  _onDotCounterChange(event) {
    event.preventDefault();

    console.log("dav20 | _onDotCounterChange");

    const element = event.currentTarget
    const dataset = element.dataset
    const index = Number(dataset.index)
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const steps = parent.find('.resource-value-step')
    if (index < 0 || index > steps.length) {
      console.log("dav20 |  Invalid index")
      return
    }

    steps.each(function (i) {
      if (i <= index) {
        console.log("dav20 | activate until index: " + index)

        $(this).addClass('active')
      }
    })

    let currentValue = Number(parent[0].dataset.value);
    let newValue = 0;
    if (index == 0 && currentValue == 1)
      newValue = index;
    else
      newValue = index + 1;

    return this.actor.update({ [fieldStrings]: newValue })
  }

  _setupDotCounters(html) {
    console.log("_setupDotCounters")

    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })

  }

  _onSquareCounterClick(event) {
    event.preventDefault();

    console.log("dav20 | _onDotCounterChange");

    const element = event.currentTarget;
    const dataset = element.dataset;
    const index = Number(dataset.index);
    const parent = $(element.parentNode);
    const fieldStrings = parent[0].id;
    const steps = parent.find('.resource-counter-step');

    if (index < 0) {
      return
    }

    steps.each(function (i) {
      if (i <= index) {
        console.log("dav20 | activate until index: " + index)

        $(this).addClass('active')
      }
    })

    let currentValue = Number(parent[0].dataset.value);
    let newValue = 0;
    if (index == 0 && currentValue == 1)
      newValue = index;
    else
      newValue = index + 1

    return this.actor.update({ [fieldStrings]: newValue })
  }

  _setupResourceCounters(html) {
    html.find('.resource-counter').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-counter-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
    html.find('.resource-counter-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-counter-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
        }
      })
    })
  }

  _onHealthCounterClick(event) {
    event.preventDefault();

    console.log("dav20 | _onDotCounterChange");

    const element = event.currentTarget;
    const dataset = element.dataset;
    const key = element.id;

    let currentState = dataset.state;
    let newState = ""

    switch (currentState) {
      case "": newState = "-"; break;
      case "-": newState = "/"; break;
      case "/": newState = "X"; break;
      case "X": newState = ""; break;

      default: newState = "-"
    }

    if (key == "") {
      console.log("dav20 | empty key to update health")
      return
    }

    return this.actor.update({ [element.id]: newState })
  }

  _setupHealthCounters(html) {
    html.find('.resource-health').each(function () {

      console.log("dav20 | _setupHealthCounters")

      $(this).find('.resource-health-step').each(function (i) {
        const state = this.dataset.state
        const level = Number(this.dataset.level)

        if (i + 1 <= level) {
          $(this).state = state
        }
      })
    })

  }

  _onDisciplineCheckDialog(event) {
    event.preventDefault()

    const template = `
      <form> 
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="6">
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('DAV20.Roll'),
        callback: async (html) => {
      
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)

          this._onDisciplineCheck(event, modifier, difficulty)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('DAV20.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('DAV20.Rolling'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }


  _onDisciplineCheck(event, modifier, difficulty) {

    const li = event.currentTarget.parentNode
    const item = this.actor.items.get(li.dataset.itemId)

    const attributeValue = this._getAtributeValue(item.data.data.props.dice1)
    const abilityValue = this._getAbilityValue(item.data.data.props.dice2)

    const data = super.getData()
    const actorData = data.data
    actorData.data.bloodPool.value -= parseInt(item.data.data.props.bloodCost) 
    const fieldStrings = "data.bloodPool.value"
    this.actor.update({ [fieldStrings]: actorData.data.bloodPool.value })

    let label = `
      <div class="roll-name">
        <img src="${item.img}" class="roll-img">
        <h4 class="roll-title">${item.name}</h4>
      </div>
        <p>${item.data.data.props.description}</p>
      <div class="roll-result">
        <h4 class="roll-title">NUMBER_OF_SUCCESS SUCCESS_PLACEHOLDER</h4>
      </div>`

    const dicePool = attributeValue + abilityValue + this._getHealthLevelPenalty() + modifier

    this._diceCheck(dicePool, this.actor, label, difficulty, false)
  
  }

  _getAtributeValue(attribute) {
    const data = super.getData()
    const actorData = data.data
    let attributeValue = 0

    for (const [key, value] of Object.entries(actorData.data.attributes)) {
      if (String(attribute).toLowerCase() == key) {
        attributeValue = value.value
        break
      }
      console.log(`${key}: ${value}`);
    }

    return attributeValue
  }

  _getAbilityValue(ablity) {
    const data = super.getData()
    const actorData = data.data
    let abilityValue = 0

    for (const [key, value] of Object.entries(actorData.data.abilities)) {
      if (String(ablity).toLowerCase() == key) {
        abilityValue = value.value
        break
      }
    }

    return abilityValue
  }

  _getHealthLevelPenalty() {
    const data = super.getData()
    const actorData = data.data
    let penalty = 0

    for (const [key, value] of Object.entries(actorData.data.healthLevels)) {
      if (value.injuryTypes != "")
        penalty = value.penalty
    }

    return penalty
  }

  /**
   * Handle clickable Vampire rolls.
   * @param {Event} event   The originating click event
   * @private
   */
    _onAttributeCheckDialog(event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    const attrValue = parseInt(dataset.roll || 0 )

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="6">
          </div>
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Specialties')}</label>
              <input type="checkbox" id="inputSpecialties">
          </div>

      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('DAV20.Roll'),
        callback: async (html) => {
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const specialties = html.find('#inputSpecialties')[0].checked
          const numDice = attrValue + modifier
          this._onAttributeCheck(event, numDice, difficulty, specialties, dataset.label)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('DAV20.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('DAV20.Rolling') + ` ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  
  _onAttributeCheck(event, numDice, dificulty, specialties, attributeName) {

    let label = `
      <div class="roll-name">
        <h4 class="roll-title">${game.i18n.localize('DAV20.Rolling')} ${attributeName}</h4>
      </div>
      <br>
      <div class="roll-result">
        <h4 class="roll-title">NUMBER_OF_SUCCESS SUCCESS_PLACEHOLDER</h4>
      </div>`

    numDice = numDice + this._getHealthLevelPenalty()

    this._diceCheck(numDice, this.actor, label, dificulty, specialties)
  }

  /**
     * Handle clickable Vampire rolls.
     * @param {Event} event   The originating click event
     * @private
     */
  _onAbilityCheckDialog(event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.dataset
    let options = ''

    for (const [key, value] of Object.entries(this.actor.data.data.attributes)) {
      options = options.concat(`<option value="${key}">${game.i18n.localize(value.name)}</option>`)
    }

    const template = `
      <form>
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.SelectAbility')}</label>
              <select id="abilitySelect">${options}</select>
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="6">
          </div>
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Specialties')}</label>
              <input type="checkbox" id="inputSpecialties">
          </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('DAV20.Roll'),
        callback: async (html) => {
          const ability = html.find('#abilitySelect')[0].value
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const specialties = html.find('#inputSpecialties')[0].checked
          const abilityVal = this.actor.data.data.attributes[ability].value
          const attributeName = game.i18n.localize(this.actor.data.data.attributes[ability].name)
          const numDice = parseInt(abilityVal || 0) + parseInt(dataset.roll || 0) + modifier
          this._abilityCheck(event, numDice, difficulty, specialties, attributeName, dataset.label)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('DAV20.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('DAV20.Rolling') + ` ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  _abilityCheck(event, numDice, dificulty, specialties, attributeName, abilityName) {
    let label = 
    `<div class="roll-name">
      <h4 class="roll-title">${attributeName} + ${abilityName}</h4>
    </div>
    <br>
    <div class="roll-result">
      <h4 class="roll-title">NUMBER_OF_SUCCESS SUCCESS_PLACEHOLDER</h4>
    </div>`

    numDice = numDice + this._getHealthLevelPenalty()

    this._diceCheck(numDice, this.actor, label, dificulty, specialties)
  } 

  _onAttackCkeckDialog(event) {
    event.preventDefault()

    const template = `
      <form> 
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Modifier')}</label>
              <input type="text" id="inputMod" value="0">
          </div>  
          <div class="form-group">
              <label>${game.i18n.localize('DAV20.Difficulty')}</label>
              <input type="text" min="0" id="inputDif" value="6">
          </div>
          <div class="form-group">
          <label>${game.i18n.localize('DAV20.Specialties')}</label>
          <input type="checkbox" id="inputSpecialties">
      </div>
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('DAV20.Roll'),
        callback: async (html) => {
      
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const specialties = html.find('#inputSpecialties')[0].checked

          this._onAttackCheck(event, modifier, difficulty)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('DAV20.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('DAV20.Rolling'),
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  _onAttackCheck(event, modifier, difficulty, specialties) {

    const item = this.actor.items.get(event.currentTarget.dataset.itemId)

    const attributeValue = this._getAtributeValue(item.data.data.weapon.dice1)
    const abilityValue = this._getAbilityValue(item.data.data.weapon.dice2)

    let label = `
      <div class="roll-name">
        <img src="${item.img}" class="roll-img">
        <h4 class="roll-title">${item.name}</h4>
      </div>
      <br>
      <div class="roll-result">
        <h4 class="roll-title">NUMBER_OF_SUCCESS SUCCESS_PLACEHOLDER</h4>
      </div>`

    const dicePool = attributeValue + abilityValue + this._getHealthLevelPenalty() + modifier

    this._diceCheck(dicePool, this.actor, label, difficulty, false)
  }

  _parseRollResult(rollResult, difficulty, specialties = false) {
    let success = 0
    let criticalSuccess = 0
    let fail = 0
    let criticalFail = 0

    rollResult.terms[0].results.forEach((dice) => {
      if (dice.result === 10 && specialties)
        criticalSuccess += 2;
      else if (dice.result === 1)
        criticalFail++;
      else if (dice.result < difficulty)
        fail++;
      else
        success++;
    })

    criticalSuccess -= criticalFail;

    if (criticalSuccess < 0) {
      success -= criticalFail
      criticalSuccess = 0
    }

    return {
      "Critical Success": criticalFail,
      "Success": success,
      "Failed": fail,
      "Critical Fail": criticalFail,
      "Total": (success + criticalSuccess)
    }
  }

  _diceCheck(numDice, actor, label = '', difficulty = 6, specialties = false) {
    const dice = numDice;
    const roll = new Roll(dice + 'd10>=' + difficulty);
    const rollResult = roll.evaluate();
    const parsedRoll = this._parseRollResult(rollResult, difficulty, specialties);

    rollResult._total = parsedRoll["Total"];

    label = label.replace("NUMBER_OF_SUCCESS", String(rollResult._total))


    if (parsedRoll["Total"] == 1 || parsedRoll["Total"] == 0)
      label = label.replace("SUCCESS_PLACEHOLDER", game.i18n.localize('DAV20.Success'))
    else if (parsedRoll["Total"] > 1) 
      label = label.replace("SUCCESS_PLACEHOLDER", game.i18n.localize('DAV20.Successes'))
    else (parsedRoll["Total"] < 0)
      label = label.replace("SUCCESS_PLACEHOLDER", game.i18n.localize('DAV20.Botches'))

    rollResult.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: label
    })
  }

  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const type = header.dataset.type;
    const label = header.dataset.label;
    var newItemData = {} 

    if(type == "power")
      newItemData = this._createEmptyDiscipline(label);


    const itemData = {
      name: game.i18n.format("Name"),
      type: type,
      data: newItemData
    };
    delete itemData.data["type"];
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    if ( item ) return item.delete();
  }

  _onItemEdit(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    return item.sheet.render(true);
  }

  _createEmptyDiscipline(disciplineTree) {
    return {
      props: {
        bloodCost: 0,
        dice1: "",
        dice2: "",
        level: 1,
        disciplineTree: disciplineTree
      }
    }
  }
}