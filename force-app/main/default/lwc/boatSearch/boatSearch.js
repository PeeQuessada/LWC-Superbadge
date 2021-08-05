import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

// imports
export default class BoatSearch extends NavigationMixin(LightningElement) {
  isLoading = false;
  boatTypeId = '';

  // Handles loading event
  handleLoading() {
    console.log('loading');
    this.isLoading = true;
  }

  // Handles done loading event
  handleDoneLoading() {
    console.log('done');
    this.isLoading = false;
  }

  // Handles search boat event
  // This custom event comes from the form
  searchBoats(event) {
    this.boatTypeId = event.detail.boatTypeId;
  }

  createNewBoat() { 
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
        objectApiName: 'Boat__c',
        actionName: 'new'
      }
    });
  }
}