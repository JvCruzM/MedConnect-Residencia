import { LightningElement, track } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AddLocationForm extends NavigationMixin(LightningElement) {
    @track locationData = {};

    countryOptions = [
        { label: 'Brasil', value: 'Brazil' },
        { label: 'Canada', value: 'Canada' },
        { label: 'Portugal', value: 'Portugal' },
        { label: 'UK', value: 'UK' },
        { label: 'USA', value: 'USA' }
    ];

    handleChange(event) {
        const field = event.target.name;
        let value;

        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else {
            value = event.target.value;
        }

        this.locationData[field] = value;

        if (field === 'Postal_Code__c' && value) {
            const cleanCep = value.replace(/[^0-9]/g, '');
            if (cleanCep.length === 8) {
                this.buscarCep(cleanCep);
            }
        }
    }

    async buscarCep(cep) {
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                this.locationData.Street__c = data.logradouro;
                this.locationData.City__c = data.localidade;
                this.locationData.State__c = data.uf;
                this.locationData.Country__c = 'Brasil'; 
                this.locationData.Verified__c = true;

                this.template.querySelector('[name="Street__c"]').value = data.logradouro;
                this.template.querySelector('[name="City__c"]').value = data.localidade;
                this.template.querySelector('[name="State__c"]').value = data.uf;
                this.template.querySelector('[name="Country__c"]').value = 'Brasil';
                this.template.querySelector('[name="Verified__c"]').checked = true;
            } else {
                alert('⚠️ CEP não encontrado na base dos Correios.');
                this.locationData.Verified__c = false;
                this.template.querySelector('[name="Verified__c"]').checked = false;
            }
        } catch (error) {
            console.error('Erro ao conectar com o ViaCEP:', error);
        }
    }

    handleSave() {
        if (!this.locationData.Name) {
            alert('⚠️ Preencha o Nome da Localização.');
            return;
        }

        const recordInput = {
            apiName: 'Location__c',
            fields: this.locationData
        };

        createRecord(recordInput)
            .then(result => {
                alert('✅ Localização criada com sucesso!');
                
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: result.id,
                        objectApiName: 'locations__c',
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                let errMsg = 'Erro desconhecido.';
                
                if (error.body && error.body.output) {
                    if (error.body.output.errors && error.body.output.errors.length > 0) {
                        errMsg = error.body.output.errors[0].message;
                    } else if (error.body.output.fieldErrors) {
                        const fieldErrors = error.body.output.fieldErrors;
                        const firstField = Object.keys(fieldErrors)[0];
                        errMsg = `Erro no campo ${firstField}: ${fieldErrors[firstField][0].message}`;
                    }
                } else if (error.body && error.body.message) {
                    errMsg = error.body.message;
                }

                alert('❌ Erro exato: ' + errMsg);
                console.error('Detalhe Técnico:', JSON.parse(JSON.stringify(error)));
            });
    }
}