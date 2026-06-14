global with sharing class LightningForgotPasswordController {

    public LightningForgotPasswordController() { }

    @AuraEnabled
    public static String forgotPassword(String username, String checkEmailUrl) {
        try {
            List<User> users = [SELECT Id, Username FROM User WHERE Email = :username AND IsActive = true LIMIT 1];
            
            if (users.isEmpty()) {
                return 'Nenhum usuário ativo foi encontrado com este e-mail.';
            }
            
            Site.forgotPassword(users[0].Username);
            
            return 'SUCCESS';
        }
        catch (Exception ex) {
            return ex.getMessage();
        }
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