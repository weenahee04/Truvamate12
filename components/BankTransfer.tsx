import React, { useState, useEffect } from 'react';
import stripePaymentService from '../services/stripePaymentService';

interface BankTransferProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  amountTHB: number;
  reference: string;
  bankLogo: string;
}

export const BankTransfer: React.FC<BankTransferProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'loading' | 'info' | 'upload' | 'processing' | 'complete'>('loading');
  const [slipImage, setSlipImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const details = await stripePaymentService.getBankTransferDetails({
        orderId,
        gameId,
        gameName,
        lines: 1,
        amount,
        currency: 'USD'
      });
      setBankDetails(details);
      setStep('info');
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลบัญชีธนาคารได้');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSlipImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSlip = async () => {
    if (!slipImage) {
      setError('กรุณาอัพโหลดสลิปการโอนเงิน');
      return;
    }

    setUploading(true);
    setStep('processing');

    // Simulate slip verification process
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate success
    setStep('complete');
    setUploading(false);

    // Wait a moment then call success
    setTimeout(() => {
      onSuccess(`bank_${Date.now()}_${bankDetails?.reference || orderId}`);
    }, 2000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('คัดลอกแล้ว!');
    } catch (err) {
      // Fallback for older browsers
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">กำลังโหลดข้อมูลบัญชี...</p>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">กำลังตรวจสอบสลิป</h3>
        <p className="text-gray-500">กรุณารอสักครู่...</p>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการโอนสำเร็จ!</h3>
        <p className="text-gray-500">ขอบคุณสำหรับการสั่งซื้อ</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-4">
        <h3 className="font-bold text-lg flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          โอนเงินผ่านธนาคาร
        </h3>
        <p className="text-green-100 text-sm">ยอดชำระ: ฿{bankDetails?.amountTHB?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}</p>
      </div>

      <div className="p-4">
        {step === 'info' && (
          <>
            {/* Bank Account Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-3">ข้อมูลบัญชีธนาคาร</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">ธนาคาร</span>
                  <div className="flex items-center">
                    <img 
                      src="https://www.kasikornbank.com/SiteCollectionDocuments/about/img/logo/logo.png" 
                      alt="KBank" 
                      className="h-6 mr-2"
                    />
                    <span className="font-medium">{bankDetails?.bankName || ''}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">เลขบัญชี</span>
                  <div className="flex items-center">
                    <span className="font-mono font-medium">{bankDetails?.accountNumber || ''}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails?.accountNumber || '')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">ชื่อบัญชี</span>
                  <span className="font-medium">{bankDetails?.accountName || ''}</span>
                </div>

                <div className="flex justify-between items-center bg-yellow-50 -mx-4 px-4 py-2">
                  <span className="text-gray-700 font-medium">ยอดโอน</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ฿{bankDetails?.amountTHB?.toLocaleString('th-TH', { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(bankDetails?.amountTHB?.toFixed(2) || '0')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Number */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm font-medium">หมายเลขอ้างอิง (Reference)</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-lg font-bold text-blue-900">{bankDetails?.reference || ''}</span>
                <button
                  onClick={() => copyToClipboard(bankDetails?.reference || '')}
                  className="text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-100 rounded"
                >
                  คัดลอก
                </button>
              </div>
              <p className="text-blue-600 text-xs mt-2">
                * กรุณาระบุหมายเลขนี้ในช่อง "หมายเหตุ" เมื่อโอนเงิน
              </p>
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">ขั้นตอนการชำระเงิน:</h4>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. โอนเงินตามยอดและบัญชีข้างต้น</li>
                <li>2. ใส่หมายเลขอ้างอิงในช่องหมายเหตุ</li>
                <li>3. บันทึกหลักฐานการโอน (สลิป)</li>
                <li>4. กดปุ่มด้านล่างเพื่ออัพโหลดสลิป</li>
              </ol>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              โอนเงินแล้ว - อัพโหลดสลิป
            </button>
          </>
        )}

        {step === 'upload' && (
          <>
            <button
              onClick={() => setStep('info')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center mb-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              กลับไปดูข้อมูลบัญชี
            </button>

            <h4 className="font-medium text-gray-800 mb-3">อัพโหลดสลิปการโอนเงิน</h4>

            {/* Upload Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                slipImage ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => document.getElementById('slip-upload')?.click()}
            >
              <input
                id="slip-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {slipImage ? (
                <div>
                  <img 
                    src={slipImage} 
                    alt="Payment Slip" 
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-green-600 mt-2 text-sm">คลิกเพื่อเปลี่ยนรูป</p>
                </div>
              ) : (
                <div>
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium">คลิกเพื่ออัพโหลดสลิป</p>
                  <p className="text-gray-400 text-sm mt-1">รองรับ JPG, PNG ขนาดไม่เกิน 5MB</p>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            <button
              onClick={handleSubmitSlip}
              disabled={!slipImage || uploading}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังอัพโหลด...
                </span>
              ) : (
                'ยืนยันการชำระเงิน'
              )}
            </button>
          </>
        )}

        {/* Cancel Button */}
        {step !== 'complete' && (
          <button
            onClick={onCancel}
            className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            ยกเลิก
          </button>
        )}
      </div>
    </div>
  );
};

export default BankTransfer;
