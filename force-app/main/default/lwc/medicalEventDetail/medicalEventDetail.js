import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

import LOCATION_FIELD from '@salesforce/schema/Medical_Event__c.Location__c';

import getEventSpeakers from '@salesforce/apex/MedicalEventController.getEventSpeakers';
import getEventAttendees from '@salesforce/apex/MedicalEventController.getEventAttendees';

export default class MedicalEventDetail extends NavigationMixin(LightningElement) {
    @api recordId;

    speakers;
    attendees;

    speakerColumns = [
        { label: 'Nome', fieldName: 'SpeakerName' },
        { label: 'Email', fieldName: 'SpeakerEmail', type: 'email' },
        { label: 'Telefone', fieldName: 'SpeakerPhone', type: 'phone' },
        { label: 'Especialização', fieldName: 'SpeakerSpecialisation' }
    ];

    attendeeColumns = [
        { label: 'Nome', fieldName: 'AttendeeName' },
        { label: 'Email', fieldName: 'AttendeeEmail', type: 'email' },
        { label: 'Telefone', fieldName: 'AttendeePhone', type: 'phone' },
        { label: 'Empresa', fieldName: 'AttendeeCompany' }
    ];

    @wire(getRecord, { recordId: '$recordId', fields: [LOCATION_FIELD] })
    eventRecord;

    get locationId() {
        return getFieldValue(this.eventRecord.data, LOCATION_FIELD);
    }

    @wire(getEventSpeakers, { eventId: '$recordId' })
    wiredSpeakers({ error, data }) {
        if (data) {
            this.speakers = data.map(row => {
                return {
                    Id: row.Id,
                    SpeakerName: row.Speaker__r ? row.Speaker__r.Name : 'N/A',
                    SpeakerEmail: row.Speaker__r ? row.Speaker__r.Email__c : '',
                    SpeakerPhone: row.Speaker__r ? row.Speaker__r.Phone__c : '',
                    SpeakerSpecialisation: row.Speaker__r ? row.Speaker__r.Specialisation__c : ''
                };
            });
        } else if (error) {
            console.error('Erro ao buscar palestrantes', error);
        }
    }

    @wire(getEventAttendees, { eventId: '$recordId' })
    wiredAttendees({ error, data }) {
        if (data) {
            this.attendees = data.map(row => {
                return {
                    Id: row.Id,
                    AttendeeName: row.Attendee__r ? row.Attendee__r.Name : 'N/A',
                    AttendeeEmail: row.Attendee__r ? row.Attendee__r.Email__c : '',
                    AttendeePhone: row.Attendee__r ? row.Attendee__r.Phone__c : '',
                    AttendeeCompany: row.Attendee__r ? row.Attendee__r.Company__c : ''
                };
            });
        } else if (error) {
            console.error('Erro ao buscar participantes', error);
        }
    }

    handleRegister() {
        window.location.href = `/confirmacao-inscricao?c__eventId=${this.recordId}`;
    }

    handleNewSpeaker() {
        const defaultValues = encodeDefaultFieldValues({
            Medical_Event__c: this.recordId
        });

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Event_Speaker__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: defaultValues
            }
        });
    }

    handleNewAttendee() {
        const defaultValues = encodeDefaultFieldValues({
            Medical_Event__c: this.recordId
        });

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Event_Attendee__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues: defaultValues
            }
        });
    }
}