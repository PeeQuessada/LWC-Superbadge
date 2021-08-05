import { LightningElement, api, wire, track } from 'lwc';
// Functions to getRecords import
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Lightning Message Channel import
import { APPLICATION_SCOPE,subscribe,MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// Custom Labels Imports
// import labelDetails for Details
import labelDetails from '@salesforce/label/c.Details';
// import labelReviews for Reviews
import labelReviews from '@salesforce/label/c.Reviews';
// import labelAddReview for Add_Review
import labelAddReview from '@salesforce/label/c.Add_Review';
// import labelFullDetails for Full_Details
import labelFullDetails from '@salesforce/label/c.Full_Details';
// import labelPleaseSelectABoat for Please_select_a_boat
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
// import BOAT_NAME_FIELD for the boat Name
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends LightningElement {
  boatId;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord;

  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
    return this.wiredRecord && this.wiredRecord.data ? 'utility:anchor' : null;
  }

  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  // Private
  subscription = null;

  // Initialize messageContext for Message Service
  @wire(MessageContext) messageContext;

  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    if(!this.subscription){
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => {
          this.boatId = message.recordId
          console.log('entrou aqui', this.boatId)
        },
        { scope: APPLICATION_SCOPE }
      ); 
    }
  }

  // Calls subscribeMC()
  connectedCallback() {
    if (this.subscription) {
      console.log('evento ja escrito')
      return;
    }
    // Subscribe to the message channel to retrieve the recordID and assign it to boatId.
    this.subscribeMC();
  }

  // Navigates to record page
  navigateToRecordViewPage() { }

  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() { }
}
