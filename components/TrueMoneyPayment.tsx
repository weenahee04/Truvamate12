import React, { useState } from 'react';
import stripePaymentService from '../services/stripePaymentService';

interface TrueMoneyPaymentProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export const TrueMoneyPayment: React.FC<TrueMoneyPaymentProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'processing' | 'success'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return /^0[689]\d{8}$/.test(cleanPhone);
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneSubmit = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (เช่น 08X-XXX-XXXX)');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate OTP request
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    setStep('otp');
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setError('กรุณากรอก OTP 6 หลัก');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const result = await stripePaymentService.processTrueMoneyPayment({
        orderId,
        gameId,
        gameName,
        lines: 1,
        amount,
        currency: 'USD'
      }, phoneNumber.replace(/\D/g, ''));

      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess(result.transactionId!);
        }, 2000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setStep('otp');
      setError(err instanceof Error ? err.message : 'การชำระเงินล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setError(null);
    alert('ส่ง OTP ใหม่แล้ว');
  };

  // Calculate THB amount
  const amountTHB = amount * 35;

  if (step === 'processing') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <img 
          src="https://www.truemoney.com/wp-content/uploads/2020/04/truemoney-logo.png" 
          alt="TrueMoney" 
          className="h-12 mx-auto mb-4"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">กำลังดำเนินการชำระเงิน</h3>
        <p className="text-gray-500 text-sm">กรุณารอสักครู่...</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">ชำระเงินสำเร็จ!</h3>
        <p className="text-gray-500">TrueMoney Wallet</p>
        <p className="text-2xl font-bold text-orange-600 mt-2">฿{amountTHB.toFixed(2)}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-4">
        <div className="flex items-center justify-center">
          <img 
            src="https://www.truemoney.com/wp-content/uploads/2020/04/truemoney-logo.png" 
            alt="TrueMoney" 
            className="h-8 bg-white rounded px-2 py-1"
          />
        </div>
        <p className="text-center text-orange-100 text-sm mt-2">ชำระเงินผ่าน TrueMoney Wallet</p>
      </div>

      <div className="p-4">
        {/* Amount Display */}
        <div className="bg-orange-50 rounded-lg p-4 mb-4 text-center">
          <p className="text-gray-500 text-sm">ยอดชำระ</p>
          <p className="text-3xl font-bold text-orange-600">฿{amountTHB.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">(${amount.toFixed(2)} USD)</p>
        </div>

        {step === 'phone' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมายเลขโทรศัพท์ TrueMoney
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🇹🇭
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(formatPhoneNumber(e.target.value));
                    setError(null);
                  }}
                  placeholder="08X-XXX-XXXX"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={12}
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              onClick={handlePhoneSubmit}
              disabled={loading || phoneNumber.replace(/\D/g, '').length < 10}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังส่ง OTP...
                </span>
              ) : (
                'ขอรหัส OTP'
              )}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <button
              onClick={() => setStep('phone')}
              className="text-orange-600 hover:text-orange-800 text-sm flex items-center mb-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              เปลี่ยนเบอร์โทรศัพท์
            </button>

            <div className="text-center mb-4">
              <p className="text-gray-600">ส่งรหัส OTP ไปที่</p>
              <p className="font-bold text-lg">{phoneNumber}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                กรอกรหัส OTP 6 หลัก
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setOtp(value);
                  setError(null);
                }}
                placeholder="• • • • • •"
                className={`w-full py-4 text-center text-2xl tracking-widest font-mono border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={6}
              />
              {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </div>

            <button
              onClick={handleOtpSubmit}
              disabled={loading || otp.length !== 6}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังตรวจสอบ...
                </span>
              ) : (
                'ยืนยันชำระเงิน'
              )}
            </button>

            <button
              onClick={resendOtp}
              disabled={loading}
              className="w-full mt-2 text-orange-600 py-2 text-sm hover:text-orange-800"
            >
              ไม่ได้รับ OTP? ส่งอีกครั้ง
            </button>
          </>
        )}

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          ยกเลิก
        </button>

        {/* Info */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>ปลอดภัยด้วยระบบ TrueMoney</p>
          <div className="flex items-center justify-center mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secured Connection
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrueMoneyPayment;
