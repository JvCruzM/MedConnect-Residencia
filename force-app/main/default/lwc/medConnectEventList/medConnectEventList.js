import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUpcomingEvents from '@salesforce/apex/MedConnectHomeController.getUpcomingEvents';

export default class MedConnectEventList extends NavigationMixin(LightningElement) {
    searchTerm = '';

    @wire(getUpcomingEvents)
    events;

    get filteredEvents() {
        if (!this.events.data) {
            return [];
        }

        let eventList = this.events.data;

        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();

            eventList = eventList.filter(event => {
                const name = event.Name__c ? event.Name__c.toLowerCase() : '';
                const status = event.Status__c ? event.Status__c.toLowerCase() : '';

                return name.includes(search) || status.includes(search);
            });
        }

        return eventList.map(event => {
            return {
                ...event,
                formattedDate: this.formatDateTime(event.Start_Date_Time__c)
            };
        });
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

    handleSearch(event) {
        this.searchTerm = event.target.value;
    }

    handleViewDetails(event) {
        const eventId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'custom_evento_mdico_detail2__c'
            },
            state: {
                c__eventId: eventId
            }
        });
    }
}