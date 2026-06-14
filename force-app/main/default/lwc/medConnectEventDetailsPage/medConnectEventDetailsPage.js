import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getEventById from '@salesforce/apex/MedConnectHomeController.getEventById';

export default class MedConnectEventDetailsPage extends LightningElement {
    eventId;

    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef && pageRef.state) {
            this.eventId =
                pageRef.state.c__eventId ||
                pageRef.state.eventId;
        }
    }

    @wire(getEventById, { eventId: '$eventId' })
    event;

    get hasEvent() {
        return this.event && this.event.data;
    }

    get formattedStartDate() {
    return this.event?.data
        ? this.formatDateTime(this.event.data.Start_Date_Time__c)
        : '';
    }

    get formattedEndDate() {
        return this.event?.data
            ? this.formatDateTime(this.event.data.End_Date_Time__c)
            : '';
    }

    formatDateTime(value) {
        if (!value) {
            return '';
        }

        return new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(new Date(value));
    }
}