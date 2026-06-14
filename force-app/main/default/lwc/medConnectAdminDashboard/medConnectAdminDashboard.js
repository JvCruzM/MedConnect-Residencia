import { LightningElement, wire } from 'lwc';
import getDashboardStats from '@salesforce/apex/AdminDashboardController.getDashboardStats';
import getRecentActivities from '@salesforce/apex/AdminDashboardController.getRecentActivities';

export default class MedConnectAdminDashboard extends LightningElement {
    @wire(getDashboardStats)
    stats;

    @wire(getRecentActivities)
    recentActivities;
}