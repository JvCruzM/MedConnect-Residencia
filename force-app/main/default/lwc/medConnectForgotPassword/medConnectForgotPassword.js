import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import forgotPassword from '@salesforce/apex/LightningForgotPasswordController.forgotPassword';

export default class MedConnectForgotPassword extends NavigationMixin(LightningElement) {
    email = '';
    errorMessage = '';

    handleEmailChange(event) {
        this.email = event.detail.value;
    }

    handleResetPassword(event) {
        event.preventDefault();
        this.errorMessage = '';

        if (!this.email) {
            this.errorMessage = 'Por favor, insira o seu e-mail.';
            return;
        }

        forgotPassword({ 
            username: this.email, 
            checkEmailUrl: 'null' 
        })
        .then((result) => {
            if (result === 'SUCCESS') {
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Check_Password' 
                    }
                });
            } else {
                this.errorMessage = result;
            }
        })
        .catch((error) => {
            this.errorMessage = 'Erro ao processar a solicitação: ' + error.body.message;
        });
    }
}