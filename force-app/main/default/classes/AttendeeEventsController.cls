public with sharing class AttendeeEventsController {
    
    @AuraEnabled(cacheable=true)
    public static List<Event_Attendee__c> getAttendeeEvents(Id attendeeId) {
        return [
            SELECT Id,
                   Medical_Event__c,
                   Medical_Event__r.Name__c, 
                   Medical_Event__r.Start_Date_Time__c,
                   Medical_Event__r.Location__r.Name
            FROM Event_Attendee__c
            WHERE Attendee__c = :attendeeId
            ORDER BY Medical_Event__r.Start_Date_Time__c DESC
        ];
    }
}