import React, { useState, useEffect } from 'react';
import stripePaymentService, { WiseTransferDetails } from '../services/stripePaymentService';

interface WisePaymentProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

export const WisePayment: React.FC<WisePaymentProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'loading' | 'details' | 'confirm' | 'processing' | 'success'>('loading');
  const [transferDetails, setTransferDetails] = useState<WiseTransferDetails | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransferDetails();
  }, []);

  const loadTransferDetails = async () => {
    try {
      const details = await stripePaymentService.getWiseTransferDetails({
        orderId,
        gameId,
        gameName,
        lines: 1,
        amount,
        currency: 'USD'
      });
      setTransferDetails(details);
      setStep('details');
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูล Wise ได้');
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirmationCode.trim()) {
      setError('กรุณากรอก Wise Transaction ID');
      return;
    }

    setStep('processing');
    
    try {
      const result = await stripePaymentService.confirmWisePayment(transferDetails?.reference || '');
      
      if (result.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess(result.transactionId!);
        }, 2000);
      } else {
        setError(result.message);
        setStep('confirm');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      setStep('confirm');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('คัดลอกแล้ว!');
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('คัดลอกแล้ว!');
    }
  };

  if (step === 'loading') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-500">กำลังโหลดข้อมูล Wise...</p>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">กำลังตรวจสอบการโอน</h3>
        <p className="text-gray-500">กรุณารอสักครู่...</p>
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
        <h3 className="text-xl font-bold text-gray-800 mb-2">การโอนผ่าน Wise สำเร็จ!</h3>
        <p className="text-gray-500">ขอบคุณสำหรับการสั่งซื้อ</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span className="font-bold text-xl">Wise Transfer</span>
        </div>
        <p className="text-center text-green-100 text-sm mt-1">International Money Transfer</p>
      </div>

      <div className="p-4">
        {step === 'details' && (
          <>
            {/* Amount Display */}
            <div className="bg-green-50 rounded-lg p-4 mb-4 text-center">
              <p className="text-gray-500 text-sm">ยอดชำระ</p>
              <p className="text-3xl font-bold text-green-600">${amount.toFixed(2)} USD</p>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                🏦 Recipient Bank Details
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Recipient Name</span>
                  <div className="flex items-center">
                    <span className="font-medium">{transferDetails?.recipientName}</span>
                    <button
                      onClick={() => copyToClipboard(transferDetails?.recipientName || '')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Bank Name</span>
                  <span className="font-medium">{transferDetails?.bankDetails.bankName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Account Number</span>
                  <div className="flex items-center">
                    <span className="font-mono font-medium">{transferDetails?.bankDetails.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(transferDetails?.bankDetails.accountNumber || '')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Routing Number</span>
                  <div className="flex items-center">
                    <span className="font-mono font-medium">{transferDetails?.bankDetails.routingNumber}</span>
                    <button
                      onClick={() => copyToClipboard(transferDetails?.bankDetails.routingNumber || '')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">SWIFT</span>
                  <span className="font-mono font-medium">{transferDetails?.bankDetails.swift}</span>
                </div>
              </div>
            </div>

            {/* Reference */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 text-sm font-medium">Reference (ระบุในหมายเหตุ)</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-lg font-bold text-green-900">{transferDetails?.reference}</span>
                <button
                  onClick={() => copyToClipboard(transferDetails?.reference || '')}
                  className="text-green-600 hover:text-green-800 px-2 py-1 bg-green-100 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2 text-sm">📋 ขั้นตอนการโอน:</h4>
              <ol className="text-xs text-yellow-700 space-y-1">
                <li>1. เข้าแอป Wise หรือเว็บไซต์ wise.com</li>
                <li>2. เลือก "Send Money" ไปยัง USA</li>
                <li>3. กรอกข้อมูลธนาคารด้านบน</li>
                <li>4. ใส่ Reference ในช่องหมายเหตุ</li>
                <li>5. ยืนยันการโอนและบันทึก Transaction ID</li>
              </ol>
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
            >
              โอนเงินแล้ว - ยืนยันการชำระ
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <button
              onClick={() => setStep('details')}
              className="text-green-600 hover:text-green-800 text-sm flex items-center mb-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              กลับไปดูข้อมูลบัญชี
            </button>

            <div className="text-center mb-4">
              <h4 className="font-bold text-gray-800 text-lg">ยืนยันการโอนเงิน</h4>
              <p className="text-gray-500 text-sm">กรุณากรอก Wise Transaction ID</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wise Transaction ID
              </label>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => {
                  setConfirmationCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                placeholder="เช่น T12345678"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-mono ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <p className="text-gray-400 text-xs mt-1">คุณสามารถดู Transaction ID ได้จากหน้ายืนยันการโอนใน Wise</p>
            </div>

            <button
              onClick={handleConfirmPayment}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
            >
              ยืนยันการชำระเงิน
            </button>
          </>
        )}

        {/* Cancel Button */}
        {step !== 'success' && (
          <button
            onClick={onCancel}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            ยกเลิก
          </button>
        )}

        {/* Security Badge */}
        <div className="mt-4 text-center text-xs text-gray-400">
          <div className="flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            FCA Regulated • Safe & Secure
          </div>
        </div>
      </div>
    </div>
  );
};

export default WisePayment;
