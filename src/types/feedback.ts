export type RatingSummary = {
  average: number;
  count: number;
  /** The signed-in user's own rating, if any. */
  myRating: number | null;
};

export type Comment = {
  id: number;
  text: string;
  userId: number;
  userName: string;
  parentCommentId: number | null;
  dateCreated: string;
  replies: Comment[];
};
