import React, { useState, useEffect } from 'react';
import stripePaymentService, { PromptPayQRData } from '../services/stripePaymentService';

interface PromptPayQRProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export const PromptPayQR: React.FC<PromptPayQRProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [qrData, setQrData] = useState<PromptPayQRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateQR();
  }, []);

  useEffect(() => {
    if (!qrData) return;

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('QR Code หมดอายุ กรุณาสร้างใหม่');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Check payment status every 5 seconds
    const statusChecker = setInterval(async () => {
      if (qrData.reference) {
        setChecking(true);
        const status = await stripePaymentService.checkPromptPayStatus(qrData.reference);
        setChecking(false);
        
        if (status === 'COMPLETED') {
          clearInterval(statusChecker);
          clearInterval(timer);
          onSuccess(`pp_${qrData.reference}`);
        }
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(statusChecker);
    };
  }, [qrData, onSuccess]);

  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await stripePaymentService.generatePromptPayQR({
        orderId,
        gameId,
        gameName,
        lines: 1,
        amount,
        currency: 'USD'
      });
      
      setQrData(data);
      setTimeLeft(15 * 60);
    } catch (err) {
      setError('ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">กำลังสร้าง QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={generateQR}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
        >
          สร้าง QR Code ใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-t-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <img 
            src="https://www.bot.or.th/Thai/PaymentSystems/PromptPay/PublishingImages/Logo%20PromptPay%20Thai.jpg" 
            alt="PromptPay" 
            className="h-6 bg-white rounded px-1"
          />
          <span className="font-bold text-lg">PromptPay</span>
        </div>
        <p className="text-blue-100 text-sm">สแกน QR Code เพื่อชำระเงิน</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 border-x border-gray-200">
        <div className="relative">
          <img 
            src={qrData?.qrCodeUrl} 
            alt="PromptPay QR Code"
            className="w-64 h-64 mx-auto rounded-lg border-2 border-gray-100"
          />
          
          {/* Checking overlay */}
          {checking && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-sm text-gray-600">ตรวจสอบการชำระเงิน...</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Display */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">ยอดชำระ</p>
          <p className="text-3xl font-bold text-gray-900">
            ฿{qrData?.amountTHB.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-400 text-sm">
            (US$ {amount.toFixed(2)})
          </p>
        </div>

        {/* Timer */}
        <div className={`mt-4 text-center p-3 rounded-lg ${timeLeft < 60 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className="text-sm text-gray-500">หมดอายุใน</p>
          <p className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Reference */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">หมายเลขอ้างอิง</p>
          <p className="text-sm font-mono text-gray-600">{qrData?.reference}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full bg-gray-50 p-4 rounded-b-xl border-x border-b border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2 text-sm">วิธีชำระเงิน:</h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. เปิดแอป Mobile Banking ของคุณ</li>
          <li>2. เลือก "สแกน QR" หรือ "PromptPay"</li>
          <li>3. สแกน QR Code ด้านบน</li>
          <li>4. ตรวจสอบยอดเงินและยืนยันการชำระ</li>
        </ol>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            ยกเลิก
          </button>
          <button
            onClick={generateQR}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            สร้าง QR ใหม่
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptPayQR;
