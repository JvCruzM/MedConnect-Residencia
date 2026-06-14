public with sharing class AddEventFormController {
    @AuraEnabled(cacheable=true)
    public static Id getCurrentOrganizerId() {
        User currentUser = [
            SELECT Id, Email
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        List<Clinic_Organizer__c> organizers = [
            SELECT Id
            FROM Clinic_Organizer__c
            WHERE Email__c = :currentUser.Email
            LIMIT 1
        ];

        if (organizers.isEmpty()) {
            throw new AuraHandledException(
                'Não encontramos um cadastro de organizador vinculado à sua conta.'
            );
        }

        return organizers[0].Id;
    }
}