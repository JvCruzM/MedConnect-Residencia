trigger LocationTrigger on Location__c (after insert, after update) {
    
    if (System.isFuture()) {
        return;
    }

    for (Location__c loc : Trigger.new) {
        
        if (Trigger.isInsert && String.isNotBlank(loc.Postal_Code__c)) {
            ViaCepService.verifyLocationCep(loc.Id, loc.Postal_Code__c);
        }
        
        if (Trigger.isUpdate) {
            Location__c oldLoc = Trigger.oldMap.get(loc.Id);
            
            if (String.isNotBlank(loc.Postal_Code__c) && loc.Postal_Code__c != oldLoc.Postal_Code__c) {
                ViaCepService.verifyLocationCep(loc.Id, loc.Postal_Code__c);
            }
        }
    }
}