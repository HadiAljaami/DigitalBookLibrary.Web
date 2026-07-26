import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Reply, Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { feedbackService } from "@/services/feedback-service";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast-store";
import { errorMessage } from "@/lib/error-message";
import { formatDate } from "@/lib/format";
import { type Comment } from "@/types/feedback";

export function BookComments({ bookId }: { bookId: number }) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState("");

  const thread = useQuery({
    queryKey: ["comments", bookId],
    queryFn: () => feedbackService.comments(bookId),
  });

  const add = useAddComment(bookId);

  function submitTop() {
    if (!text.trim()) return;
    add.mutate(
      { text: text.trim() },
      { onSuccess: () => setText("") },
    );
  }

  const comments = thread.data ?? [];
  const count = countComments(comments);

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 font-semibold">
        {t("feedback.commentsTitle")} <span className="text-muted-foreground">({count})</span>
      </h2>

      {isAuthenticated ? (
        <div className="mb-6 space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("feedback.commentPlaceholder")}
            rows={3}
          />
          <div className="flex justify-end">
            <Button onClick={submitTop} disabled={add.isPending || !text.trim()}>
              {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("feedback.postComment")}
            </Button>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          <Link to="/login" state={{ from: `/library/books/${bookId}` }} className="text-primary hover:underline">
            {t("public.signIn")}
          </Link>{" "}
          {t("feedback.signInToComment")}
        </p>
      )}

      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("feedback.noComments")}</p>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <CommentNode key={c.id} bookId={bookId} comment={c} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentNode({ bookId, comment, depth }: { bookId: number; comment: Comment; depth: number }) {
  const { t } = useTranslation();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editText, setEditText] = useState(comment.text);

  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["comments", bookId] });
  const add = useAddComment(bookId);

  const update = useMutation({
    mutationFn: () => feedbackService.updateComment(bookId, comment.id, { text: editText.trim() }),
    onSuccess: () => {
      setEditing(false);
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => feedbackService.deleteComment(bookId, comment.id),
    onSuccess: () => {
      toast.success(t("common.deleted"));
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const canManage = isAdmin || user?.id === comment.userId;

  return (
    <div className={depth > 0 ? "ms-6 border-s ps-4" : ""}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback>
            {comment.userName ? comment.userName.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">{formatDate(comment.dateCreated)}</span>
          </div>

          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => update.mutate()} disabled={update.isPending || !editText.trim()}>
                  {t("common.save")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditText(comment.text); }}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">{comment.text}</p>
          )}

          {!editing && (
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {isAuthenticated && (
                <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setReplying((v) => !v)}>
                  <Reply className="h-3.5 w-3.5" /> {t("feedback.reply")}
                </button>
              )}
              {canManage && (
                <>
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5" /> {t("common.edit")}
                  </button>
                  <button
                    className="inline-flex items-center gap-1 hover:text-destructive"
                    onClick={() => { if (confirm(t("feedback.confirmDeleteComment"))) remove.mutate(); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {t("common.delete")}
                  </button>
                </>
              )}
            </div>
          )}

          {replying && (
            <div className="mt-2 space-y-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("feedback.replyPlaceholder")}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={add.isPending || !replyText.trim()}
                  onClick={() =>
                    add.mutate(
                      { text: replyText.trim(), parentCommentId: comment.id },
                      { onSuccess: () => { setReplyText(""); setReplying(false); } },
                    )
                  }
                >
                  {t("feedback.reply")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((r) => (
            <CommentNode key={r.id} bookId={bookId} comment={r} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function useAddComment(bookId: number) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { text: string; parentCommentId?: number | null }) =>
      feedbackService.addComment(bookId, body),
    onSuccess: () => {
      toast.success(t("feedback.commentPosted"));
      queryClient.invalidateQueries({ queryKey: ["comments", bookId] });
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
}

function countComments(list: Comment[]): number {
  return list.reduce((sum, c) => sum + 1 + countComments(c.replies), 0);
}
