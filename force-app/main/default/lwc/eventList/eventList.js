import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getLiveEvents from '@salesforce/apex/EventListController.getLiveEvents';

export default class EventList extends NavigationMixin(LightningElement) {
    
    allEvents = []; 
    @track filteredData = []; 
    error;

    @wire(getLiveEvents)
    wiredEvents({ error, data }) {
        if (data) {
            this.allEvents = data.map(row => {
                let dateText = '';
                if (row.Start_Date_Time__c) {
                    const d = new Date(row.Start_Date_Time__c);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0'); 
                    const year = d.getFullYear();
                    dateText = `${day}/${month}/${year}`;
                }

                return {
                    ...row,
                    LocationName: row.Location__r ? row.Location__r.Name : 'Online/TBA',
                    SearchableDate: dateText
                };
            });
            this.filteredData = [...this.allEvents];
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.allEvents = [];
            this.filteredData = [];
        }
    }

    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();

        if (searchTerm) {
            this.filteredData = this.allEvents.filter(record => {
                const nameMatch = record.Name__c ? record.Name__c.toLowerCase().includes(searchTerm) : false;
                const locationMatch = record.LocationName ? record.LocationName.toLowerCase().includes(searchTerm) : false;
                const dateMatch = record.SearchableDate ? record.SearchableDate.includes(searchTerm) : false;
                
                return nameMatch || locationMatch || dateMatch;
            });
        } else {
            this.filteredData = [...this.allEvents];
        }
    }

    navigateToRecord(event) {
        event.preventDefault(); 
        const recordId = event.target.dataset.id;
        
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                // Nome de API da página de detalhes no Experience Builder
                name: 'Event_Detail' 
            },
            state: {
                recordId: recordId
            }
        });
    }
}