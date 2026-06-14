import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import NAME_FIELD from '@salesforce/schema/Speaker__c.Name';
import PROFILE_URL_FIELD from '@salesforce/schema/Speaker__c.Profile_URL__c';
import ABOUT_ME_FIELD from '@salesforce/schema/Speaker__c.About_Me__c';
import SPECIALISATION_FIELD from '@salesforce/schema/Speaker__c.Specialisation__c';

const FIELDS = [NAME_FIELD, PROFILE_URL_FIELD, ABOUT_ME_FIELD, SPECIALISATION_FIELD];

export default class SpeakerTile extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    speaker;

    get name() {
        return getFieldValue(this.speaker.data, NAME_FIELD);
    }

    get profileUrl() {
        return getFieldValue(this.speaker.data, PROFILE_URL_FIELD);
    }

    get aboutMe() {
        return getFieldValue(this.speaker.data, ABOUT_ME_FIELD);
    }

    get specialisation() {
        return getFieldValue(this.speaker.data, SPECIALISATION_FIELD);
    }
}