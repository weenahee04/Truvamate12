/**
 * Payment Service
 * Handles integrations with Wise, Omise, and Alipay payment gateways
 */

// ==================== TYPES ====================

export interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  description: string;
  returnUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  qrCode?: string;
  message?: string;
  error?: string;
}

// ==================== WISE API ====================

/**
 * Wise (TransferWise) Payment Integration
 * API Documentation: https://api-docs.wise.com/
 */
export class WisePaymentService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, isProduction: boolean = false) {
    this.apiKey = apiKey;
    this.baseUrl = isProduction 
      ? 'https://api.wise.com/v1' 
      : 'https://api.sandbox.transferwise.tech/v1';
  }

  /**
   * Create a Wise payment quote
   */
  async createQuote(params: {
    sourceCurrency: string;
    targetCurrency: string;
    amount: number;
    payOut: 'BANK_TRANSFER' | 'BALANCE';
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/quotes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceCurrency: params.sourceCurrency,
        targetCurrency: params.targetCurrency,
        sourceAmount: params.amount,
        payOut: params.payOut,
      }),
    });

    if (!response.ok) {
      throw new Error(`Wise API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a Wise transfer
   */
  async createTransfer(params: {
    targetAccount: number;
    quoteUuid: string;
    customerTransactionId: string;
    details: {
      reference: string;
      transferPurpose?: string;
    };
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transfers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Wise Transfer Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Fund a transfer
   */
  async fundTransfer(transferId: number, profileId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/profiles/${profileId}/transfers/${transferId}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'BALANCE',
      }),
    });

    if (!response.ok) {
      throw new Error(`Wise Fund Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get transfer status
   */
  async getTransferStatus(transferId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/transfers/${transferId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Wise Status Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// ==================== OMISE API ====================

/**
 * Omise Payment Integration (Thailand)
 * API Documentation: https://docs.opn.ooo/
 */
export class OmisePaymentService {
  private secretKey: string;
  private publicKey: string;
  private baseUrl: string;

  constructor(publicKey: string, secretKey: string) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.omise.co';
  }

  /**
   * Create a charge
   */
  async createCharge(params: PaymentRequest & {
    source?: {
      type: 'promptpay' | 'truemoney' | 'rabbit_linepay' | 'mobile_banking';
    };
  }): Promise<PaymentResponse> {
    try {
      const auth = Buffer.from(`${this.secretKey}:`).toString('base64');
      
      const body = new URLSearchParams({
        amount: (params.amount * 100).toString(), // Omise uses smallest currency unit
        currency: params.currency,
        description: params.description,
        'metadata[order_id]': params.orderId,
        'metadata[customer_id]': params.customerId,
      });

      if (params.source) {
        body.append('source[type]', params.source.type);
      }

      if (params.returnUrl) {
        body.append('return_uri', params.returnUrl);
      }

      const response = await fetch(`${this.baseUrl}/charges`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      const data = await response.json();

      if (!response.ok || data.object === 'error') {
        return {
          success: false,
          error: data.message || 'Payment failed',
        };
      }

      return {
        success: true,
        transactionId: data.id,
        redirectUrl: data.authorize_uri,
        qrCode: data.source?.scannable_code?.image?.download_uri,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create PromptPay QR payment
   */
  async createPromptPayCharge(params: PaymentRequest): Promise<PaymentResponse> {
    return this.createCharge({
      ...params,
      source: { type: 'promptpay' },
    });
  }

  /**
   * Create TrueMoney payment
   */
  async createTrueMoneyCharge(params: PaymentRequest & { phoneNumber: string }): Promise<PaymentResponse> {
    return this.createCharge({
      ...params,
      source: { type: 'truemoney' },
    });
  }

  /**
   * Get charge status
   */
  async getChargeStatus(chargeId: string): Promise<any> {
    const auth = Buffer.from(`${this.secretKey}:`).toString('base64');
    
    const response = await fetch(`${this.baseUrl}/charges/${chargeId}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    return response.json();
  }

  /**
   * Create a refund
   */
  async createRefund(chargeId: string, amount?: number): Promise<any> {
    const auth = Buffer.from(`${this.secretKey}:`).toString('base64');
    
    const body = new URLSearchParams();
    if (amount) {
      body.append('amount', (amount * 100).toString());
    }

    const response = await fetch(`${this.baseUrl}/charges/${chargeId}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    return response.json();
  }
}

// ==================== ALIPAY API ====================

/**
 * Alipay Payment Integration
 * API Documentation: https://global.alipay.com/docs/ac/web/overview
 */
export class AlipayPaymentService {
  private appId: string;
  private privateKey: string;
  private alipayPublicKey: string;
  private gatewayUrl: string;

  constructor(appId: string, privateKey: string, alipayPublicKey: string, isProduction: boolean = false) {
    this.appId = appId;
    this.privateKey = privateKey;
    this.alipayPublicKey = alipayPublicKey;
    this.gatewayUrl = isProduction 
      ? 'https://openapi.alipay.com/gateway.do' 
      : 'https://openapi.alipaydev.com/gateway.do';
  }

  /**
   * Create Alipay payment (Web)
   */
  async createWebPayment(params: PaymentRequest): Promise<PaymentResponse> {
    try {
      const bizContent = {
        out_trade_no: params.orderId,
        total_amount: params.amount.toFixed(2),
        subject: params.description,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        timeout_express: '30m',
      };

      const commonParams = {
        app_id: this.appId,
        method: 'alipay.trade.page.pay',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString(),
        version: '1.0',
        notify_url: params.returnUrl,
        biz_content: JSON.stringify(bizContent),
      };

      // Sign the request (implementation depends on your crypto library)
      const sign = await this.signRequest(commonParams);
      const signedParams = { ...commonParams, sign };

      // Build form HTML for redirect
      const formHtml = this.buildPaymentForm(signedParams);

      return {
        success: true,
        redirectUrl: this.gatewayUrl,
        message: formHtml,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create Alipay QR code payment
   */
  async createQrPayment(params: PaymentRequest): Promise<PaymentResponse> {
    try {
      const bizContent = {
        out_trade_no: params.orderId,
        total_amount: params.amount.toFixed(2),
        subject: params.description,
        timeout_express: '30m',
      };

      const commonParams = {
        app_id: this.appId,
        method: 'alipay.trade.precreate',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString(),
        version: '1.0',
        notify_url: params.returnUrl,
        biz_content: JSON.stringify(bizContent),
      };

      const sign = await this.signRequest(commonParams);
      const response = await this.makeRequest({ ...commonParams, sign });

      if (response.alipay_trade_precreate_response?.code === '10000') {
        return {
          success: true,
          transactionId: response.alipay_trade_precreate_response.out_trade_no,
          qrCode: response.alipay_trade_precreate_response.qr_code,
        };
      }

      return {
        success: false,
        error: response.alipay_trade_precreate_response?.sub_msg || 'QR creation failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Query payment status
   */
  async queryPayment(orderId: string): Promise<any> {
    const bizContent = {
      out_trade_no: orderId,
    };

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.query',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString(),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };

    const sign = await this.signRequest(commonParams);
    return this.makeRequest({ ...commonParams, sign });
  }

  /**
   * Refund payment
   */
  async refundPayment(orderId: string, refundAmount: number, refundReason: string): Promise<any> {
    const bizContent = {
      out_trade_no: orderId,
      refund_amount: refundAmount.toFixed(2),
      refund_reason: refundReason,
    };

    const commonParams = {
      app_id: this.appId,
      method: 'alipay.trade.refund',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString(),
      version: '1.0',
      biz_content: JSON.stringify(bizContent),
    };

    const sign = await this.signRequest(commonParams);
    return this.makeRequest({ ...commonParams, sign });
  }

  // ==================== HELPER METHODS ====================

  private async signRequest(params: Record<string, string>): Promise<string> {
    // This is a placeholder - implement proper RSA signing with your crypto library
    // Example using Node.js crypto:
    // const crypto = require('crypto');
    // const sign = crypto.createSign('RSA-SHA256');
    // sign.update(this.buildSignString(params));
    // return sign.sign(this.privateKey, 'base64');
    
    return 'MOCK_SIGNATURE'; // Replace with actual implementation
  }

  private buildSignString(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return signString;
  }

  private buildPaymentForm(params: Record<string, string>): string {
    const inputs = Object.entries(params)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n');

    return `
      <form id="alipayForm" action="${this.gatewayUrl}" method="POST">
        ${inputs}
      </form>
      <script>document.getElementById('alipayForm').submit();</script>
    `;
  }

  private async makeRequest(params: Record<string, string>): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.gatewayUrl}?${queryString}`);
    return response.json();
  }
}

// ==================== UNIFIED PAYMENT GATEWAY ====================

export class UnifiedPaymentGateway {
  private wise?: WisePaymentService;
  private omise?: OmisePaymentService;
  private alipay?: AlipayPaymentService;

  constructor(config: {
    wise?: { apiKey: string; isProduction?: boolean };
    omise?: { publicKey: string; secretKey: string };
    alipay?: { appId: string; privateKey: string; publicKey: string; isProduction?: boolean };
  }) {
    if (config.wise) {
      this.wise = new WisePaymentService(config.wise.apiKey, config.wise.isProduction);
    }
    if (config.omise) {
      this.omise = new OmisePaymentService(config.omise.publicKey, config.omise.secretKey);
    }
    if (config.alipay) {
      this.alipay = new AlipayPaymentService(
        config.alipay.appId,
        config.alipay.privateKey,
        config.alipay.publicKey,
        config.alipay.isProduction
      );
    }
  }

  async processPayment(
    method: 'WISE' | 'OMISE' | 'ALIPAY',
    params: PaymentRequest
  ): Promise<PaymentResponse> {
    switch (method) {
      case 'WISE':
        if (!this.wise) throw new Error('Wise not configured');
        // Implement Wise payment flow
        return { success: false, error: 'Wise integration pending' };

      case 'OMISE':
        if (!this.omise) throw new Error('Omise not configured');
        return this.omise.createPromptPayCharge(params);

      case 'ALIPAY':
        if (!this.alipay) throw new Error('Alipay not configured');
        return this.alipay.createQrPayment(params);

      default:
        return { success: false, error: 'Invalid payment method' };
    }
  }
}

// ==================== EXPORTS ====================

export default {
  WisePaymentService,
  OmisePaymentService,
  AlipayPaymentService,
  UnifiedPaymentGateway,
};
