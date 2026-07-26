import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { feedbackService } from "@/services/feedback-service";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";

/** Average rating + an interactive 1–5 star control for signed-in users. */
export function BookRating({ bookId }: { bookId: number }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [hover, setHover] = useState(0);

  const summary = useQuery({
    queryKey: ["rating-summary", bookId],
    queryFn: () => feedbackService.ratingSummary(bookId),
  });

  const rate = useMutation({
    mutationFn: (value: number) => feedbackService.rate(bookId, value),
    onSuccess: () => {
      toast.success(t("feedback.rated"));
      queryClient.invalidateQueries({ queryKey: ["rating-summary", bookId] });
      queryClient.invalidateQueries({ queryKey: ["public-book", bookId] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const clear = useMutation({
    mutationFn: () => feedbackService.deleteRating(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rating-summary", bookId] });
      queryClient.invalidateQueries({ queryKey: ["public-book", bookId] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const s = summary.data;
  const mine = s?.myRating ?? 0;
  // The interactive control tracks hover, else the user's own rating.
  const shown = hover || mine;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-3 font-semibold">{t("feedback.ratingTitle")}</h2>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{(s?.average ?? 0).toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            {t("feedback.outOfFive")} · {t("feedback.ratingsCount", { count: s?.count ?? 0 })}
          </span>
        </div>
      </div>

      <div className="mt-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={rate.isPending}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => rate.mutate(n)}
                  className="p-0.5"
                  aria-label={`${n}`}
                >
                  <Star
                    className={
                      "h-7 w-7 transition " +
                      (n <= shown ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40")
                    }
                  />
                </button>
              ))}
            </div>
            {mine > 0 && (
              <button
                type="button"
                onClick={() => clear.mutate()}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                {t("feedback.clearRating")}
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" state={{ from: `/library/books/${bookId}` }} className="text-primary hover:underline">
              {t("public.signIn")}
            </Link>{" "}
            {t("feedback.signInToRate")}
          </p>
        )}
      </div>
    </div>
  );
}
