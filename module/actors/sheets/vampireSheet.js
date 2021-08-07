
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

  /** @override */
  getData() {
    const data = super.getData();
    const actorData = data.data;
    data.config = CONFIG.DAV20;

    let powers = data.items.filter(function (item) { return item.type == "power" })
    let weapons = data.items.filter(function (item) { return item.type == "weapon" })
    let meritsAndFlaws = data.items.filter(function (item) { return item.type == "merits&flaws" })
    let flaws = data.items.filter(function (item) { return item.type == "weapon" })

    const disciplines = this._formatDisciplinesAndPowers(data, powers)
    this._formatMeritsAndFlaws(data, meritsAndFlaws)

    data.disciplines = disciplines;
    data.weapons = weapons;

    data.actor = actorData;
    data.data = actorData.data;

    // Owned Items
    data.items = actorData.items;
    for (let i of data.items) {
      const item = this.actor.items.get(i._id);
      i.labels = item.labels;
    }

    return data;
  }

  _formatDisciplinesAndPowers(data, powers) {
    const disciplines = new Map();

    powers.forEach(power => {
      const key = power.data.props.disciplineTree;

      if (disciplines.has(key)) {
        disciplines.get(key).powers.push(power);
      } else {
        const value = {
          level: 1,
          label: power.data.props.disciplineTree,
          powers: []
        };

        value.powers.push(power);
        disciplines.set(key, value);
      }

    });

    // Sort the spellbook by section level
    const sorted = Object.fromEntries(disciplines);

    return sorted;
  }

  _formatMeritsAndFlaws(data, meritsAndFlaws) {

    data.merits = meritsAndFlaws.filter(function (item) {
      const merits = item.data.meritsAndFlaws.meritsOrFlaws == "Merits"
      return merits
    })

    data.flaws = meritsAndFlaws.filter(function (item) {return item.data.meritsAndFlaws.meritsOrFlaws == "Flaws"})
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
    html.find('.abilityCheck').click(this._onVampireRollDialog.bind(this))
    //html.find('.resource-value-empty').click(this._onDotCounterEmpty.bind(this))

     
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

  /**
     * Handle clickable Vampire rolls.
     * @param {Event} event   The originating click event
     * @private
     */
  _onVampireRollDialog(event) {
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
      </form>`

    let buttons = {}
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize('VTM5E.Roll'),
        callback: async (html) => {
          const ability = html.find('#abilitySelect')[0].value
          const modifier = parseInt(html.find('#inputMod')[0].value || 0)
          const difficulty = parseInt(html.find('#inputDif')[0].value || 0)
          const abilityVal = this.actor.data.data.attributes[ability].value
          const abilityName = game.i18n.localize(this.actor.data.data.attributes[ability].name)
          const numDice = abilityVal + parseInt(dataset.roll) + modifier
          this._abilityCheck(numDice, this.actor, `${dataset.label} + ${abilityName}`, difficulty, true)
          // this._vampireRoll(numDice, this.actor, `${dataset.label} + ${abilityName}`, difficulty)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize('VTM5E.Cancel')
      }
    }

    new Dialog({
      title: game.i18n.localize('VTM5E.Rolling') + ` ${dataset.label}...`,
      content: template,
      buttons: buttons,
      default: 'draw'
    }).render(true)
  }

  _abilityCheck(numDice, actor, label = '', difficulty = 6, specialties = false) {
    const dice = numDice;
    const roll = new Roll(dice + 'd10');
    const rollResult = roll.evaluate();
    const parsedRoll = this._parseRollResult(rollResult, difficulty);

    rollResult._total = parsedRoll["Total"];

    rollResult.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      flavor: label
    })
  }

  _parseRollResult(rollResult, difficulty) {
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
      success -= criticalFail;
    }

    return {
      "Critical Success": criticalFail,
      "Success": success,
      "Failed": fail,
      "Critical Fail": criticalFail,
      "Total": (success + criticalSuccess)
    }
  }

  _rollDice(numDice, actor, label = '', difficulty = 6) {

    const dice = numDice;
    const roll = new Roll(dice + 'd10');
    const rollResult = roll.evaluate();

    let difficultyResult = '<span></span>'
    let success = 0
    let hungerSuccess = 0
    let critSuccess = 0
    let hungerCritSuccess = 0
    let fail = 0

    rollResult.terms[0].results.forEach((dice) => {
      if (dice.success) {
        if (dice.result === 10) {
          critSuccess++
        } else {
          success++
        }
      } else {
        fail++
      }
    })

    let totalCritSuccess = 0
    totalCritSuccess = Math.floor((critSuccess + hungerCritSuccess) / 2)
    const totalSuccess = (totalCritSuccess * 2) + success + hungerSuccess + critSuccess + hungerCritSuccess
    let successRoll = false
    if (difficulty !== 0) {
      successRoll = totalSuccess >= difficulty
      difficultyResult = `( <span class="danger">${game.i18n.localize('VTM5E.Fail')}</span> )`
      if (successRoll) {
        difficultyResult = `( <span class="success">${game.i18n.localize('VTM5E.Success')}</span> )`
      }
    }

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

  // There's gotta be a better way to do this but for the life of me I can't figure it out
  _assignToActorField(fields, value) {
    const actorData = duplicate(this.actor)
    // update actor owned items
    if (fields.length === 2 && fields[0] === 'items') {
      for (const i of actorData.items) {
        if (fields[1] === i._id) {
          i.data.points = value
          break
        }
      }
    } else {
      const lastField = fields.pop()
      fields.reduce((data, field) => data[field], actorData)[lastField] = value
    }
    this.actor.update(actorData)
  }

}