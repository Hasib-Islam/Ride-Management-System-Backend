import axios from 'axios';
import { envVars } from '../config/env';

export interface IPaymentRequest {
  total_amount: number;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1: string;
  cus_city: string;
  cus_country: string;
  shipping_method: string;
  product_name: string;
  product_category: string;
  product_profile: string;
}

export interface IPaymentResponse {
  status: string;
  failedreason: string;
  sessionkey: string;
  gw: {
    visa: string;
    master: string;
    amex: string;
    othercards: string;
    internetbanking: string;
    mobilebanking: string;
  };
  redirectGatewayURL: string;
  directPaymentURL: string;
  redirectGatewayURLFailed: string;
  GatewayPageURL: string;
  storeBanner: string;
  storeLogo: string;
  desc: string[];
  is_direct_pay_enable: string;
}

export interface IValidationResponse {
  status: string;
  tran_date: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  currency: string;
  bank_tran_id: string;
  card_type: string;
  card_no: string;
  card_issuer: string;
  card_brand: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  currency_type: string;
  currency_amount: string;
  currency_rate: string;
  base_fair: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
  emi_instalment: string;
  emi_amount: string;
  emi_description: string;
  emi_issuer: string;
  account_details: string;
  risk_title: string;
  risk_level: string;
  APIConnect: string;
  validated_on: string;
  gw_version: string;
}

export const SSLCommerzService = {
  async initiatePayment(
    paymentData: Partial<IPaymentRequest>
  ): Promise<IPaymentResponse> {
    try {
      const defaultData: IPaymentRequest = {
        total_amount: 0,
        currency: 'BDT',
        tran_id: '',
        success_url: envVars.SSL_SUCCESS_URL,
        fail_url: envVars.SSL_FAIL_URL,
        cancel_url: envVars.SSL_CANCEL_URL,
        ipn_url: envVars.SSL_IPN_URL,
        cus_name: '',
        cus_email: '',
        cus_phone: '',
        cus_add1: '',
        cus_city: '',
        cus_country: 'Bangladesh',
        shipping_method: 'NO',
        product_name: 'Ride Payment',
        product_category: 'Ride Service',
        product_profile: 'general',
      };

      const requestData = { ...defaultData, ...paymentData };

      const formData = new URLSearchParams();
      formData.append('store_id', envVars.SSL_STORE_ID);
      formData.append('store_passwd', envVars.SSL_STORE_PASSWORD);

      Object.entries(requestData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await axios.post(envVars.SSL_PAYMENT_API, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to initiate payment: ${error.message}`);
    }
  },

  async validatePayment(valId: string): Promise<IValidationResponse> {
    try {
      const response = await axios.get(envVars.SSL_VALIDATION_API, {
        params: {
          val_id: valId,
          store_id: envVars.SSL_STORE_ID,
          store_passwd: envVars.SSL_STORE_PASSWORD,
          format: 'json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to validate payment: ${error.message}`);
    }
  },

  generateTransactionId(prefix = 'RIDE'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  },
};
