import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLocations from '@salesforce/apex/LocationController.getLocations';
import USER_ID from '@salesforce/user/Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import YOU_ARE_FIELD from '@salesforce/schema/User.You_Are__c';

export default class MedConnectLocationsPage extends NavigationMixin(LightningElement) {

    @wire(getLocations)
    locations;

    isOrganizer = false;

    @wire(getRecord, { recordId: USER_ID, fields: [YOU_ARE_FIELD] })
    userData({ error, data }) {
        if (data) {
            const role = getFieldValue(data, YOU_ARE_FIELD);
            this.isOrganizer = (role === 'Organizer');
        } else if (error) {
            console.error('Erro ao verificar permissão do usuário', error);
        }
    }

    handleAddLocation(event) {
        event.preventDefault();
        
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'AddLocation__c' 
            }
        });
    }
}