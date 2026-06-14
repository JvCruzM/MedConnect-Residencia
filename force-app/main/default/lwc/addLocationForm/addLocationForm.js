import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AddLocationForm extends NavigationMixin(LightningElement) {
    @track locationData = {
        Country__c: 'Brazil',
        Verified__c: false
    };

    errorMessage = '';
    successMessage = '';
    warningMessage = '';

    isSaving = false;
    isFetchingCep = false;
    lastSearchedCep = '';

    countryOptions = [
        { label: 'Brasil', value: 'Brazil' },
        { label: 'Canadá', value: 'Canada' },
        { label: 'Portugal', value: 'Portugal' },
        { label: 'Reino Unido', value: 'UK' },
        { label: 'Estados Unidos', value: 'USA' }
    ];

    get saveButtonLabel() {
        return this.isSaving ? 'Salvando localização...' : 'Salvar Localização';
    }

    handleChange(event) {
        const field = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value;
        }

        this.locationData = {
            ...this.locationData,
            [field]: value
        };

        if (field === 'Country__c' && value !== 'Brazil') {
            this.locationData = {
                ...this.locationData,
                Verified__c: false
            };
        }
    }

    handlePostalCodeChange(event) {
        const value = event.target.value;
        const cleanCep = value ? value.replace(/[^0-9]/g, '') : '';

        this.errorMessage = '';
        this.successMessage = '';
        this.warningMessage = '';

        this.locationData = {
            ...this.locationData,
            Postal_Code__c: value,
            Verified__c: false
        };

        if (cleanCep.length === 8 && cleanCep !== this.lastSearchedCep) {
            this.lastSearchedCep = cleanCep;
            this.buscarCep(cleanCep);
        }
    }

    async buscarCep(cep) {
        this.errorMessage = '';
        this.successMessage = '';
        this.warningMessage = '';
        this.isFetchingCep = true;

        try {
            const endereco =
                await this.buscarNoViaCep(cep) ||
                await this.buscarNaBrasilApi(cep) ||
                await this.buscarNoOpenCep(cep);

            if (!endereco) {
                this.locationData = {
                    ...this.locationData,
                    Verified__c: false
                };

                this.warningMessage = 'CEP não localizado automaticamente. Preencha o endereço manualmente.';
                return;
            }

            this.locationData = {
                ...this.locationData,
                Street__c: endereco.street || this.locationData.Street__c,
                City__c: endereco.city || this.locationData.City__c,
                State__c: endereco.state || this.locationData.State__c,
                Country__c: 'Brazil',
                Verified__c: true
            };

            this.successMessage = `Endereço preenchido automaticamente pela base ${endereco.source}.`;

            setTimeout(() => {
                if (
                    this.successMessage &&
                    this.successMessage.includes('Endereço preenchido automaticamente')
                ) {
                    this.successMessage = '';
                }
            }, 3000);
        } catch (error) {
            console.error('Erro ao consultar CEP:', error);

            this.locationData = {
                ...this.locationData,
                Verified__c: false
            };

            this.warningMessage = 'Não foi possível consultar o CEP automaticamente. Preencha o endereço manualmente.';
        } finally {
            this.isFetchingCep = false;
        }
    }

    async buscarNoViaCep(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.erro) {
                return null;
            }

            return {
                source: 'ViaCEP',
                street: data.logradouro,
                city: data.localidade,
                state: data.uf
            };
        } catch (error) {
            console.warn('ViaCEP falhou:', error);
            return null;
        }
    }

    async buscarNaBrasilApi(cep) {
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            return {
                source: 'BrasilAPI',
                street: data.street,
                city: data.city,
                state: data.state
            };
        } catch (error) {
            console.warn('BrasilAPI falhou:', error);
            return null;
        }
    }

    async buscarNoOpenCep(cep) {
        try {
            const response = await fetch(`https://opencep.com/v1/${cep}.json`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.erro) {
                return null;
            }

            return {
                source: 'OpenCEP',
                street: data.logradouro,
                city: data.localidade,
                state: data.uf
            };
        } catch (error) {
            console.warn('OpenCEP falhou:', error);
            return null;
        }
    }

    validateForm() {
        const inputs = [
            ...this.template.querySelectorAll('lightning-input, lightning-combobox')
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

        if (!this.locationData.Name || !this.locationData.Name.trim()) {
            this.errorMessage = 'Informe o nome da localização.';
            return false;
        }

        if (!this.locationData.Street__c || !this.locationData.Street__c.trim()) {
            this.errorMessage = 'Informe a rua da localização.';
            return false;
        }

        if (!this.locationData.City__c || !this.locationData.City__c.trim()) {
            this.errorMessage = 'Informe a cidade da localização.';
            return false;
        }

        if (!this.locationData.State__c || !this.locationData.State__c.trim()) {
            this.errorMessage = 'Informe o estado da localização.';
            return false;
        }

        if (!this.locationData.Country__c) {
            this.errorMessage = 'Informe o país da localização.';
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
            apiName: 'Location__c',
            fields
        };

        createRecord(recordInput)
            .then(() => {
                this.warningMessage = '';
                this.successMessage = 'Localização criada com sucesso.';

                setTimeout(() => {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__webPage',
                        attributes: {
                            url: '/locations'
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

        Object.keys(this.locationData).forEach((fieldName) => {
            const value = this.locationData[fieldName];

            if (typeof value === 'string') {
                const trimmedValue = value.trim();

                if (trimmedValue) {
                    fields[fieldName] = trimmedValue;
                }
            } else if (value !== null && value !== undefined) {
                fields[fieldName] = value;
            }
        });

        fields.Verified__c = this.locationData.Verified__c === true;

        return fields;
    }

    extractErrorMessage(error) {
        if (!error) {
            return 'Erro desconhecido ao salvar localização.';
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

        return 'Erro desconhecido ao salvar localização.';
    }
}