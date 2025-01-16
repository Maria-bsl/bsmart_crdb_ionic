export type StudentInvoice = {
  Invoice_No: string;
  Invoice_Amount: number;
  Fee_Type: string;
  Invoice_Date: string | Date;
};

export type StudentPendingInvoice = {
  Expired_Date: string | Date;
  Fee_Type: string;
  Invoice_No: string;
  Pending_Amount: string;
};

export type StudentPaidInvoice = {
  Invoice_No: string;
  Receipt_No: string;
  Paid_Amount: number;
  Pending_Amount: number;
  Paid_Date: string | Date;
  Fee_Type: string;
};
