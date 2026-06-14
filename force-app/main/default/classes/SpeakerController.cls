// O "without sharing" garante que todos na comunidade vejam os palestrantes, independente de quem os criou
public without sharing class SpeakerController {

    @AuraEnabled(cacheable=true)
    public static List<Speaker__c> getRecentSpeakers() {
        return [
            SELECT Id, Name, Specialisation__c, About_Me__c, Profile_URL__c 
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