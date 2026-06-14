public without sharing class FeaturedSpeakersController {

    public class SpeakerEditData {
        @AuraEnabled public Id speakerId;
        @AuraEnabled public String nameValue;
        @AuraEnabled public String email;
        @AuraEnabled public String phone;
        @AuraEnabled public String specialisation;
        @AuraEnabled public String profileUrl;
        @AuraEnabled public String aboutMe;
    }

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
            SELECT
                Id,
                Name,
                Email__c,
                Phone__c,
                Specialisation__c,
                About_Me__c,
                Profile_URL__c,
                CreatedById
            FROM Speaker__c
            ORDER BY Name ASC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static SpeakerEditData getSpeakerForEdit(Id speakerId) {
        if (speakerId == null) {
            throw new AuraHandledException('Palestrante inválido.');
        }

        List<Speaker__c> speakers = [
            SELECT
                Id,
                Name,
                Email__c,
                Phone__c,
                Specialisation__c,
                Profile_URL__c,
                About_Me__c,
                CreatedById
            FROM Speaker__c
            WHERE Id = :speakerId
            AND CreatedById = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (speakers.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para editar este palestrante.');
        }

        Speaker__c speaker = speakers[0];

        SpeakerEditData data = new SpeakerEditData();
        data.speakerId = speaker.Id;
        data.nameValue = speaker.Name;
        data.email = speaker.Email__c;
        data.phone = speaker.Phone__c;
        data.specialisation = speaker.Specialisation__c;
        data.profileUrl = speaker.Profile_URL__c;
        data.aboutMe = speaker.About_Me__c;

        return data;
    }

    @AuraEnabled
    public static Id updateSpeaker(
        Id speakerId,
        String nameValue,
        String email,
        String phone,
        String specialisation,
        String profileUrl,
        String aboutMe
    ) {
        if (speakerId == null) {
            throw new AuraHandledException('Palestrante inválido.');
        }

        List<Speaker__c> speakers = [
            SELECT Id, CreatedById
            FROM Speaker__c
            WHERE Id = :speakerId
            AND CreatedById = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (speakers.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para editar este palestrante.');
        }

        if (String.isBlank(nameValue)) {
            throw new AuraHandledException('Informe o nome completo do palestrante.');
        }

        if (String.isBlank(email)) {
            throw new AuraHandledException('Informe o e-mail do palestrante.');
        }

        if (String.isBlank(specialisation)) {
            throw new AuraHandledException('Informe a especialização do palestrante.');
        }

        Speaker__c speakerToUpdate = new Speaker__c(
            Id = speakerId,
            Name = nameValue,
            Email__c = email,
            Phone__c = phone,
            Specialisation__c = specialisation,
            Profile_URL__c = profileUrl,
            About_Me__c = aboutMe
        );

        update speakerToUpdate;

        return speakerId;
    }

    @AuraEnabled
    public static void deleteSpeaker(Id speakerId) {
        if (speakerId == null) {
            throw new AuraHandledException('Palestrante inválido.');
        }

        List<Speaker__c> speakers = [
            SELECT Id, CreatedById
            FROM Speaker__c
            WHERE Id = :speakerId
            AND CreatedById = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (speakers.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para excluir este palestrante.');
        }

        Integer linkedEvents = [
            SELECT COUNT()
            FROM Event_Speaker__c
            WHERE Speaker__c = :speakerId
        ];

        if (linkedEvents > 0) {
            throw new AuraHandledException(
                'Não é possível excluir este palestrante porque ele está vinculado a um ou mais eventos.'
            );
        }

        delete speakers[0];
    }
}