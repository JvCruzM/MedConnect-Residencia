global class LightningSelfRegisterController {

    public LightningSelfRegisterController() {

    }

    @TestVisible 
    private static boolean isValidPassword(String password, String confirmPassword) {
        return password == confirmPassword;
    }
    
    @TestVisible 
    private static boolean siteAsContainerEnabled(String communityUrl) {
        Auth.AuthConfiguration authConfig = new Auth.AuthConfiguration(communityUrl,'');
        return authConfig.isCommunityUsingSiteAsContainer();
    }
    
    @TestVisible 
    private static void validatePassword(User u, String password, String confirmPassword) {
        if(!Test.isRunningTest()) {
        Site.validatePassword(u, password, confirmPassword);
        }
        return;
    }

    @future
    public static void assignPermissionSetByRoleAsync(String userId, String userRole) {
        String permissionSetName;

        if (userRole == 'Organizer') {
            permissionSetName = 'MaxFit_Organizer_Permissions';
        } else {
            permissionSetName = 'MaxFit_Attendee_Permissions';
        }

        List<PermissionSet> permissionSets = [
            SELECT Id, Name
            FROM PermissionSet
            WHERE Name = :permissionSetName
            LIMIT 1
        ];

        if (permissionSets.isEmpty()) {
            System.debug('Permission Set não encontrado: ' + permissionSetName);
            return;
        }

        List<PermissionSetAssignment> existingAssignments = [
            SELECT Id
            FROM PermissionSetAssignment
            WHERE AssigneeId = :userId
            AND PermissionSetId = :permissionSets[0].Id
            LIMIT 1
        ];

        if (!existingAssignments.isEmpty()) {
            System.debug('Usuário já possui o Permission Set: ' + permissionSetName);
            return;
        }

        insert new PermissionSetAssignment(
            AssigneeId = userId,
            PermissionSetId = permissionSets[0].Id
        );

        System.debug('Permission Set atribuído: ' + permissionSetName);
    }
    
    @AuraEnabled
    public static String selfRegister(String firstname ,String lastname, String email, String password, String confirmPassword, String accountId, String regConfirmUrl, String extraFields, String startUrl, Boolean includePassword, String userRole) {
        Savepoint sp = null;
        try {
            sp = Database.setSavepoint();
            
            if (lastname == null || String.isEmpty(lastname)) {
                return Label.Site.lastname_is_required;
            }
            
            if (email == null || String.isEmpty(email)) {
                return Label.Site.email_is_required;
            }
            
            User u = new User();
            u.Username = email;
            u.put('Email',email);
            
            u.FirstName = firstname;
            u.LastName = lastname;
            u.put('You_Are__c', userRole);
            
            String networkId = Network.getNetworkId();

            if(networkId != null && siteAsContainerEnabled(Network.getLoginUrl(networkId))) {
                u.put('UserPreferencesHideS1BrowserUI',true);
            }
            
            String nickname = ((firstname != null && firstname.length() > 0) ? firstname.substring(0,1) : '' ) + lastname.substring(0,1);
            nickname += String.valueOf(Crypto.getRandomInteger()).substring(1,7);
            u.put('CommunityNickname', nickname);
                     
            if (extraFields != null) {
                List<Object> extraFieldsList = (List<Object>) JSON.deserializeUntyped(extraFields);        
                for (Object thisFieldObject : extraFieldsList) {
                    Map<String,Object> thisField = (Map<String,Object>) thisFieldObject;
                    Schema.SObjectField sof = Schema.SObjectType.User.fields.getMap().get((String) thisField.get('fieldPath'));
                    u.put(sof, thisField.get('value'));
                }
            }
                        
            if (includePassword) {    
                if (!isValidPassword(password, confirmPassword)) {
                    return Label.site.passwords_dont_match;
                }
             validatePassword(u, password, confirmPassword);
            }
            else {
                password = null;
            }
            
            String userId = Site.createPortalUser(u, accountId, password);

            if (Test.isRunningTest()) {
                userId = 'fakeUserId';           
            }

            if (userId != null && !Test.isRunningTest()) {
                assignPermissionSetByRoleAsync(userId, userRole);
            }

            if (userId != null) { 
                if (password != null && password.length() > 1) {
                    ApexPages.PageReference lgn = Site.login(email, password, startUrl);

                    if (lgn != null) {
                        return lgn.getUrl();
                    }

                    return startUrl != null ? startUrl : '/';
                } else {
                    return regConfirmUrl != null ? regConfirmUrl : '/login';
                }
            }
            return 'Não foi possível criar o usuário.';
        }
        catch (Exception ex) {
            if (sp != null) {
                Database.rollback(sp);
            }

            System.debug('ERRO NO selfRegister: ' + ex.getMessage());
            System.debug('TIPO DO ERRO: ' + ex.getTypeName());
            System.debug('STACKTRACE: ' + ex.getStackTraceString());

            return 'ERROR: ' + ex.getMessage();
        }
    }
    
    @AuraEnabled
    public static List<Map<String,Object>> getExtraFields(String extraFieldsFieldSet) { 
        List<Map<String,Object>> extraFields = new List<Map<String,Object>>();
        Schema.FieldSet fieldSet = Schema.SObjectType.User.fieldSets.getMap().get(extraFieldsFieldSet);
        if(!Test.isRunningTest()) {
        if (fieldSet != null) {
            for (Schema.FieldSetMember f : fieldSet.getFields()) {
                Map<String, Object> fieldDetail = new Map<String, Object>();
                fieldDetail.put('dbRequired', f.getDBRequired());
                fieldDetail.put('fieldPath', f.getFieldPath());
                fieldDetail.put('label', f.getLabel());
                fieldDetail.put('required', f.getRequired());
                fieldDetail.put('type', f.getType());
                fieldDetail.put('value', '');
                extraFields.add(fieldDetail);
            }}}
        return extraFields;
    }
    
    @AuraEnabled
    global static String setExperienceId(String expId) {
        try {
            if (expId != null) {
                Site.setExperienceId(expId);   
            }
            return null; 
        } catch (Exception ex) {
            return ex.getMessage();            
        }        
    }  
}