public class EventBatchHandler {

    public static void deleteOldEvents(List<Medical_Event__c> events) {
        delete events;
    }
}