export type BookBorrowed = {
  Author: string;
  Book_ID: number;
  Book_Title: string;
  Date_Borrowed: string;
  Free_Days: number;
  Return_Date: string;
  Subject: string;
};

export type BookReturned = {
  Book_ID: number;
  Subject: string;
  Book_Title: string;
  Author: string;
  Date_Returned: string;
  Available_Books: number;
};
