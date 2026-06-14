public class ViaCepAddressService {

    public class ViaCepResponse {
        public String logradouro;
        public String localidade;
        public String uf;
        public Boolean erro;
    }

    public static void validateAddress(Id locationId) {

        Location__c loc = [
            SELECT Id, Street__c, City__c, State__c, Postal_Code__c, Verified__c
            FROM Location__c
            WHERE Id = :locationId
            LIMIT 1
        ];

        String cep = loc.Postal_Code__c.replaceAll('[^0-9]', '');

        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ViaCEP/ws/' + cep + '/json/');
        req.setMethod('GET');

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {

            ViaCepResponse data =
                (ViaCepResponse) JSON.deserialize(res.getBody(), ViaCepResponse.class);

            if (data.erro == true) {
                loc.Verified__c = false;
            } else {

                if (data.localidade == loc.City__c &&
                    data.uf == loc.State__c) {

                    loc.Verified__c = true;

                } else {
                    loc.Verified__c = false;
                }
            }
        }

        update loc;
    }
}