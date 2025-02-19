import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { adminUser, loading } = useAdminAuth();

  React.useEffect(() => {
    if (!loading && !adminUser) {
      navigate('/admin/login');
    }
  }, [adminUser, loading, navigate]);

  if (loading || !adminUser) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage users and their company access from the Users page.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
