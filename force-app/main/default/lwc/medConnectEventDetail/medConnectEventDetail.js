import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getEventById from '@salesforce/apex/MedConnectHomeController.getEventById';
import registerAttendee from '@salesforce/apex/MedConnectHomeController.registerAttendee';

export default class MedConnectEventDetail extends LightningElement {
    eventId;

    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef && pageRef.state) {
            this.eventId = pageRef.state.c__eventId;
        }
    }

    @wire(getEventById, { eventId: '$eventId' })
    event;

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

    handleRegister() {
        registerAttendee({ eventId: this.eventId })
            .then(result => {
                if (result === 'SUCCESS') {
                    alert('✅ Inscrição confirmada! Verifique seu e-mail para acessar a credencial.');
                } else if (result === 'ALREADY_REGISTERED') {
                    alert('⚠️ Você já está inscrito neste evento.');
                } else {
                    alert('❌ Aviso: ' + result);
                }
            })
            .catch(error => {
                let errorMessage = 'Erro desconhecido.';
                if (error && error.body && error.body.message) {
                    errorMessage = error.body.message;
                }
                
                alert('❌ Falha ao processar: ' + errorMessage);
                console.error('Detalhe técnico do erro:', error);
            });
    }
}