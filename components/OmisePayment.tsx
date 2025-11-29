import React, { useState } from 'react';
import stripePaymentService from '../services/stripePaymentService';

interface OmisePaymentProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

type OmiseMethod = 'promptpay' | 'truemoney' | 'internet_banking' | 'credit_card' | 'rabbit_linepay';

export const OmisePayment: React.FC<OmisePaymentProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<OmiseMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'process' | 'qr' | 'success'>('select');
  const [qrData, setQrData] = useState<{ qrCodeUrl: string; chargeId: string; amountTHB: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const paymentMethods = stripePaymentService.getOmisePaymentMethods();
  const amountTHB = stripePaymentService.convertToTHB(amount);

  const handleMethodSelect = async (methodId: OmiseMethod) => {
    setSelectedMethod(methodId);
    setError(null);

    if (methodId === 'promptpay') {
      setLoading(true);
      try {
        const data = await stripePaymentService.generateOmisePromptPayQR({
          orderId,
          gameId,
          gameName,
          lines: 1,
          amount,
          currency: 'USD'
        });
        setQrData(data);
        setStep('qr');
        startQRTimer(data.chargeId);
      } catch (err) {
        setError('ไม่สามารถสร้าง QR Code ได้');
      } finally {
        setLoading(false);
      }
    } else {
      setStep('process');
    }
  };

  const startQRTimer = (chargeId: string) => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('QR Code หมดอายุ');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate payment check
    const checker = setInterval(async () => {
      const checkCount = parseInt(localStorage.getItem(`omise_check_${chargeId}`) || '0');
      localStorage.setItem(`omise_check_${chargeId}`, (checkCount + 1).toString());
      
      if (checkCount >= 3) {
        clearInterval(checker);
        clearInterval(timer);
        localStorage.removeItem(`omise_check_${chargeId}`);
        setStep('success');
        setTimeout(() => onSuccess(`omise_${chargeId}`), 2000);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(checker);
    };
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    setError(null);

    try {
      const result = await stripePaymentService.processOmisePayment(
        {
          orderId,
          gameId,
          gameName,
          lines: 1,
          amount,
          currency: 'USD'
        },
        selectedMethod as 'promptpay' | 'truemoney' | 'internet_banking' | 'credit_card'
      );

      if (result.success) {
        setStep('success');
        setTimeout(() => onSuccess(result.transactionId!), 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'success') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">ชำระเงินสำเร็จ!</h3>
        <p className="text-gray-500">Omise Payment</p>
        <p className="text-2xl font-bold text-indigo-600 mt-2">฿{amountTHB.toFixed(2)}</p>
      </div>
    );
  }

  if (step === 'qr' && qrData) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-bold text-xl">Omise PromptPay</span>
          </div>
          <p className="text-indigo-100 text-sm">สแกน QR Code เพื่อชำระเงิน</p>
        </div>

        <div className="p-6">
          <div className="relative max-w-xs mx-auto">
            <img 
              src={qrData.qrCodeUrl}
              alt="Omise QR Code"
              className="w-64 h-64 mx-auto rounded-lg border-2 border-gray-100"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">ยอดชำระ</p>
            <p className="text-3xl font-bold text-indigo-600">฿{qrData.amountTHB.toFixed(2)}</p>
          </div>

          <div className={`mt-4 text-center p-3 rounded-lg ${timeLeft < 60 ? 'bg-red-50' : 'bg-indigo-50'}`}>
            <p className="text-sm text-gray-500">หมดอายุใน</p>
            <p className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-indigo-800'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setStep('select');
                setSelectedMethod(null);
              }}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              เปลี่ยนวิธีชำระ
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-200"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'process') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 text-center">
          <span className="font-bold text-xl">Omise Payment</span>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-500">คุณเลือกชำระด้วย</p>
            <p className="text-xl font-bold text-gray-800">
              {paymentMethods.find(m => m.id === selectedMethod)?.nameTh}
            </p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">฿{amountTHB.toFixed(2)}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-800 text-sm">
              ⚡ เมื่อกดยืนยัน ระบบจะเปิดหน้าต่างใหม่เพื่อดำเนินการชำระเงินผ่าน Omise
            </p>
          </div>

          <button
            onClick={handleProcessPayment}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                กำลังดำเนินการ...
              </span>
            ) : (
              'ยืนยันการชำระเงิน'
            )}
          </button>

          <button
            onClick={() => {
              setStep('select');
              setSelectedMethod(null);
            }}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200"
          >
            เปลี่ยนวิธีชำระ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="font-bold text-xl">Omise</span>
        </div>
        <p className="text-center text-indigo-100 text-sm">Thailand Payment Gateway</p>
      </div>

      <div className="p-4">
        {/* Amount Display */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-4 text-center">
          <p className="text-gray-500 text-sm">ยอดชำระ</p>
          <p className="text-3xl font-bold text-indigo-600">฿{amountTHB.toFixed(2)}</p>
          <p className="text-gray-400 text-sm">(${amount.toFixed(2)} USD)</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Payment Methods */}
        <h4 className="font-medium text-gray-800 mb-3">เลือกวิธีชำระเงิน</h4>
        <div className="space-y-2">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id as OmiseMethod)}
              disabled={loading || !method.available}
              className={`w-full flex items-center gap-3 p-4 border-2 rounded-xl transition ${
                selectedMethod === method.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1 text-left">
                <span className="font-bold text-gray-800 block">{method.nameTh}</span>
                <span className="text-xs text-gray-500">{method.name}</span>
              </div>
              {loading && selectedMethod === method.id && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          ยกเลิก
        </button>

        {/* Security Badge */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <div className="flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            PCI-DSS Certified • ปลอดภัย 100%
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmisePayment;
