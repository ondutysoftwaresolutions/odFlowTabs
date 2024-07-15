import { api, track } from 'lwc';
import LightningModal from 'lightning/modal';

export default class OD_FlowTabsConfigurationTabs extends LightningModal {
  @api tabs;
  @api builderContext;

  @track theTabs = [];

  // =================================================================
  // lifecycle methods
  // =================================================================
  connectedCallback() {
    this.theTabs = this.tabs ? JSON.parse(this.tabs) : [];
  }

  // =================================================================
  // getters methods
  // =================================================================
  get disabledSave() {
    return this.theTabs.length === 0;
  }

  get booleanOptions() {
    const result = [];

    // variables
    const variables = this.builderContext.variables;
    if (variables.length > 0) {
      const variablesPerType = variables.filter((vr) => vr.dataType.toLowerCase() === 'boolean');

      if (variablesPerType.length > 0) {
        variablesPerType.forEach((vpo) => {
          result.push({
            label: vpo.name,
            value: `{!${vpo.name}}`,
          });
        });
      }
    }

    // formulas
    const formulas = this.builderContext.formulas;
    if (formulas.length > 0) {
      const formulasPerType = formulas.filter((fml) => fml.dataType.toLowerCase() === 'boolean');

      if (formulasPerType.length > 0) {
        formulasPerType.forEach((fml) => {
          result.push({
            label: fml.name,
            value: `{!${fml.name}}`,
          });
        });
      }
    }

    // constants
    const constants = this.builderContext.constants;
    if (constants.length > 0) {
      const constantsPerType = constants.filter((cnt) => cnt.dataType.toLowerCase() === 'boolean');

      if (constantsPerType.length > 0) {
        constantsPerType.forEach((cnt) => {
          result.push({
            label: cnt.name,
            value: `{!${cnt.name}}`,
          });
        });
      }
    }

    return result;
  }

  // =================================================================
  // private methods
  // =================================================================
  _addDataAndOrder(tabs) {
    let result = this._sortArrayByProperty(tabs, 'order');
    const elementsWithOrder = result.filter((tb) => tb.order);
    let lastElement;

    if (elementsWithOrder.length > 0) {
      lastElement = elementsWithOrder[elementsWithOrder.length - 1];
    } else {
      lastElement = { order: 0 };
    }

    let iteration = 1;
    result = result.map((tab) => {
      if (!tab.order) {
        let newTab = {};

        newTab.order = lastElement.order + 10 * iteration;

        iteration++;

        return { ...tab, ...newTab };
      }
      return tab;
    });

    return result;
  }

  _sortArrayByProperty(array, property) {
    return array.sort((a, b) => {
      const aProp = a[property] || 9998;
      const bProp = b[property] || 9999;
      const fa = isNaN(aProp) ? aProp.toLowerCase() : aProp;
      const fb = isNaN(bProp) ? bProp.toLowerCase() : bProp;

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }

      return 0;
    });
  }

  // =================================================================
  // handler methods
  // =================================================================
  handleUpdateField(event) {
    const value = event.detail.value;
    const tabValue = event.target.dataset.value;
    const name = event.target.name;

    // update the right field in the arrays
    // tabs array
    const tabIndex = this.theTabs.findIndex((tb) => tb.value === tabValue);

    this.theTabs[tabIndex] = {
      ...this.theTabs[tabIndex],
      [name]: value,
    };
  }

  handleClose() {
    this.close();
  }

  handleSave() {
    this.handleReorder();

    // dispatch the close
    this.close(JSON.stringify(this.theTabs));
  }

  handleReorder() {
    this.theTabs = this._sortArrayByProperty(this.theTabs, 'order');
  }

  handleAddTab() {
    const tabsPlusNew = JSON.parse(JSON.stringify(this.theTabs));

    tabsPlusNew.push({
      label: `Tab ${tabsPlusNew.length + 1}`,
      value: `tab_${tabsPlusNew.length + 1}`,
    });

    this.theTabs = this._addDataAndOrder(tabsPlusNew);
  }

  handleDeleteTab(event) {
    const value = event.target.dataset.value;

    const deletedIndex = this.theTabs.findIndex((tab) => tab.value === value);
    if (deletedIndex !== -1) {
      this.theTabs.splice(deletedIndex, 1);
    }
  }
}
