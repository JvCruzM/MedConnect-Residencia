import { LightningElement, api, wire, track } from 'lwc';
import getAttendeeEvents from '@salesforce/apex/AttendeeEventsController.getAttendeeEvents';

export default class AttendeeEvents extends LightningElement {
    
    @api recordId;
    
    @track upcomingEvents = [];
    @track pastEvents = [];

    columns = [
        {
            label: 'Event Name',
            fieldName: 'eventUrl',
            type: 'url',
            typeAttributes: { 
                label: { fieldName: 'EventName' }, 
                target: '_blank'
            }
        },
        {
            label: 'Start Date',
            fieldName: 'StartDate',
            type: 'date',
            typeAttributes: {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            }
        },
        { label: 'Location', fieldName: 'LocationName' }
    ];

    @wire(getAttendeeEvents, { attendeeId: '$recordId' })
    wiredEvents({ error, data }) {
        if (data) {
            const today = new Date();
            let upcoming = [];
            let past = [];

            data.forEach(row => {
                
                const eventDate = new Date(row.Medical_Event__r.Start_Date_Time__c);
                
                const flattenedRow = {
                    Id: row.Id,
                    eventUrl: `/lightning/r/Medical_Event__c/${row.Medical_Event__c}/view`,
                    EventName: row.Medical_Event__r.Name__c,
                    StartDate: row.Medical_Event__r.Start_Date_Time__c,
                    LocationName: row.Medical_Event__r.Location__r ? row.Medical_Event__r.Location__r.Name : 'Online/TBA'
                };

                if (eventDate >= today) {
                    upcoming.push(flattenedRow);
                } else {
                    past.push(flattenedRow);
                }
            });

            this.upcomingEvents = upcoming;
            this.pastEvents = past;
            
        } else if (error) {
            console.error('Erro ao buscar eventos do participante:', error);
        }
    }
}