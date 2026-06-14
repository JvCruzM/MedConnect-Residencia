public with sharing class ErrorLogService {

    // Log simples (usa data atual)
    public static void logError(String logDetails, String processName) {
        logError(null, logDetails, processName);
    }

	// Log individual (encaminha para bulk)
    public static void logError(Datetime logDateTime, String logDetails, String processName) {
        logErrors(new List<Error_Log__c>{
            buildLog(logDateTime, logDetails, processName)
        });
    }

	// Inserção bulk com partial success
    public static void logErrors(List<Error_Log__c> logs) {
        if (logs == null || logs.isEmpty()) return;

        try {
            Database.insert(logs, false);
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR,
                'Erro ao registrar logs: ' +
                e.getMessage() + ' | ' +
                e.getStackTraceString()
            );
        }
    }

	// Monta o log com valores padrão
    private static Error_Log__c buildLog(Datetime logDateTime, String logDetails, String processName) {
        return new Error_Log__c(
            Log_Date_Time__c = (logDateTime != null) ? logDateTime : System.now(),
            Log_Details__c   = String.isNotBlank(logDetails) ? logDetails : 'No details provided',
            Process_Name__c  = String.isNotBlank(processName) ? processName : 'Unknown Process'
        );
    }
}