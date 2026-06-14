import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class MedConnectCheckEmail extends NavigationMixin(LightningElement) {

    handleBackToLogin() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Login'
            }
        });
    }
}