import { useState } from 'react';
import { LoginForm, RegisterForm } from './AuthForms';

export function AuthView() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="auth-layout">
      <div className="auth-intro">
        <span className="brand-mark auth-mark" aria-hidden="true">
          C
        </span>
        <p className="eyebrow">WELCOME TO CAREEROS</p>
        <h1>Your career, at your fingertips.</h1>
        <p>Keep the details you use most ready for every opportunity.</p>
      </div>
      <div className="auth-form-card card">
        {isLogin ? (
          <LoginForm onSwitch={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    </main>
  );
}
