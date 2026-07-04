import {useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";

function CommentSection({postId}) {
    const[text, setText] = useState("");
    const queryClient = useQueryClient();
    const {data: me} = useQuery({
      queryKey: ["me"],
      queryFn: () => savouraClient.entities.User.get("me"),
    });

    const{data:comments = [], isLoading} = useQuery({
      queryKey: ["comments", postId],
      queryFn: () => savouraClient.entities.Comment.list("-created_date", { post_id: postId }),
    });

    const createMutation = useMutation({
        mutationFn: (newComment) => savouraClient.entities.Comment.create(newComment),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setText("");
        }
    });

    const handleSubmit = () => {
        if (!text.trim()) return;
        createMutation.mutate({
            content: text,
          post_id: postId,
          author_id: me?.id,
            author_name: me?.name || "Anonymous",
        });
    };

    return ( 
 <div className="pt-3 border-t border-border/40 space-y-3">
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet. Be the first to reply.</p>
      ) : (
        <div className="space-y-2.5">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-primary">
                  {(c.author_name || "?")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{c.author_name}</p>
                <p className="text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="h-8 text-sm"
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />
        <Button
          size="icon"
          className="h-8 w-8 shrink-0 no-select"
          disabled={!text.trim() || createMutation.isPending}
          onClick={handleSubmit}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default CommentSection;
