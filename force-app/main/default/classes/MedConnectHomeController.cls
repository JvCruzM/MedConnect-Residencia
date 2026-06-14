public without sharing class MedConnectHomeController {

    @AuraEnabled(cacheable=true)
    public static List<Medical_Event__c> getUpcomingEvents() {
        return [
            SELECT Id,
                   Name__c,
                   Start_Date_Time__c,
                   Status__c,
                   Location__r.Name,
                   Remaining_Seats__c
            FROM Medical_Event__c
            WHERE Live__c = true
            ORDER BY Start_Date_Time__c ASC
            LIMIT 4
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Medical_Event__c getEventById(Id eventId) {
        return [
            SELECT Id,
                   Name__c,
                   Start_Date_Time__c,
                   End_Date_Time__c,
                   Status__c,
                   Remaining_Seats__c,
                   Max_Seats__c,
                   Event_Detail__c
            FROM Medical_Event__c
            WHERE Id = :eventId
            LIMIT 1
        ];
    }

    @AuraEnabled
    public static String registerAttendee(Id eventId) {
        try {
            Id userId = UserInfo.getUserId();
            User currentUser = [SELECT Id, Name, Email FROM User WHERE Id = :userId LIMIT 1];
            
            List<Attendee__c> attendees = [SELECT Id FROM Attendee__c WHERE Email__c = :currentUser.Email LIMIT 1];
            
            Attendee__c currentAttendee;
            
            if (attendees.isEmpty()) {
                currentAttendee = new Attendee__c(
                    Name = currentUser.Name,
                    Email__c = currentUser.Email
                );
                insert currentAttendee;
            } else {
                currentAttendee = attendees[0];
            }
            
            List<Event_Attendee__c> existingReg = [
                SELECT Id FROM Event_Attendee__c 
                WHERE Medical_Event__c = :eventId AND Attendee__c = :currentAttendee.Id
            ];
            
            if (!existingReg.isEmpty()) {
                return 'ALREADY_REGISTERED';
            }
            
            Event_Attendee__c newRegistration = new Event_Attendee__c(
                Medical_Event__c = eventId,
                Attendee__c = currentAttendee.Id
            );
            
            insert newRegistration;
            return 'SUCCESS';
            
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}