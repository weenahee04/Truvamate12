import React, { useState } from 'react';
import { IconUser, IconMail, IconSmartphone, IconLock, IconEye, IconEyeOff, IconCheckCircle, IconX, IconFileText, IconShield } from './Icons';

interface RegisterViewProps {
  onRegisterSuccess: () => void;
  onGoToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegisterSuccess, onGoToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Popup States
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert('กรุณายอมรับข้อกำหนดและเงื่อนไข');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 animate-fade-in-up">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 px-8 py-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           <h2 className="text-3xl font-bold text-white relative z-10">สมัครสมาชิก</h2>
           <p className="text-red-100 mt-2 relative z-10 text-sm">สร้างบัญชีเพื่อเริ่มซื้อลอตเตอรี่ระดับโลก</p>
        </div>

        {/* Form */}
        <div className="p-8">
           <form onSubmit={handleRegister} className="space-y-5">
              
              {/* Name Row */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">ชื่อจริง</label>
                      <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <IconUser className="w-4 h-4 text-gray-400" />
                          </div>
                          <input 
                            type="text" 
                            required
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all text-gray-900 placeholder-gray-400"
                            placeholder="สมชาย"
                            value={formData.firstName}
                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">นามสกุล</label>
                      <div className="relative">
                          <input 
                            type="text" 
                            required
                            className="w-full pl-4 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all text-gray-900 placeholder-gray-400"
                            placeholder="ใจดี"
                            value={formData.lastName}
                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                          />
                      </div>
                  </div>
              </div>

              {/* Phone */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <IconSmartphone className="w-4 h-4 text-gray-400" />
                     </div>
                     <input 
                        type="tel" 
                        required
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all text-gray-900 placeholder-gray-400"
                        placeholder="081-234-5678"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                     />
                 </div>
              </div>

              {/* Email */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">อีเมล</label>
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <IconMail className="w-4 h-4 text-gray-400" />
                     </div>
                     <input 
                        type="email" 
                        required
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all text-gray-900 placeholder-gray-400"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                 </div>
              </div>

              {/* Birth Date */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">วันเกิด (ต้องอายุ 20+)</label>
                 <input 
                    type="date" 
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm text-gray-900 transition-all"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                 />
              </div>

              {/* Password */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">รหัสผ่าน</label>
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <IconLock className="w-4 h-4 text-gray-400" />
                     </div>
                     <input 
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all text-gray-900 placeholder-gray-400"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                         {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                     </button>
                 </div>
              </div>

              {/* Confirm Password */}
              <div>
                 <label className="block text-xs font-bold text-gray-700 mb-1">ยืนยันรหัสผ่าน</label>
                 <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <IconLock className="w-4 h-4 text-gray-400" />
                     </div>
                     <input 
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm transition-all text-gray-900 placeholder-gray-400"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                     />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                         {showConfirmPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                     </button>
                 </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 ${formData.termsAccepted ? 'bg-red-600 border-red-600' : 'border-gray-300 bg-white group-hover:border-red-400'}`}>
                      {formData.termsAccepted && <IconCheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.termsAccepted} onChange={e => setFormData({...formData, termsAccepted: e.target.checked})} />
                  <span className="text-xs text-gray-500 leading-tight">
                      ฉันยอมรับ <button type="button" onClick={() => setShowTerms(true)} className="text-red-600 font-bold hover:underline">เงื่อนไขการให้บริการ</button> และ <button type="button" onClick={() => setShowPrivacy(true)} className="text-red-600 font-bold hover:underline">นโยบายความเป็นส่วนตัว</button> ของ TruvaMate
                  </span>
              </label>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-black transition-all transform active:scale-95 disabled:opacity-70 flex justify-center items-center"
              >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : 'สมัครสมาชิก'}
              </button>
           </form>

           <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                  มีบัญชีอยู่แล้ว? <button onClick={onGoToLogin} className="text-red-600 font-bold hover:underline">เข้าสู่ระบบ</button>
              </p>
           </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowTerms(false)}>
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <IconFileText className="w-5 h-5 text-gray-500" />
                          <h3 className="font-bold text-lg text-gray-800">เงื่อนไขการให้บริการ</h3>
                      </div>
                      <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600"><IconX className="w-6 h-6"/></button>
                  </div>
                  <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
                      <p>ยินดีต้อนรับสู่ TruvaMate กรุณาอ่านข้อกำหนดและเงื่อนไขต่างๆ ดังต่อไปนี้อย่างละเอียดก่อนใช้งาน...</p>
                      <h4 className="font-bold text-gray-800">1. การเป็นสมาชิก</h4>
                      <p>ผู้สมัครต้องมีอายุ 20 ปีบริบูรณ์ขึ้นไป และให้ข้อมูลที่เป็นจริงในการสมัครสมาชิก...</p>
                      <h4 className="font-bold text-gray-800">2. การสั่งซื้อ</h4>
                      <p>การสั่งซื้อตั๋วลอตเตอรี่ผ่านทาง TruvaMate เป็นบริการตัวแทนซื้อ (Messenger Service) โดยเราจะดำเนินการซื้อตั๋วจริงในนามของคุณ...</p>
                      <h4 className="font-bold text-gray-800">3. การรับรางวัล</h4>
                      <p>หากถูกรางวัลเล็ก ระบบจะโอนเงินเข้า Wallet ของท่าน หากถูกรางวัลใหญ่ (Jackpot) ทางบริษัทจะอำนวยความสะดวกในการเดินทางไปรับรางวัลด้วยตนเอง...</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                      <button onClick={() => setShowTerms(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">รับทราบ</button>
                  </div>
              </div>
          </div>
      )}

      {/* Privacy Modal */}
      {showPrivacy && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowPrivacy(false)}>
              <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <IconShield className="w-5 h-5 text-gray-500" />
                          <h3 className="font-bold text-lg text-gray-800">นโยบายความเป็นส่วนตัว</h3>
                      </div>
                      <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600"><IconX className="w-6 h-6"/></button>
                  </div>
                  <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4">
                      <p>TruvaMate ให้ความสำคัญกับข้อมูลส่วนบุคคลของท่าน...</p>
                      <h4 className="font-bold text-gray-800">1. การเก็บรวบรวมข้อมูล</h4>
                      <p>เราเก็บรวบรวมข้อมูลที่จำเป็น เช่น ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์ และข้อมูลการทำธุรกรรม...</p>
                      <h4 className="font-bold text-gray-800">2. การใช้ข้อมูล</h4>
                      <p>ข้อมูลของท่านจะถูกใช้เพื่อการยืนยันตัวตน, การติดต่อสื่อสาร, และการโอนเงินรางวัลเท่านั้น จะไม่มีการเปิดเผยต่อบุคคลภายนอก...</p>
                      <h4 className="font-bold text-gray-800">3. ความปลอดภัย</h4>
                      <p>เราใช้มาตรการรักษาความปลอดภัยมาตรฐานสากลในการจัดเก็บข้อมูลของท่าน...</p>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                      <button onClick={() => setShowPrivacy(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">รับทราบ</button>
                  </div>
              </div>
          </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center animate-fade-in-up" onClick={e => e.stopPropagation()}>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-once">
                      <IconCheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">สมัครสมาชิกสำเร็จ!</h3>
                  <p className="text-gray-600 mb-2">ยินดีต้อนรับสู่ TruvaMate</p>
                  <p className="text-sm text-gray-500 mb-8">บัญชีของคุณพร้อมใช้งานแล้ว เริ่มซื้อลอตเตอรี่ระดับโลกได้เลย</p>
                  
                  <div className="space-y-3">
                      <button 
                          onClick={() => {
                              setShowSuccess(false);
                              onRegisterSuccess();
                          }}
                          className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:bg-red-700 transition-all active:scale-95"
                      >
                          เริ่มต้นใช้งาน
                      </button>
                      <p className="text-xs text-gray-400 mt-4">
                          🎁 โบนัสต้อนรับ 50 THB ถูกเพิ่มเข้า Wallet แล้ว
                      </p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};