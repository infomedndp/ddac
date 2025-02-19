import React from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export function AuthForms() {
  const [view, setView] = React.useState<'login' | 'signup' | 'forgot-password'>('login');

  const renderForm = () => {
    switch (view) {
      case 'signup':
        return <SignupForm onSwitchToLogin={() => setView('login')} />;
      case 'forgot-password':
        return <ForgotPasswordForm onBack={() => setView('login')} />;
      default:
        return (
          <LoginForm 
            onSwitchToSignup={() => setView('signup')} 
            onForgotPassword={() => setView('forgot-password')} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {renderForm()}
      </div>
    </div>
  );
}
