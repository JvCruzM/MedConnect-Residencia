public with sharing class AdminDashboardController {
    
    public class DashboardStats {
        @AuraEnabled public Integer totalEvents;
        @AuraEnabled public Integer totalAttendees;
        @AuraEnabled public Integer totalSpeakers;
        @AuraEnabled public Integer totalLocations;
    }
    
    public class RecentActivity {
        @AuraEnabled public String title;
        @AuraEnabled public String description;
        @AuraEnabled public Datetime createdDate;
    }
    
    private static Id getCurrentOrganizerId() {
        Id currentUserId = UserInfo.getUserId();
        
        User currentUser = [
            SELECT Id, Email
            FROM User
            WHERE Id = :currentUserId
            LIMIT 1
        ];
        
        if (String.isBlank(currentUser.Email)) {
            return null;
        }
        
        List<Clinic_Organizer__c> organizers = [
            SELECT Id
            FROM Clinic_Organizer__c
            WHERE Email__c = :currentUser.Email
            LIMIT 1
        ];
        
        if (organizers.isEmpty()) {
            return null;
        }
        
        return organizers[0].Id;
    }
    
    @AuraEnabled(cacheable=true)
    public static DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        
        Id organizerId = getCurrentOrganizerId();
        Id currentUserId = UserInfo.getUserId();
        
        if (organizerId == null) {
            stats.totalEvents = 0;
            stats.totalAttendees = 0;
            stats.totalSpeakers = [SELECT COUNT() FROM Speaker__c];
            stats.totalLocations = [
                SELECT COUNT()
                FROM Location__c
                WHERE CreatedById = :currentUserId
            ];
            
            return stats;
        }
        
        stats.totalEvents = [
            SELECT COUNT()
            FROM Medical_Event__c
            WHERE Organizers__c = :organizerId
        ];
        
        AggregateResult attendeeResult = [
        SELECT SUM(People_Attending__c) totalAttendees
        FROM Medical_Event__c
        WHERE Organizers__c = :organizerId
        ];
        
        Decimal attendeeTotal = (Decimal) attendeeResult.get('totalAttendees');
        stats.totalAttendees = attendeeTotal == null ? 0 : attendeeTotal.intValue();
        
        stats.totalSpeakers = [
            SELECT COUNT()
            FROM Speaker__c
        ];
        
        stats.totalLocations = [
            SELECT COUNT()
            FROM Location__c
            WHERE CreatedById = :currentUserId
        ];
        
        return stats;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<RecentActivity> getRecentActivities() {
        List<RecentActivity> activities = new List<RecentActivity>();
        
        Id organizerId = getCurrentOrganizerId();
        
        if (organizerId == null) {
            return activities;
        }
        
        for (Medical_Event__c eventRecord : [
            SELECT Id, Name__c, CreatedDate
            FROM Medical_Event__c
            WHERE Organizers__c = :organizerId
            ORDER BY CreatedDate DESC
            LIMIT 5
        ]) {
            RecentActivity activity = new RecentActivity();
            activity.title = 'Novo evento criado';
            activity.description = eventRecord.Name__c;
            activity.createdDate = eventRecord.CreatedDate;
            activities.add(activity);
        }
        
        return activities;
    }
}