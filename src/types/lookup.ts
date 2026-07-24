export type Country = {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  nationalityAr: string;
  nationalityEn: string;
};

export type City = {
  id: number;
  nameAr: string;
  nameEn: string;
  countryId: number;
};

export type Language = {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
};
