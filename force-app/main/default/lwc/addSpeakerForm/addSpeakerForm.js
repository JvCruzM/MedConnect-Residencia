import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class AddSpeakerForm extends NavigationMixin(LightningElement) {
    
    handleSave() {
        const fields = {};
        let isValid = true;

        this.template.querySelectorAll('lightning-input, lightning-textarea').forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
            if(input.name) {
                fields[input.name] = input.value;
            }
        });

        if (!isValid) {
            return;
        }

        const recordInput = {
            apiName: 'Speaker__c',
            fields: fields
        };

        createRecord(recordInput)
            .then(result => {
                alert('✅ Palestrante adicionado com sucesso!');
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Speakers__c' 
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