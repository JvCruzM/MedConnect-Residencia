public with sharing class LocationController {

    @AuraEnabled(cacheable=true)
    public static List<Location__c> getLocations() {
        return [
            SELECT Id,
                   Name,
                   City__c,
                   Country__c,
                   Landmark__c,
                   Postal_Code__c,
                   State__c,
                   Street__c,
                   Verified__c
            FROM Location__c
            ORDER BY Name ASC
        ];
    }
}