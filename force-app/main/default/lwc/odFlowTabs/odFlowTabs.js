import { LightningElement, api } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';

export default class OD_FlowTabs extends LightningElement {
  // input variables
  @api title;
  @api variant;
  @api tabs;
  @api selectedTab;

  // output variables
  @api activeTab;

  theActiveTab;

  // =================================================================
  // lifecycle methods
  // =================================================================
  connectedCallback() {
    // put the default as active at the beginning
    this.theActiveTab = this.selectedTab || this.theTabs[0].value;
  }

  // =================================================================
  // getter methods
  // =================================================================
  get theTabs() {
    const result = JSON.parse(this.tabs);

    result.forEach((tab) => {
      tab.isError = tab.hasError === 'true';
      tab.showTab = !tab.hideTab || tab.hideTab !== 'true';
    });

    return result;
  }

  _doDispatchEvent() {
    const event = new FlowAttributeChangeEvent('activeTab', this.theActiveTab);
    this.dispatchEvent(event);
  }

  // =================================================================
  // handler methods
  // =================================================================
  handleActive(event) {
    this.theActiveTab = event.target.value;

    this._doDispatchEvent();
  }
}
