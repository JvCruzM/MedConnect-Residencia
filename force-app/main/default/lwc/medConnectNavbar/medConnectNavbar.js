import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import isGuest from '@salesforce/user/isGuest';
import basePath from '@salesforce/community/basePath';
import USER_ID from '@salesforce/user/Id';
import YOU_ARE_FIELD from '@salesforce/schema/User.You_Are__c';
import logoMedConnect from '@salesforce/resourceUrl/MedConnect_Logo_SemFundo';

export default class MedConnectNavbar extends NavigationMixin(LightningElement) {
    userRole;
    logoUrl = logoMedConnect;

    @wire(getRecord, { recordId: USER_ID, fields: [YOU_ARE_FIELD] })
    userData({ error, data }) {
        if (data) {
            this.userRole = getFieldValue(data, YOU_ARE_FIELD);
        } else if (error) {
            console.error('Erro ao buscar o perfil do usuário', error);
        }
    }

    get isGuestUser() {
        return isGuest;
    }

    get isOrganizer() {
        return !isGuest && this.userRole === 'Organizer';
    }

    get isAttendee() {
        return isGuest || this.userRole === 'Attendee';
    }

   handleLogin() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Login'
            }
        });
    }

    handleLogout() {
        const sitePrefix = basePath || '';
        const logoutUrl = `${sitePrefix}/secur/logout.jsp?retUrl=${sitePrefix}/login`;
        window.location.replace(logoutUrl);
    }
} 