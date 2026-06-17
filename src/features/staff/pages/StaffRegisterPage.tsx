import React, { useState } from 'react';
import { useStaff } from '../hooks/useStaff';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { StaffRole } from '../../../types';

export default function StaffRegisterPage() {
  const navigate = useNavigate();
  const { registerStaff } = useStaff();
  const addToast = useNotificationStore(state => state.addToast);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'teacher' as StaffRole,
    qualification: '',
    salary: 3000,
    bankName: '',
    accountName: '',
    accountNumber: '',
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please complete all required fields.' });
      return;
    }

    try {
      registerStaff({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        departmentId: 'dept_001', // default assigned department
        qualification: formData.qualification,
        salary: Number(formData.salary),
        bankAccount: formData.bankName ? {
          bankName: formData.bankName,
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
        } : undefined
      });

      addToast({
        type: 'success',
        title: 'Staff Registered',
        message: `${formData.firstName} ${formData.lastName} has been successfully registered.`
      });

      navigate('/staff');
    } catch {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: 'Could not register staff member. Please try again.'
      });
    }
  };

  return (
    <PageWrapper
      title="Staff Registration"
      subtitle="Register a new academic teacher or auxiliary team member into the school registry."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Staff', path: '/staff' },
        { label: 'Register Staff' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-600" />
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">Personal Credentials</h3>
              </div>

              <div className="grid grid-2 gap-4">
                <Input
                  label="First Name *"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                <Input
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>

              <div className="grid grid-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Input
                  label="Phone *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 pt-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-600" />
                <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">Employment & Financials</h3>
              </div>

              <div className="grid grid-3 gap-4">
                <Select
                  label="Staff Role *"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="Select Staff Role"
                  options={[
                    { value: 'teacher', label: 'Teacher' },
                    { value: 'head_teacher', label: 'Head Teacher' },
                    { value: 'accountant', label: 'Accountant' },
                    { value: 'secretary', label: 'Secretary' },
                    { value: 'librarian', label: 'Librarian' },
                    { value: 'security', label: 'Security' },
                    { value: 'cleaner', label: 'Cleaner' },
                  ]}
                />
                <Input
                  label="Basic Monthly Salary *"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                />
                <Input
                  label="Qualification"
                  placeholder="e.g. B.Ed, M.Sc"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange('qualification', e.target.value)}
                />
              </div>

              {/* Bank Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Salary Bank Credentials (Optional)</h4>
                <div className="grid grid-3 gap-4">
                  <Input
                    label="Bank Name"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                  <Input
                    label="Account Name"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                  />
                  <Input
                    label="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  />
                </div>
              </div>
            </CardBody>
            
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate('/staff')}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Cancel
              </Button>
              <Button type="submit" variant="primary" className="bg-success-600 hover:bg-success-700 text-white shadow-success">
                <Save className="h-4 w-4 mr-1.5" /> Save Staff Record
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageWrapper>
  );
}
