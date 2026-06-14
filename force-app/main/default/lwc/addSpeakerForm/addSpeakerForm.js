import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AddSpeakerForm extends NavigationMixin(LightningElement) {
    @track speakerData = {};

    errorMessage = '';
    successMessage = '';
    isSaving = false;

    get saveButtonLabel() {
        return this.isSaving ? 'Salvando palestrante...' : 'Salvar Palestrante';
    }

    get profileUrl() {
        return this.speakerData.Profile_URL__c || '';
    }

    get hasPhotoUrl() {
        return !!this.profileUrl;
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

        const fields = this.buildFields();

        const recordInput = {
            apiName: 'Speaker__c',
            fields
        };

        createRecord(recordInput)
            .then(() => {
                this.successMessage = 'Palestrante adicionado com sucesso.';

                setTimeout(() => {
                    this[NavigationMixin.Navigate]({
                        type: 'comm__namedPage',
                        attributes: {
                            name: 'Speakers__c'
                        }
                    });
                }, 1000);
            })
            .catch((error) => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Detalhe Técnico:', JSON.parse(JSON.stringify(error)));
            })
            .finally(() => {
                this.isSaving = false;
            });
    }

    buildFields() {
        const fields = {};

        Object.keys(this.speakerData).forEach((fieldName) => {
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

        return 'Erro desconhecido ao salvar palestrante.';
    }
}