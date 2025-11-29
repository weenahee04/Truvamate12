/**
 * Stripe Payment Service
 * Frontend-only payment processing for demo/development
 */

import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';

// ==================== TYPES ====================

export type PaymentMethod = 'CARD' | 'PROMPTPAY' | 'TRUEMONEY' | 'BANK_TRANSFER' | 'WISE' | 'ALIPAY' | 'OMISE';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message: string;
  receiptUrl?: string;
  redirectUrl?: string;
}

export interface OrderDetails {
  orderId: string;
  gameId: string;
  gameName: string;
  lines: number;
  amount: number;
  currency: string;
  customerEmail?: string;
}

export interface WiseTransferDetails {
  recipientName: string;
  recipientEmail: string;
  bankDetails: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    swift: string;
  };
  amount: number;
  currency: string;
  reference: string;
  expiresAt: Date;
}

export interface AlipayQRData {
  qrCodeUrl: string;
  amount: number;
  amountCNY: number;
  expiresAt: Date;
  reference: string;
}

export interface OmisePaymentData {
  chargeId: string;
  authorizeUri?: string;
  status: string;
  amount: number;
  currency: string;
}

export interface SavedCard {
  id: string;
  type: 'VISA' | 'MASTERCARD' | 'AMEX';
  last4: string;
  expiry: string;
  expiryMonth: string;
  expiryYear: string;
  cardholderName: string;
  brand: string;
  isDefault: boolean;
}

export interface PromptPayQRData {
  qrCodeUrl: string;
  amount: number;
  amountTHB: number;
  expiresAt: Date;
  reference: string;
}

// ==================== STRIPE CONFIGURATION ====================

// Demo Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_TYooMQauvdEDq54NiTphI7jx';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// ==================== PAYMENT SERVICE ====================

class StripePaymentService {
  private readonly USD_TO_THB_RATE = 35.5;
  private readonly USD_TO_CNY_RATE = 7.2;

