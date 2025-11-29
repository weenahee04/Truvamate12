import React, { useState, useEffect } from 'react';

interface WeChatPaymentProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

interface WeChatQRData {
  qrCodeUrl: string;
  amountCNY: number;
  reference: string;
  expiresAt: Date;
}

export const WeChatPayment: React.FC<WeChatPaymentProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [qrData, setQrData] = useState<WeChatQRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [error, setError] = useState<string | null>(null);

  // Mock exchange rate USD to CNY
  const exchangeRate = 7.25;
  const amountCNY = amount * exchangeRate;

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
          setError('二维码已过期，请重新生成');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate payment check every 5 seconds
    const statusChecker = setInterval(async () => {
      setChecking(true);
      // Simulate API check
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChecking(false);
      
      // In production, this would check real payment status
      // For demo, we'll randomly complete after a few checks
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
      
      // Simulate QR generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reference = `WX${Date.now().toString(36).toUpperCase()}`;
      
      // Generate a mock QR code URL (in production, this would come from WeChat API)
      const mockQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=wxp://f2f0${reference}${Math.random().toString(36).slice(2)}`;
      
      setQrData({
        qrCodeUrl: mockQRUrl,
        amountCNY: amountCNY,
        reference: reference,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });
      setTimeLeft(15 * 60);
    } catch (err) {
      setError('无法生成二维码，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate successful payment for demo
  const simulatePayment = () => {
    if (qrData) {
      onSuccess(`wechat_${qrData.reference}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-500">正在生成微信支付二维码...</p>
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
          className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600"
        >
          重新生成二维码
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-xl text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          {/* WeChat Icon */}
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
          </svg>
          <span className="font-bold text-xl">微信支付</span>
          <span className="text-green-200 text-sm">WeChat Pay</span>
        </div>
        <p className="text-green-100 text-sm">扫码支付</p>
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 border-x border-gray-200 w-full">
        <div className="relative max-w-xs mx-auto">
          <img 
            src={qrData?.qrCodeUrl} 
            alt="WeChat Pay QR Code"
            className="w-64 h-64 mx-auto rounded-lg border-2 border-gray-100"
          />
          
          {/* WeChat logo overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
              </svg>
            </div>
          </div>
          
          {/* Checking overlay */}
          {checking && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
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
        <div className={`mt-4 text-center p-3 rounded-lg ${timeLeft < 60 ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className="text-sm text-gray-500">二维码有效期</p>
          <p className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-green-800'}`}>
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
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
            打开微信 App
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
            点击右上角"+"，选择"扫一扫"
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
            扫描上方二维码
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
            确认金额并完成支付
          </li>
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
            className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition"
          >
            刷新二维码
          </button>
        </div>

        {/* Demo button - Remove in production */}
        <button
          onClick={simulatePayment}
          className="w-full mt-3 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition text-sm"
        >
          🎮 模拟支付成功 (Demo)
        </button>
      </div>

      {/* Security Badge */}
      <div className="mt-4 text-center text-xs text-gray-400">
        <div className="flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          财付通安全支付
        </div>
      </div>
    </div>
  );
};

export default WeChatPayment;
