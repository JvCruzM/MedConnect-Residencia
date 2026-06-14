public with sharing class AttendeeProfileController {

    public class MyEventDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String name;
        @AuraEnabled public String status;
        @AuraEnabled public Datetime startDate;
        @AuraEnabled public Id registrationId;
    }

    @AuraEnabled(cacheable=true)
    public static List<MyEventDTO> getMyEvents() {
        User currentUser = [
            SELECT Id, Email
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        List<Attendee__c> attendees = [
            SELECT Id, Email__c
            FROM Attendee__c
            WHERE Email__c = :currentUser.Email
            LIMIT 1
        ];

        if (attendees.isEmpty()) {
            return new List<MyEventDTO>();
        }

        List<MyEventDTO> result = new List<MyEventDTO>();

        for (Event_Attendee__c registration : [
            SELECT Id,
                   Medical_Event__r.Id,
                   Medical_Event__r.Name__c,
                   Medical_Event__r.Status__c,
                   Medical_Event__r.Start_Date_Time__c
            FROM Event_Attendee__c
            WHERE Attendee__c = :attendees[0].Id
            ORDER BY Medical_Event__r.Start_Date_Time__c ASC
        ]) {
            MyEventDTO item = new MyEventDTO();

            item.registrationId = registration.Id;
            item.id = registration.Medical_Event__r.Id;
            item.name = registration.Medical_Event__r.Name__c;
            item.status = registration.Medical_Event__r.Status__c;
            item.startDate = registration.Medical_Event__r.Start_Date_Time__c;

            result.add(item);
        }

        return result;
    }

    @AuraEnabled
    public static void cancelRegistration(Id registrationId) {
        if (registrationId == null) {
            throw new AuraHandledException('Inscrição não encontrada.');
        }

        Event_Attendee__c registration = [
            SELECT Id
            FROM Event_Attendee__c
            WHERE Id = :registrationId
            LIMIT 1
        ];

        delete registration;
    }
}