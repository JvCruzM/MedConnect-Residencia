@isTest
public class ErrorLogServiceTest {

    @isTest
    static void testLogError() {

        Datetime nowTime = System.now();
        String details = 'Test error message';
        String process = 'TestProcess';

        Test.startTest();

        ErrorLogService.logError(nowTime, details, process);

        Test.stopTest();

        List<Error_Log__c> logs = [
            SELECT Log_Date_Time__c, Log_Details__c, Process_Name__c
            FROM Error_Log__c
        ];

        System.assertEquals(1, logs.size());
        System.assertEquals(details, logs[0].Log_Details__c);
        System.assertEquals(process, logs[0].Process_Name__c);
    }
}