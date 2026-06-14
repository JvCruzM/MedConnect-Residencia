import { LightningElement } from 'lwc';

export default class MedConnectCreateEvent extends LightningElement {
    successMessage = '';
    errorMessage = '';

    handleSuccess() {
        this.successMessage = 'Evento criado com sucesso!';
        this.errorMessage = '';
    }

    handleError() {
        this.errorMessage = 'Não foi possível criar o evento. Verifique os campos obrigatórios.';
        this.successMessage = '';
    }
}