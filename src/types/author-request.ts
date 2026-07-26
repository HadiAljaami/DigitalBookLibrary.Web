import { type PaginationParams } from "./api";

export type AuthorRequestStatus = "Pending" | "Approved" | "Rejected";

export type AuthorRequest = {
  id: number;
  userId: number;
  username: string;
  fullName: string | null;
  status: AuthorRequestStatus;
  note: string | null;
  dateCreated: string;
  reviewedAt: string | null;
  adminNote: string | null;
};

export type AuthorRequestQuery = PaginationParams & {
  status?: AuthorRequestStatus;
};
