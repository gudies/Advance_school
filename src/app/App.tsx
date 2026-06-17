import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import { StudentListPage, EnrollPage, StudentDetailPage, AdmissionsPage } from '../features/students';
import { StaffListPage, StaffRegisterPage, StaffDetailPage, StaffAttendancePage, LeaveManagementPage, DepartmentsPage } from '../features/staff';
import { FeeOverviewPage, FeeSetupPage, PaymentsPage, OutstandingPage } from '../features/fees';
import { UserManagementPage, SettingsPage, ApprovalsPage, ActivityLogPage } from '../features/admin';
import { FinanceDashboardPage, InvoicesPage, IncomePage, BudgetPage } from '../features/finance';
import { ExpenditureDashboardPage, RecordExpensePage, ProcurementPage } from '../features/expenditure';
import { PayrollDashboardPage, PayslipListPage, PayslipDetailPage, PayrollHistoryPage } from '../features/payroll';
import { AcademicOverviewPage, ExamResultsPage, ReportCardsPage, AssessmentsPage, AcademicAttendancePage } from '../features/academics';
import { FinancialReportsPage } from '../features/reports';
import { ParentDashboardPage, ChildPerformancePage, PayFeesPage, ParentAttendancePage } from '../features/portals/parent';
import { TeacherDashboardPage, GradeEntryPage, MarkAttendancePage, TeacherTimetablePage, TeacherAssignmentsPage, TeacherPayslipPage } from '../features/portals/teacher';
import { StudentDashboardPage, MyResultsPage, MyAttendancePage, StudentAssignmentsPage, StudentTimetablePage } from '../features/portals/student';
import { CanteenDashboardPage, MenuPage, SalesPage, CanteenInventoryPage } from '../features/canteen';
import { AnnouncementsPage, MessagingPage, EventsPage } from '../features/communication';
import { ToastContainer } from '../components/feedback/Toast';
import { ConfirmationModal } from '../components/feedback/ConfirmationModal';

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Admin Panel Module Routes */}
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/approvals" element={<ApprovalsPage />} />
        <Route path="/admin/activity-log" element={<ActivityLogPage />} />
        
        {/* Students Module Routes */}
        <Route path="/students" element={<StudentListPage />} />
        <Route path="/students/enroll" element={<EnrollPage />} />
        <Route path="/students/admissions" element={<AdmissionsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />

        {/* Staff Module Routes */}
        <Route path="/staff" element={<StaffListPage />} />
        <Route path="/staff/register" element={<StaffRegisterPage />} />
        <Route path="/staff/attendance" element={<StaffAttendancePage />} />
        <Route path="/staff/leave" element={<LeaveManagementPage />} />
        <Route path="/staff/departments" element={<DepartmentsPage />} />
        <Route path="/staff/:id" element={<StaffDetailPage />} />

        {/* Fees Module Routes */}
        <Route path="/fees" element={<FeeOverviewPage />} />
        <Route path="/fees/setup" element={<FeeSetupPage />} />
        <Route path="/fees/payments" element={<PaymentsPage />} />
        <Route path="/fees/outstanding" element={<OutstandingPage />} />

        {/* Finance Module Routes */}
        <Route path="/finance" element={<FinanceDashboardPage />} />
        <Route path="/finance/invoices" element={<InvoicesPage />} />
        <Route path="/finance/income" element={<IncomePage />} />
        <Route path="/finance/budget" element={<BudgetPage />} />
        <Route path="/finance/expenses" element={<RecordExpensePage />} />

        {/* Expenditure Module Routes */}
        <Route path="/expenditure" element={<ExpenditureDashboardPage />} />
        <Route path="/expenditure/record" element={<RecordExpensePage />} />
        <Route path="/expenditure/procurement" element={<ProcurementPage />} />
        <Route path="/expenditure/approvals" element={<ApprovalsPage />} />

        {/* Payroll Module Routes */}
        <Route path="/payroll" element={<PayrollDashboardPage />} />
        <Route path="/payroll/payslips" element={<PayslipListPage />} />
        <Route path="/payroll/payslips/:id" element={<PayslipDetailPage />} />
        <Route path="/payroll/history" element={<PayrollHistoryPage />} />

        {/* Academics Module Routes */}
        <Route path="/academics" element={<AcademicOverviewPage />} />
        <Route path="/academics/results" element={<ExamResultsPage />} />
        <Route path="/academics/report-cards" element={<ReportCardsPage />} />
        <Route path="/academics/assessments" element={<AssessmentsPage />} />
        <Route path="/academics/attendance" element={<AcademicAttendancePage />} />

        {/* Reports Module Routes */}
        <Route path="/reports" element={<Navigate to="/reports/academic" replace />} />
        <Route path="/reports/financial" element={<FinancialReportsPage />} />
        <Route path="/reports/fee-payments" element={<FinancialReportsPage />} />
        <Route path="/reports/academic" element={<AcademicOverviewPage />} />
        <Route path="/reports/audit" element={<ActivityLogPage />} />

        {/* Parent Portal Routes */}
        <Route path="/parent" element={<ParentDashboardPage />} />
        <Route path="/parent/performance" element={<ChildPerformancePage />} />
        <Route path="/parent/fees" element={<PayFeesPage />} />
        <Route path="/parent/attendance" element={<ParentAttendancePage />} />
        <Route path="/parent/messages" element={<MessagingPage />} />
        <Route path="/parent/announcements" element={<AnnouncementsPage />} />

        {/* Teacher Portal Routes */}
        <Route path="/teacher" element={<TeacherDashboardPage />} />
        <Route path="/teacher/grades" element={<GradeEntryPage />} />
        <Route path="/teacher/attendance" element={<MarkAttendancePage />} />
        <Route path="/teacher/timetable" element={<TeacherTimetablePage />} />
        <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
        <Route path="/teacher/payslip" element={<TeacherPayslipPage />} />
        <Route path="/teacher/messages" element={<MessagingPage />} />

        {/* Student Portal Routes */}
        <Route path="/student" element={<StudentDashboardPage />} />
        <Route path="/student/results" element={<MyResultsPage />} />
        <Route path="/student/attendance" element={<MyAttendancePage />} />
        <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
        <Route path="/student/timetable" element={<StudentTimetablePage />} />
        <Route path="/student/announcements" element={<AnnouncementsPage />} />

        {/* Canteen Module Routes */}
        <Route path="/canteen" element={<CanteenDashboardPage />} />
        <Route path="/canteen/menu" element={<MenuPage />} />
        <Route path="/canteen/sales" element={<SalesPage />} />
        <Route path="/canteen/inventory" element={<CanteenInventoryPage />} />

        {/* Communication Module Routes */}
        <Route path="/communication" element={<Navigate to="/communication/announcements" replace />} />
        <Route path="/communication/announcements" element={<AnnouncementsPage />} />
        <Route path="/communication/messages" element={<MessagingPage />} />
        <Route path="/communication/events" element={<EventsPage />} />
      </Route>
    </Routes>
    <ToastContainer />
    <ConfirmationModal />
    </>
  );
}
