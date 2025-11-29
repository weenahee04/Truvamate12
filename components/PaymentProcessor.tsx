import React, { useState, useEffect } from 'react';
import stripePaymentService, { SavedCard, PaymentResult } from '../services/stripePaymentService';

interface PaymentProcessorProps {
  amount: number;
  orderId: string;
  gameId: string;
  gameName: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

interface CardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  saveCard: boolean;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  amount,
  orderId,
  gameId,
  gameName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(true);
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    saveCard: true
  });
  const [errors, setErrors] = useState<Partial<CardFormData>>({});

  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    const cards = await stripePaymentService.getSavedCards();
    setSavedCards(cards);
    setShowNewCard(cards.length === 0);
  };

  const formatCardNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };

  const handleInputChange = (field: keyof CardFormData, value: string | boolean) => {
    if (field === 'cardNumber' && typeof value === 'string') {
      value = formatCardNumber(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CardFormData> = {};
    
    const cardNum = formData.cardNumber.replace(/\s/g, '');
    if (!cardNum || cardNum.length < 13 || cardNum.length > 19) {
      newErrors.cardNumber = 'กรุณากรอกหมายเลขบัตรที่ถูกต้อง';
    }

    const month = parseInt(formData.expiryMonth);
    if (!month || month < 1 || month > 12) {
      newErrors.expiryMonth = 'เดือนไม่ถูกต้อง';
    }

    const year = parseInt(formData.expiryYear);
    const currentYear = new Date().getFullYear() % 100;
    if (!year || year < currentYear || year > currentYear + 20) {
      newErrors.expiryYear = 'ปีไม่ถูกต้อง';
    }

    if (!formData.cvv || formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'CVV ไม่ถูกต้อง';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'กรุณากรอกชื่อบนบัตร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayWithNewCard = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const expiry = `${formData.expiryMonth}/${formData.expiryYear}`;
      const result = await stripePaymentService.processCardPayment({
        orderId,
        gameId,
        gameName,
        lines: 1,
        amount,
        currency: 'USD'
      }, {
        number: formData.cardNumber.replace(/\s/g, ''),
        expiry: expiry,
        cvc: formData.cvv,
        name: formData.cardholderName
      });

      if (result.success && formData.saveCard) {
        await stripePaymentService.saveCard({
          number: formData.cardNumber.replace(/\s/g, ''),
          expiry: expiry,
          name: formData.cardholderName
        });
        await loadSavedCards();
      }

      onSuccess(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'การชำระเงินล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithSavedCard = async () => {
    if (!selectedCard) {
      onError('กรุณาเลือกบัตรที่จะใช้ชำระเงิน');
      return;
    }

    const card = savedCards.find(c => c.id === selectedCard);
    if (!card) {
      onError('ไม่พบข้อมูลบัตร');
      return;
    }

    setLoading(true);
    try {
      // For saved cards, we simulate the payment
      const result = await stripePaymentService.processCardPayment({
        orderId,
        gameId,
        gameName,
        lines: 1,
        amount,
        currency: 'USD'
      }, {
        number: '4242424242424242', // Test card for saved card simulation
        expiry: card.expiry,
        cvc: '123', // CVV is always re-entered in real systems
        name: 'Saved Card'
      });

      onSuccess(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'การชำระเงินล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const deleteSavedCard = async (cardId: string) => {
    await stripePaymentService.deleteCard(cardId);
    await loadSavedCards();
    if (selectedCard === cardId) {
      setSelectedCard(null);
    }
    if (savedCards.length === 1) {
      setShowNewCard(true);
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return (
          <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#1A1F71"/>
            <path d="M19 10l-3 12h-3l3-12h3zm12 7.8c0-2.4-1.6-3.2-3.2-3.2-1.6 0-2.8.8-2.8.8l-.4-2s1.6-.8 3.6-.8c3.2 0 5.2 1.6 5.2 4.4 0 4.4-6 4.8-6 7.2h5.6l-.4 2H23s0-6.4 4.8-8.4h3.2zm-7.6-7.8l-1.6 8.8-2-.8-3.6-6.8-.8 6.8h-2.8l1.6-9.6h3.2l3.2 6.4.8-5.6 2 .8z" fill="#fff"/>
          </svg>
        );
      case 'mastercard':
        return (
          <svg className="w-10 h-6" viewBox="0 0 48 32" fill="none">
            <rect width="48" height="32" rx="4" fill="#252525"/>
            <circle cx="19" cy="16" r="8" fill="#EB001B"/>
            <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
            <path d="M24 10a8 8 0 000 12 8 8 0 000-12z" fill="#FF5F00"/>
          </svg>
        );
      default:
        return (
          <div className="w-10 h-6 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600">
            CARD
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
        <h3 className="font-bold text-lg">ชำระเงินด้วยบัตรเครดิต/เดบิต</h3>
        <p className="text-indigo-100 text-sm">ยอดชำระ: ${amount.toFixed(2)}</p>
      </div>

      <div className="p-4">
        {/* Saved Cards Section */}
        {savedCards.length > 0 && !showNewCard && (
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-gray-700">บัตรที่บันทึกไว้</h4>
            {savedCards.map(card => (
              <div 
                key={card.id}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  selectedCard === card.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedCard(card.id)}
              >
                <input
                  type="radio"
                  checked={selectedCard === card.id}
                  onChange={() => setSelectedCard(card.id)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div className="ml-3 flex-1 flex items-center">
                  {getCardIcon(card.brand)}
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">•••• {card.last4}</p>
                    <p className="text-xs text-gray-500">หมดอายุ {card.expiryMonth}/{card.expiryYear}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSavedCard(card.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              onClick={() => setShowNewCard(true)}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition"
            >
              + เพิ่มบัตรใหม่
            </button>

            {selectedCard && (
              <button
                onClick={handlePayWithSavedCard}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    กำลังดำเนินการ...
                  </span>
                ) : (
                  `ชำระ $${amount.toFixed(2)}`
                )}
              </button>
            )}
          </div>
        )}

        {/* New Card Form */}
        {showNewCard && (
          <div className="space-y-4">
            {savedCards.length > 0 && (
              <button
                onClick={() => setShowNewCard(false)}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                กลับไปเลือกบัตรที่บันทึกไว้
              </button>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขบัตร</label>
              <input
                type="text"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                placeholder="1234 5678 9012 3456"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เดือน</label>
                <input
                  type="text"
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange('expiryMonth', e.target.value.replace(/\D/g, '').substring(0, 2))}
                  placeholder="MM"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={2}
                />
                {errors.expiryMonth && <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ปี</label>
                <input
                  type="text"
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange('expiryYear', e.target.value.replace(/\D/g, '').substring(0, 2))}
                  placeholder="YY"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={2}
                />
                {errors.expiryYear && <p className="text-red-500 text-xs mt-1">{errors.expiryYear}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="password"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="•••"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={4}
                />
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบนบัตร</label>
              <input
                type="text"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange('cardholderName', e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.cardholderName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cardholderName && <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>}
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.saveCard}
                onChange={(e) => handleInputChange('saveCard', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">บันทึกบัตรนี้สำหรับการชำระครั้งถัดไป</span>
            </label>

            <button
              onClick={handlePayWithNewCard}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  กำลังดำเนินการ...
                </span>
              ) : (
                `ชำระ $${amount.toFixed(2)}`
              )}
            </button>

            {/* Test Card Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm font-medium">🧪 โหมดทดสอบ</p>
              <p className="text-yellow-700 text-xs mt-1">
                ใช้หมายเลขบัตรทดสอบ: 4242 4242 4242 4242<br/>
                วันหมดอายุ: ใดก็ได้ในอนาคต, CVV: เลข 3 หลักใดก็ได้
              </p>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          ยกเลิก
        </button>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center text-gray-400 text-xs">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secured by SSL Encryption
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor;
