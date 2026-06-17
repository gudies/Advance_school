import { useState } from 'react';
import { useStudents } from '../hooks/useStudents';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { Card, CardBody, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, UserPlus } from 'lucide-react';
import { ClassLevel } from '../../../types';

export default function EnrollPage() {
  const navigate = useNavigate();
  const { enrollStudent } = useStudents();
  const addToast = useNotificationStore(state => state.addToast);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: 'Female' as 'Female' | 'Male',
    classLevel: 'JHS 1',
    address: '',
    previousSchool: '',
    healthInfo: '',
    guardianName: '',
    guardianRelationship: 'Father',
    guardianPhone: '',
    guardianEmail: '',
    guardianAddress: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    // Basic validations
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        addToast({ type: 'error', title: 'Validation Error', message: 'Please complete all required personal details.' });
        return;
      }
    } else if (step === 2) {
      if (!formData.guardianName || !formData.guardianPhone || !formData.guardianAddress) {
        addToast({ type: 'error', title: 'Validation Error', message: 'Please complete all required guardian details.' });
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      enrollStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        classLevel: formData.classLevel as ClassLevel,
        address: formData.address,
        previousSchool: formData.previousSchool,
        healthInfo: formData.healthInfo,
        guardian: {
          name: formData.guardianName,
          relationship: formData.guardianRelationship,
          phone: formData.guardianPhone,
          email: formData.guardianEmail,
          address: formData.guardianAddress,
        }
      });

      addToast({
        type: 'success',
        title: 'Enrollment Successful',
        message: `${formData.firstName} ${formData.lastName} has been enrolled in ${formData.classLevel}.`
      });

      navigate('/students');
    } catch {
      addToast({
        type: 'error',
        title: 'Enrollment Failed',
        message: 'Could not save student data. Please try again.'
      });
    }
  };

  return (
    <PageWrapper
      title="Student Admission Wizard"
      subtitle="Complete the multi-step workflow to register and enroll a new student into classes."
      breadcrumbs={[
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Students', path: '/students' },
        { label: 'New Admission' },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Timeline Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          {[
            { step: 1, label: 'Bio Details' },
            { step: 2, label: 'Guardian' },
            { step: 3, label: 'Academic & Review' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex-center font-bold text-xs shrink-0 select-none ${
                  step === item.step
                    ? 'bg-primary-600 text-white shadow-primary'
                    : step > item.step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {item.step}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === item.step ? 'text-primary-600' : 'text-secondary'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Form Cards */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardBody className="space-y-6">
              {/* STEP 1: Personal/Bio Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary-600" />
                    <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">Student Personal Details</h3>
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

                  <div className="grid grid-3 gap-4">
                    <Input
                      label="Middle Name"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                    />
                    <Input
                      label="Date of Birth *"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                    <Select
                      label="Gender *"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value as 'Female' | 'Male')}
                      placeholder="Select Gender"
                      options={[
                        { value: 'Female', label: 'Female' },
                        { value: 'Male', label: 'Male' },
                      ]}
                    />
                  </div>

                  <Textarea
                    label="Home Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              )}

              {/* STEP 2: Guardian Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-primary-600" />
                    <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">Guardian Information</h3>
                  </div>

                  <div className="grid grid-2 gap-4">
                    <Input
                      label="Guardian Name *"
                      value={formData.guardianName}
                      onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    />
                    <Select
                      label="Relationship *"
                      value={formData.guardianRelationship}
                      onChange={(e) => handleInputChange('guardianRelationship', e.target.value)}
                      placeholder="Select Relationship"
                      options={[
                        { value: 'Father', label: 'Father' },
                        { value: 'Mother', label: 'Mother' },
                        { value: 'Uncle', label: 'Uncle' },
                        { value: 'Aunt', label: 'Aunt' },
                        { value: 'Guardian', label: 'Other Guardian' },
                      ]}
                    />
                  </div>

                  <div className="grid grid-2 gap-4">
                    <Input
                      label="Guardian Phone *"
                      value={formData.guardianPhone}
                      onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    />
                    <Input
                      label="Guardian Email"
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                    />
                  </div>

                  <Textarea
                    label="Guardian Address *"
                    value={formData.guardianAddress}
                    onChange={(e) => handleInputChange('guardianAddress', e.target.value)}
                  />
                </div>
              )}

              {/* STEP 3: Academic & Review */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary-600" />
                      <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">Academic Details</h3>
                    </div>

                    <div className="grid grid-2 gap-4">
                      <Select
                        label="Assign Class Level *"
                        value={formData.classLevel}
                        onChange={(e) => handleInputChange('classLevel', e.target.value)}
                        placeholder="Select Class Level"
                        options={[
                          { value: 'JHS 1', label: 'JHS 1' },
                          { value: 'JHS 2', label: 'JHS 2' },
                          { value: 'JHS 3', label: 'JHS 3' },
                        ]}
                      />
                      <Input
                        label="Previous School"
                        value={formData.previousSchool}
                        onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                      />
                    </div>

                    <Textarea
                      label="Medical/Health Information Notes"
                      placeholder="Note allergies, medical conditions, etc."
                      value={formData.healthInfo}
                      onChange={(e) => handleInputChange('healthInfo', e.target.value)}
                    />
                  </div>

                  {/* Summary Review Block */}
                  <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Review Summary Info</h4>
                    
                    <div className="grid grid-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10">
                      <div>
                        <p className="text-xs text-slate-400 font-light">Student Name:</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-light">Assigned Class Level:</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formData.classLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-light">Guardian Name:</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formData.guardianName} ({formData.guardianRelationship})</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-light">Guardian Contact:</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formData.guardianPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardBody>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={step === 1 ? () => navigate('/students') : prevStep}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>

              {step < 3 ? (
                <Button type="button" variant="primary" onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              ) : (
                <Button type="submit" variant="primary" className="bg-success-600 hover:bg-success-700 text-white shadow-success">
                  <Save className="h-4 w-4 mr-1.5" />
                  Save & Enroll
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageWrapper>
  );
}
