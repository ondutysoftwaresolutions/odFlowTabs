import { LightningElement, api, track } from 'lwc';
import FlowTabsConfigurationTabs from 'c/odFlowTabsConfigurationTabs';

export default class OD_FlowTabsConfigurationEditor extends LightningElement {
  @api builderContext;

  // popups
  showConfigureTabs = false;

  // private
  _inputVariables = [];

  @track inputValues = {
    title: {
      label: 'Title',
      helpText: 'Displays tooltip text when the mouse moves over the tabset.',
    },
    selectedTab: {
      label: 'Selected Tab',
      helpText:
        "Sets a specific tab to open by default using a string that matches a tab's value string. If not used, the first tab opens by default.",
    },
    variant: {
      label: 'Variant',
      value: 'standard',
      helpText: 'The variant changes the appearance of the tabset. Accepted variants are standard and scoped.',
    },
    tabs: {
      label: 'Tabs',
      required: true,
      helpText: 'JSON string with the tabs to display',
    },
  };

  // =================================================================
  // validate flow configuration
  // =================================================================
  @api
  validate() {
    const validity = [];

    // columns
    if (!this.inputValues.tabs.value) {
      validity.push({
        key: 'tabs',
        errorString: 'You must create at least one tab.',
      });
    }

    return validity;
  }

  // =================================================================
  // getter for inputs
  // =================================================================
  @api
  get inputVariables() {
    return this._inputVariables;
  }

  get emptyTabs() {
    return !this.inputValues.tabs.value;
  }

  get variantOptions() {
    return [
      {
        label: 'Standard',
        value: 'standard',
      },
      {
        label: 'Scoped',
        value: 'scoped',
      },
    ];
  }

  get selectedTabOptions() {
    const result = [];

    // variables
    const variables = this.builderContext.variables;
    if (variables.length > 0) {
      const variablesPerType = variables.filter((vr) => vr.dataType.toLowerCase() === 'string');

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
      const formulasPerType = formulas.filter((fml) => fml.dataType.toLowerCase() === 'string');

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
      const constantsPerType = constants.filter((cnt) => cnt.dataType.toLowerCase() === 'string');

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
  // setter for inputs
  // =================================================================
  // Set the fields with the data that was stored from the flow.
  set inputVariables(variables) {
    this._inputVariables = variables || [];
    this._initializeValues();
  }

  // =================================================================
  // getter methods
  // =================================================================

  // =================================================================
  // private methods
  // =================================================================
  _initializeValues() {
    // initialise from previous saves
    this._inputVariables.forEach((input) => {
      if (input.name && input.value != null) {
        if (this.inputValues[input.name] != null) {
          this.inputValues[input.name].value = input.value;
        }
      }
    });
  }

  _doDispatchChange(detail) {
    const valueChangedEvent = new CustomEvent('configuration_editor_input_value_changed', {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail,
    });
    this.dispatchEvent(valueChangedEvent);
  }

  // =================================================================
  // handler methods
  // =================================================================
  handleInputChange(event) {
    if (event && event.detail) {
      let value = event.detail.value;

      // dispatch the change
      const detail = {
        name: event.target.name,
        newValue: value ? value : null,
        newValueDataType: 'string',
      };

      this._doDispatchChange(detail);
    }
  }

  async handleOpenTabsConfigurator() {
    // open the modal
    const resultModal = await FlowTabsConfigurationTabs.open({
      tabs: this.inputValues.tabs.value,
      builderContext: this.builderContext,
      size: 'medium',
    });

    if (resultModal) {
      const detail = {
        name: 'tabs',
        newValue: resultModal,
        newValueDataType: 'string',
      };

      this._doDispatchChange(detail);
    }
  }
}
