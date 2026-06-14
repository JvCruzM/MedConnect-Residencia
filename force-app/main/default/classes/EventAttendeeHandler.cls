public class EventAttendeeHandler {

    public static void handleAfterInsert(List<Event_Attendee__c> newRecords) {

        Set<Id> eventIds = new Set<Id>();
        Set<Id> attendeeIds = new Set<Id>();

        for (Event_Attendee__c rec : newRecords) {
            if (rec.Medical_Event__c != null) {
                eventIds.add(rec.Medical_Event__c);
            }
            if (rec.Attendee__c != null) {
                attendeeIds.add(rec.Attendee__c);
            }
        }

        Map<Id, Medical_Event__c> eventMap = new Map<Id, Medical_Event__c>([
            SELECT Id, Name__c, Start_Date_Time__c,
                   Location__r.Name,
                   Location__r.Street__c,
                   Location__r.City__c,
                   Location__r.State__c,
                   Location__r.Postal_Code__c,
                   Organizers__r.Name
            FROM Medical_Event__c
            WHERE Id IN :eventIds
        ]);

        Map<Id, Attendee__c> attendeeMap = new Map<Id, Attendee__c>([
            SELECT Id, Name, Email__c
            FROM Attendee__c
            WHERE Id IN :attendeeIds
        ]);

        List<OrgWideEmailAddress> owea = [SELECT Id FROM OrgWideEmailAddress WHERE DisplayName = 'MedConnect' LIMIT 1];

        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();

        for (Event_Attendee__c rec : newRecords) {

            try {

                if (rec.Medical_Event__c == null || rec.Attendee__c == null) {
                    continue;
                }

                Medical_Event__c ev = eventMap.get(rec.Medical_Event__c);
                Attendee__c at = attendeeMap.get(rec.Attendee__c);

                if (ev == null || at == null || String.isBlank(at.Email__c)) {
                    continue;
                }

                String locationName = (ev.Location__r != null)
                    ? ev.Location__r.Name
                    : 'Location not available';

                String organizerName = (ev.Organizers__r != null)
                    ? ev.Organizers__r.Name
                    : 'Organizer';

                String street = (ev.Location__r != null) ? ev.Location__r.Street__c : '';
                String city   = (ev.Location__r != null) ? ev.Location__r.City__c : '';
                String state  = (ev.Location__r != null) ? ev.Location__r.State__c : '';
                String postal = (ev.Location__r != null) ? ev.Location__r.Postal_Code__c : '';

                String fullAddress = locationName + ', ' + street + ', ' + city + ', ' + state + ', ' + postal;

                String mapsLink = 'https://www.google.com/maps/search/?api=1&query=' +
                    EncodingUtil.urlEncode(fullAddress, 'UTF-8');

                String subject = 'Credencial para o "' + ev.Name__c + '"';

                String body =
                    'Prezado(a) ' + at.Name + ',\n\n' +
                    'Obrigado por se inscrever no "' + ev.Name__c +
                    '" que será realizado em "' + ev.Start_Date_Time__c.format() +
                    '" no local "' + locationName +
                    '". Estamos animados em tê-lo(a) conosco. Nos vemos no evento!\n\n' +
                    'Encontre a localização do evento no Google Maps aqui:\n' +
                    mapsLink + '\n\n' +
                    'Atenciosamente,\n' +
                    organizerName;

                Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

                if (!owea.isEmpty()) {
                    mail.setOrgWideEmailAddressId(owea.get(0).Id);
                }

                mail.setToAddresses(new String[] { at.Email__c });
                mail.setSubject(subject);
                mail.setPlainTextBody(body);

                emails.add(mail);

                System.debug('✅ SUCESSO! O e-mail foi montado na fila para: ' + at.Email__c);

            } catch (Exception e) {
                System.debug('Erro ao processar Event_Attendee__c: ' + e.getMessage());
            }
        }

        try {
            if (!emails.isEmpty()) {
                Messaging.sendEmail(emails);
            }
        } catch (Exception e) {
            System.debug('Erro ao enviar emails: ' + e.getMessage());
        }
    }
}