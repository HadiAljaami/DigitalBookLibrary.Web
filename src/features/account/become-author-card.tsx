import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PenSquare, Clock, XCircle, Loader2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { accountService } from "@/services/account-service";
import { memberService } from "@/services/member-service";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { Roles } from "@/types/auth";

/** Lets a member ask to become an author, and shows the request's status. */
export function BecomeAuthorCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const isAuthor = user?.roles.includes(Roles.Author) ?? false;

  const profile = useQuery({
    queryKey: ["me", "profile"],
    queryFn: () => accountService.profile(),
    enabled: !isAuthor,
  });
  const alreadyAuthor = isAuthor || profile.data?.authorId != null;

  const request = useQuery({
    queryKey: ["me", "author-request"],
    queryFn: () => memberService.authorRequest(),
    enabled: !alreadyAuthor,
  });

  const submit = useMutation({
    mutationFn: () => memberService.submitAuthorRequest(note.trim() || null),
    onSuccess: () => {
      toast.success(t("becomeAuthor.submitted"));
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["me", "author-request"] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (alreadyAuthor) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <BadgeCheck className="h-6 w-6 text-primary" />
          <div>
            <p className="font-medium">{t("becomeAuthor.youAreAuthor")}</p>
            <Link to="/my-books" className="text-sm text-primary hover:underline">
              {t("public.myBooks")}
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const status = request.data?.status;

  if (status === "Pending") {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-amber-500" />
          <div>
            <p className="font-medium">{t("becomeAuthor.pending")}</p>
            <p className="text-sm text-muted-foreground">{t("becomeAuthor.pendingHint")}</p>
          </div>
        </div>
      </Card>
    );
  }

  // No request yet, or a previous one was rejected → offer the form.
  return (
    <Card>
      <div className="flex items-start gap-3">
        <PenSquare className="mt-0.5 h-6 w-6 text-primary" />
        <div className="flex-1">
          <p className="font-medium">{t("becomeAuthor.title")}</p>
          <p className="text-sm text-muted-foreground">{t("becomeAuthor.subtitle")}</p>

          {status === "Rejected" && request.data?.adminNote && (
            <div className="mt-2 flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {t("becomeAuthor.rejected")}: {request.data.adminNote}
              </span>
            </div>
          )}

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("becomeAuthor.notePlaceholder")}
            rows={3}
            className="mt-3"
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
              {submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("becomeAuthor.submit")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card p-5">{children}</div>;
}
