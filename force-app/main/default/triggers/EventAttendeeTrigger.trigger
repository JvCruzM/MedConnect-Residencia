trigger EventAttendeeTrigger on Event_Attendee__c (after insert) {
    EventAttendeeHandler.handleAfterInsert(Trigger.new);
}