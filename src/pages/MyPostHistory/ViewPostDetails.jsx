import styles from "./ViewPostDetails.module.css";
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  TextField,
  Chip,
  IconButton,
  Popover,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  MoreHoriz,
  Comment as CommentIcon,
  Share as ShareIcon,
  Send,
  Edit,
  Delete,
  VisibilityOff,
  PostAdd,
} from "@mui/icons-material";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import AuthContext from "contexts/AuthContext";
import apiPostService from "services/apiPostService";
import apiPostCommentService from "services/apiPostCommentService";
import apiPostReactService from "services/apiPostReactService";
import apiReactionTypeService from "services/apiReactionTypeService";
import DOMPurify from "dompurify";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";
import Swal from "sweetalert2";
import apiGroupMemberService from "services/apiGroupMemberService";

const ViewPostDetails = () => {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [reactionTypes, setReactionTypes] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null);
  const [previewAnchorEl, setPreviewAnchorEl] = useState(null);
  const [previewTab, setPreviewTab] = useState("all");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const commentListRef = useRef();

  const COMMENTS_PAGE_SIZE = 10;

  const fetchPost = useCallback(async () => {
    setLoadingPost(true);
    try {
      const res = await apiPostService.getActivePostByIdForUser(postId);
      const data = res.data || res;
      setPost(data);
      setIsAdmin(data.createdBy === user?.userId);
      return data;
    } catch (e) {
      showErrorFetchAPI(e);
      setPost(null);
      return null;
    } finally {
      setLoadingPost(false);
    }
  }, [postId, user]);

  const fetchReactionTypes = useCallback(async () => {
    try {
      const res = await apiReactionTypeService.getAllReactionTypes();
      setReactionTypes(res?.data?.reactionTypes || []);
    } catch (e) {
      showErrorFetchAPI(e);
      setReactionTypes([]);
    }
  }, []);

  const fetchComments = useCallback(
    async (page = 1, replace = false) => {
      if (!postId || loadingComments || page > commentTotalPages) return;
      setLoadingComments(true);
      try {
        const res = await apiPostCommentService.getCommentsByPostId(postId, {
          PageNumber: page,
          PageSize: COMMENTS_PAGE_SIZE,
        });
        const data = res.data || res;
        if (!data || !data.comments || !Number.isInteger(data.totalPages)) {
          throw new Error("Invalid API response for comments");
        }
        setComments((prev) =>
          replace ? data.comments || [] : [...prev, ...(data.comments || [])]
        );
        setCommentTotalPages(data.totalPages || 1);
      } catch (e) {
        showErrorFetchAPI(e);
      } finally {
        setLoadingComments(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    const loadData = async () => {
      const postData = await fetchPost();
      if (postData && user) {
        try {
          const membershipResponse = await apiGroupMemberService.isUserInGroup(
            postData.groupId
          );
          setIsMember(membershipResponse.data);
        } catch (e) {
          setIsMember(false);
        }
        await fetchComments(1, true);
        await fetchReactionTypes();
      }
    };
    loadData();
  }, [fetchPost, fetchComments, fetchReactionTypes, user]);

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

  // Infinite scroll for comments
  useEffect(() => {
    const el = commentListRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (
        el.scrollHeight - el.scrollTop - el.clientHeight < 120 &&
        !loadingComments &&
        commentPage < commentTotalPages
      ) {
        setCommentPage((prev) => prev + 1);
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loadingComments, commentPage, commentTotalPages]);

  // Fetch comments when commentPage changes
  useEffect(() => {
    if (commentPage > 1) {
      fetchComments(commentPage);
    }
  }, [commentPage, fetchComments]);

  // Handle reaction
  const handleReact = async (reactionType) => {
    if (!user) {
      showInfoMessage("Please login to react.");
      setTimeout(
        () =>
          navigate("/login", {
            state: { from: `/group/${post?.groupId}/post/${postId}` },
          }),
        1200
      );
      return;
    }
    if (!isMember) {
      showWarningMessage("You must be a member of this group to react.");
      return;
    }
    try {
      const userReaction = getUserReaction();
      if (userReaction?.reactionTypeId === reactionType.reactionTypeId) {
        await apiPostReactService.unreactToPost(postId);
        setPost((prev) => ({
          ...prev,
          reactions: prev.reactions.filter((r) => r.userId !== user.userId),
        }));
        showSuccessMessage("Reaction removed!");
      } else {
        await apiPostReactService.reactToPost({
          postId: Number.parseInt(postId),
          reactionTypeId: reactionType.reactionTypeId,
          reactionText: reactionType.reactionName,
        });
        setPost((prev) => ({
          ...prev,
          reactions: userReaction
            ? prev.reactions.map((r) =>
                r.userId === user.userId
                  ? {
                      ...r,
                      reactionTypeId: reactionType.reactionTypeId,
                      reactionTypeEmojiUnicode: reactionType.emojiUnicode,
                      reactionTypeName: reactionType.reactionName,
                    }
                  : r
              )
            : [
                ...prev.reactions,
                {
                  userId: user.userId,
                  reactionTypeId: reactionType.reactionTypeId,
                  reactionTypeEmojiUnicode: reactionType.emojiUnicode,
                  reactionTypeName: reactionType.reactionName,
                },
              ],
        }));
        showSuccessMessage(`Reacted with ${reactionType.reactionName}!`);
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setReactionAnchorEl(null);
    }
  };

  // Get user reaction
  const getUserReaction = () => {
    if (!user || !post?.reactions) return null;
    return post.reactions.find((r) => r.userId === user.userId) || null;
  };

  // Get reaction counts
  const getReactionCounts = () => {
    const counts = {};
    if (!post?.reactions) return counts;
    post.reactions.forEach((r) => {
      counts[r.reactionTypeEmojiUnicode] =
        (counts[r.reactionTypeEmojiUnicode] || 0) + 1;
    });
    return counts;
  };

  // Convert Unicode to Emoji
  const unicodeToEmoji = (unicode) => {
    if (!unicode) return "";
    try {
      return unicode
        .trim()
        .split(/\s+/)
        .map((u) => {
          const hex = u.trim().toUpperCase().replace(/^U\+/, "");
          const code = Number.parseInt(hex, 16);
          if (Number.isNaN(code)) return "";
          return String.fromCodePoint(code);
        })
        .join("");
    } catch (error) {
      console.error("Error converting emoji:", error);
      return "";
    }
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!isMember) {
      showWarningMessage("You must be a member of this group to comment.");
      return;
    }
    const commentText = newComment.trim();
    if (!commentText) {
      showWarningMessage("Comment cannot be empty.");
      return;
    }
    if (commentText.length > 500) {
      showWarningMessage("Comment must be 500 characters or fewer.");
      return;
    }
    try {
      Swal.fire({
        title: "Adding comment...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await apiPostCommentService.addCommentByUser({
        postId: Number.parseInt(postId),
        commentText,
      });
      setNewComment("");
      setPost((prev) => ({
        ...prev,
        totalComment: (prev.totalComment || 0) + 1,
      }));
      setCommentPage(1);
      await fetchComments(1, true);
      showSuccessMessage("Comment added successfully.");
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      Swal.close();
    }
  };

  // Handle comment editing
  const handleEditComment = async () => {
    if (!isMember) {
      showWarningMessage(
        "You must be a member of this group to edit comments."
      );
      return;
    }
    const trimmedText = editCommentText.trim();
    if (!trimmedText) {
      showWarningMessage("Comment cannot be empty.");
      return;
    }
    if (trimmedText.length > 500) {
      showWarningMessage("Comment must be 500 characters or fewer.");
      return;
    }
    try {
      Swal.fire({
        title: "Updating comment...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await apiPostCommentService.editCommentByUser(editingComment.commentId, {
        postId: Number.parseInt(postId),
        commentText: trimmedText,
      });
      setComments((prev) =>
        prev.map((com) =>
          com.commentId === editingComment.commentId
            ? { ...com, commentText: trimmedText }
            : com
        )
      );
      setEditingComment(null);
      setEditCommentText("");
      showSuccessMessage("Comment updated successfully.");
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      Swal.close();
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!isMember) {
      showWarningMessage(
        "You must be a member of this group to delete comments."
      );
      return;
    }
    try {
      Swal.fire({
        title: "Deleting comment...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await apiPostCommentService.deleteCommentByUser(commentId);
      setComments((prev) =>
        prev.filter((comment) => comment.commentId !== commentId)
      );
      setPost((prev) => ({
        ...prev,
        totalComment: (prev.totalComment || 1) - 1,
      }));
      showSuccessMessage("Comment deleted successfully.");
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      Swal.close();
      setMenuAnchorEl(null);
      setSelectedComment(null);
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    if (!isMember) {
      showWarningMessage("You must be a member of this group to delete posts.");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;
    try {
      Swal.fire({
        title: "Deleting post...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await apiPostService.deletePost(postId);
      navigate(`/groups/${post?.groupId}`);
      showSuccessMessage("Post deleted successfully.");
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      Swal.close();
      setMenuAnchorEl(null);
    }
  };

  // Handle post hiding
  const handleHidePost = async () => {
    if (!isMember) {
      showWarningMessage("You must be a member of this group to hide posts.");
      return;
    }
    try {
      Swal.fire({
        title: "Processing...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setPost((prev) => ({
        ...prev,
        status: "inactive",
      }));

      let dataPost = {
        postId: post.postId,
        userId: post.userId,
        groupId: post.groupId,
        thumbnail: post.thumbnail,
        content: post.content,
        status: "inactive",
        tagIds: post.tagIds,
      };
      await apiPostService.updatePost(postId, dataPost);
      showSuccessMessage("Post hidden successfully.");
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      Swal.close();
      setMenuAnchorEl(null);
    }
  };

  const handleSharePost = async () => {
    if (!isMember) {
      showWarningMessage("You must be a member of this group to share posts.");
      return;
    }
    const postUrl = `${window.location.origin}/groups/${post?.groupId}/post/${postId}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(postUrl);
        showSuccessMessage("Post URL copied to clipboard!");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = postUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          showSuccessMessage("Post URL copied to clipboard!");
        } catch {
          throw new Error("Failed to copy link.");
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch {
      showErrorMessage("Failed to copy link.");
    } finally {
      setMenuAnchorEl(null);
    }
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loadingPost) {
    return (
      <Box className={styles["loading-container"]}>
        <CircularProgress />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box className={styles["error-container"]}>
        <Typography variant="h6" color="error">
          Post Not Found
        </Typography>
        <Typography color="text.secondary">
          The post you're looking for doesn't exist.
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate(`/groups`)}
          sx={{ mt: 2 }}
        >
          Back to Groups
        </Button>
      </Box>
    );
  }

  const userReaction = getUserReaction();
  const reactionCounts = getReactionCounts();
  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + count,
    0
  );
  const reactionUsers = {};
  if (post.reactions) {
    post.reactions.forEach((r) => {
      if (!reactionUsers[r.reactionTypeEmojiUnicode])
        reactionUsers[r.reactionTypeEmojiUnicode] = [];
      reactionUsers[r.reactionTypeEmojiUnicode].push(r);
    });
  }
  const usersToShow =
    previewTab === "all"
      ? Object.values(reactionUsers).flat()
      : reactionUsers[previewTab] || [];

  const commentListStyles = {
    maxHeight: 400,
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "var(--border-light) var(--background-light)",
    "&::-webkit-scrollbar": {
      width: 8,
      background: "var(--background-light)",
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "var(--border-light)",
      borderRadius: 8,
      minHeight: 40,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "var(--text-secondary)",
    },
  };

  return (
    <Box className={styles["view-post-details-container"]}>
      <Box className={styles["main-content"]}>
        {!isMember && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You are not a member of this group. Interactions are limited.
          </Alert>
        )}
        <Card className={styles["post-card"]}>
          <CardContent sx={{ pb: 1 }}>
            {/* Post Header */}
            <Box className={styles["post-header"]}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={post.user?.avatar || "/placeholder-avatar.jpg"}
                  alt={post.user?.fullName || "User"}
                  className={styles["post-author-avatar"]}
                />
                <Box>
                  <Typography
                    variant="subtitle2"
                    className={styles["post-author-name"]}
                  >
                    {post.user?.fullName || "Anonymous"}
                  </Typography>
                  <Typography variant="caption" className={styles["post-date"]}>
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                className={styles["post-menu-button"]}
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl) && !selectedComment}
                onClose={() => setMenuAnchorEl(null)}
                PaperProps={{ className: "post-menu" }}
              >
                {post.userId === user?.userId && !isMember && (
                  <Alert severity="warning" sx={{ mb: 2, p: 2, width: "100%" }}>
                    You have left this group. Other members can still see your
                    post.
                  </Alert>
                )}
                {post.userId === user?.userId && !isMember && (
                  <MenuItem
                    onClick={() =>
                      navigate(`/groups/${post?.groupId}?action=view-out-join`)
                    }
                  >
                    <PostAdd sx={{ mr: 1 }} />
                    View group
                  </MenuItem>
                )}
                {post.userId === user?.userId && isMember && (
                  <MenuItem
                    onClick={() => navigate(`/my-posts/${postId}/edit`)}
                    className={styles["edit-menu-item"]}
                  >
                    <Edit sx={{ mr: 1 }} />
                    Edit Post
                  </MenuItem>
                )}
                {(post.userId === user?.userId || isAdmin) && isMember && (
                  <MenuItem
                    onClick={handleDeletePost}
                    className={styles["delete-menu-item"]}
                  >
                    <Delete sx={{ mr: 1 }} />
                    Delete Post
                  </MenuItem>
                )}
                {isAdmin && isMember && (
                  <MenuItem
                    onClick={handleHidePost}
                    className={styles["hide-menu-item"]}
                  >
                    <VisibilityOff sx={{ mr: 1 }} />
                    Hide Post
                  </MenuItem>
                )}
                {isMember && (
                  <MenuItem
                    onClick={handleSharePost}
                    className={styles["share-menu-item"]}
                  >
                    <ShareIcon sx={{ mr: 1 }} />
                    Share Post
                  </MenuItem>
                )}
              </Menu>
            </Box>

            {/* Post Tags */}
            {post?.tags && post?.tags?.length > 0 && (
              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                {post.tags.map((tag) => (
                  <Chip
                    key={tag.tagId}
                    label={`#${tag.tagName}`}
                    size="small"
                    className={styles["post-tag"]}
                  />
                ))}
              </Box>
            )}

            {/* Post Content */}
            <Typography
              variant="body2"
              className={styles["post-content"]}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content),
              }}
            />
            {post.thumbnail && (
              <Box className={styles["post-image-container"]}>
                <a
                  href={post.thumbnail}
                  data-fancybox="gallery"
                  data-caption={post.content || "Post Image"}
                  className={styles["post-image-link"]}
                >
                  <img
                    src={post.thumbnail || "/default_image.png"}
                    alt="Post Thumbnail"
                    className={styles["post-image"]}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default_image.png";
                    }}
                  />
                </a>
              </Box>
            )}

            {/* Post Reactions and Actions */}
            <Box className={styles["group-post-reactions"]}>
              {totalReactions > 0 ? (
                <Box className={styles["reactions-summary"]}>
                  <Box className={styles["reaction-emojis"]}>
                    {Object.entries(reactionCounts).map(
                      ([emojiUnicode, count]) => (
                        <span
                          key={emojiUnicode}
                          style={{ fontSize: 18, marginRight: 4 }}
                        >
                          {unicodeToEmoji(emojiUnicode)}
                        </span>
                      )
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    className={styles["reactions-count"]}
                    onClick={(e) => setPreviewAnchorEl(e.currentTarget)}
                  >
                    {totalReactions} reactions
                  </Typography>
                  <Popover
                    open={Boolean(previewAnchorEl)}
                    anchorEl={previewAnchorEl}
                    onClose={() => setPreviewAnchorEl(null)}
                    anchorReference="anchorPosition"
                    anchorPosition={{
                      top: window.innerHeight / 2,
                      left: window.innerWidth / 2,
                    }}
                    transformOrigin={{
                      vertical: "center",
                      horizontal: "center",
                    }}
                    PaperProps={{
                      className: "reactions-popover",
                      sx: { width: 400, maxHeight: 500, p: 2 },
                    }}
                  >
                    <Tabs
                      value={previewTab}
                      onChange={(_, v) => setPreviewTab(v)}
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ mb: 1, minHeight: 36 }}
                      TabIndicatorProps={{
                        style: {
                          height: 3,
                          background: "var(--primary-color)",
                        },
                      }}
                    >
                      <Tab
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Typography variant="caption">All</Typography>
                          </Box>
                        }
                        value="all"
                        sx={{
                          minHeight: 36,
                          px: 1.5,
                          borderRadius: 1,
                          fontWeight: 600,
                        }}
                      />
                      {Object.entries(reactionUsers).map(
                        ([emojiUnicode, users]) => (
                          <Tab
                            key={emojiUnicode}
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <span style={{ fontSize: 18 }}>
                                  {unicodeToEmoji(emojiUnicode)}
                                </span>
                                <Typography variant="caption">
                                  {users[0]?.reactionTypeName}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "var(--text-secondary)" }}
                                >
                                  ({users.length})
                                </Typography>
                              </Box>
                            }
                            value={emojiUnicode}
                            sx={{
                              minHeight: 36,
                              px: 1.5,
                              borderRadius: 1,
                              fontWeight: 600,
                            }}
                          />
                        )
                      )}
                    </Tabs>
                    <Box sx={{ width: "100%", mt: 1 }}>
                      {usersToShow.length > 0 ? (
                        usersToShow.map((u, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1.5,
                            }}
                          >
                            <Avatar
                              src={u.userAvatar || "/placeholder-avatar.jpg"}
                              alt={u.userFullName || "User"}
                              sx={{ width: 28, height: 28, mr: 1 }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                color: "var(--text-primary)",
                                fontWeight: 500,
                              }}
                            >
                              {u.userFullName || "User"}
                            </Typography>
                            <Box sx={{ ml: 1 }}>
                              <span style={{ fontSize: 16 }}>
                                {unicodeToEmoji(u.reactionTypeEmojiUnicode)}
                              </span>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ color: "var(--text-secondary)" }}
                        >
                          No reactions yet.
                        </Typography>
                      )}
                    </Box>
                  </Popover>
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  className={styles["no-reactions"]}
                >
                  No one has expressed any reactions to this post yet.
                </Typography>
              )}

              <Box className={styles["post-actions"]}>
                <Button
                  size="small"
                  color={userReaction ? "secondary" : "primary"}
                  startIcon={
                    <span
                      role="img"
                      aria-label={userReaction?.reactionTypeName || "Like"}
                      style={{ fontSize: 18 }}
                    >
                      {userReaction
                        ? unicodeToEmoji(userReaction.reactionTypeEmojiUnicode)
                        : "👍"}
                    </span>
                  }
                  onClick={(e) =>
                    isMember && setReactionAnchorEl(e.currentTarget)
                  }
                  className={`${styles["reaction-btn"]} ${
                    userReaction ? styles["reacted"] : ""
                  }`}
                  aria-label={userReaction ? "Change reaction" : "Add reaction"}
                  disabled={!isMember}
                >
                  {userReaction ? userReaction.reactionTypeName : "Like"}
                </Button>
                <Popover
                  open={Boolean(reactionAnchorEl)}
                  anchorEl={reactionAnchorEl}
                  onClose={() => setReactionAnchorEl(null)}
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  transformOrigin={{ vertical: "bottom", horizontal: "center" }}
                  PaperProps={{ className: "reaction-picker" }}
                  disableRestoreFocus
                >
                  {reactionTypes
                    ?.filter((rt) => rt.status === "active")
                    .map((rt) => (
                      <Tooltip
                        key={rt.reactionTypeId}
                        title={rt.reactionName}
                        arrow
                        placement="top"
                      >
                        <IconButton
                          onClick={() => handleReact(rt)}
                          className={`reaction-option ${
                            userReaction?.reactionTypeId === rt.reactionTypeId
                              ? "active"
                              : ""
                          }`}
                          aria-label={`React with ${rt.reactionName}`}
                        >
                          <span>{unicodeToEmoji(rt.emojiUnicode)}</span>
                        </IconButton>
                      </Tooltip>
                    ))}
                </Popover>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<CommentIcon />}
                  className={styles["comment-button"]}
                  aria-label={`Comment on post with ${
                    post.totalComment || 0
                  } comments`}
                >
                  Comment ({post.totalComment || 0})
                </Button>
              </Box>
            </Box>

            {/* Comment Section */}
            <Box className={styles["comment-section"]}>
              {isMember && (
                <Box className={styles["comment-input-container"]}>
                  <Avatar
                    src={user?.avatar || "/placeholder-avatar.jpg"}
                    alt="Your Avatar"
                    className={styles["comment-avatar"]}
                  />
                  <TextField
                    size="small"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    fullWidth
                    multiline
                    minRows={1}
                    maxRows={4}
                    className={styles["comment-input"]}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddComment}
                    variant="contained"
                    color="primary"
                    className={styles["comment-submit-button"]}
                    disabled={!newComment.trim()}
                  >
                    <Send />
                  </Button>
                </Box>
              )}

              <Box ref={commentListRef} sx={commentListStyles}>
                {comments.length === 0 && !loadingComments ? (
                  <Typography className={styles["no-comments"]}>
                    No comments yet. Be the first to comment!
                  </Typography>
                ) : (
                  comments.map((comment) => (
                    <Box
                      key={comment.commentId}
                      className={`${styles["comment-item"]} ${
                        comment.userId === user?.userId
                          ? styles["own-comment"]
                          : ""
                      }`}
                    >
                      <Avatar
                        src={comment.userAvatar || "/placeholder-avatar.jpg"}
                        alt={comment.userFullName || "User"}
                        className={styles["comment-avatar"]}
                        onError={(e) =>
                          (e.target.src = "/placeholder-avatar.jpg")
                        }
                      />
                      <Box sx={{ flex: 1 }}>
                        {editingComment?.commentId === comment.commentId ? (
                          <Box className={styles["editing-comment"]}>
                            <TextField
                              autoFocus
                              margin="dense"
                              label="Edit your comment"
                              type="text"
                              fullWidth
                              multiline
                              minRows={2}
                              maxRows={6}
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
                              sx={{ mb: 1 }}
                            />
                            <Box className={styles["edit-actions"]}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditCommentText("");
                                }}
                                color="secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="small"
                                onClick={handleEditComment}
                                variant="contained"
                                color="primary"
                                disabled={!editCommentText.trim()}
                              >
                                Save
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <>
                            <Box className={styles["comment-header"]}>
                              <Typography
                                variant="subtitle2"
                                className={styles["comment-author"]}
                              >
                                {comment.userFullName || "User"}
                              </Typography>
                              <Typography
                                variant="caption"
                                className={styles["comment-date"]}
                              >
                                {new Date(comment.createdAt).toLocaleString()}
                              </Typography>
                              {comment.userId === user?.userId && isMember && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    setMenuAnchorEl(e.currentTarget);
                                    setSelectedComment(comment);
                                  }}
                                  aria-label="Comment actions"
                                >
                                  <MoreHoriz fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              className={styles["comment-text"]}
                            >
                              {comment.commentText}
                            </Typography>
                          </>
                        )}
                      </Box>
                      {comment.userId === user?.userId && isMember && (
                        <Menu
                          anchorEl={menuAnchorEl}
                          open={
                            Boolean(menuAnchorEl) &&
                            selectedComment?.commentId === comment.commentId
                          }
                          onClose={() => {
                            setMenuAnchorEl(null);
                            setSelectedComment(null);
                          }}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          PaperProps={{
                            sx: {
                              borderRadius: 2,
                              minWidth: 140,
                              boxShadow: 3,
                            },
                          }}
                        >
                          <MenuItem
                            onClick={() => {
                              setEditingComment(comment);
                              setEditCommentText(comment.commentText);
                              setMenuAnchorEl(null);
                              setSelectedComment(null);
                            }}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() =>
                              handleDeleteComment(comment.commentId)
                            }
                            sx={{ color: "var(--accent-error)" }}
                          >
                            Delete
                          </MenuItem>
                        </Menu>
                      )}
                    </Box>
                  ))
                )}
                {loadingComments && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewPostDetails;
