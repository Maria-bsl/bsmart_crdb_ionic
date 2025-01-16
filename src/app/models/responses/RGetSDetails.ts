export interface GetSDetailStudents {
  Facility_Reg_Sno: number;
  Facility_Name: string;
  User_Name: string;
  Parent_Name: string;
  Admission_No: string;
  Class_Sno: number;
  Class_Name: string;
  Section_Sno: number;
  Section_Name: string;
  Academic_Sno: number;
  Acad_Year: string;
  SFullName: string;
}

export interface GetSDetails {
  Students: GetSDetailStudents[];
  Package_Mas_Sno: number;
  Package_Name: string;
  Package_Status: string;
}

export interface GetSDetailsErrorStatus {
  status: string;
}
