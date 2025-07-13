import styles from "./ViewPostDetails.module.css";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MoreVertical,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  MoreHorizontal,
  Edit3,
  Trash2,
  EyeOff,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import AuthContext from "contexts/AuthContext";
import apiPostService from "services/apiPostService";
import apiPostCommentService from "services/apiPostCommentService";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";
import "./ViewPostDetails.module.css";

const ViewPostDetails = () => {
  const { groupId, postId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingCommentsError, setLoadingCommentsError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [reactionDialogOpen, setReactionDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showCommentMenu, setShowCommentMenu] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [error, setError] = useState(null);

  const observer = useRef();
  const postMenuRef = useRef();
  const commentMenuRef = useRef();

  const fetchPost = useCallback(async () => {
    setLoadingPost(true);
    try {
      const res = await apiPostService.getActivePostByIdForUser(postId);
      setPost(res.data);
      return res.data;
    } catch (e) {
      showErrorFetchAPI(e);
      return null;
    } finally {
      setLoadingPost(false);
    }
  }, [postId]);

  const fetchComments = useCallback(
    async (pageNum, reset = false, retryCount = 0) => {
      const maxRetries = 3;
      if (!postId || loadingComments || !hasMore) return;

      setLoadingComments(true);
      setLoadingCommentsError(null);

      try {
        const res = await apiPostCommentService.getCommentsByPostId(postId, {
          pageNumber: pageNum,
          pageSize: 10,
        });
        const newComments = res.data.comments || [];
        setComments((prev) =>
          reset ? newComments : [...prev, ...newComments]
        );
        setHasMore(newComments.length === 10 && pageNum < res.data.totalPages);
      } catch (e) {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            fetchComments(pageNum, reset, retryCount + 1);
          }, 1000 * (retryCount + 1));
          return;
        }
        setLoadingCommentsError("Failed to load comments");
        showErrorFetchAPI(e);
      } finally {
        setLoadingComments(false);
      }
    },
    [postId, hasMore, loadingComments]
  );
  useEffect(() => {
    const loadData = async () => {
      const postData = await fetchPost();
      if (postData) {
        await fetchComments(1, true);
      }
    };
    loadData();
  }, [fetchPost, fetchComments]);

  useEffect(() => {
    Fancybox.bind("[data-fancybox]", {
      animated: true,
      showClass: "fancybox-zoomInUp",
      hideClass: "fancybox-zoomOutDown",
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: ["zoomIn", "zoomOut", "close"],
          right: ["slideshow", "fullscreen", "download", "thumbs"],
        },
      },
      Image: { zoom: true, click: "zoom", doubleClick: "close" },
      Thumbs: { autoStart: false },
    });

    return () => {
      Fancybox.unbind("[data-fancybox]");
      Fancybox.close();
    };
  }, [postId]);

  const lastCommentRef = useCallback(
    (node) => {
      if (loadingComments) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingComments, hasMore]
  );

  useEffect(() => {
    if (page > 1) {
      fetchComments(page);
    }
  }, [page, fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await apiPostCommentService.addCommentByUser({
        postId: Number.parseInt(postId),
        commentText: newComment,
      });
      setNewComment("");
      setPage(1);
      setHasMore(true);
      fetchComments(1, true);
      setSnackbar({
        open: true,
        message: "Comment added successfully.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to add comment.",
        severity: "error",
      });
    }
  };

  const handleEditComment = async () => {
    if (!editCommentText.trim() || !editingComment) return;

    try {
      await apiPostCommentService.editCommentByUser(editingComment.commentId, {
        postId: Number.parseInt(postId),
        commentText: editCommentText,
      });
      setPage(1);
      setHasMore(true);
      fetchComments(1, true);
      setEditingComment(null);
      setEditCommentText("");
      setSnackbar({
        open: true,
        message: "Comment edited successfully.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to edit comment.",
        severity: "error",
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await apiPostCommentService.deleteCommentByUser(commentId);
      setPage(1);
      setHasMore(true);
      fetchComments(1, true);
      setSnackbar({
        open: true,
        message: "Comment deleted successfully.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to delete comment.",
        severity: "error",
      });
    }
    setShowCommentMenu(false);
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiPostService.deletePost(postId);
      navigate(`/group/${groupId}`);
      setSnackbar({
        open: true,
        message: "Post deleted successfully.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to delete post.",
        severity: "error",
      });
    }
    setShowPostMenu(false);
  };

  const handleHidePost = async () => {
    try {
      await apiPostService.hidePost(postId);
      navigate(`/group/${groupId}`);
      setSnackbar({
        open: true,
        message: "Post hidden successfully.",
        severity: "success",
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: "Failed to hide post.",
        severity: "error",
      });
    }
    setShowPostMenu(false);
  };

  const handleSharePost = () => {
    const postUrl = `${window.location.origin}/group/${groupId}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    setSnackbar({
      open: true,
      message: "Post URL copied to clipboard!",
      severity: "success",
    });
    setShowPostMenu(false);
  };

  const handleRetryComments = () => {
    setPage(1);
    setHasMore(true);
    fetchComments(1, true);
  };

  const reactionCount = post?.reactions?.length || 0;
  const reactionTypes = post?.reactions
    ? [...new Set(post.reactions.map((r) => r.reactionTypeName))]
    : [];

  if (loadingPost) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-spinner"]}></div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className={styles["error-container"]}>
        <AlertCircle className={styles["error-icon"]} />
        <h2 className={styles["error-title"]}>Post Not Found</h2>
        <p className={styles["error-message"]}>
          {error || "The post you're looking for doesn't exist."}
        </p>
      </div>
    );
  }

  return (
    <div className={styles["view-post-details-container"]}>
      <div className={styles["facebook-layout"]}>
        <div className={styles["main-content"]}>
          {/* Main Post Card */}
          <div className={styles["post-card"]}>
            {/* Post Header */}
            <div className={styles["post-header"]}>
              <div className={styles["post-header-content"]}>
                <div className={styles["post-user-info"]}>
                  <img
                    src={post.user?.avatar || "/default-avatar.png"}
                    alt="User Avatar"
                    className={styles["user-avatar"]}
                  />
                  <div className={styles["user-details"]}>
                    <h3>{post.user?.fullName || "Unknown User"}</h3>
                    <p>{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ position: "relative" }} ref={postMenuRef}>
                  <button
                    onClick={() => setShowPostMenu(!showPostMenu)}
                    className={styles["post-menu-button"]}
                  >
                    <MoreVertical />
                  </button>

                  {showPostMenu && (
                    <div className={styles["dropdown-menu"]}>
                      <button
                        onClick={() => {
                          navigate(`/my-posts/${postId}/edit`);
                          setShowPostMenu(false);
                        }}
                        className={styles["dropdown-item"]}
                      >
                        <Edit3 />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDeletePost}
                        className={
                          styles["dropdown-item"] + " " + styles["danger"]
                        }
                      >
                        <Trash2 />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={handleSharePost}
                        className={styles["dropdown-item"]}
                      >
                        <Share2 />
                        <span>Share</span>
                      </button>
                      <button
                        onClick={handleHidePost}
                        className={styles["dropdown-item"]}
                      >
                        <EyeOff />
                        <span>Hide Post</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className={styles["post-content"]}>
              <div
                className={styles["post-text"]}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {post.thumbnail && (
                <a href={post.thumbnail} data-fancybox="gallery">
                  <img
                    src={post.thumbnail || "/placeholder.svg"}
                    alt="Post Thumbnail"
                    className={styles["post-image"]}
                  />
                </a>
              )}
            </div>

            {/* Post Tags */}
            <div className={styles["post-tags"]}>
              {post.tags && post.tags.length > 0 ? (
                <div className={styles["tags-container"]}>
                  {post.tags.map((tag) => (
                    <span key={tag.tagId} className={styles["post-tag"]}>
                      {tag.tagName}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles["no-tags"]}>No tags</p>
              )}
            </div>

            {/* Post Stats */}
            <div className={styles["post-stats"]}>
              <div className={styles["stats-content"]}>
                <div className={styles["stats-left"]}>
                  <button
                    onClick={() => setReactionDialogOpen(true)}
                    className={styles["stat-item"]}
                  >
                    <ThumbsUp />
                    <span>{reactionCount} Reactions</span>
                  </button>

                  <div className={styles["stat-item"]}>
                    <MessageCircle />
                    <span>{post.totalComment} Comments</span>
                  </div>
                </div>

                <span
                  className={`post-status ${
                    post.status === "active" ? "active" : "deleted"
                  }`}
                >
                  {post.status === "active" ? "Active" : "Deleted"}
                </span>
              </div>

              {/* Action Buttons - Facebook Style */}
              <div className={styles["post-actions"]}>
                <button className={styles["action-button"]}>
                  <ThumbsUp />
                  <span>Like</span>
                </button>
                <button className={styles["action-button"]}>
                  <MessageCircle />
                  <span>Comment</span>
                </button>
                <button
                  onClick={handleSharePost}
                  className={styles["action-button"]}
                >
                  <Share2 />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Comment Section */}
            <div className={styles["comment-section"]}>
              {/* Add Comment */}
              <div className={styles["comment-input-container"]}>
                <div className={styles["comment-input-wrapper"]}>
                  <img
                    src={post?.user?.avatar || "/default-avatar.png"}
                    alt="Your Avatar"
                    className={styles["comment-avatar"]}
                  />
                  <div className={styles["comment-input-group"]}>
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddComment()
                      }
                      className={styles["comment-input"]}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className={styles["comment-send-button"]}
                    >
                      <Send />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments Error */}
              {loadingCommentsError && (
                <div className={styles["comments-error"]}>
                  <p>{loadingCommentsError}</p>
                  <button
                    onClick={handleRetryComments}
                    className={styles["retry-button"]}
                  >
                    <RefreshCw />
                    <span>Retry Loading Comments</span>
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className={styles["comments-list"]}>
                {comments.map((comment, index) => (
                  <div
                    key={comment.commentId}
                    ref={index === comments.length - 1 ? lastCommentRef : null}
                    className={styles["comment-item"]}
                  >
                    <div className={styles["comment-content"]}>
                      <img
                        src={comment.userAvatar || "/default-avatar.png"}
                        alt="Commenter Avatar"
                        className={styles["comment-avatar"]}
                      />
                      <div className={styles["comment-main"]}>
                        <div className={styles["comment-header"]}>
                          <div className={styles["comment-user-info"]}>
                            <h4>{comment.userFullName || "Unknown User"}</h4>
                            <p>
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>

                          {comment.userId === user.userId && (
                            <div
                              style={{ position: "relative" }}
                              ref={commentMenuRef}
                            >
                              <button
                                onClick={() => {
                                  setSelectedComment(comment);
                                  setShowCommentMenu(!showCommentMenu);
                                }}
                                className={styles["comment-menu-button"]}
                              >
                                <MoreHorizontal />
                              </button>

                              {showCommentMenu &&
                                selectedComment?.commentId ===
                                  comment.commentId && (
                                  <div className={styles["dropdown-menu"]}>
                                    <button
                                      onClick={() => {
                                        setEditingComment(selectedComment);
                                        setEditCommentText(
                                          selectedComment.commentText
                                        );
                                        setShowCommentMenu(false);
                                      }}
                                      className={styles["dropdown-item"]}
                                    >
                                      <Edit3 />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(
                                          selectedComment.commentId
                                        )
                                      }
                                      className={
                                        styles["dropdown-item"] +
                                        " " +
                                        styles["danger"]
                                      }
                                    >
                                      <Trash2 />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>

                        {editingComment?.commentId === comment.commentId ? (
                          <div className={styles["comment-edit-form"]}>
                            <input
                              type="text"
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              className={styles["comment-edit-input"]}
                            />
                            <button
                              onClick={handleEditComment}
                              disabled={!editCommentText.trim()}
                              className={
                                styles["comment-edit-button"] +
                                " " +
                                styles["save"]
                              }
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingComment(null)}
                              className={
                                styles["comment-edit-button"] +
                                " " +
                                styles["cancel"]
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className={styles["comment-text"]}>
                            {comment.commentText}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading Comments */}
              {loadingComments && (
                <div className={styles["loading-comments"]}>
                  <div className={styles["loading-spinner"]}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* All dialogs and overlays remain the same... */}
      {reactionDialogOpen && (
        <div className={styles["reaction-dialog-overlay"]}>
          <div className={styles["reaction-dialog"]}>
            <div className={styles["reaction-dialog-header"]}>
              <h3 className={styles["reaction-dialog-title"]}>Reactions</h3>
              <button
                onClick={() => setReactionDialogOpen(false)}
                className={styles["reaction-dialog-close"]}
              >
                <X />
              </button>
            </div>

            <div className={styles["reaction-dialog-content"]}>
              {reactionTypes.length > 0 ? (
                <div className={styles["reaction-section"]}>
                  <h4>All Reactions ({reactionCount})</h4>
                  <div className={styles["reaction-list"]}>
                    {post.reactions.map((reaction) => (
                      <div
                        key={reaction.reactionId}
                        className={styles["reaction-item"]}
                      >
                        <img
                          src={reaction.userAvatar || "/default-avatar.png"}
                          alt="User Avatar"
                          className={styles["reaction-user-avatar"]}
                        />
                        <div className={styles["reaction-user-info"]}>
                          <p className={styles["reaction-user-name"]}>
                            {reaction.userFullName || "Unknown User"}
                          </p>
                        </div>
                        <span className={styles["reaction-emoji"]}>
                          {reaction.reactionTypeEmojiUnicode
                            ? String.fromCodePoint(
                                Number.parseInt(
                                  reaction.reactionTypeEmojiUnicode.replace(
                                    "U+",
                                    ""
                                  ),
                                  16
                                )
                              )
                            : reaction.reactionTypeName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className={styles["no-reactions"]}>No reactions yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {snackbar.open && (
        <div className={styles["snackbar"]}>
          <div className={`snackbar-content ${snackbar.severity}`}>
            <span className={styles["snackbar-message"]}>
              {snackbar.message}
            </span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className={styles["snackbar-close"]}
            >
              <X />
            </button>
          </div>
        </div>
      )}

      {showPostMenu && (
        <div
          className={styles["click-outside-overlay"]}
          onClick={() => setShowPostMenu(false)}
        />
      )}
      {showCommentMenu && (
        <div
          className={styles["click-outside-overlay"]}
          onClick={() => setShowCommentMenu(false)}
        />
      )}
    </div>
  );
};

export default ViewPostDetails;
