public without sharing class FeaturedSpeakersController {

    @AuraEnabled(cacheable=true)
    public static List<Speaker__c> getFeaturedSpeakers() {
        return [
            SELECT
                Id,
                Name,
                Specialisation__c,
                About_Me__c,
                Profile_URL__c
            FROM Speaker__c
            ORDER BY CreatedDate DESC
            LIMIT 5
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Speaker__c> getAllSpeakers() {
        return [
            SELECT Id, Name, Specialisation__c, About_Me__c, Profile_URL__c
            FROM Speaker__c
            ORDER BY Name ASC
        ];
    }
}