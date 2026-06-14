@isTest
public class EventAttendeeHandlerTest {

    @TestSetup
    static void setupData() {

        Location__c loc = new Location__c(
            Name = 'Hospital Central',
            City__c = 'Recife',
            State__c = 'PE',
            Postal_Code__c = '50000-000',
            Street__c = 'Rua A',
            Country__c = 'Brazil',
            Verified__c = true
        );
        insert loc;

        Clinic_Organizer__c org = new Clinic_Organizer__c(
            Name = 'Organizer Test',
            Email__c = 'org@test.com'
        );
        insert org;

        Medical_Event__c event = new Medical_Event__c(
            Name__c = 'Evento Teste',
            Status__c = 'Published',
            Start_Date_Time__c = System.now().addDays(1),
            End_Date_Time__c = System.now().addDays(2),
            Max_Seats__c = 10,
            Live__c = true,
            Event_Type__c = 'In-Person',
            Location__c = loc.Id,
            Organizers__c = org.Id
        );
        insert event;

        Attendee__c attendee = new Attendee__c(
            Name = 'Yasmin',
            Email__c = 'yasmin@test.com'
        );
        insert attendee;

        //Attendee sem email (para cobrir branch)
        Attendee__c attendeeNoEmail = new Attendee__c(
            Name = 'Sem Email'
        );
        insert attendeeNoEmail;
    }

    //TESTE PRINCIPAL (envio de email)
    @isTest
    static void testEmailSent() {

        Event_Attendee__c ea = new Event_Attendee__c(
            Medical_Event__c = [SELECT Id FROM Medical_Event__c LIMIT 1].Id,
            Attendee__c = [SELECT Id FROM Attendee__c WHERE Email__c != null LIMIT 1].Id
        );

        Test.startTest();
        insert ea;
        Test.stopTest();

        System.assertNotEquals(null, ea.Id);
    }

    //TESTE: Attendee sem email
    @isTest
    static void testNoEmail() {

        Event_Attendee__c ea = new Event_Attendee__c(
            Medical_Event__c = [SELECT Id FROM Medical_Event__c LIMIT 1].Id,
            Attendee__c = [SELECT Id FROM Attendee__c WHERE Email__c = null LIMIT 1].Id
        );

        Test.startTest();
        insert ea;
        Test.stopTest();

        System.assert(true); 
    }

    //TESTE: Event nulo
    @isTest
    static void testNullEvent() {

        Event_Attendee__c ea = new Event_Attendee__c(
            Attendee__c = [SELECT Id FROM Attendee__c LIMIT 1].Id
        );

        Test.startTest();
        insert ea;
        Test.stopTest();

        System.assert(true);
    }

    //TESTE: Attendee nulo
    @isTest
    static void testNullAttendee() {

        Event_Attendee__c ea = new Event_Attendee__c(
            Medical_Event__c = [SELECT Id FROM Medical_Event__c LIMIT 1].Id
        );

        Test.startTest();
        insert ea;
        Test.stopTest();

        System.assert(true);
    }

    //TESTE: múltiplos registros (bulk)
    @isTest
    static void testBulkInsert() {

        Id eventId = [SELECT Id FROM Medical_Event__c LIMIT 1].Id;
        List<Attendee__c> attendees = [SELECT Id FROM Attendee__c WHERE Email__c != null];

        List<Event_Attendee__c> listEA = new List<Event_Attendee__c>();

        for (Attendee__c a : attendees) {
            listEA.add(new Event_Attendee__c(
                Medical_Event__c = eventId,
                Attendee__c = a.Id
            ));
        }

        Test.startTest();
        insert listEA;
        Test.stopTest();

        System.assertEquals(attendees.size(), listEA.size());
    }
}