public class ViaCepService {
    
    @future(callout=true)
    public static void verifyLocationCep(Id locationId, String cep) {
        String cleanCep = cep != null ? cep.replaceAll('[^0-9]', '') : '';
        
        if (cleanCep.length() != 8) {
            System.debug('CEP inválido: ' + cep);
            updateVerification(locationId, false);
            return;
        }

        try {
            Boolean cepFound =
                checkViaCep(cleanCep) ||
                checkBrasilApi(cleanCep) ||
                checkOpenCep(cleanCep);

            updateVerification(locationId, cepFound);

            if (cepFound) {
                System.debug('CEP verificado com sucesso: ' + cleanCep);
            } else {
                System.debug('CEP não encontrado em nenhuma API: ' + cleanCep);
            }
        } catch (Exception e) {
            System.debug('Exceção ao tentar verificar o CEP: ' + e.getMessage());
            updateVerification(locationId, false);
        }
    }

    private static Boolean checkViaCep(String cep) {
        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://viacep.com.br/ws/' + cep + '/json/');
            request.setMethod('GET');
            request.setTimeout(10000);

            HttpResponse response = new Http().send(request);

            if (response.getStatusCode() != 200) {
                System.debug('ViaCEP falhou. Status: ' + response.getStatusCode());
                return false;
            }

            Map<String, Object> jsonResponse =
                (Map<String, Object>) JSON.deserializeUntyped(response.getBody());

            if (jsonResponse.containsKey('erro')) {
                System.debug('ViaCEP não encontrou o CEP: ' + cep);
                return false;
            }

            System.debug('CEP encontrado no ViaCEP: ' + cep);
            return true;
        } catch (Exception e) {
            System.debug('Erro no ViaCEP: ' + e.getMessage());
            return false;
        }
    }

    private static Boolean checkBrasilApi(String cep) {
        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://brasilapi.com.br/api/cep/v2/' + cep);
            request.setMethod('GET');
            request.setTimeout(10000);

            HttpResponse response = new Http().send(request);

            if (response.getStatusCode() != 200) {
                System.debug('BrasilAPI falhou. Status: ' + response.getStatusCode());
                return false;
            }

            Map<String, Object> jsonResponse =
                (Map<String, Object>) JSON.deserializeUntyped(response.getBody());

            if (
                jsonResponse.containsKey('cep') ||
                jsonResponse.containsKey('street') ||
                jsonResponse.containsKey('city') ||
                jsonResponse.containsKey('state')
            ) {
                System.debug('CEP encontrado na BrasilAPI: ' + cep);
                return true;
            }

            return false;
        } catch (Exception e) {
            System.debug('Erro na BrasilAPI: ' + e.getMessage());
            return false;
        }
    }

    private static Boolean checkOpenCep(String cep) {
        try {
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://opencep.com/v1/' + cep + '.json');
            request.setMethod('GET');
            request.setTimeout(10000);

            HttpResponse response = new Http().send(request);

            if (response.getStatusCode() != 200) {
                System.debug('OpenCEP falhou. Status: ' + response.getStatusCode());
                return false;
            }

            Map<String, Object> jsonResponse =
                (Map<String, Object>) JSON.deserializeUntyped(response.getBody());

            if (jsonResponse.containsKey('erro')) {
                System.debug('OpenCEP não encontrou o CEP: ' + cep);
                return false;
            }

            if (
                jsonResponse.containsKey('cep') ||
                jsonResponse.containsKey('logradouro') ||
                jsonResponse.containsKey('localidade') ||
                jsonResponse.containsKey('uf')
            ) {
                System.debug('CEP encontrado no OpenCEP: ' + cep);
                return true;
            }

            return false;
        } catch (Exception e) {
            System.debug('Erro no OpenCEP: ' + e.getMessage());
            return false;
        }
    }

    private static void updateVerification(Id locationId, Boolean isVerified) {
        if (locationId == null) {
            return;
        }

        Location__c locToUpdate = new Location__c(
            Id = locationId,
            Verified__c = isVerified
        );

        update locToUpdate;
    }
}