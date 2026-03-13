import React, { useState } from 'react';
import Login from './Login';
import VerifyOTP from './VerifyOTP';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('login'); // 'login' or 'verify'

  const handleLoginSuccess = (email) => {
    setEmail(email);
    setStep('verify');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary-600"></div>
      {step === 'login' ? (
        <Login onSuccess={handleLoginSuccess} />
      ) : (
        <VerifyOTP email={email} />
      )}
    </div>
  );
};

export default Auth;
