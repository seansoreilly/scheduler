export interface Meeting {
  title: string;
  times: {
    [key: string]: string[];  // timeKey -> array of names
  };
}