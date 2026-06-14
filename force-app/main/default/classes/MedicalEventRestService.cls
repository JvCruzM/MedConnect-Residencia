@RestResource(urlMapping='/LiveMedicalEvents/*')
global with sharing class MedicalEventRestService {

    @HttpGet
    global static List<Medical_Event__c> getLiveEvents() {
        
        List<Medical_Event__c> activeEvents = [
            SELECT Id, 
                   Name, 
                   Name__c, 
                   Start_Date_Time__c, 
                   End_Date_Time__c, 
                   Max_Seats__c, 
                   Remaining_Seats__c,
                   Location__r.Name
            FROM Medical_Event__c
            WHERE Live__c = true 
            AND Start_Date_Time__c > TODAY
            ORDER BY Start_Date_Time__c ASC
        ];

        return activeEvents;
    }
}