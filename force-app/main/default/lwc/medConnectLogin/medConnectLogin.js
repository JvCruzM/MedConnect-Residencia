import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import doLogin from '@salesforce/apex/LightningLoginFormController.login';

export default class CustomLoginPage extends NavigationMixin(LightningElement) {
    email = '';
    password = '';
    errorMessage = '';
    showPassword = false;

    get passwordInputType() {
        return this.showPassword ? 'text' : 'password';
    }

    get passwordIconName() {
        return this.showPassword ? 'utility:hide' : 'utility:preview';
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    handleEmailChange(event) { this.email = event.detail.value; }
    handlePasswordChange(event) { this.password = event.detail.value; }

    handleLoginAction(event) {
        event.preventDefault();
        this.errorMessage = '';

        if (!this.email || !this.password) {
            this.errorMessage = 'Por favor, preencha o e-mail e a senha.';
            return;
        }

        doLogin({
            username: this.email,
            password: this.password,
            startUrl: '/'
        })
            .then((result) => {
                if (result && result.startsWith('ERROR:')) {
                    this.errorMessage = result.replace('ERROR:', '').trim();
                    return;
                }

                if (result) {
                    window.location.href = result;
                    return;
                }

                this.errorMessage = 'Erro ao autenticar. Verifique suas credenciais.';
            })
            .catch((error) => {
                console.error('Erro no login:', JSON.stringify(error));

                this.errorMessage =
                    error?.body?.message ||
                    error?.message ||
                    'Erro ao fazer login.';
            });
    }

    navigateToRegister() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Register'
            }
        });
    }

    navigateToForgotPassword() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Forgot_Password'
            }
        });
    }
}