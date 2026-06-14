import { LightningElement, track, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import getCurrentOrganizerId from '@salesforce/apex/AddEventFormController.getCurrentOrganizerId';

export default class AddEventForm extends NavigationMixin(LightningElement) {
    @track eventData = {
        Live__c: true,
        Recurring__c: false
    };

    @wire(getCurrentOrganizerId)
    wiredOrganizer({ error, data }) {
        if (data) {
            this.eventData = {
                ...this.eventData,
                Organizers__c: data
            };
        } else if (error) {
            this.errorMessage = 'Não foi possível identificar o organizador logado.';
            console.error('Erro ao buscar organizador:', error);
        }
    }

    selectedSpeakerId = '';
    errorMessage = '';
    successMessage = '';
    isSaving = false;

    statusOptions = [
        { label: 'Criado', value: 'Created' },
        { label: 'Publicado', value: 'Published' },
        { label: 'Em Andamento', value: 'In Progress' },
        { label: 'Concluído', value: 'Completed' },
        { label: 'Adiado', value: 'Postponed' },
        { label: 'Cancelado', value: 'Cancelled' }
    ];

    typeOptions = [
        { label: 'Presencial', value: 'In-Person' },
        { label: 'Virtual', value: 'Virtual' }
    ];

    frequencyOptions = [
        { label: 'Diária', value: 'Daily' },
        { label: 'Semanal', value: 'Weekly' }
    ];

    get showFrequency() {
        return this.eventData.Recurring__c === true;
    }

    get showLocation() {
        return this.eventData.Event_Type__c === 'In-Person';
    }

    get saveButtonLabel() {
        return this.isSaving ? 'Criando evento...' : 'Criar Evento';
    }

    handleChange(event) {
        const field = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value;
        }

        this.eventData = {
            ...this.eventData,
            [field]: value
        };

        if (field === 'Recurring__c' && value === false) {
            const updatedData = { ...this.eventData };
            delete updatedData.Frequency__c;
            this.eventData = updatedData;
        }

        if (field === 'Event_Type__c' && value === 'Virtual') {
            const updatedData = { ...this.eventData };
            delete updatedData.Location__c;
            this.eventData = updatedData;
        }
    }

    handleLocationChange(event) {
        this.eventData = {
            ...this.eventData,
            Location__c: event.detail.recordId
        };
    }

    handleSpeakerChange(event) {
        this.selectedSpeakerId = event.detail.recordId;
    }

    validateForm() {
        const inputs = [
            ...this.template.querySelectorAll(
                'lightning-input, lightning-combobox, lightning-record-picker, lightning-textarea'
            )
        ];

        const allInputsValid = inputs.reduce((validSoFar, input) => {
            if (typeof input.reportValidity === 'function') {
                return input.reportValidity() && validSoFar;
            }

            return validSoFar;
        }, true);

        if (!allInputsValid) {
            this.errorMessage = 'Revise os campos destacados antes de continuar.';
            return false;
        }

        if (Number(this.eventData.Max_Seats__c) <= 0) {
            this.errorMessage = 'O máximo de participantes deve ser maior que zero.';
            return false;
        }

        if (this.eventData.Event_Type__c === 'In-Person' && !this.eventData.Location__c) {
            this.errorMessage = 'Eventos presenciais precisam de uma localização.';
            return false;
        }

        if (this.eventData.Event_Type__c === 'Virtual' && this.eventData.Location__c) {
            this.errorMessage = 'Eventos virtuais não devem possuir localização.';
            return false;
        }

        if (this.eventData.Recurring__c === true && !this.eventData.Frequency__c) {
            this.errorMessage = 'Eventos recorrentes precisam de uma frequência.';
            return false;
        }

        if (!this.eventData.Organizers__c) {
            this.errorMessage = 'Não foi possível identificar o organizador responsável pelo evento.';
            return false;
        }

        const startDateTime = new Date(this.eventData.Start_Date_Time__c);
        const endDateTime = new Date(this.eventData.End_Date_Time__c);

        if (endDateTime <= startDateTime) {
            this.errorMessage = 'A data de término deve ser posterior à data de início.';
            return false;
        }

        return true;
    }

    handleSave() {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.validateForm()) {
            return;
        }

        this.isSaving = true;

        const fields = {
            ...this.eventData
        };

        const eventRecordInput = {
            apiName: 'Medical_Event__c',
            fields
        };

        createRecord(eventRecordInput)
            .then((eventResult) => {
                if (!this.selectedSpeakerId) {
                    return {
                        eventId: eventResult.id,
                        speakerLinked: false
                    };
                }

                const speakerLinkRecordInput = {
                    apiName: 'Event_Speaker__c',
                    fields: {
                        Medical_Event__c: eventResult.id,
                        Speaker__c: this.selectedSpeakerId
                    }
                };

                return createRecord(speakerLinkRecordInput).then(() => {
                    return {
                        eventId: eventResult.id,
                        speakerLinked: true
                    };
                });
            })
            .then((result) => {
                this.successMessage = result.speakerLinked
                    ? 'Evento criado com sucesso e palestrante vinculado.'
                    : 'Evento criado com sucesso.';

                setTimeout(() => {
                    this[NavigationMixin.Navigate]({
                        type: 'comm__namedPage',
                        attributes: {
                            name: 'custom_evento_mdico_detail2__c'
                        },
                        state: {
                            c__eventId: result.eventId
                        }
                    });
                }, 1200);
            })
            .catch((error) => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Detalhe Técnico:', JSON.parse(JSON.stringify(error)));
            })
            .finally(() => {
                this.isSaving = false;
            });
    }

    extractErrorMessage(error) {
        if (!error) {
            return 'Erro desconhecido ao criar evento.';
        }

        if (error.body && error.body.output) {
            if (error.body.output.errors && error.body.output.errors.length > 0) {
                return error.body.output.errors[0].message;
            }

            if (error.body.output.fieldErrors) {
                const fieldErrors = error.body.output.fieldErrors;
                const firstField = Object.keys(fieldErrors)[0];

                if (firstField && fieldErrors[firstField] && fieldErrors[firstField].length > 0) {
                    return `Erro no campo ${firstField}: ${fieldErrors[firstField][0].message}`;
                }
            }
        }

        if (error.body && error.body.message) {
            return error.body.message;
        }

        if (error.message) {
            return error.message;
        }

        return 'Erro desconhecido ao criar evento.';
    }
}