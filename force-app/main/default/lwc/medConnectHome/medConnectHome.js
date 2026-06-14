import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUpcomingEvents from '@salesforce/apex/MedConnectHomeController.getUpcomingEvents';
import getFeaturedSpeakers from '@salesforce/apex/FeaturedSpeakersController.getFeaturedSpeakers';

export default class MedConnectHome extends NavigationMixin(LightningElement) {
    @wire(getUpcomingEvents)
    events;

    @wire(getFeaturedSpeakers)
    speakers;

    get formattedEvents() {
        if (!this.events.data) {
            return [];
        }

        return this.events.data.map(event => {
            return {
                ...event,
                formattedStartDate: this.formatDateTime(event.Start_Date_Time__c)
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

    handleNavigateToEvents() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'events__c' 
            }
        });
    }

    handleNavigateToSpeakers() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Speakers__c' 
            }
        });
    }

    handleViewEventDetails(event) {
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