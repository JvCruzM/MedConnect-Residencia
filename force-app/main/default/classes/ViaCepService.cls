public class ViaCepService {
    
    @future(callout=true)
    public static void verifyLocationCep(Id locationId, String cep) {
        
        String cleanCep = cep.replaceAll('[^0-9]', '');
        
        if (cleanCep.length() != 8) {
            System.debug('CEP inválido: ' + cep);
            return;
        }

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://viacep.com.br/ws/' + cleanCep + '/json/');
        request.setMethod('GET');
        request.setTimeout(10000);

        try {
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                
                Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                
                Location__c locToUpdate = new Location__c(Id = locationId);
                
                if (jsonResponse.containsKey('erro')) {
                    locToUpdate.Verified__c = false;
                    System.debug('ViaCEP retornou erro para o CEP: ' + cep);
                } else {
                    locToUpdate.Verified__c = true;
                }
                
                update locToUpdate;
                
            } else {
                System.debug('Erro na chamada da API ViaCEP. Status: ' + response.getStatusCode());
            }
            
        } catch (Exception e) {
            System.debug('Exceção fatal ao tentar verificar o CEP: ' + e.getMessage());
        }
    }
}