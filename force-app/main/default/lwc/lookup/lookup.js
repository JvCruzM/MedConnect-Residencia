import { LightningElement, api, track } from 'lwc';
import searchRecords from '@salesforce/apex/LookupController.searchRecords';

export default class Lookup extends LightningElement {

    @api label;
    @api objectName;
    @api fieldName;

    @track records;
    selectedValue = '';

    handleChange(event) {
        const searchTerm = event.target.value;
        this.selectedValue = searchTerm;

        if (searchTerm.length >= 2) {
            searchRecords({
                searchTerm,
                objectName: this.objectName,
                fieldName: this.fieldName
            })
            .then(result => {
                console.log('RESULTADOS:', result);

                this.records = result.map(record => {
                    return {
                        ...record,
                        displayValue: record[this.fieldName]
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
        } else {
            this.records = null; 
        }
    }

    handleSelect(event) {
        const selectedId = event.currentTarget.dataset.id;
        const selectedName = event.currentTarget.dataset.name; 

        this.selectedValue = selectedName;

        this.dispatchEvent(
            new CustomEvent('lookupselected', {
                detail: selectedId
            })
        );

        this.records = null;
    }
}