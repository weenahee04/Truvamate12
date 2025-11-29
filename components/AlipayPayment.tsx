import React, { useState, useEffect } from 'react';
import stripePaymentService, { AlipayQRData } from '../services/stripePaymentService';

interface AlipayPaymentProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export const AlipayPayment: React.FC<AlipayPaymentProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [qrData, setQrData] = useState<AlipayQRData | null>(null);
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
          setError('QR Code 已过期，请重新生成');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Check payment status every 5 seconds
    const statusChecker = setInterval(async () => {
      if (qrData.reference) {
        setChecking(true);
        const status = await stripePaymentService.checkAlipayStatus(qrData.reference);
        setChecking(false);
        
        if (status === 'COMPLETED') {
          clearInterval(statusChecker);
          clearInterval(timer);
          onSuccess(`alipay_${qrData.reference}`);
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
      
      const data = await stripePaymentService.generateAlipayQR({
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
      setError('无法生成 QR Code，请重试');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500">正在生成支付宝 QR Code...</p>
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
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600"
        >
          重新生成 QR Code
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
          </svg>
          <span className="font-bold text-xl">支付宝</span>
          <span className="text-blue-200 text-sm">Alipay</span>
        </div>
        <p className="text-blue-100 text-sm">扫码支付</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 border-x border-gray-200 w-full">
        <div className="relative max-w-xs mx-auto">
          <img 
            src={qrData?.qrCodeUrl} 
            alt="Alipay QR Code"
            className="w-64 h-64 mx-auto rounded-lg border-2 border-gray-100"
          />
          
          {/* Checking overlay */}
          {checking && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <span className="text-sm text-gray-600">检查支付状态...</span>
              </div>
            </div>
          )}
        </div>

        {/* Amount Display */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">支付金额</p>
          <p className="text-3xl font-bold text-gray-900">
            ¥{qrData?.amountCNY.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-400 text-sm">
            (${amount.toFixed(2)} USD)
          </p>
        </div>

        {/* Timer */}
        <div className={`mt-4 text-center p-3 rounded-lg ${timeLeft < 60 ? 'bg-red-50' : 'bg-blue-50'}`}>
          <p className="text-sm text-gray-500">二维码有效期</p>
          <p className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-800'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>

        {/* Reference */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">订单号</p>
          <p className="text-sm font-mono text-gray-600">{qrData?.reference}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full bg-gray-50 p-4 rounded-b-xl border-x border-b border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2 text-sm">支付步骤：</h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. 打开支付宝 App</li>
          <li>2. 点击首页"扫一扫"</li>
          <li>3. 扫描上方二维码</li>
          <li>4. 确认金额并完成支付</li>
        </ol>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            取消
          </button>
          <button
            onClick={generateQR}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            刷新二维码
          </button>
        </div>
      </div>

      {/* Security Badge */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <div className="flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          蚂蚁金服安全支付
        </div>
      </div>
    </div>
  );
};

export default AlipayPayment;
