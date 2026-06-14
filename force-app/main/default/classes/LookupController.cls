public with sharing class LookupController {

    @AuraEnabled
    public static List<SObject> searchRecords(
        String searchTerm,
        String objectName,
        String fieldName
    ) {

        String query =
            'SELECT Id, ' + fieldName +
            ' FROM ' + objectName +
            ' WHERE ' + fieldName +
            ' LIKE \'%' + searchTerm + '%\' ' +
            'LIMIT 5';

        return Database.query(query);
    }
}