import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import getLocations from '@salesforce/apex/LocationController.getLocations';
import deleteLocation from '@salesforce/apex/LocationController.deleteLocation';

import USER_ID from '@salesforce/user/Id';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import YOU_ARE_FIELD from '@salesforce/schema/User.You_Are__c';

export default class MedConnectLocationsPage extends NavigationMixin(LightningElement) {
    locations = [];
    wiredLocationsResult;

    isOrganizer = false;
    errorMessage = '';
    successMessage = '';

    @wire(getLocations)
    wiredLocations(result) {
        this.wiredLocationsResult = result;

        const { error, data } = result;

        if (data) {
            this.locations = data.map(location => {
                return {
                    ...location,
                    canManage: this.isOrganizer && location.CreatedById === USER_ID
                };
            });

            this.errorMessage = '';
        } else if (error) {
            this.locations = [];
            this.errorMessage = 'Não foi possível carregar os locais.';
            console.error('Erro ao carregar localizações:', error);
        }
    }

    @wire(getRecord, { recordId: USER_ID, fields: [YOU_ARE_FIELD] })
    userData({ error, data }) {
        if (data) {
            const role = getFieldValue(data, YOU_ARE_FIELD);
            this.isOrganizer = role === 'Organizer';

            this.locations = this.locations.map(location => {
                return {
                    ...location,
                    canManage: this.isOrganizer && location.CreatedById === USER_ID
                };
            });
        } else if (error) {
            console.error('Erro ao verificar permissão do usuário', error);
        }
    }

    get hasLocations() {
        return this.locations && this.locations.length > 0;
    }

    handleAddLocation(event) {
        event.preventDefault();

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'AddLocation__c'
            }
        });
    }

    handleEditLocation(event) {
        const locationId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'AddLocation__c'
            },
            state: {
                c__locationId: locationId
            }
        });
    }

    handleDeleteLocation(event) {
        const locationId = event.currentTarget.dataset.id;
        const locationName = event.currentTarget.dataset.name;

        const confirmed = window.confirm(
            `Tem certeza que deseja excluir a localização "${locationName}"?`
        );

        if (!confirmed) {
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';

        deleteLocation({ locationId })
            .then(() => {
                this.successMessage = 'Localização excluída com sucesso.';
                return refreshApex(this.wiredLocationsResult);
            })
            .catch(error => {
                this.errorMessage = this.extractErrorMessage(error);
                console.error('Erro ao excluir localização:', JSON.parse(JSON.stringify(error)));
            });
    }

    extractErrorMessage(error) {
        if (!error) {
            return 'Erro desconhecido.';
        }

        if (error.body && error.body.message) {
            return error.body.message;
        }

        if (error.message) {
            return error.message;
        }

        return 'Erro desconhecido.';
    }
}