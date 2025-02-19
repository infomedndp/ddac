import React from 'react';
import { DollarSign, Plus, History } from 'lucide-react';
import { RunPayroll } from './RunPayroll';
import { EmployeeForm } from './EmployeeForm';
import { ContractorForm } from './ContractorForm';
import { PaymentHistory } from './PaymentHistory';
import { useCompany } from '../../context/CompanyContext';
import { Employee, Contractor, PayrollRun } from '../../types/payroll';

export function Payroll() {
  const { companyData, updateCompanyData } = useCompany();
  const [view, setView] = React.useState<'employees' | 'contractors'>('employees');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [showRunPayroll, setShowRunPayroll] = React.useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = React.useState(false);
  const [editingPerson, setEditingPerson] = React.useState<Employee | Contractor | null>(null);
  const [editingPayrollRun, setEditingPayrollRun] = React.useState<PayrollRun | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const employees = companyData?.payroll?.employees || [];
  const contractors = companyData?.payroll?.contractors || [];
  const payrollRuns = companyData?.payroll?.payrollRuns || [];

  const filteredEmployees = React.useMemo(() => {
    if (!searchTerm) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(emp => 
      emp.fullName.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  const filteredContractors = React.useMemo(() => {
    if (!searchTerm) return contractors;
    const term = searchTerm.toLowerCase();
    return contractors.filter(con => 
      con.fullName.toLowerCase().includes(term) ||
      con.businessName?.toLowerCase().includes(term) ||
      con.email?.toLowerCase().includes(term)
    );
  }, [contractors, searchTerm]);

  const handleSaveEmployee = async (employee: Employee) => {
    try {
      const updatedEmployees = editingPerson
        ? employees.map(emp => emp.id === employee.id ? employee : emp)
        : [...employees, employee];

      await updateCompanyData({
        payroll: {
          ...companyData?.payroll,
          employees: updatedEmployees,
          contractors
        }
      });

      setShowAddForm(false);
      setEditingPerson(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Please try again.');
    }
  };

  const handleSaveContractor = async (contractor: Contractor) => {
    try {
      const updatedContractors = editingPerson
        ? contractors.map(con => con.id === contractor.id ? contractor : con)
        : [...contractors, contractor];

      await updateCompanyData({
        payroll: {
          ...companyData?.payroll,
          employees,
          contractors: updatedContractors
        }
      });

      setShowAddForm(false);
      setEditingPerson(null);
    } catch (error) {
      console.error('Error saving contractor:', error);
      alert('Failed to save contractor. Please try again.');
    }
  };

  const handleEditPayrollRun = (payrollRun: PayrollRun) => {
    setEditingPayrollRun(payrollRun);
  };

  const handleDeletePayrollRun = async (payrollRunId: string) => {
    if (window.confirm('Are you sure you want to delete this payroll run?')) {
      try {
        const updatedPayrollRuns = payrollRuns.filter(run => run.id !== payrollRunId);

        await updateCompanyData({
          payroll: {
            ...companyData?.payroll,
            payrollRuns: updatedPayrollRuns
          }
        });

        alert('Payroll run deleted successfully.');
      } catch (error) {
        console.error('Error deleting payroll run:', error);
        alert('Failed to delete payroll run. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employees, contractors, and process payroll
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPaymentHistory(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <History className="w-4 h-4 mr-2" />
            View Payments
          </button>
          <button
            onClick={() => setShowRunPayroll(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {view === 'employees' ? 'Run Payroll' : 'Pay Contractors'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {view === 'employees' ? 'Employee' : 'Contractor'}
          </button>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setView('employees')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  view === 'employees'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => setView('contractors')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  view === 'contractors'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Contractors
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        {/* Render Employee or Contractor List */}
      </div>

      {showAddForm && view === 'employees' && (
        <EmployeeForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingPerson(null);
          }}
          onSave={handleSaveEmployee}
          employee={editingPerson as Employee | null}
        />
      )}

      {showAddForm && view === 'contractors' && (
        <ContractorForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setEditingPerson(null);
          }}
          onSave={handleSaveContractor}
          contractor={editingPerson as Contractor | null}
        />
      )}

      {showRunPayroll && (
        <RunPayroll
          isOpen={showRunPayroll}
          onClose={() => setShowRunPayroll(false)}
          mode={view}
          employees={employees}
          contractors={contractors}
        />
      )}

      {showPaymentHistory && (
        <PaymentHistory
          isOpen={showPaymentHistory}
          onClose={() => setShowPaymentHistory(false)}
          mode={view}
          payrollRuns={payrollRuns}
          employees={employees}
          contractors={contractors}
          onEdit={handleEditPayrollRun}
          onDelete={handleDeletePayrollRun}
        />
      )}
    </div>
  );
}
