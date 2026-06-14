import { LightningElement, track, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

import getSpeakerForEdit from '@salesforce/apex/FeaturedSpeakersController.getSpeakerForEdit';
import updateSpeaker from '@salesforce/apex/FeaturedSpeakersController.updateSpeaker';

export default class AddSpeakerForm extends NavigationMixin(LightningElement) {
    @track speakerData = {};

    speakerId;
    errorMessage = '';
    successMessage = '';
    isSaving = false;

    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef && pageRef.state) {
            const pageSpeakerId = pageRef.state.c__speakerId || pageRef.state.speakerId;

            if (pageSpeakerId && pageSpeakerId !== this.speakerId) {
                this.speakerId = pageSpeakerId;
                this.loadSpeakerForEdit();
            }
        }
    }

    get isEditMode() {
        return !!this.speakerId;
    }

    get formTitle() {
        return this.isEditMode ? 'Editar Palestrante' : 'Adicionar Palestrante';
    }

    get saveButtonLabel() {
        if (this.isSaving) {
            return this.isEditMode ? 'Salvando alterações...' : 'Salvando palestrante...';
        }

        return this.isEditMode ? 'Salvar Alterações' : 'Salvar Palestrante';
    }

    get profileUrl() {
        return this.speakerData.Profile_URL__c || '';
    }

    get hasPhotoUrl() {
        return !!this.profileUrl;
    }

    loadSpeakerForEdit() {
        this.errorMessage = '';
        this.successMessage = '';

        getSpeakerForEdit({ speakerId: this.speakerId })
            .then(data => {
                this.speakerData = {
                    Name: data.nameValue,
                    Email__c: data.email,
                    Phone__c: data.phone,
                    Specialisation__c: data.specialisation,
                    Profile_URL__c: data.profileUrl,
                    About_Me__c: data.aboutMe
                };
            })
            .catch(error => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Erro ao carregar palestrante:', JSON.parse(JSON.stringify(error)));
            });
    }

    handleChange(event) {
        const field = event.target.name;
        const value = event.target.value;

        this.speakerData = {
            ...this.speakerData,
            [field]: value
        };
    }

    validateForm() {
        const inputs = [
            ...this.template.querySelectorAll('lightning-input, lightning-textarea')
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

        if (!this.speakerData.Name || !this.speakerData.Name.trim()) {
            this.errorMessage = 'Informe o nome completo do palestrante.';
            return false;
        }

        if (!this.speakerData.Email__c || !this.speakerData.Email__c.trim()) {
            this.errorMessage = 'Informe o e-mail do palestrante.';
            return false;
        }

        if (!this.speakerData.Specialisation__c || !this.speakerData.Specialisation__c.trim()) {
            this.errorMessage = 'Informe a especialização do palestrante.';
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

        if (this.isEditMode) {
            this.updateExistingSpeaker();
        } else {
            this.createNewSpeaker();
        }
    }

    createNewSpeaker() {
        const fields = this.buildFields();

        const recordInput = {
            apiName: 'Speaker__c',
            fields
        };

        createRecord(recordInput)
            .then(() => {
                this.successMessage = 'Palestrante adicionado com sucesso.';
                this.navigateToSpeakers();
            })
            .catch(error => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Detalhe Técnico:', JSON.parse(JSON.stringify(error)));
            })
            .finally(() => {
                this.isSaving = false;
            });
    }

    updateExistingSpeaker() {
        updateSpeaker({
            speakerId: this.speakerId,
            nameValue: this.speakerData.Name,
            email: this.speakerData.Email__c,
            phone: this.speakerData.Phone__c,
            specialisation: this.speakerData.Specialisation__c,
            profileUrl: this.speakerData.Profile_URL__c,
            aboutMe: this.speakerData.About_Me__c
        })
            .then(() => {
                this.successMessage = 'Palestrante atualizado com sucesso.';
                this.navigateToSpeakers();
            })
            .catch(error => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Erro ao atualizar palestrante:', JSON.parse(JSON.stringify(error)));
            })
            .finally(() => {
                this.isSaving = false;
            });
    }

    navigateToSpeakers() {
        setTimeout(() => {
            this[NavigationMixin.Navigate]({
                type: 'comm__namedPage',
                attributes: {
                    name: 'Speakers__c'
                }
            });
        }, 1000);
    }

    buildFields() {
        const fields = {};

        Object.keys(this.speakerData).forEach(fieldName => {
            const value = this.speakerData[fieldName];

            if (typeof value === 'string') {
                const trimmedValue = value.trim();

                if (trimmedValue) {
                    fields[fieldName] = trimmedValue;
                }
            } else if (value !== null && value !== undefined) {
                fields[fieldName] = value;
            }
        });

        return fields;
    }

    extractErrorMessage(error) {
        if (!error) {
            return 'Erro desconhecido ao salvar palestrante.';
        }

        if (error.body && error.body.message) {
            return error.body.message;
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

        if (error.message) {
            return error.message;
        }

        return 'Erro desconhecido ao salvar palestrante.';
    }
}