public class EventSpeakerHandler {

    public static void validateSpeakers(List<Event_Speaker__c> newRecords, Boolean isUpdate) {

        Set<Id> speakerIds = new Set<Id>();

        for (Event_Speaker__c rec : newRecords) {
            if (rec.Speaker__c != null) {
                speakerIds.add(rec.Speaker__c);
            }
        }

        List<Event_Speaker__c> existing = [
            SELECT Id, Speaker__c
            FROM Event_Speaker__c
            WHERE Speaker__c IN :speakerIds
        ];
        
        for (Event_Speaker__c rec : newRecords) {

            if (rec.Speaker__c == null) continue;

            for (Event_Speaker__c ex : existing) {

                if (isUpdate && ex.Id == rec.Id) {
                    continue;
                }

                if (ex.Speaker__c == rec.Speaker__c) {
                    rec.addError('Este palestrante já está atribuído a um evento.');
                    break;
                }
            }
        }
    }
}