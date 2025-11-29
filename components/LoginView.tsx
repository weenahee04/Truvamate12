import React, { useState } from 'react';
import { IconMail, IconLock, IconEye, IconEyeOff, IconFacebook, IconGoogle, IconLine, IconHelpCircle, IconX } from './Icons';
import authService from '../services/firebase';

interface LoginViewProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onGoToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await authService.login(formData.email, formData.password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await authService.loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await authService.resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in-up">
      
      {/* Logo Area */}
      <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-red-200 shadow-xl mx-auto mb-4 transform -rotate-3">
              T
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">TruvaMate</h1>
          <p className="text-gray-400 text-sm mt-1">บริการซื้อลอตเตอรี่ออนไลน์ระดับโลก</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">อีเมล</label>
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <IconMail className="w-5 h-5 text-gray-400" />
                     </div>
                     <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                        placeholder="กรอกอีเมลของคุณ"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">รหัสผ่าน</label>
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <IconLock className="w-5 h-5 text-gray-400" />
                     </div>
                     <input 
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                        placeholder="กรอกรหัสผ่าน"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                         {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                     </button>
                 </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center text-gray-500 cursor-pointer">
                      <input type="checkbox" className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                      จดจำฉันไว้
                  </label>
                  <button type="button" onClick={() => setShowForgotPassword(true)} className="text-red-600 font-bold hover:underline flex items-center gap-1">
                      <IconHelpCircle className="w-3.5 h-3.5" />
                      ลืมรหัสผ่าน?
                  </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 transition-all transform active:scale-95 disabled:opacity-70 flex justify-center items-center"
              >
                {isLoading ? (
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : 'เข้าสู่ระบบ'}
              </button>
          </form>

          <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400 text-xs uppercase">หรือเข้าสู่ระบบด้วย</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed" disabled>
                  <div className="w-6 h-6 text-[#1877F2]"><IconFacebook /></div>
              </button>
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors hover:border-red-300"
              >
                  <div className="w-6 h-6 text-[#DB4437]"><IconGoogle /></div>
              </button>
              <button className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors opacity-50 cursor-not-allowed" disabled>
                  <div className="w-6 h-6 text-[#06C755]"><IconLine /></div>
              </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
              ยังไม่มีบัญชี? <button onClick={onGoToRegister} className="text-gray-900 font-bold hover:underline">สมัครสมาชิก</button>
          </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowForgotPassword(false)}>
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">ลืมรหัสผ่าน?</h3>
                      <button onClick={() => setShowForgotPassword(false)} className="text-gray-400 hover:text-gray-600">
                          <IconX className="w-6 h-6" />
                      </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">กรุณากรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ให้คุณ</p>
                  
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">อีเมล</label>
                          <input 
                             type="email" 
                             required
                             className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-gray-900"
                             placeholder="name@example.com"
                          />
                      </div>
                      <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">
                          ส่งลิงก์รีเซ็ตรหัสผ่าน
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};