import { useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayroll } from '../hooks/usePayroll';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LocalStorageAdapter } from '../../../services/adapters/localStorageAdapter';
import { Staff } from '../../../types/staff';
import { CURRENCY_SYMBOL } from '../../../types/common';
import { useNotificationStore } from '../../../stores/notificationStore';
import { Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PayslipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { payslips } = usePayroll();
  const addToast = useNotificationStore((state) => state.addToast);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const payslip = useMemo(() => {
    return payslips.find((p) => p.id === id);
  }, [payslips, id]);

  const staff = useMemo(() => {
    if (!payslip) return null;
    return new LocalStorageAdapter<Staff>('advance_staff').getById(payslip.staffId);
  }, [payslip]);

  const formattedMonth = useMemo(() => {
    if (!payslip) return '';
    const [year, monthNum] = payslip.month.split('-');
    const date = new Date(Number(year), Number(monthNum) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [payslip]);

  const handleDownloadPDF = async () => {
    const element = printAreaRef.current;
    if (!element || !payslip) return;

    try {
      addToast({ type: 'info', message: 'Generating PDF document, please wait...' });
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`payslip-${payslip.staffId}-${payslip.month}.pdf`);
      addToast({ type: 'success', message: 'PDF downloaded successfully!' });
    } catch {
      addToast({ type: 'error', message: 'Failed to generate PDF.' });
    }
  };

  if (!payslip) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>Payslip not found.</p>
        <Button variant="secondary" onClick={() => navigate('/payroll/payslips')} className="mt-4">
          Back to List
        </Button>
      </div>
    );
  }

  const totalEarnings = payslip.basicSalary + payslip.allowances.reduce((acc, a) => acc + a.amount, 0);
  const totalDeductions = payslip.deductions.reduce((acc, d) => acc + d.amount, 0);

  const breadcrumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Payroll', path: '/payroll' },
    { label: 'Payslips', path: '/payroll/payslips' },
    { label: 'Payslip Details' }
  ];

  return (
    <PageWrapper 
      title="Salary Payslip details" 
      subtitle="Examine granular employee pay stubs, allowances, and statutory deduction details."
      breadcrumbs={breadcrumbs}
      action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/payroll/payslips')} leftIcon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF} leftIcon={<Download size={16} />}>
            Export PDF
          </Button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="shadow-2xl">
          <CardBody className="p-8 space-y-8" ref={printAreaRef} id="payslip-print-area">
            
            {/* Header / Brand block */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 flex items-center justify-center shrink-0">
                  <img src="/logo_transparent.png" alt="School Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight font-heading">
                    Camied Behills
                  </h2>
                  <p className="text-xs text-slate-500">International School</p>
                  <p className="text-[10px] text-slate-400 font-mono italic">Motto: Scientia Potestas Est</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Salary Payslip</h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">{formattedMonth}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Ref ID: {payslip.id}</p>
              </div>
            </div>

            {/* Employee Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-xs">Employee Name</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {staff ? `${staff.firstName} ${staff.lastName}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Staff ID</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{staff?.staffId || payslip.staffId}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Designation / Role</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{staff?.role.replace('_', ' ') || 'Staff'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 text-xs">Bank Details</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {staff?.bankAccount?.bankName || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Account Name</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {staff?.bankAccount?.accountName || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs">Account Number</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {staff?.bankAccount?.accountNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              
              {/* Earnings */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  Earnings
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Basic Salary</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{CURRENCY_SYMBOL}{payslip.basicSalary.toLocaleString()}</span>
                  </div>
                  {payslip.allowances.map((allow, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-500">{allow.name}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{CURRENCY_SYMBOL}{allow.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Earnings</span>
                    <span>{CURRENCY_SYMBOL}{totalEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  Deductions
                </div>
                <div className="p-4 space-y-3">
                  {payslip.deductions.map((ded, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-slate-500">{ded.name}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{CURRENCY_SYMBOL}{ded.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Deductions</span>
                    <span>{CURRENCY_SYMBOL}{totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Net Payout highlighted card */}
            <div className="p-6 bg-primary-600 rounded-xl text-white flex justify-between items-center">
              <div>
                <span className="text-xs uppercase font-semibold text-white/80 tracking-wider">Net Salary Transferred</span>
                <h2 className="text-3xl font-extrabold font-heading mt-1 text-white">
                  {CURRENCY_SYMBOL}{payslip.netSalary.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="text-right text-xs text-white/90 font-light">
                <p>Status: PAID</p>
                <p className="mt-1 font-mono">Date: {payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString('en-GB') : 'N/A'}</p>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-4">
                <div className="h-8 border-b border-slate-300 mx-auto w-48" />
                <p>Employee Signature</p>
              </div>
              <div className="space-y-4">
                <div className="h-8 border-b border-slate-300 mx-auto w-48" />
                <p>Authorized Signature / Accountant</p>
              </div>
            </div>

          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}
