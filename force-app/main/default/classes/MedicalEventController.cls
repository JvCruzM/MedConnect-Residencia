public with sharing class MedicalEventController {
    
    @AuraEnabled(cacheable=true)
    public static List<Event_Speaker__c> getEventSpeakers(Id eventId) {
        return [SELECT Id, Speaker__c, 
                       Speaker__r.Name, 
                       Speaker__r.Email__c, 
                       Speaker__r.Phone__c, 
                       Speaker__r.Specialisation__c 
                FROM Event_Speaker__c 
                WHERE Medical_Event__c = :eventId];
    }

    @AuraEnabled(cacheable=true)
    public static List<Event_Attendee__c> getEventAttendees(Id eventId) {
        return [SELECT Id, Attendee__c, 
                       Attendee__r.Name, 
                       Attendee__r.Email__c, 
                       Attendee__r.Company__c,
                       Attendee__r.Phone__c
                FROM Event_Attendee__c 
                WHERE Medical_Event__c = :eventId];
    }
}