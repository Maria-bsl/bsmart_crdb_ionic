export interface FSDetails {
  Admission_No: string;
  Facility_Reg_Sno: string;
}

export interface FRegisterParent {
  User_Name: string;
  Email_Address: undefined | string | null;
  Parent_Name: undefined | string | null;
  Mobile_No: undefined | string | null;
  SDetails: FSDetails[];
}

export interface FDeleteStudent {
  Facility_Reg_Sno: string | number;
  User_Name: string;
  Admission_No: string | number;
  Reason_Del: string;
}

export interface FStudentMarksForm extends FSDetails {
  Exam_Type_Sno: string | number;
}
