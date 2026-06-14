public with sharing class EventListController {
    
    @AuraEnabled(cacheable=true)
    public static List<Medical_Event__c> getLiveEvents() {
        return [
            SELECT Id, Name, Name__c, Start_Date_Time__c, Location__r.Name 
            FROM Medical_Event__c 
            WHERE Live__c = true 
            AND Start_Date_Time__c >= TODAY 
            ORDER BY Start_Date_Time__c ASC
        ];
    }
}