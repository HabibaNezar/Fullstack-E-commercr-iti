import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymobService {
  private baseUrl = 'https://accept.paymob.com/api';
  
  // ⚠️ WARNING: In a production app, these should be handled by a backend server 
  // to avoid exposing your API Key in the frontend.
  private apiKey = 'YOUR_PAYMOB_API_KEY'; // Replace with your Paymob API Key
  private integrationId = 'YOUR_INTEGRATION_ID'; // Replace with your Card Integration ID
  public iframeId = 'YOUR_IFRAME_ID'; // Replace with your Iframe ID

  constructor(private http: HttpClient) {}

  /**
   * Step 1: Authentication Request
   */
  getAuthToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/tokens`, {
      api_key: this.apiKey
    });
  }

  /**
   * Step 2: Order Registration
   */
  registerOrder(token: string, orderDetails: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: orderDetails.amountCents,
      currency: "EGP",
      items: orderDetails.items
    });
  }

  /**
   * Step 3: Payment Key Generation
   */
  getPaymentKey(token: string, orderId: number, amountCents: number, billingData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/acceptance/payment_keys`, {
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: "NA",
        email: billingData.email,
        floor: "NA",
        first_name: billingData.firstName,
        street: billingData.address,
        building: "NA",
        phone_number: billingData.phone || "01000000000",
        shipping_method: "NA",
        postal_code: "NA",
        city: "NA",
        country: "NA",
        last_name: billingData.lastName || "NA",
        state: "NA"
      },
      currency: "EGP",
      integration_id: this.integrationId
    });
  }

  /**
   * Full Handshake: Auth -> Order -> Payment Key
   */
  payWithPaymob(orderDetails: any, billingData: any): Observable<any> {
    return this.getAuthToken().pipe(
      switchMap((authRes: any) => {
        const token = authRes.token;
        return this.registerOrder(token, orderDetails).pipe(
          switchMap((orderRes: any) => {
            const orderId = orderRes.id;
            return this.getPaymentKey(token, orderId, orderDetails.amountCents, billingData);
          })
        );
      })
    );
  }
}
