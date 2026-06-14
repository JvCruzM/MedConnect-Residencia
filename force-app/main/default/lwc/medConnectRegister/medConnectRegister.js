import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import selfRegister from '@salesforce/apex/LightningSelfRegisterController.selfRegister';

export default class MedConnectRegister extends NavigationMixin(LightningElement) {
    firstname = '';
    lastname = '';
    email = '';
    password = '';
    confirmPassword = '';
    showPassword = false;
    showConfirmPassword = false;
    roleValue = 'Attendee';
    errorMessage = '';

    roleOptions = [
        {
            label: 'Participante',
            value: 'Attendee'
        },
        {
            label: 'Organizador',
            value: 'Organizer'
        }
    ];

    get passwordInputType() {
        return this.showPassword ? 'text' : 'password';
    }

    get confirmPasswordInputType() {
        return this.showConfirmPassword ? 'text' : 'password';
    }

    get passwordIconName() {
        return this.showPassword ? 'utility:hide' : 'utility:preview';
    }

    get confirmPasswordIconName() {
        return this.showConfirmPassword ? 'utility:hide' : 'utility:preview';
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    handleNameChange(event) {
        const fullName = event.target.value.trim().split(' ');
        this.firstname = fullName[0] || '';
        this.lastname = fullName.slice(1).join(' ') || ' ';
    }

    handleEmailChange(event) { this.email = event.target.value; }
    handlePasswordChange(event) { this.password = event.target.value; }
    handleConfirmPasswordChange(event) { this.confirmPassword = event.target.value; }
    handleRoleChange(event) { this.roleValue = event.detail.value; }

    handleRegister() {
        console.log('CLICOU NO CADASTRAR');
        console.log('Dados:', {
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            roleValue: this.roleValue
        });

        this.errorMessage = '';

        if (!this.firstname || !this.email || !this.password) {
            this.errorMessage = 'Preencha todos os campos obrigatórios.';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'As senhas não coincidem.';
            return;
        }

        console.log('ANTES DE CHAMAR selfRegister');

        selfRegister({
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword,
            accountId: '001dL00002DFUi2QAH',
            regConfirmUrl: null,
            extraFields: null,
            startUrl: '/',
            includePassword: true,
            userRole: this.roleValue
        })
        .then((result) => {
            console.log('RESULTADO DO REGISTRO:', result);

            if (result && result.startsWith('ERROR:')) {
                this.errorMessage = result.replace('ERROR:', '').trim();
                return;
            }

            if (result && (result.startsWith('/') || result.startsWith('http'))) {
                window.location.href = result;
                return;
            }

            if (result) {
                this.errorMessage = result;
                return;
            }

            alert('Conta criada com sucesso! Você será redirecionado para o Login.');
            this.navigateToLogin();
        })
        .catch((error) => {
            console.error('Erro no registro:', JSON.stringify(error));

            this.errorMessage =
                error?.body?.message ||
                error?.message ||
                'Erro ao processar cadastro.';
        });
    }

    navigateToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Login'
            }
        });
    }
}