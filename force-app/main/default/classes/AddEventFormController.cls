public with sharing class AddEventFormController {
    
    public class EventEditData {
        @AuraEnabled public Id eventId;
        @AuraEnabled public String nameValue;
        @AuraEnabled public Datetime startDateTime;
        @AuraEnabled public Datetime endDateTime;
        @AuraEnabled public Decimal maxSeats;
        @AuraEnabled public String status;
        @AuraEnabled public String eventType;
        @AuraEnabled public Boolean live;
        @AuraEnabled public Boolean recurring;
        @AuraEnabled public String frequency;
        @AuraEnabled public Id locationId;
        @AuraEnabled public String eventDetail;
        @AuraEnabled public Id speakerId;
        @AuraEnabled public Id organizerId;
    }

    @AuraEnabled(cacheable=true)
    public static Id getCurrentOrganizerId() {
        Id organizerId = getCurrentOrganizerIdInternal();

        if (organizerId == null) {
            throw new AuraHandledException(
                'Não encontramos um cadastro de organizador vinculado à sua conta.'
            );
        }

        return organizerId;
    }

    @AuraEnabled(cacheable=true)
    public static Id getCurrentOrganizerIdIfExists() {
        return getCurrentOrganizerIdInternal();
    }

    private static Id getCurrentOrganizerIdInternal() {
        User currentUser = [
            SELECT Id, Email
            FROM User
            WHERE Id = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (String.isBlank(currentUser.Email)) {
            return null;
        }

        List<Clinic_Organizer__c> organizers = [
            SELECT Id
            FROM Clinic_Organizer__c
            WHERE Email__c = :currentUser.Email
            LIMIT 1
        ];

        if (organizers.isEmpty()) {
            return null;
        }

        return organizers[0].Id;
    }

    @AuraEnabled(cacheable=true)
    public static EventEditData getEventForEdit(Id eventId) {
        if (eventId == null) {
            throw new AuraHandledException('Evento inválido.');
        }

        Id organizerId = getCurrentOrganizerIdInternal();

        if (organizerId == null) {
            throw new AuraHandledException('Não foi possível identificar o organizador logado.');
        }

        List<Medical_Event__c> events = [
            SELECT Id,
                   Name__c,
                   Start_Date_Time__c,
                   End_Date_Time__c,
                   Max_Seats__c,
                   Status__c,
                   Event_Type__c,
                   Live__c,
                   Recurring__c,
                   Frequency__c,
                   Location__c,
                   Event_Detail__c,
                   Organizers__c
            FROM Medical_Event__c
            WHERE Id = :eventId
            AND Organizers__c = :organizerId
            LIMIT 1
        ];

        if (events.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para editar este evento.');
        }

        Medical_Event__c eventRecord = events[0];

        EventEditData data = new EventEditData();
        data.eventId = eventRecord.Id;
        data.nameValue = eventRecord.Name__c;
        data.startDateTime = eventRecord.Start_Date_Time__c;
        data.endDateTime = eventRecord.End_Date_Time__c;
        data.maxSeats = eventRecord.Max_Seats__c;
        data.status = eventRecord.Status__c;
        data.eventType = eventRecord.Event_Type__c;
        data.live = eventRecord.Live__c;
        data.recurring = eventRecord.Recurring__c;
        data.frequency = eventRecord.Frequency__c;
        data.locationId = eventRecord.Location__c;
        data.eventDetail = eventRecord.Event_Detail__c;
        data.organizerId = eventRecord.Organizers__c;

        List<Event_Speaker__c> speakerLinks = [
            SELECT Id, Speaker__c
            FROM Event_Speaker__c
            WHERE Medical_Event__c = :eventId
            LIMIT 1
        ];

        if (!speakerLinks.isEmpty()) {
            data.speakerId = speakerLinks[0].Speaker__c;
        }

        return data;
    }

    @AuraEnabled
    public static Id updateEvent(
        Id eventId,
        String nameValue,
        Datetime startDateTime,
        Datetime endDateTime,
        Decimal maxSeats,
        String status,
        String eventType,
        Boolean live,
        Boolean recurring,
        String frequency,
        Id locationId,
        String eventDetail,
        Id speakerId
    ) {
        if (eventId == null) {
            throw new AuraHandledException('Evento inválido.');
        }

        Id organizerId = getCurrentOrganizerIdInternal();

        if (organizerId == null) {
            throw new AuraHandledException('Não foi possível identificar o organizador logado.');
        }

        List<Medical_Event__c> events = [
            SELECT Id, Organizers__c
            FROM Medical_Event__c
            WHERE Id = :eventId
            AND Organizers__c = :organizerId
            LIMIT 1
        ];

        if (events.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para editar este evento.');
        }

        if (String.isBlank(nameValue)) {
            throw new AuraHandledException('Informe o nome do evento.');
        }

        if (startDateTime == null || endDateTime == null) {
            throw new AuraHandledException('Informe a data de início e término.');
        }

        if (endDateTime <= startDateTime) {
            throw new AuraHandledException('A data de término deve ser posterior à data de início.');
        }

        if (maxSeats == null || maxSeats <= 0) {
            throw new AuraHandledException('O máximo de participantes deve ser maior que zero.');
        }

        if (eventType == 'In-Person' && locationId == null) {
            throw new AuraHandledException('Eventos presenciais precisam de uma localização.');
        }

        Medical_Event__c eventToUpdate = new Medical_Event__c(
            Id = eventId,
            Name__c = nameValue,
            Start_Date_Time__c = startDateTime,
            End_Date_Time__c = endDateTime,
            Max_Seats__c = maxSeats,
            Status__c = status,
            Event_Type__c = eventType,
            Live__c = live == true,
            Recurring__c = recurring == true,
            Frequency__c = recurring == true ? frequency : null,
            Location__c = eventType == 'In-Person' ? locationId : null,
            Event_Detail__c = eventDetail
        );

        update eventToUpdate;

        List<Event_Speaker__c> existingLinks = [
            SELECT Id
            FROM Event_Speaker__c
            WHERE Medical_Event__c = :eventId
        ];

        if (!existingLinks.isEmpty()) {
            delete existingLinks;
        }

        if (speakerId != null) {
            insert new Event_Speaker__c(
                Medical_Event__c = eventId,
                Speaker__c = speakerId
            );
        }

        return eventId;
    }

    @AuraEnabled
    public static void deleteEvent(Id eventId) {
        if (eventId == null) {
            throw new AuraHandledException('Evento inválido.');
        }

        Id organizerId = getCurrentOrganizerIdInternal();

        if (organizerId == null) {
            throw new AuraHandledException('Não foi possível identificar o organizador logado.');
        }

        List<Medical_Event__c> events = [
            SELECT Id, Organizers__c
            FROM Medical_Event__c
            WHERE Id = :eventId
            AND Organizers__c = :organizerId
            LIMIT 1
        ];

        if (events.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para excluir este evento.');
        }

        List<Event_Speaker__c> speakerLinks = [
            SELECT Id
            FROM Event_Speaker__c
            WHERE Medical_Event__c = :eventId
        ];

        if (!speakerLinks.isEmpty()) {
            delete speakerLinks;
        }

        List<Event_Attendee__c> attendeeLinks = [
            SELECT Id
            FROM Event_Attendee__c
            WHERE Medical_Event__c = :eventId
        ];

        if (!attendeeLinks.isEmpty()) {
            delete attendeeLinks;
        }

        delete events[0];
    }
}