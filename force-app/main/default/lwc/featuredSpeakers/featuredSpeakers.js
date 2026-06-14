import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllSpeakers from '@salesforce/apex/FeaturedSpeakersController.getAllSpeakers';
import USER_ID from '@salesforce/user/Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import YOU_ARE_FIELD from '@salesforce/schema/User.You_Are__c';

export default class FeaturedSpeakers extends NavigationMixin(LightningElement) {
    @track speakers = [];
    error;
    
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

    @wire(getAllSpeakers)
    wiredSpeakers({ error, data }) {
        if (data) {
            this.speakers = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.speakers = [];
            console.error(error);
        }
    }

    handleAddSpeaker(event) {
        event.preventDefault();
        
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Add_Speaker__c' 
            }
        });
    }
}