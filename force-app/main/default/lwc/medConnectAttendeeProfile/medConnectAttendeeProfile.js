import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';

import NAME_FIELD from '@salesforce/schema/User.Name';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import USERNAME_FIELD from '@salesforce/schema/User.Username';
import YOU_ARE_FIELD from '@salesforce/schema/User.You_Are__c';

import getMyEvents from '@salesforce/apex/AttendeeProfileController.getMyEvents';

export default class MedConnectAttendeeProfile extends NavigationMixin(LightningElement) {
    events = [];
    eventsError;
    userError;

    @wire(getRecord, {
        recordId: USER_ID,
        fields: [NAME_FIELD, EMAIL_FIELD, USERNAME_FIELD, YOU_ARE_FIELD]
    })
    user;

    @wire(getMyEvents)
    wiredEvents({ error, data }) {
        if (data) {
            this.events = data.map(event => {
                return {
                    ...event,
                    formattedStartDate: this.formatDateTime(event.startDate),
                    isPast: this.isPastEvent(event.startDate)
                };
            });

            this.eventsError = undefined;
        } else if (error) {
            this.events = [];
            this.eventsError = error;
            console.error('Erro ao buscar eventos do participante:', error);
        }
    }

    get userName() {
        return getFieldValue(this.user.data, NAME_FIELD) || 'Participante';
    }

    get userEmail() {
        return getFieldValue(this.user.data, EMAIL_FIELD) || 'Email não informado';
    }

    get username() {
        return getFieldValue(this.user.data, USERNAME_FIELD) || 'Username não informado';
    }

    get userRole() {
        return getFieldValue(this.user.data, YOU_ARE_FIELD);
    }

    get userRoleLabel() {
        if (this.userRole === 'Organizer') {
            return 'Organizador';
        }

        if (this.userRole === 'Attendee') {
            return 'Participante';
        }

        return 'Não informado';
    }

    get initials() {
        if (!this.userName) {
            return '👤';
        }

        const names = this.userName.trim().split(' ');

        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }

    get totalEvents() {
        return this.events.length;
    }

    get upcomingEvents() {
        return this.events.filter(event => !event.isPast).length;
    }

    get completedEvents() {
        return this.events.filter(event => event.isPast).length;
    }

    get hasEvents() {
        return this.events && this.events.length > 0;
    }

    get hasUserData() {
        return this.user && this.user.data;
    }

    formatDateTime(value) {
        if (!value) {
            return 'Data não informada';
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

    isPastEvent(value) {
        if (!value) {
            return false;
        }

        return new Date(value).getTime() < new Date().getTime();
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