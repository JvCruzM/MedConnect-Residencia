import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class AddAttendeem extends NavigationMixin(LightningElement) {

    handleSuccess(event) {
        const newAttendeeId = event.detail.id;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!',
                message: 'Attendee registered successfully!',
                variant: 'success'
            })
        );

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: newAttendeeId,
                objectApiName: 'Attendee__c',
                actionName: 'view'
            }
        });
    }

    handleReset() {
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
}