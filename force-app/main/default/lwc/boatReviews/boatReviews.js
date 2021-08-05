// imports
import { LightningElement, api, wire, track } from 'lwc';

import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews'

import { ShowToastEvent } from 'lightning/platformShowToastEvent'

export default class BoatReviews extends LightningElement {
  // Private
  boatId;
  error;
  boatReviews;
  isLoading;
  
  // Getter and Setter to allow for logic to run on recordId change
  @api
  get recordId() { 
    return boatId;
  }
  set recordId(value) {
    //sets boatId attribute
    this.boatId = value;
    //sets boatId assignment
    this.setAttribute('boatId', value);
    //get reviews associated with boatId
    getReviews();
  }
  
  // Getter to determine if there are reviews to display
  get reviewsToShow() {
    return this.boatReviews && this.boatReviews != null && this.boatReviews != undefined && this.boatReviews.length > 0
  }
  
  // Public method to force a refresh of the reviews invoking getReviews
  @api
  refresh() { 
    this.getReviews();
  }
  
  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  getReviews() {
    this.isLoading = true;

    getAllReviews({boatId: this.boatId})
      .then(result => {
        console.log('result ', result);
        this.boatReviews = result;
      })
      .catch(error => {
        console.log('error ', error);
        this.error = error;
      })
      .finally(() => {
        this.isLoading = false;
      })

  }
  
  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) {  }
}
