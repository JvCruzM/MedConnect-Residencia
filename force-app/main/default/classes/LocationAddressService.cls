public class LocationAddressService {

    public static void validateAddress(Id locationId) {

       
        Location__c loc = [
            SELECT Id, Street__c, City__c, State__c, Postal_Code__c, Country__c
            FROM Location__c
            WHERE Id = :locationId
            LIMIT 1
        ];

        
        Http http = new Http();
        HttpRequest request = new HttpRequest();

       
        request.setEndpoint('callout:External_API/posts/1');
        request.setMethod('GET');

        HttpResponse response = http.send(request);

        
        if (response.getStatusCode() == 200) {
            loc.Verified__c = true;
        } else {
            loc.Verified__c = false;
        }

        update loc;
    }
}