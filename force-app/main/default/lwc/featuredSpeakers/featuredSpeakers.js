import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import getAllSpeakers from '@salesforce/apex/FeaturedSpeakersController.getAllSpeakers';
import deleteSpeaker from '@salesforce/apex/FeaturedSpeakersController.deleteSpeaker';

import USER_ID from '@salesforce/user/Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import YOU_ARE_FIELD from '@salesforce/schema/User.You_Are__c';

export default class FeaturedSpeakers extends NavigationMixin(LightningElement) {
    @track speakers = [];

    rawSpeakers = [];
    wiredSpeakersResult;

    error;
    errorMessage = '';
    successMessage = '';

    isOrganizer = false;

    @wire(getRecord, { recordId: USER_ID, fields: [YOU_ARE_FIELD] })
    userData({ error, data }) {
        if (data) {
            const role = getFieldValue(data, YOU_ARE_FIELD);
            this.isOrganizer = role === 'Organizer';
            this.applySpeakerPermissions();
        } else if (error) {
            console.error('Erro ao verificar permissão do usuário', error);
        }
    }

    @wire(getAllSpeakers)
    wiredSpeakers(result) {
        this.wiredSpeakersResult = result;

        const { error, data } = result;

        if (data) {
            this.rawSpeakers = data;
            this.applySpeakerPermissions();
            this.error = undefined;
            this.errorMessage = '';
        } else if (error) {
            this.error = error;
            this.rawSpeakers = [];
            this.speakers = [];
            this.errorMessage = 'Não foi possível carregar os palestrantes.';
            console.error(error);
        }
    }

    get hasSpeakers() {
        return this.speakers && this.speakers.length > 0;
    }

    applySpeakerPermissions() {
        this.speakers = (this.rawSpeakers || []).map(speaker => {
            return {
                ...speaker,
                canManage: this.isOrganizer && speaker.CreatedById === USER_ID
            };
        });
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

    handleEditSpeaker(event) {
        const speakerId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Add_Speaker__c'
            },
            state: {
                c__speakerId: speakerId
            }
        });
    }

    handleDeleteSpeaker(event) {
        const speakerId = event.currentTarget.dataset.id;
        const speakerName = event.currentTarget.dataset.name;

        const confirmed = window.confirm(
            `Tem certeza que deseja excluir o palestrante "${speakerName}"?`
        );

        if (!confirmed) {
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        deleteSpeaker({ speakerId })
            .then(() => {
                this.successMessage = 'Palestrante excluído com sucesso.';
                return refreshApex(this.wiredSpeakersResult);
            })
            .catch(error => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Erro ao excluir palestrante:', JSON.parse(JSON.stringify(error)));
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