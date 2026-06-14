global class DeleteOldEventsBatch implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext bc) {

        return Database.getQueryLocator([
            SELECT Id
            FROM Medical_Event__c
            WHERE End_Date_Time__c <= :System.now().addMonths(-2)
            AND Live__c = false
        ]);
    }
   
    global void execute(Database.BatchableContext bc, List<Medical_Event__c> scope) {

        try {
            EventBatchHandler.deleteOldEvents(scope);

        } catch (Exception e) {
            System.debug('Erro ao deletar eventos: ' + e.getMessage());
        }
    }

    global void finish(Database.BatchableContext bc) {

        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

        mail.setToAddresses(new String[] {'sfdcpanther@gmail.com'});
        mail.setSubject('Batch Completed');
        mail.setPlainTextBody('The batch job to delete old events has completed successfully.');

        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}