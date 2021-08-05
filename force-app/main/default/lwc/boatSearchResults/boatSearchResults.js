import { LightningElement, api, wire, track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

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

export default class BoatSearchResults extends LightningElement {
  @api boatTypeId = '';
  @track boats;
  isLoading;
  selectedBoatId;

  columns = COLUMNS;
  saveDraftValues = [];

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

  updateSelectedTile(event) {
    const detail = event.detail;
    this.selectedBoatId = detail.boatId;
  }

  async handleSave(event) {
    console.log('save')
    this.saveDraftValues = event.detail.draftValues;
    const notifyChangeIds = this.saveDraftValues.map(row => { return { "recordId": row.Id } });

    await updateBoatList({ data: this.saveDraftValues })
      .then((result) => {
        console.log('result success');
        refreshApex(this.wiredBoats);
        this.dispatchEvent(
          new ShowToastEvent({
            variant: SUCCESS_VARIANT,
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
          })
        );
        this.saveDraftValues = [];

        // Refresh LDS cache and wires
        getRecordNotifyChange(notifyChangeIds);

        // Display fresh data in the datatable
        refreshApex(this.boats);
        refreshApex(this.wiredBoats);
      })
      .catch((error) => {
        console.log('error ', error);

        this.dispatchEvent(
          new ShowToastEvent({
            variant: ERROR_VARIANT,
            title: CONST_ERROR,
            message: error,
          })
        );
      })
    
  }
}