  /**
   * Process card payment
   */
  async processCardPayment(
    orderDetails: OrderDetails,
    cardDetails: {
      number: string;
      expiry: string;
      cvc: string;
      name: string;
    }
  ): Promise<PaymentResult> {
    try {
      // Simulate processing delay
      await this.delay(2000);

      const cardNumber = cardDetails.number.replace(/\s/g, '');
      
      // Validate card format
      if (!this.isValidCardNumber(cardNumber)) {
        return { success: false, message: 'หมายเลขบัตรไม่ถูกต้อง' };
      }

      // Validate expiry
      if (!this.isValidExpiry(cardDetails.expiry)) {
        return { success: false, message: 'วันหมดอายุไม่ถูกต้อง' };
      }

      // Validate CVC
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        return { success: false, message: 'รหัส CVV ไม่ถูกต้อง' };
      }

      // Test card scenarios
      if (cardNumber === '4000000000000002') {
        return { success: false, message: 'บัตรถูกปฏิเสธ กรุณาใช้บัตรอื่น' };
      }
      
      if (cardNumber === '4000000000009995') {
        return { success: false, message: 'วงเงินไม่เพียงพอ กรุณาใช้บัตรอื่น' };
      }

      // Success
      const transactionId = `txn_${this.generateId()}`;
      
      return {
        success: true,
        transactionId,
        message: 'ชำระเงินสำเร็จ!',
        receiptUrl: `https://pay.stripe.com/receipts/${transactionId}`
      };

    } catch (error) {
      console.error('Payment error:', error);
      return { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองใหม่อีกครั้ง' 
      };
    }
  }

  /**
   * Generate PromptPay QR Code for payment
   */
  async generatePromptPayQR(orderDetails: OrderDetails): Promise<PromptPayQRData> {
    await this.delay(500);

    const reference = `PP${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const amountTHB = this.convertToTHB(orderDetails.amount);

    // PromptPay phone number (demo)
    const promptPayId = '0891234567';
    
    // Generate EMVCo-compatible PromptPay payload
    const payload = this.generatePromptPayPayload(promptPayId, amountTHB);
    
    // Use QR code generator API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;

    return {
      qrCodeUrl,
      amount: orderDetails.amount,
      amountTHB,
      expiresAt,
      reference
    };
  }

  /**
   * Check PromptPay payment status (simulated)
   */
  async checkPromptPayStatus(reference: string): Promise<PaymentStatus> {
    await this.delay(1000);
    
    // Simulate: after 3 checks, payment completes
    const checkCount = parseInt(localStorage.getItem(`pp_check_${reference}`) || '0');
    localStorage.setItem(`pp_check_${reference}`, (checkCount + 1).toString());
    
    if (checkCount >= 3) {
      localStorage.removeItem(`pp_check_${reference}`);
      return 'COMPLETED';
    }
    
    return 'PENDING';
  }

  /**
   * Process TrueMoney Wallet payment (simulated)
   */
  async processTrueMoneyPayment(
    orderDetails: OrderDetails,
    phoneNumber: string
  ): Promise<PaymentResult> {
    await this.delay(2000);

    // Validate Thai phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith('0')) {
      return { success: false, message: 'หมายเลขโทรศัพท์ไม่ถูกต้อง' };
    }

    return {
      success: true,
      transactionId: `tm_${this.generateId()}`,
      message: 'ชำระเงินผ่าน TrueMoney สำเร็จ!',
    };
  }

  /**
   * Get bank transfer details
   */
  async getBankTransferDetails(orderDetails: OrderDetails): Promise<{
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    amountTHB: number;
    reference: string;
    bankLogo: string;
  }> {
    return {
      bankName: 'ธนาคารกรุงเทพ',
      accountNumber: '123-4-56789-0',
      accountName: 'บริษัท ทรูวาเมท จำกัด',
      amount: orderDetails.amount,
      amountTHB: this.convertToTHB(orderDetails.amount),
      reference: `TRV${Date.now().toString().slice(-8)}`,
      bankLogo: 'https://www.bangkokbank.com/en/-/media/bangkokbank/logo/logo-bbbl.png'
    };
  }

  /**
   * Confirm bank transfer with slip
   */
  async confirmBankTransfer(
    reference: string,
    slipImage?: File
  ): Promise<PaymentResult> {
    await this.delay(1500);

    if (slipImage) {
      // In production: upload slip and verify
      console.log('Slip uploaded:', slipImage.name);
    }

    return {
      success: true,
      transactionId: `bt_${this.generateId()}`,
      message: 'ยืนยันการโอนเงินสำเร็จ! กำลังดำเนินการตรวจสอบ',
    };
  }

  // ==================== WISE PAYMENT ====================

  /**
   * Get Wise transfer details for international payment
   */
  async getWiseTransferDetails(orderDetails: OrderDetails): Promise<WiseTransferDetails> {
    await this.delay(500);
    
    return {
      recipientName: 'TruvaMate International Ltd',
      recipientEmail: 'payments@truvamate.com',
      bankDetails: {
        accountNumber: '8312456789',
        routingNumber: '026073150',
        bankName: 'Community Federal Savings Bank',
        swift: 'CMFGUS33'
      },
      amount: orderDetails.amount,
      currency: 'USD',
      reference: `WISE-${Date.now().toString().slice(-8)}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  /**
   * Process Wise payment confirmation
   */
  async confirmWisePayment(reference: string): Promise<PaymentResult> {
    await this.delay(2000);
    
    return {
      success: true,
      transactionId: `wise_${this.generateId()}`,
      message: 'ยืนยันการโอนเงินผ่าน Wise สำเร็จ!',
    };
  }

  // ==================== ALIPAY PAYMENT ====================

  /**
   * Generate Alipay QR Code for payment
   */
  async generateAlipayQR(orderDetails: OrderDetails): Promise<AlipayQRData> {
    await this.delay(500);

    const reference = `ALIPAY${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const amountCNY = this.convertToCNY(orderDetails.amount);

    // Generate Alipay payment URL (demo)
    const alipayUrl = `https://qr.alipay.com/demo?amount=${amountCNY}&ref=${reference}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(alipayUrl)}`;

    return {
      qrCodeUrl,
      amount: orderDetails.amount,
      amountCNY,
      expiresAt,
      reference
    };
  }

  /**
   * Check Alipay payment status (simulated)
   */
  async checkAlipayStatus(reference: string): Promise<PaymentStatus> {
    await this.delay(1000);
    
    const checkCount = parseInt(localStorage.getItem(`alipay_check_${reference}`) || '0');
    localStorage.setItem(`alipay_check_${reference}`, (checkCount + 1).toString());
    
    if (checkCount >= 3) {
      localStorage.removeItem(`alipay_check_${reference}`);
      return 'COMPLETED';
    }
    
    return 'PENDING';
  }

  /**
   * Process Alipay redirect payment
   */
  async processAlipayPayment(orderDetails: OrderDetails): Promise<PaymentResult> {
    await this.delay(1500);
    
    const transactionId = `alipay_${this.generateId()}`;
    
    return {
      success: true,
      transactionId,
      message: '支付宝支付成功！',
      redirectUrl: `https://alipay.com/receipt/${transactionId}`
    };
  }

  // ==================== OMISE PAYMENT ====================

  /**
   * Process Omise payment (Thailand gateway)
   */
  async processOmisePayment(
    orderDetails: OrderDetails,
    paymentType: 'promptpay' | 'truemoney' | 'internet_banking' | 'credit_card',
    cardDetails?: {
      number: string;
      expiry: string;
      cvc: string;
      name: string;
    }
  ): Promise<PaymentResult> {
    await this.delay(2000);

    const chargeId = `chrg_${this.generateId()}`;
    const amountTHB = this.convertToTHB(orderDetails.amount);

    if (paymentType === 'credit_card' && cardDetails) {
      const cardNumber = cardDetails.number.replace(/\s/g, '');
      
      if (!this.isValidCardNumber(cardNumber)) {
        return { success: false, message: 'หมายเลขบัตรไม่ถูกต้อง' };
      }

      return {
        success: true,
        transactionId: chargeId,
        message: 'ชำระเงินผ่าน Omise สำเร็จ!',
        receiptUrl: `https://dashboard.omise.co/charges/${chargeId}`
      };
    }

    // For other payment types, return redirect URL
    return {
      success: true,
      transactionId: chargeId,
      message: `ชำระเงินผ่าน ${paymentType} สำเร็จ!`,
      redirectUrl: `https://api.omise.co/charges/${chargeId}/authorize`
    };
  }

  /**
   * Generate Omise PromptPay QR
   */
  async generateOmisePromptPayQR(orderDetails: OrderDetails): Promise<{
    qrCodeUrl: string;
    chargeId: string;
    amount: number;
    amountTHB: number;
    expiresAt: Date;
  }> {
    await this.delay(500);

    const chargeId = `chrg_${this.generateId()}`;
    const amountTHB = this.convertToTHB(orderDetails.amount);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Generate PromptPay QR via Omise
    const qrData = `00020101021229370016A000000677010111011300665539999999530376454${amountTHB.toFixed(2).length.toString().padStart(2, '0')}${amountTHB.toFixed(2)}5802TH6304`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

    return {
      qrCodeUrl,
      chargeId,
      amount: orderDetails.amount,
      amountTHB,
      expiresAt
    };
  }

  /**
   * Get available Omise payment methods
   */
  getOmisePaymentMethods(): Array<{
    id: string;
    name: string;
    nameTh: string;
    icon: string;
    available: boolean;
  }> {
    return [
      { id: 'promptpay', name: 'PromptPay', nameTh: 'พร้อมเพย์', icon: '📱', available: true },
      { id: 'truemoney', name: 'TrueMoney Wallet', nameTh: 'ทรูมันนี่ วอลเล็ท', icon: '💰', available: true },
      { id: 'internet_banking', name: 'Internet Banking', nameTh: 'อินเทอร์เน็ตแบงก์กิ้ง', icon: '🏦', available: true },
      { id: 'credit_card', name: 'Credit Card', nameTh: 'บัตรเครดิต', icon: '💳', available: true },
      { id: 'rabbit_linepay', name: 'Rabbit LINE Pay', nameTh: 'แรบบิท ไลน์ เพย์', icon: '🐰', available: true },
    ];
  }

  /**
   * Get saved cards for user
   */
  async getSavedCards(userId: string = 'default'): Promise<SavedCard[]> {
    const saved = localStorage.getItem(`saved_cards_${userId}`);
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Save a card
   */
  async saveCard(
    cardDetails: {
      number: string;
      expiry: string;
      name: string;
    },
    userId: string = 'default'
  ): Promise<SavedCard> {
    const cards = await this.getSavedCards(userId);
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    const [month, year] = cardDetails.expiry.split('/').map(s => s.trim());
    const cardType = this.getCardType(cardNumber);
    
    const newCard: SavedCard = {
      id: `card_${this.generateId()}`,
      type: cardType,
      brand: cardType.toLowerCase(),
      last4: cardNumber.slice(-4),
      expiry: cardDetails.expiry,
      expiryMonth: month,
      expiryYear: year,
      cardholderName: cardDetails.name,
      isDefault: cards.length === 0
    };

    cards.push(newCard);
    localStorage.setItem(`saved_cards_${userId}`, JSON.stringify(cards));

    return newCard;
  }

  /**
   * Delete saved card
   */
  async deleteCard(cardId: string, userId: string = 'default'): Promise<void> {
    const cards = await this.getSavedCards(userId);
    const filtered = cards.filter(c => c.id !== cardId);
    localStorage.setItem(`saved_cards_${userId}`, JSON.stringify(filtered));
  }

  /**
   * Set default card
   */
  async setDefaultCard(cardId: string, userId: string = 'default'): Promise<void> {
    const cards = await this.getSavedCards(userId);
    const updated = cards.map(c => ({ ...c, isDefault: c.id === cardId }));
    localStorage.setItem(`saved_cards_${userId}`, JSON.stringify(updated));
  }

  // ==================== HELPER METHODS ====================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private isValidCardNumber(cardNumber: string): boolean {
    if (cardNumber.length < 13 || cardNumber.length > 19) return false;
    return this.luhnCheck(cardNumber);
  }

  private luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  private isValidExpiry(expiry: string): boolean {
    const [month, year] = expiry.split('/').map(s => parseInt(s.trim(), 10));
    if (!month || !year) return false;
    if (month < 1 || month > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  }

  private getCardType(cardNumber: string): 'VISA' | 'MASTERCARD' | 'AMEX' {
    if (cardNumber.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) return 'MASTERCARD';
    if (/^3[47]/.test(cardNumber)) return 'AMEX';
    return 'VISA';
  }

  convertToTHB(usdAmount: number): number {
    return Math.round(usdAmount * this.USD_TO_THB_RATE * 100) / 100;
  }

  convertToCNY(usdAmount: number): number {
    return Math.round(usdAmount * this.USD_TO_CNY_RATE * 100) / 100;
  }

  formatAmount(amount: number, currency: string = 'USD'): string {
    const locale = currency === 'THB' ? 'th-TH' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Generate PromptPay EMVCo payload
   */
  private generatePromptPayPayload(phoneNumber: string, amount: number): string {
    // Simplified PromptPay payload format
    // In production, use proper EMVCo QR code generation
    const formatIndicator = '000201';
    const pointOfInitiation = '010212'; // Dynamic QR
    const merchantAccountInfo = `2937001600A00000067701011101130066${phoneNumber}`;
    const transactionCurrency = '5303764'; // THB = 764
    const transactionAmount = `54${amount.toFixed(2).length.toString().padStart(2, '0')}${amount.toFixed(2)}`;
    const countryCode = '5802TH';
    
    const dataWithoutCRC = formatIndicator + pointOfInitiation + merchantAccountInfo + 
                           transactionCurrency + transactionAmount + countryCode + '6304';
    
    // CRC-16 checksum (simplified)
    const crc = this.calculateCRC16(dataWithoutCRC);
    
    return dataWithoutCRC + crc;
  }

  private calculateCRC16(data: string): string {
    let crc = 0xFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService();
export default stripePaymentService;
