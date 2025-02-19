import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export function Auth() {
  const [view, setView] = React.useState<'login' | 'signup' | 'forgot-password'>('login');

  const renderForm = () => {
    switch (view) {
      case 'signup':
        return <SignupForm onToggleForm={() => setView('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setView('login')} />;
      default:
        return (
          <LoginForm 
            onToggleForm={() => setView('signup')} 
            onForgotPassword={() => setView('forgot-password')} 
          />
        );
    }
  };

  return (
    <AuthLayout
      title={
        view === 'login' 
          ? 'Sign in to your account' 
          : view === 'signup'
          ? 'Create your account'
          : 'Reset your password'
      }
      subtitle={
        view === 'login'
          ? 'Enter your credentials to access your account'
          : view === 'signup'
          ? 'Get started with your free account'
          : 'Enter your email to reset your password'
      }
    >
      {renderForm()}
    </AuthLayout>
  );
}
