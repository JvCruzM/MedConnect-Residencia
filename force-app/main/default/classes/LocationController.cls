public with sharing class LocationController {

    public class LocationEditData {
        @AuraEnabled public Id locationId;
        @AuraEnabled public String nameValue;
        @AuraEnabled public String street;
        @AuraEnabled public String landmark;
        @AuraEnabled public String city;
        @AuraEnabled public String stateValue;
        @AuraEnabled public String postalCode;
        @AuraEnabled public String country;
        @AuraEnabled public Boolean verified;
    }

    @AuraEnabled(cacheable=true)
    public static List<Location__c> getLocations() {
        return [
            SELECT Id,
                   Name,
                   City__c,
                   Country__c,
                   Landmark__c,
                   Postal_Code__c,
                   State__c,
                   Street__c,
                   Verified__c,
                   CreatedById
            FROM Location__c
            ORDER BY Name ASC
        ];
    }

    @AuraEnabled(cacheable=true)
    public static LocationEditData getLocationForEdit(Id locationId) {
        if (locationId == null) {
            throw new AuraHandledException('Localização inválida.');
        }

        List<Location__c> locations = [
            SELECT Id,
                   Name,
                   Street__c,
                   Landmark__c,
                   City__c,
                   State__c,
                   Postal_Code__c,
                   Country__c,
                   Verified__c,
                   CreatedById
            FROM Location__c
            WHERE Id = :locationId
            AND CreatedById = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (locations.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para editar esta localização.');
        }

        Location__c loc = locations[0];

        LocationEditData data = new LocationEditData();
        data.locationId = loc.Id;
        data.nameValue = loc.Name;
        data.street = loc.Street__c;
        data.landmark = loc.Landmark__c;
        data.city = loc.City__c;
        data.stateValue = loc.State__c;
        data.postalCode = loc.Postal_Code__c;
        data.country = loc.Country__c;
        data.verified = loc.Verified__c;

        return data;
    }

    @AuraEnabled
    public static Id updateLocation(
        Id locationId,
        String nameValue,
        String street,
        String landmark,
        String city,
        String stateValue,
        String postalCode,
        String country,
        Boolean verified
    ) {
        if (locationId == null) {
            throw new AuraHandledException('Localização inválida.');
        }

        List<Location__c> locations = [
            SELECT Id, CreatedById
            FROM Location__c
            WHERE Id = :locationId
            AND CreatedById = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (locations.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para editar esta localização.');
        }

        if (String.isBlank(nameValue)) {
            throw new AuraHandledException('Informe o nome da localização.');
        }

        if (String.isBlank(street)) {
            throw new AuraHandledException('Informe a rua da localização.');
        }

        if (String.isBlank(city)) {
            throw new AuraHandledException('Informe a cidade da localização.');
        }

        if (String.isBlank(stateValue)) {
            throw new AuraHandledException('Informe o estado da localização.');
        }

        if (String.isBlank(country)) {
            throw new AuraHandledException('Informe o país da localização.');
        }

        Location__c locationToUpdate = new Location__c(
            Id = locationId,
            Name = nameValue,
            Street__c = street,
            Landmark__c = landmark,
            City__c = city,
            State__c = stateValue,
            Postal_Code__c = postalCode,
            Country__c = country,
            Verified__c = verified == true
        );

        update locationToUpdate;

        return locationId;
    }

    @AuraEnabled
    public static void deleteLocation(Id locationId) {
        if (locationId == null) {
            throw new AuraHandledException('Localização inválida.');
        }

        List<Location__c> locations = [
            SELECT Id, CreatedById
            FROM Location__c
            WHERE Id = :locationId
            AND CreatedById = :UserInfo.getUserId()
            LIMIT 1
        ];

        if (locations.isEmpty()) {
            throw new AuraHandledException('Você não tem permissão para excluir esta localização.');
        }

        Integer linkedEvents = [
            SELECT COUNT()
            FROM Medical_Event__c
            WHERE Location__c = :locationId
        ];

        if (linkedEvents > 0) {
            throw new AuraHandledException(
                'Não é possível excluir esta localização porque ela está vinculada a um ou mais eventos.'
            );
        }

        delete locations[0];
    }
}