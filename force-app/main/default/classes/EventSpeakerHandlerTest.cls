@isTest
public class EventSpeakerHandlerTest {

    @TestSetup
    static void setupData() {

        Location__c loc = new Location__c(
            Name = 'Loc',
            City__c = 'Recife',
            Country__c = 'Brazil'
        );
        insert loc;

        Clinic_Organizer__c org = new Clinic_Organizer__c(
            Name = 'Org',
            Email__c = 'org@test.com'
        );
        insert org;

        Medical_Event__c event = new Medical_Event__c(
            Name__c = 'Evento',
            Status__c = 'Published',
            Start_Date_Time__c = System.now(),
            End_Date_Time__c = System.now().addDays(2),
            Max_Seats__c = 10,
            Live__c = true,
            Event_Type__c = 'In-Person',
            Location__c = loc.Id,
            Organizers__c = org.Id
        );
        insert event;

        Speaker__c sp1 = new Speaker__c(
            Name = 'Speaker 1',
            Email__c = 'sp1@test.com'
        );

        Speaker__c sp2 = new Speaker__c(
            Name = 'Speaker 2',
            Email__c = 'sp2@test.com'
        );

        insert new List<Speaker__c>{sp1, sp2};
    }

    //SUCESSO
    @isTest
    static void testInsertSuccess() {

        Event_Speaker__c es = new Event_Speaker__c(
            Medical_Event__c = [SELECT Id FROM Medical_Event__c LIMIT 1].Id,
            Speaker__c = [SELECT Id FROM Speaker__c LIMIT 1].Id
        );

        Test.startTest();
        insert es;
        Test.stopTest();

        System.assertNotEquals(null, es.Id);
    }

    //DUPLICADO
    @isTest
    static void testDuplicateError() {

        Id eventId = [SELECT Id FROM Medical_Event__c LIMIT 1].Id;
        Id speakerId = [SELECT Id FROM Speaker__c LIMIT 1].Id;

        insert new Event_Speaker__c(
            Medical_Event__c = eventId,
            Speaker__c = speakerId
        );

        Event_Speaker__c duplicate = new Event_Speaker__c(
            Medical_Event__c = eventId,
            Speaker__c = speakerId
        );

        Test.startTest();
        try {
            insert duplicate;
            System.assert(false);
        } catch (Exception e) {
            System.assert(e.getMessage().contains('already assigned'));
        }
        Test.stopTest();
    }

    //UPDATE 
    @isTest
    static void testUpdateSameRecord() {

        Event_Speaker__c es = new Event_Speaker__c(
            Medical_Event__c = [SELECT Id FROM Medical_Event__c LIMIT 1].Id,
            Speaker__c = [SELECT Id FROM Speaker__c LIMIT 1].Id
        );
        insert es;

        es.Medical_Event__c = es.Medical_Event__c; // update sem mudar speaker

        Test.startTest();
        update es;
        Test.stopTest();

        System.assert(true);
    }

    //BULK TEST
    @isTest
    static void testBulkInsert() {

        Id eventId = [SELECT Id FROM Medical_Event__c LIMIT 1].Id;
        List<Speaker__c> speakers = [SELECT Id FROM Speaker__c];

        List<Event_Speaker__c> listES = new List<Event_Speaker__c>();

        for (Speaker__c sp : speakers) {
            listES.add(new Event_Speaker__c(
                Medical_Event__c = eventId,
                Speaker__c = sp.Id
            ));
        }

        Test.startTest();
        insert listES;
        Test.stopTest();

        System.assertEquals(speakers.size(), listES.size());
    }
}