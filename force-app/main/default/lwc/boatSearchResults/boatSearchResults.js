import { LightningElement, api, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

import { refreshApex } from '@salesforce/apex';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

const COLUMNS = [
  { label: 'Name', fieldName: 'Name', editable: true },
  { label: 'Length', fieldName: 'Length__c', editable: true},
  { label: 'Price', fieldName: 'Price__c', editable: true},
  { label: 'Description', fieldName: 'Description__c', editable: true}
];

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
const LOADING_EVENT = 'loading';
const DONE_LOADING_EVENT = 'doneloading';
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = COLUMNS;

  boatTypeId = '';
  @track boats;
  @track saveDraftValues = [];
  isLoading;
  error = undefined;
  
  // wired message context
  @wire(MessageContext) messageContext;

  // wired getBoats method 
  @wire(getBoats, { boatTypeId: '$boatTypeId'})  
  wiredBoats({ error, data }) {
    if(data) {
      this.isLoading = true;
      this.dispatchEvent(new CustomEvent('loading'));
      console.log('Data ', JSON.stringify(data));
      this.boats = data;

      this.dispatchEvent(new CustomEvent('doneloading'));
      this.isLoading = false;
    }
    else if(error) {
      console.log('error ', JSON.stringify(error));
    }
  }

  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) { 
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId = boatTypeId;

    this.isLoading = false;
    this.notifyLoading(this.isLoading); 
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api
  async refresh() {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);      

    await refreshApex(this.boats);

    this.isLoading = false;
    this.notifyLoading(this.isLoading); 
  }

  // this function must update selectedBoatId and call sendMessageService 
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    publish(this.messageContext, BOATMC, { recordId : boatId });
  }

  // The handleSave method must save the changes in the Boat Editor 
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    const recordInputs = event.detail.draftValues.slice().map(draft => {
      const fields = Object.assign({}, draft);
      return { fields };
    });

    const promises = recordInputs.map(recordInput => updateRecord(recordInput));

    Promise.all(promises)
      .then(() => {
          const toastEvent = new ShowToastEvent({
            title : SUCCESS_TITLE,
            message : MESSAGE_SHIP_IT,
            variant : SUCCESS_VARIANT
        });
        this.dispatchEvent(toastEvent);

        this.refresh();
      })
      .catch( error => {
          this.error = error;

          const toastEvent = new ShowToastEvent({
            title : ERROR_TITLE,
            message : error.body.message,
            variant : ERROR_VARIANT
          });
          this.dispatchEvent(toastEvent);
      }).finally(() => {
          this.draftValues = [];
      });
  }
  
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 
    let eventType;

    if (isLoading) {
        eventType = new CustomEvent(LOADING_EVENT);
    } else {
        eventType = new CustomEvent(DONE_LOADING_EVENT);
    }

    this.dispatchEvent(eventType)
  }

}