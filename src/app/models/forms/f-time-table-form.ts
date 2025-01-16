export interface FTimeTableForm {
  Facility_Reg_Sno: string | number;
  Admission_No: string | number;
  From_Date?: string;
  To_Date?: string;
}

export interface FBookForm {
  Facility_Reg_Sno: string | number;
  Admission_No: string | number;
  Academic_Sno: string | number;
}
