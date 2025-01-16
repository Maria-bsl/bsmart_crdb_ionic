export type OverallAttendance = {
  Present: string;
  Absent: string;
};

//{'Month': 'October', 'Year': '2021', 'Total_Days': 4, 'Present_Days': 3, 'Absent_Days': 1}

export type AttendanceScore = {
  Month: string;
  Year: string;
  StartDate: Date | undefined;
  EndDate: Date | undefined;
  Total_Days: number;
  Present_Days: number;
  Absent_Days: number;
};
