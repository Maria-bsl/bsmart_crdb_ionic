export interface FStudentReg {
  Admission_No: string;
  Facility_Reg_Sno: string;
}

export interface FParentReg {
  User_Name: string;
  Email_Address: string;
  Parent_Name: string;
  Mobile_No: string;
  SDetails: FStudentReg[];
}

export interface FDeleteStudent {
  Facility_Reg_Sno: string | number;
  User_Name: string;
  Admission_No: string | number;
  Reason_Del: string;
}

export interface IParentDetail {
  Status: string | undefined;
  User_Name: string | null;
  Parent_Name: string | null;
  Email_Address: string | null;
  Mobile_No: string | null;
}

export interface IUpdateParentReg {
  Parent_Name: string;
  User_Name: string;
  Mobile_No: string;
  Email_Address: string;
}
