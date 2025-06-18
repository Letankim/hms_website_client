import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import SendIcon from "@mui/icons-material/Send";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import apiPostService from "services/apiPostService";
import apiPostCommentService from "services/apiPostCommentService";
import "./ViewPostDetails.css";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { BoxOpen } from "components/Icon/BoxOpen";
import AuthContext from "contexts/AuthContext";

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
  const [anchorElPost, setAnchorElPost] = useState(null);
  const [anchorElComment, setAnchorElComment] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [error, setError] = useState(null);
  const observer = useRef();

  const fetchPost = useCallback(async () => {
    setLoadingPost(true);
    try {
      const res = await apiPostService.getActivePostByIdForUser(postId);
      setPost(res.data);
      setSnackbar({
        open: true,
        message: "Post loaded successfully.",
        severity: "success",
      });
      return res.data;
    } catch (e) {
      setError(e?.message || "Failed to load post details.");
      setSnackbar({
        open: true,
        message: e?.message || "Failed to load post details.",
        severity: "error",
      });
      return null;
    } finally {
      setLoadingPost(false);
    }
  }, [postId]);

  const fetchComments = useCallback(
    async (pageNum, reset = false, retryCount = 0) => {
      const maxRetries = 3;
      if (!post || !hasMore || loadingComments) return;
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
        setLoadingCommentsError(e?.message || "Failed to load comments.");
        setSnackbar({
          open: true,
          message: "Failed to load comments.",
          severity: "error",
        });
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
  }, [fetchPost]);

  useEffect(() => {
    const initializeFancybox = () => {
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
        Image: {
          zoom: true,
          click: "zoom",
          doubleClick: "close",
        },
        Thumbs: {
          autoStart: false,
        },
      });
    };

    initializeFancybox();

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
        postId: parseInt(postId),
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
    if (!editCommentText.trim()) return;
    try {
      await apiPostCommentService.editCommentByUser(editingComment.commentId, {
        postId: parseInt(postId),
        commentText: editCommentText,
      });
      setPage(1);
      setHasMore(true);
      fetchComments(1, true);
      setEditingComment(null);
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
    setAnchorElComment(null);
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
    setAnchorElPost(null);
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
    setAnchorElPost(null);
  };

  const handleSharePost = () => {
    const postUrl = `${window.location.origin}/group/${groupId}/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    setSnackbar({
      open: true,
      message: "Post URL copied to clipboard!",
      severity: "success",
      autoHideDuration: 3000,
    });
    setAnchorElPost(null);
  };

  const handlePostMenuOpen = (event) => {
    setAnchorElPost(event.currentTarget);
  };

  const handlePostMenuClose = () => {
    setAnchorElPost(null);
  };

  const handleCommentMenuOpen = (event, comment) => {
    setAnchorElComment(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleCommentMenuClose = () => {
    setAnchorElComment(null);
    setSelectedComment(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRetryComments = () => {
    setPage(1);
    setHasMore(true);
    fetchComments(1, true);
  };

  const reactionCount = post?.reactions ? post.reactions.length : 0;
  const reactionTypes = post?.reactions
    ? [...new Set(post.reactions.map((r) => r.reactionTypeName))]
    : [];

  if (loadingPost) {
    return (
      <Box
        className="view-post-details-container"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box
        className="view-post-details-container"
        py={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
      >
        <BoxOpen style={{ width: 96, height: 96, color: "#d32f2f" }} />
        <Typography color="error" align="center" variant="h6">
          {error || "Post not found."}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="view-post-details-container">
      <Card className="post-card">
        <CardContent className="post-header">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                src={post.user?.avatar || "/default-avatar.png"}
                alt="User Avatar"
                className="user-avatar"
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {post.user?.fullName || "Unknown User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handlePostMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </CardContent>
        <CardContent className="post-content-area">
          <div
            className="post-text"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {post.thumbnail && (
            <a href={post.thumbnail} data-fancybox="gallery">
              <CardMedia
                component="img"
                image={post.thumbnail}
                alt="Post Thumbnail"
                className="post-image"
              />
            </a>
          )}
        </CardContent>
        <CardContent className="post-tags">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag) => (
              <Chip
                key={tag.tagId}
                label={tag.tagName}
                size="small"
                className="post-chip"
                sx={{ mr: 1, mb: 1 }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tags
            </Typography>
          )}
        </CardContent>
        <Divider />
        <CardContent className="post-footer">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box display="flex" gap={2} alignItems="center">
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                onClick={() => setReactionDialogOpen(true)}
                className="reaction-count"
              >
                <ThumbUpIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {reactionCount} Reactions
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CommentIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {post.totalComment} Comments
                </Typography>
              </Box>
            </Box>
            <Chip
              label={post.status === "active" ? "Active" : "Deleted"}
              color={post.status === "active" ? "success" : "default"}
              size="small"
            />
          </Box>
        </CardContent>
        <Divider />
        <CardContent className="comment-section">
          <Box display="flex" gap={1} mb={2} className="comment-input">
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
            />
            <IconButton
              color="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
          {loadingCommentsError && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              mb={2}
            >
              <Typography color="error" align="center">
                {loadingCommentsError}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRetryComments}
              >
                Retry Loading Comments
              </Button>
            </Box>
          )}
          {comments.map((comment, index) => (
            <Box
              key={comment.commentId}
              ref={index === comments.length - 1 ? lastCommentRef : null}
              className={`comment-item ${
                comment.userId === user.userId ? "user-comment" : ""
              }`}
            >
              <Box display="flex" gap={2}>
                <Avatar
                  src={comment.userAvatar || "/default-avatar.png"}
                  alt="Commenter Avatar"
                  className="comment-avatar"
                />
                <Box flexGrow={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {comment.userFullName || "Unknown User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {comment.userId === user.userId && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleCommentMenuOpen(e, comment)}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    )}
                  </Box>
                  {editingComment?.commentId === comment.commentId ? (
                    <Box display="flex" gap={1} mt={1}>
                      <TextField
                        fullWidth
                        size="small"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        variant="outlined"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEditComment}
                        disabled={!editCommentText.trim()}
                        size="small"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setEditingComment(null)}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" mt={1}>
                      {comment.commentText}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          {loadingComments && (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress size={24} />
            </Box>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorElPost}
        open={Boolean(anchorElPost)}
        onClose={handlePostMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate(`/my-posts/${postId}/edit`);
            handlePostMenuClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeletePost}>Delete</MenuItem>
        <MenuItem onClick={handleSharePost}>Share</MenuItem>
        <MenuItem onClick={handleHidePost}>Hide Post</MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorElComment}
        open={Boolean(anchorElComment)}
        onClose={handleCommentMenuClose}
      >
        <MenuItem
          onClick={() => {
            setEditingComment(selectedComment);
            setEditCommentText(selectedComment.commentText);
            handleCommentMenuClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDeleteComment(selectedComment.commentId)}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={reactionDialogOpen}
        onClose={() => setReactionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {reactionTypes.length > 0 ? (
            <>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="reaction types tabs"
                sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
              >
                <Tab
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        All Reactions ({reactionCount})
                      </Typography>
                    </Box>
                  }
                  aria-label="all reactions"
                />
                {reactionTypes.map((type, index) => (
                  <Tab
                    key={type}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        {post.reactions.find((r) => r.reactionTypeName === type)
                          ?.reactionTypeEmojiUnicode ? (
                          <span>
                            {String.fromCodePoint(
                              parseInt(
                                post.reactions
                                  .find((r) => r.reactionTypeName === type)
                                  .reactionTypeEmojiUnicode.replace("U+", ""),
                                16
                              )
                            )}
                          </span>
                        ) : (
                          type
                        )}
                        <Typography variant="body2">
                          {type} (
                          {
                            post.reactions.filter(
                              (r) => r.reactionTypeName === type
                            ).length
                          }
                          )
                        </Typography>
                      </Box>
                    }
                    aria-label={`${type} reactions`}
                  />
                ))}
              </Tabs>
              <div
                role="tabpanel"
                hidden={selectedTab !== 0}
                id="reaction-tabpanel-all"
                aria-labelledby="reaction-tab-all"
              >
                {selectedTab === 0 && (
                  <List>
                    {post.reactions.map((reaction) => (
                      <ListItem key={reaction.reactionId}>
                        <ListItemAvatar>
                          <Avatar
                            src={reaction.userAvatar || "/default-avatar.png"}
                            alt="User Avatar"
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={reaction.userFullName || "Unknown User"}
                          secondary={
                            reaction.reactionTypeEmojiUnicode ? (
                              <span>
                                {String.fromCodePoint(
                                  parseInt(
                                    reaction.reactionTypeEmojiUnicode.replace(
                                      "U+",
                                      ""
                                    ),
                                    16
                                  )
                                )}
                              </span>
                            ) : (
                              reaction.reactionTypeName
                            )
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </div>
              {reactionTypes.map((type, index) => (
                <div
                  key={type}
                  role="tabpanel"
                  hidden={selectedTab !== index + 1}
                  id={`reaction-tabpanel-${index + 1}`}
                  aria-labelledby={`reaction-tab-${index + 1}`}
                >
                  {selectedTab === index + 1 && (
                    <List>
                      {post.reactions
                        .filter((r) => r.reactionTypeName === type)
                        .map((reaction) => (
                          <ListItem key={reaction.reactionId}>
                            <ListItemAvatar>
                              <Avatar
                                src={
                                  reaction.userAvatar || "/default-avatar.png"
                                }
                                alt="User Avatar"
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={reaction.userFullName || "Unknown User"}
                              secondary={
                                reaction.reactionTypeEmojiUnicode ? (
                                  <span>
                                    {String.fromCodePoint(
                                      parseInt(
                                        reaction.reactionTypeEmojiUnicode.replace(
                                          "U+",
                                          ""
                                        ),
                                        16
                                      )
                                    )}
                                  </span>
                                ) : (
                                  type
                                )
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  )}
                </div>
              ))}
            </>
          ) : (
            <Typography>No reactions yet.</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ViewPostDetails;
