export interface C2BMpesaPayment {
  input_Amount: string;
  input_Country: string;
  input_Currency: string;
  input_CustomerMSISDN: string;
  input_ServiceProviderCode: string;
  input_ThirdPartyConversationID: string;
  input_TransactionReference: string;
  input_PurchasedItemsDesc: string;
}

export interface SessionKey {
  output_ResponseCode: string;
  output_ResponseDesc: string;
  output_SessionID: string;
  at: string | undefined | null;
}

export interface C2BMpesaResponse {
  output_ResponseCode: string;
  output_ResponseDesc: string;
  output_TransactionID: string;
  output_ConversationID: string;
  output_ThirdPartyConversationID: string;
}
