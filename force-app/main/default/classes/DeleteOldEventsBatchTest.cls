@isTest
public class DeleteOldEventsBatchTest {

    @isTest
    static void testBatch() {

        Location__c loc = new Location__c(
            Name = 'Loc',
            City__c = 'Recife',
            Country__c = 'Brazil',
            Verified__c = true
        );
        insert loc;

        Clinic_Organizer__c org = new Clinic_Organizer__c(
            Name = 'Org',
            Email__c = 'org@test.com'
        );
        insert org;

        List<Medical_Event__c> events = new List<Medical_Event__c>();

        for (Integer i = 0; i < 200; i++) {
            events.add(new Medical_Event__c(
                Name__c = 'Old Event ' + i,
                Status__c = 'Completed',
                Start_Date_Time__c = System.now().addMonths(-5),
                End_Date_Time__c = System.now().addMonths(-3),
                Max_Seats__c = 10,
                Live__c = false,
                Event_Type__c = 'In-Person',
                Location__c = loc.Id,
                Organizers__c = org.Id
            ));
        }

        insert events;

        System.assertEquals(200, [SELECT COUNT() FROM Medical_Event__c]);

        Test.startTest();

        Database.executeBatch(new DeleteOldEventsBatch(), 200);

        Test.stopTest();

        Integer remaining = [SELECT COUNT() FROM Medical_Event__c];

        System.assertEquals(0, remaining);
    }
}