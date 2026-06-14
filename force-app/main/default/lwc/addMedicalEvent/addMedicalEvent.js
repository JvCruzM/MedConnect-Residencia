import { LightningElement } from 'lwc';

import { createRecord } from 'lightning/uiRecordApi';

import { NavigationMixin } from 'lightning/navigation';

export default class AddMedicalEvent extends NavigationMixin(
    LightningElement
) {

    name;
    organizerId;
    startDate;
    endDate;
    maxAttendees;
    locationId;
    eventDetail;

    handleName(event) {
        this.name = event.target.value;
    }

    handleOrganizer(event) {
        this.organizerId = event.detail;
    }

    handleStartDate(event) {
        this.startDate = event.target.value;
    }

    handleEndDate(event) {
        this.endDate = event.target.value;
    }

    handleMaxAttendees(event) {
        this.maxAttendees = event.target.value;
    }

    handleLocation(event) {
        this.locationId = event.detail;
    }

    handleEventDetail(event) {
        this.eventDetail = event.target.value;
    }

    createEvent() {

        const fields = {

            Name__c: this.name,
            Organizers__c: this.organizerId,
            Start_Date_Time__c: this.startDate,
            End_Date_Time__c: this.endDate,
            Max_Seats__c: this.maxAttendees,
            Location__c: this.locationId,
            Event_Detail__c: this.eventDetail
        };

        const recordInput = {
            apiName: 'Medical_Event__c',
            fields
        };

        createRecord(recordInput)
            .then(result => {

                this[NavigationMixin.Navigate]({

                    type: 'standard__recordPage',

                    attributes: {
                        recordId: result.id,
                        objectApiName: 'Medical_Event__c',
                        actionName: 'view'
                    }
                });

            })
            .catch(error => {

                console.log(JSON.stringify(error));

                console.log(error.body.output.fieldErrors);

                console.error(error);

            });
    }
}