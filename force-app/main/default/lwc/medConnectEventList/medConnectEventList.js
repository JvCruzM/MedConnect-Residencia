import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import getEventsForList from '@salesforce/apex/MedConnectHomeController.getEventsForList';
import getCurrentOrganizerIdIfExists from '@salesforce/apex/AddEventFormController.getCurrentOrganizerIdIfExists';
import deleteEvent from '@salesforce/apex/AddEventFormController.deleteEvent';

export default class MedConnectEventList extends NavigationMixin(LightningElement) {
    searchTerm = '';
    currentOrganizerId;
    rawEvents = [];
    filteredEvents = [];

    errorMessage = '';
    successMessage = '';
    wiredEventsResult;

    @wire(getCurrentOrganizerIdIfExists)
    wiredOrganizer({ error, data }) {
        if (data) {
            this.currentOrganizerId = data;
            this.applyFilters();
        } else if (error) {
            this.currentOrganizerId = null;
            console.error('Erro ao identificar organizador:', error);
        }
    }

    @wire(getEventsForList)
    wiredEvents(result) {
        this.wiredEventsResult = result;

        const { error, data } = result;

        if (data) {
            this.rawEvents = data;
            this.errorMessage = '';
            this.applyFilters();
        } else if (error) {
            this.rawEvents = [];
            this.filteredEvents = [];
            this.errorMessage = 'Não foi possível carregar os eventos.';
            console.error('Erro ao carregar eventos:', error);
        }
    }

    get hasEvents() {
        return this.filteredEvents && this.filteredEvents.length > 0;
    }

    applyFilters() {
        let eventList = this.rawEvents || [];

        if (this.searchTerm) {
            const search = this.searchTerm.toLowerCase();

            eventList = eventList.filter(event => {
                const name = event.Name__c ? event.Name__c.toLowerCase() : '';
                const status = event.Status__c ? event.Status__c.toLowerCase() : '';

                return name.includes(search) || status.includes(search);
            });
        }

        this.filteredEvents = eventList.map(event => {
            return {
                ...event,
                formattedDate: this.formatDateTime(event.Start_Date_Time__c),
                statusLabel: this.formatStatus(event.Status__c),
                canManage: this.currentOrganizerId && event.Organizers__c === this.currentOrganizerId
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

    formatStatus(status) {
        const statusMap = {
            Created: 'Criado',
            Published: 'Publicado',
            'In Progress': 'Em Andamento',
            Completed: 'Concluído',
            Postponed: 'Adiado',
            Cancelled: 'Cancelado'
        };

        return statusMap[status] || status || 'Não informado';
    }

    handleSearch(event) {
        this.searchTerm = event.target.value;
        this.applyFilters();
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

    handleEdit(event) {
        const eventId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: `/add-event-form?c__eventId=${eventId}`
            }
        });
    }

    handleDelete(event) {
        const eventId = event.currentTarget.dataset.id;
        const eventName = event.currentTarget.dataset.name;

        const confirmed = window.confirm(
            `Tem certeza que deseja excluir o evento "${eventName}"?`
        );

        if (!confirmed) {
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        deleteEvent({ eventId })
            .then(() => {
                this.successMessage = 'Evento excluído com sucesso.';
                return refreshApex(this.wiredEventsResult);
            })
            .then(() => {
                this.applyFilters();
            })
            .catch(error => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Erro ao excluir evento:', JSON.parse(JSON.stringify(error)));
            });
    }

    extractErrorMessage(error) {
        if (!error) {
            return 'Erro desconhecido.';
        }

        if (error.body && error.body.message) {
            return error.body.message;
        }

        if (error.message) {
            return error.message;
        }

        return 'Erro desconhecido.';
    }
}