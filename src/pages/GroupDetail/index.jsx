import React, {
  useEffect,
  useState,
  useCallback,
  useContext,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  TextField,
  AvatarGroup,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  Pagination,
} from "@mui/material";
import {
  Lock as LockIcon,
  Public as PublicIcon,
  People as PeopleIcon,
  Comment as CommentIcon,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Image as ImageIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import Link from "@tiptap/extension-link";
import DOMPurify from "dompurify";
import apiGroupService from "services/apiGroupService";
import apiGroupMemberService from "services/apiGroupMemberService";
import apiPostService from "services/apiPostService";
import apiReactionTypeService from "services/apiReactionTypeService";
import AuthContext from "contexts/AuthContext";
import Popover from "@mui/material/Popover";
import { useTheme } from "@mui/material/styles";
import Autocomplete from "@mui/material/Autocomplete";
import apiTagService from "services/apiTagService";
import "./index.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AddIcon from "@mui/icons-material/Add";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import apiPostReactService from "services/apiPostReactService";
import apiPostCommentService from "services/apiPostCommentService";
import apiUserService from "services/apiUserService";
import apiReportReasonService from "services/apiReportReasonService";
import apiPostReportService from "services/apiPostReportService";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const editorStyles = {
  border: "1px solid #e0e0e0",
  borderRadius: "0 0 4px 4px",
  padding: "12px",
  minHeight: "150px",
  bgcolor: "#fff",
  "& .ProseMirror": {
    minHeight: "120px",
    outline: "none",
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333",
    "& p.is-empty::before": {
      content: '"What\'s on your mind?"',
      color: "#6b7280",
      float: "left",
      pointerEvents: "none",
    },
    "& p": {
      margin: "0 0 8px 0",
    },
    "& ul, & ol": {
      paddingLeft: "20px",
      margin: "8px 0",
    },
    "& img": {
      maxWidth: "100%",
      height: "auto",
      borderRadius: "4px",
      margin: "8px 0",
    },
    "& a": {
      color: "#007bff",
      textDecoration: "underline",
    },
    "&:focus": {
      borderColor: "#007bff",
      boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.1)",
    },
  },
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [userAddPost, setUserAddPost] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [posts, setPosts] = useState([]);
  const [postReport, setPostReport] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [reactionTypes, setReactionTypes] = useState([]);
  const [anchorEl, setAnchorEl] = useState({});
  const [previewAnchorEl, setPreviewAnchorEl] = useState({});
  const [previewTab, setPreviewTab] = useState({});
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTagsPost, setSelectedTagsPost] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [postLoadingBtn, setPostLoadingBtn] = useState(false);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [imageType, setImageType] = useState("upload");
  const [imageLink, setImageLink] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState(null);
  const [commentMenuCommentId, setCommentMenuCommentId] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [imagePreviewDialogOpen, setImagePreviewDialogOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [reportReasonPage, setReportReasonPage] = useState(1);
  const [reportReasonTotalPages, setReportReasonTotalPages] = useState(1);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(null);
  const [reportDetails, setReportDetails] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const theme = useTheme();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: "",
  });

  const fetchGroup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGroupService.getGroupActiveById(groupId);
      const data = res.data || res;
      setGroup({
        ...data,
        isJoin: data.isJoin || false,
        memberCount: data.memberCount || 0,
        communityPosts: data.communityPosts || [],
        members: data.members || [],
      });
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to fetch group.",
        severity: "error",
      });
      setGroup(null);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchPosts = useCallback(async () => {
    if (!group?.isJoin) return;
    setPostLoading(true);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        ValidPageSize: pageSize,
        Status: "active",
        search,
      };
      let res;
      if (selectedTags.length > 0) {
        res = await apiPostService.getPostsByTags(
          groupId,
          selectedTags.map((t) => t.tagId),
          params
        );
      } else {
        res = await apiPostService.getPostsByGroup(groupId, params);
      }
      const data = res.data || res;
      setPosts(data.posts || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setPosts([]);
      setSnackbar({
        open: true,
        message: e?.message || "Failed to fetch posts.",
        severity: "error",
      });
    } finally {
      setPostLoading(false);
    }
  }, [group?.isJoin, search, selectedTags, groupId, pageNumber, pageSize]);

  useEffect(() => {
    apiReactionTypeService.getAllReactionTypes().then((data) => {
      setReactionTypes(data?.data?.reactionTypes || data);
    });
  }, []);

  useEffect(() => {
    if (group?.isJoin) fetchPosts();
  }, [group?.isJoin, fetchPosts, pageNumber, pageSize]);

  useEffect(() => {
    apiTagService.getAllActiveTags().then((res) => {
      setAllTags(res.data?.tags || []);
    });
  }, []);

  const handleJoin = async () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please login to join the group.",
        severity: "warning",
      });
      setTimeout(
        () => navigate("/login", { state: { from: `/groups/${groupId}` } }),
        1200
      );
      return;
    }
    if (!group) return;
    setJoinLoading(true);
    try {
      if (group.isJoin) {
        await apiGroupMemberService.leaveGroup({ groupId });
        setGroup((prev) => ({
          ...prev,
          isJoin: false,
          memberCount: Math.max(0, prev.memberCount - 1),
        }));
        setSnackbar({
          open: true,
          message: "Left group successfully!",
          severity: "info",
        });
      } else {
        await apiGroupMemberService.joinGroup({ groupId });
        setGroup((prev) => {
          const isPrivate = prev.isPrivate;
          return {
            ...prev,
            isJoin: isPrivate ? false : true,
            isRequested: isPrivate ? true : false,
            memberCount: isPrivate ? prev.memberCount : prev.memberCount + 1,
          };
        });
        setSnackbar({
          open: true,
          message: group.isPrivate
            ? "Join request sent! Please wait for approval."
            : "Joined group successfully!",
          severity: "success",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message:
          e?.message || `Failed to ${group.isJoin ? "leave" : "join"} group.`,
        severity: "error",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleOpenPostDialog = async () => {
    setOpenPostDialog(true);
    if (editor) {
      editor.commands.setContent("");
    }
    if (userAddPost == null) {
      try {
        const responseUser = await apiUserService.getUserActiveById(
          user.userId
        );
        if (responseUser.statusCode === 200) {
          setUserAddPost(responseUser.data || responseUser);
        } else {
          setSnackbar({
            open: true,
            message: "Failed to fetch user data.",
            severity: "error",
          });
        }
      } catch (e) {
        setSnackbar({
          open: true,
          message: e?.message || "Failed to fetch user data.",
          severity: "error",
        });
      }
    }
  };

  const handleClosePostDialog = () => {
    setOpenPostDialog(false);
    setPostImage(null);
    setImagePreview("");
    setImageLink("");
    setSelectedTagsPost([]);
    if (editor) {
      editor.commands.setContent("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLink = () => {
    setImagePreview(imageLink);
    setPostImage(null);
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setImagePreview("");
    setImageLink("");
  };

  const handlePostSubmit = async () => {
    if (!editor || !editor.getHTML().trim() || !group?.isJoin) {
      setSnackbar({
        open: true,
        message: "You must join the group and provide content to post.",
        severity: "warning",
      });
      return;
    }
    setPostLoadingBtn(true);
    try {
      let thumbnail = imagePreview;
      if (postImage && imageType === "upload") {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(postImage);
        });
        thumbnail = base64;
      } else if (imageType === "link" && imageLink) {
        thumbnail = imageLink;
      }
      const postDto = {
        postId: 0,
        userId: user.userId,
        groupId: Number(groupId),
        thumbnail,
        content: editor.getHTML(),
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
        updatedAt: new Date().toISOString(),
        tagIds: selectedTagsPost.map((t) => t.tagId),
      };
      await apiPostService.createPost(postDto);
      setSnackbar({
        open: true,
        message: "Post created successfully!",
        severity: "success",
      });
      handleClosePostDialog();
      fetchPosts();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to create post.",
        severity: "error",
      });
    } finally {
      setPostLoadingBtn(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

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
  }, []);

  const unicodeToEmoji = (unicode) => {
    if (!unicode) return "";
    return unicode
      .split(" ")
      .map((u) => String.fromCodePoint(parseInt(u.replace("U+", ""), 16)))
      .join("");
  };

  const getUserReaction = (post) => {
    if (!user || !post.reactions) return null;
    return post.reactions.find((r) => r.userId === user.userId) || null;
  };

  const getReactionCounts = (post) => {
    const counts = {};
    if (!post.reactions) return counts;
    post.reactions.forEach((r) => {
      counts[r.reactionTypeEmojiUnicode] =
        (counts[r.reactionTypeEmojiUnicode] || 0) + 1;
    });
    return counts;
  };

  const handleReactionBarOpen = (event, postId) => {
    setAnchorEl((prev) => ({ ...prev, [postId]: event.currentTarget }));
  };

  const handleReactionBarClose = (postId) => {
    setAnchorEl((prev) => ({ ...prev, [postId]: null }));
  };

  const handlePreviewOpen = (event, postId) => {
    setPreviewAnchorEl((prev) => ({ ...prev, [postId]: event.currentTarget }));
  };

  const handlePreviewClose = (postId) => {
    setPreviewAnchorEl((prev) => ({ ...prev, [postId]: null }));
  };

  const handlePreviewTabChange = (postId, newTab) => {
    setPreviewTab((prev) => ({ ...prev, [postId]: newTab }));
  };

  const handleReact = async (post, reactionType) => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please login to react.",
        severity: "warning",
      });
      setTimeout(
        () => navigate("/login", { state: { from: `/groups/${groupId}` } }),
        1200
      );
      return;
    }
    try {
      const userReaction = getUserReaction(post);
      if (userReaction) {
        if (userReaction.reactionTypeId === reactionType.reactionTypeId) {
          await apiPostReactService.unreactToPost(post.postId);
          setPosts((prev) =>
            prev.map((p) => {
              if (p.postId === post.postId) {
                return {
                  ...p,
                  reactions: p.reactions.filter(
                    (r) => r.userId !== user.userId
                  ),
                };
              }
              return p;
            })
          );
          setSnackbar({
            open: true,
            message: "Reaction removed!",
            severity: "success",
          });
        } else {
          await apiPostReactService.reactToPost({
            postId: post.postId,
            reactionTypeId: reactionType.reactionTypeId,
            reactionText: reactionType.reactionName,
          });
          setPosts((prev) =>
            prev.map((p) => {
              if (p.postId === post.postId) {
                return {
                  ...p,
                  reactions: p.reactions.map((r) =>
                    r.userId === user.userId
                      ? {
                          ...r,
                          reactionTypeId: reactionType.reactionTypeId,
                          reactionTypeEmojiUnicode: reactionType.emojiUnicode,
                          reactionTypeName: reactionType.reactionName,
                        }
                      : r
                  ),
                };
              }
              return p;
            })
          );
          setSnackbar({
            open: true,
            message: `Reacted with ${reactionType.reactionName}!`,
            severity: "success",
          });
        }
      } else {
        await apiPostReactService.reactToPost({
          postId: post.postId,
          reactionTypeId: reactionType.reactionTypeId,
          reactionText: reactionType.reactionName,
        });
        setPosts((prev) =>
          prev.map((p) => {
            if (p.postId === post.postId) {
              return {
                ...p,
                reactions: [
                  ...p.reactions,
                  {
                    userId: user.userId,
                    reactionTypeId: reactionType.reactionTypeId,
                    reactionTypeEmojiUnicode: reactionType.emojiUnicode,
                    reactionTypeName: reactionType.reactionName,
                  },
                ],
              };
            }
            return p;
          })
        );
        setSnackbar({
          open: true,
          message: `Reacted with ${reactionType.reactionName}!`,
          severity: "success",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to react.",
        severity: "error",
      });
    } finally {
      handleReactionBarClose(post.postId);
    }
  };

  const COMMENTS_PAGE_SIZE = 3;

  const handleOpenCommentDialog = async (post) => {
    setActiveCommentPost(post);
    setCommentDialogOpen(true);
    setCommentPage(1);
    setComments([]);
    await fetchComments(post.postId, 1, true);
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setActiveCommentPost(null);
    setComments([]);
    setNewComment("");
    setEditingComment(null);
  };

  const fetchComments = async (postId, page = 1, replace = false) => {
    setCommentLoading(true);
    try {
      const res = await apiPostCommentService.getCommentsByPostId(postId, {
        PageNumber: page,
        PageSize: COMMENTS_PAGE_SIZE,
      });
      const data = res.data || res;
      setCommentTotalPages(data.totalPages || 1);
      setComments((prev) =>
        replace ? data.comments || [] : [...prev, ...(data.comments || [])]
      );
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || "Failed to load comments.",
        severity: "error",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeCommentPost) return;
    try {
      await apiPostCommentService.addCommentByUser({
        postId: activeCommentPost.postId,
        commentText: newComment,
      });
      setNewComment("");
      await fetchComments(activeCommentPost.postId, 1, true);
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to add comment.",
        severity: "error",
      });
    }
  };

  const handleCommentMenuOpen = (event, commentId) => {
    setCommentMenuAnchorEl(event.currentTarget);
    setCommentMenuCommentId(commentId);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchorEl(null);
    setCommentMenuCommentId(null);
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditingCommentText(comment.commentText);
    handleCommentMenuClose();
  };

  const handleDeleteComment = async (comment) => {
    handleCommentMenuClose();
    try {
      const deleteResponse = await apiPostCommentService.deleteCommentByUser(
        comment.commentId
      );
      if (deleteResponse.statusCode === 200) {
        await fetchComments(comment.postId, 1, true);
        setSnackbar({
          open: true,
          message: deleteResponse?.message || "Comment deleted successfully.",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to delete comment.",
          severity: "error",
        });
      }
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to delete comment.",
        severity: "error",
      });
    }
  };

  const handleLoadMoreComments = async () => {
    if (!activeCommentPost) return;
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    await fetchComments(activeCommentPost.postId, nextPage);
  };

  const commentListRef = useRef();

  useEffect(() => {
    if (!commentDialogOpen) return;
    const el = commentListRef.current;
    if (!el) return;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (
          el.scrollHeight - el.scrollTop - el.clientHeight < 120 &&
          !commentLoading &&
          commentPage < commentTotalPages
        ) {
          handleLoadMoreComments();
        }
        ticking = false;
      });
    };
    el.addEventListener("scroll", handleScroll);
    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [
    commentDialogOpen,
    commentLoading,
    commentPage,
    commentTotalPages,
    handleLoadMoreComments,
  ]);

  const handleOpenReportDialog = async (post) => {
    try {
      const userReport = await apiPostReportService.checkUserReport(
        post.postId
      );
      if (userReport) {
        setSnackbar({
          open: true,
          message: "You have already reported this post.",
          severity: "warning",
        });
        return;
      }
    } catch (e) {}
    setReportReasons([]);
    await handleLoadMoreReportReasons();
    setSelectedReportReason(null);
    setReportDetails("");
    setReportDialogOpen(true);
    setPostReport(post);
  };

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
    setSelectedReportReason(null);
    setReportDetails("");
  };

  const handleLoadMoreReportReasons = async () => {
    if (reportLoading) return;
    setReportLoading(true);
    try {
      const queryParams = {
        PageNumber: 1,
        PageSize: 1000,
        ValidPageSize: 10,
      };
      const res = await apiReportReasonService.getAllActiveReportReasons(
        queryParams
      );
      const data = res.data || res;
      setReportReasons((prev) => [...prev, ...(data.reportReasons || [])]);
      setReportReasonPage(1);
      setReportReasonTotalPages(data.totalPages || 1);
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to load report reasons.",
        severity: "error",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedReportReason) return;
    try {
      await apiPostReportService.reportPost({
        postId: postReport.postId,
        reasonId: selectedReportReason.reasonId,
        userId: user?.userId || 0,
        reasonText: selectedReportReason.reasonName,
        details: reportDetails,
        status: "pending",
        note: "new",
      });
      setSnackbar({
        open: true,
        message: "Report submitted successfully.",
        severity: "success",
      });
      handleCloseReportDialog();
    } catch (e) {
      setSnackbar({
        open: true,
        message: e?.message || "Failed to submit report.",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={180}
          sx={{ mb: 2, borderRadius: 3 }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="circular" width={100} height={100} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={36} />
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="30%" height={20} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!group) {
    return (
      <Box className="group-detail-empty">
        <Typography color="#6b7280">Group not found.</Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate("/groups")}
          sx={{ mt: 2 }}
          aria-label="Back to groups"
        >
          Back to Groups
        </Button>
      </Box>
    );
  }

  const commentListStyles = {
    maxHeight: 360,
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "#ccd0d5 #f0f2f5",
    "&::-webkit-scrollbar": {
      width: 8,
      background: "#f0f2f5",
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#ccd0d5",
      borderRadius: 8,
      minHeight: 40,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#b0b3b8",
    },
  };

  return (
    <Box className="group-detail-container">
      <Box className="group-detail-cover">
        <img
          src={group.thumbnail || "/placeholder-cover.jpg"}
          alt={`${group.groupName} cover`}
          aria-label="Group cover image"
        />
      </Box>
      <Box className="group-detail-header">
        <Box className="group-detail-avatar">
          <Avatar
            src={group.thumbnail}
            alt={group.groupName}
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              borderRadius: 3,
              border: "4px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            aria-label="Group avatar"
          />
        </Box>
        <Box className="group-detail-info">
          <Typography
            variant="h4"
            fontWeight={800}
            color="#1877f2"
            sx={{ fontSize: { xs: "1.6rem", sm: "2rem", md: "2.5rem" }, mb: 1 }}
          >
            {group.groupName}
          </Typography>
          <Box className="group-detail-meta">
            <div
              className={`group-meta-item ${
                group.isPrivate ? "private" : "public"
              }`}
            >
              {group.isPrivate ? (
                <>
                  <LockIcon className="meta-icon" />
                  <b>Private Group</b>
                </>
              ) : (
                <>
                  <PublicIcon className="meta-icon" />
                  <b>Public Group</b>
                </>
              )}
            </div>
            <div className="group-meta-item members-info">
              <PeopleIcon className="meta-icon" />
              <b>{group.memberCount || 0}</b> members
            </div>
            <div className="group-meta-item join-btn">
              {group.isJoin ? (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleJoin}
                  disabled={joinLoading}
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 20,
                    px: 2,
                    boxShadow: "0 1px 3px rgba(24,119,242,0.08)",
                  }}
                  aria-label="Leave group"
                >
                  {joinLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Leave Group"
                  )}
                </Button>
              ) : group.isRequested ? (
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  disabled
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 20,
                    px: 2,
                    boxShadow: "0 1px 3px rgba(255,193,7,0.08)",
                  }}
                  aria-label="Request pending"
                >
                  Request Pending...
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleJoin}
                  disabled={joinLoading}
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 20,
                    px: 2,
                    boxShadow: "0 2px 8px rgba(24,119,242,0.12)",
                  }}
                  aria-label="Join group"
                >
                  {joinLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Join Group"
                  )}
                </Button>
              )}
            </div>
          </Box>
          <Box className="group-detail-creator">
            <Avatar
              src={group.creator?.avatar || "/placeholder-avatar.jpg"}
              alt={group.creator?.fullName || "Admin"}
              sx={{
                width: 40,
                height: 40,
                border: "2px solid #1877f2",
                bgcolor: "#fff",
                mr: 1,
              }}
              aria-label="Group creator avatar"
            />
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "#1877f2", lineHeight: 1.3 }}
              >
                {group.creator?.fullName || "Admin"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", lineHeight: 1.3 }}
              >
                {group.creator?.email || ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className="group-detail-members">
        <Typography variant="h6" fontWeight={700} mb={2}>
          Members ({group.memberCount || 0})
        </Typography>
        {group.members && group.members.length > 0 ? (
          <AvatarGroup max={6} sx={{ mb: 2 }}>
            {group.members.map((member) => (
              <Avatar
                key={member.id}
                src={member.avatar || "/placeholder-avatar.jpg"}
                alt={member.name || "Member"}
                sx={{ width: 40, height: 40 }}
                aria-label={`Member ${member.name || "Unknown"}`}
              />
            ))}
          </AvatarGroup>
        ) : (
          <Typography color="#6b7280" mb={2}>
            No members yet.
          </Typography>
        )}
      </Box>
      <Box className="group-detail-description">
        <Typography variant="h6" fontWeight={700} mb={2}>
          About This Group
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#374151", lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(group.description),
          }}
        />
      </Box>
      {group.isJoin && (
        <Box
          className="group-detail-description"
          sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenPostDialog}
            sx={{ fontWeight: 700, borderRadius: 20, px: 3, boxShadow: 2 }}
          >
            Create Post
          </Button>
        </Box>
      )}
      <Dialog
        open={openPostDialog}
        onClose={handleClosePostDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle fontWeight={700} color="#1877f2">
          Create New Post
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f0f2f5", p: 0 }}>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderBottom: "1px solid #e4e6eb",
                bgcolor: "#fff",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
            >
              <Avatar
                src={userAddPost?.avatar || "/placeholder-avatar.jpg"}
                alt={userAddPost?.fullName || "User"}
                sx={{ width: 48, height: 48 }}
              />
              <Typography fontWeight={700} color="#1877f2">
                {userAddPost?.fullName || "User"}
              </Typography>
            </Box>
            <Typography
              sx={{
                display: "block",
                color: "#b0b3b8",
                borderBottom: "1px solid #e4e6eb",
                bgcolor: "#fff",
                p: 2,
                fontSize: 18,
                fontWeight: 500,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              What's on your mind today?
            </Typography>
          </Box>
          <Box sx={{ p: 2, pt: 1 }}>
            <Box
              sx={{
                mb: 2,
                border: "1px solid #e4e6eb",
                borderRadius: 3,
                bgcolor: "#fff",
                boxShadow: 0,
              }}
            >
              {editor && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mb: 1,
                      p: 1,
                      borderBottom: "1px solid #e4e6eb",
                      bgcolor: "#f0f2f5",
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    }}
                  >
                    <IconButton
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      disabled={
                        !editor.can().chain().focus().toggleBold().run()
                      }
                      color={editor.isActive("bold") ? "primary" : "default"}
                      size="small"
                      aria-label="Toggle bold"
                    >
                      <FormatBold />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                      }
                      color={editor.isActive("italic") ? "primary" : "default"}
                      size="small"
                      aria-label="Toggle italic"
                    >
                      <FormatItalic />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleBulletList().run()
                      }
                      color={
                        editor.isActive("bulletList") ? "primary" : "default"
                      }
                      size="small"
                      aria-label="Toggle bullet list"
                    >
                      <FormatListBulleted />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleOrderedList().run()
                      }
                      color={
                        editor.isActive("orderedList") ? "primary" : "default"
                      }
                      size="small"
                      aria-label="Toggle ordered list"
                    >
                      <FormatListNumbered />
                    </IconButton>
                    <IconButton
                      onClick={() => setImageType("link")}
                      color={editor.isActive("link") ? "primary" : "default"}
                      size="small"
                      aria-label="Add link"
                    >
                      <LinkIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setImageType("upload")}
                      color={editor.isActive("image") ? "primary" : "default"}
                      size="small"
                      aria-label="Add image"
                    >
                      <ImageIcon />
                    </IconButton>
                  </Box>
                  <Box sx={editorStyles}>
                    <EditorContent editor={editor} />
                  </Box>
                </>
              )}
            </Box>
            <Autocomplete
              multiple
              options={allTags}
              getOptionLabel={(option) => option.tagName}
              value={selectedTagsPost}
              onChange={(_, v) => setSelectedTagsPost(v)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.tagName}
                    {...getTagProps({ index })}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    sx={{
                      bgcolor: "#e4e6eb",
                      color: "#050505",
                      fontWeight: 600,
                    }}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Select tags"
                  size="small"
                  sx={{
                    bgcolor: "#f0f2f5",
                    borderRadius: 2,
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <TextField
                select
                label="Image Type"
                value={imageType}
                onChange={(e) => setImageType(e.target.value)}
                size="small"
                sx={{
                  minWidth: 120,
                  bgcolor: "#f0f2f5",
                  borderRadius: 2,
                }}
                SelectProps={{ native: true }}
              >
                <option value="upload">Upload from device</option>
                <option value="link">Paste image link</option>
              </TextField>
              {imageType === "upload" ? (
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{
                    bgcolor: "#e4e6eb",
                    color: "#1877f2",
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  {imagePreview ? "Change Image" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              ) : (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    size="small"
                    label="Image Link"
                    value={imageLink}
                    onChange={(e) => setImageLink(e.target.value)}
                    sx={{
                      minWidth: 220,
                      bgcolor: "#f0f2f5",
                      borderRadius: 2,
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleImageLink}
                    disabled={!imageLink}
                    sx={{
                      bgcolor: "#e4e6eb",
                      color: "#1877f2",
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Select
                  </Button>
                </Box>
              )}
              {imagePreview && (
                <Box sx={{ position: "relative" }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      objectFit: "cover",
                      border: "1px solid #e4e6eb",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "#fff",
                      border: "1px solid #e4e6eb",
                      borderRadius: 2,
                    }}
                    onClick={handleRemoveImage}
                  >
                    ✕
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePostDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handlePostSubmit}
            variant="contained"
            color="primary"
            disabled={!editor || !editor.getText().trim() || postLoadingBtn}
            sx={{ fontWeight: 700, borderRadius: 1, px: 3 }}
          >
            {postLoadingBtn ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Post"
            )}
          </Button>
        </DialogActions>
      </Dialog>
      {group.isJoin && (
        <Card
          className="group-detail-description"
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            boxShadow: 1,
            background: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            />
            <Autocomplete
              multiple
              options={allTags}
              getOptionLabel={(option) => option.tagName}
              value={selectedTags}
              onChange={(_, v) => setSelectedTags(v)}
              renderInput={(params) => (
                <TextField {...params} label="Filter by tags" size="small" />
              )}
              sx={{ minWidth: 220 }}
            />
            <Button
              variant="contained"
              onClick={fetchPosts}
              sx={{
                fontWeight: 600,
                borderRadius: 20,
                bgcolor: "#1877f2",
                color: "#fff",
              }}
            >
              Filter / Search
            </Button>
          </Box>
        </Card>
      )}
      {group.isJoin && (
        <>
          <Box className="group-detail-description">
            <Typography variant="h6" fontWeight={700} mb={2}>
              Group Posts
            </Typography>
            {postLoading ? (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 3, py: 4 }}
              >
                {[...Array(3)].map((_, i) => (
                  <Card key={i} sx={{ p: 2, borderRadius: 3, boxShadow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Skeleton
                        variant="circular"
                        width={40}
                        height={40}
                        sx={{ mr: 2 }}
                      />
                      <Skeleton variant="text" width="30%" height={22} />
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={60}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton variant="text" width="80%" height={18} />
                    <Skeleton variant="text" width="50%" height={18} />
                  </Card>
                ))}
              </Box>
            ) : posts.length > 0 ? (
              posts.map((post) => {
                const userReaction = getUserReaction(post);
                const reactionCounts = getReactionCounts(post);
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
                const currentTab = previewTab[post.postId] || "all";
                let usersToShow = [];
                if (currentTab === "all" || !currentTab) {
                  usersToShow = Object.values(reactionUsers).flat();
                } else {
                  usersToShow = reactionUsers[currentTab] || [];
                }
                return (
                  <>
                    <Card
                      key={post.postId}
                      className="group-post-card"
                      sx={{
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: theme.shadows[1],
                        background: "#fff",
                        overflow: "visible",
                      }}
                    >
                      <CardContent sx={{ pb: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1.5,
                          }}
                        >
                          <Avatar
                            src={post.user?.avatar || "/placeholder-avatar.jpg"}
                            alt={post.user?.fullName || "User"}
                            sx={{
                              width: 44,
                              height: 44,
                              mr: 2,
                              border: "2px solid #e7f3ff",
                            }}
                            aria-label={`Post author ${
                              post.user?.fullName || "Unknown"
                            }`}
                          />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, color: "#1877f2" }}
                            >
                              {post.user?.fullName || "Anonymous"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280" }}
                            >
                              {new Date(post.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        {post.tags && post.tags.length > 0 && (
                          <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                            {post.tags.map((tag) => (
                              <Chip
                                key={tag.tagId}
                                label={`#${tag.tagName}`}
                                size="small"
                                sx={{
                                  bgcolor: "#e7f3ff",
                                  color: "#1877f2",
                                  fontWeight: 600,
                                  fontSize: 13,
                                  borderRadius: 8,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setSelectedTags([tag]);
                                  fetchPosts();
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#374151",
                            lineHeight: 1.6,
                            mb: post.thumbnail ? 2 : 0,
                            width: "100%",
                            overflow: "hidden",
                            wordBreak: "break-word",
                            "& img": {
                              maxWidth: "100%",
                              height: "auto",
                              display: "block",
                            },
                            "& table": {
                              width: "100%",
                              maxWidth: "100%",
                              tableLayout: "fixed",
                              borderCollapse: "collapse",
                            },
                            "& td, & th": {
                              wordBreak: "break-word",
                              padding: "8px",
                            },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(post.content),
                          }}
                        />
                        {post.thumbnail && (
                          <Box
                            sx={{
                              width: "100%",
                              mt: 1,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <a
                              href={post.thumbnail}
                              data-fancybox="gallery"
                              data-caption={post.content || "Post Image"}
                              style={{
                                maxWidth: "96%",
                                maxHeight: 340,
                                display: "block",
                              }}
                            >
                              <img
                                src={post.thumbnail}
                                alt="Post Thumbnail"
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: 340,
                                  objectFit: "contain",
                                  borderRadius: 8,
                                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                                  transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.transform =
                                    "scale(1.02)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.transform = "scale(1)")
                                }
                              />
                            </a>
                          </Box>
                        )}
                      </CardContent>
                      <Box className="group-post-reactions">
                        {totalReactions > 0 ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              px: 2,
                              pb: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 1,
                              }}
                            >
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
                              sx={{
                                color: "#6b7280",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                              onClick={(e) => handlePreviewOpen(e, post.postId)}
                            >
                              {totalReactions} actions
                            </Typography>
                            <Popover
                              open={Boolean(previewAnchorEl[post.postId])}
                              anchorEl={previewAnchorEl[post.postId]}
                              onClose={() => handlePreviewClose(post.postId)}
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
                                sx: {
                                  minWidth: 340,
                                  maxWidth: 420,
                                  p: 2.5,
                                  borderRadius: 2,
                                  boxShadow: 6,
                                  background: "#fff",
                                  border: "1px solid #e0e0e0",
                                  maxHeight: 420,
                                  overflowY: "auto",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                },
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  mb: 1,
                                  fontWeight: 700,
                                  color: "#1877f2",
                                  fontSize: 18,
                                }}
                              >
                                Reactions
                              </Typography>
                              <Tabs
                                value={previewTab[post.postId] || "all"}
                                onChange={(_, v) =>
                                  handlePreviewTabChange(post.postId, v)
                                }
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ mb: 1, minHeight: 36 }}
                                TabIndicatorProps={{
                                  style: { height: 3, background: "#1877f2" },
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
                                      <Typography variant="caption">
                                        All
                                      </Typography>
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
                                            sx={{ color: "#6b7280" }}
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
                                        src={
                                          u.userAvatar ||
                                          "/placeholder-avatar.jpg"
                                        }
                                        alt={u.userFullName || "User"}
                                        sx={{ width: 28, height: 28, mr: 1 }}
                                      />
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: "#374151",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {u.userFullName || "User"}
                                      </Typography>
                                      <Box sx={{ ml: 1 }}>
                                        <span style={{ fontSize: 16 }}>
                                          {unicodeToEmoji(
                                            u.reactionTypeEmojiUnicode
                                          )}
                                        </span>
                                      </Box>
                                    </Box>
                                  ))
                                ) : (
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#6b7280" }}
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
                            sx={{
                              color: "#6b7280",
                              px: 2,
                              pb: 1,
                              display: "block",
                            }}
                          >
                            No one has expressed any reactions to this post yet.
                          </Typography>
                        )}
                        <Box
                          className="group-post-actions"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            px: 2,
                            pb: 1,
                          }}
                        >
                          <Box className="reaction-button">
                            <Button
                              size="small"
                              color={userReaction ? "secondary" : "primary"}
                              startIcon={
                                <span
                                  role="img"
                                  aria-label={
                                    userReaction?.reactionTypeName || "Like"
                                  }
                                  style={{ fontSize: 18 }}
                                >
                                  {userReaction
                                    ? unicodeToEmoji(
                                        userReaction.reactionTypeEmojiUnicode
                                      )
                                    : "👍"}
                                </span>
                              }
                              onClick={(e) =>
                                handleReactionBarOpen(e, post.postId)
                              }
                              sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                color: userReaction ? "#f50057" : "#1877f2",
                                bgcolor: userReaction ? "#fff0f6" : "#f0f2f5",
                                borderRadius: 20,
                                px: 2,
                                boxShadow: userReaction
                                  ? "0 2px 8px #f5005722"
                                  : "0 1px 3px #e0e0e022",
                                "&:hover": {
                                  bgcolor: userReaction ? "#ffe6ef" : "#e7f3ff",
                                },
                              }}
                              aria-label={
                                userReaction
                                  ? "Change reaction"
                                  : "Add reaction"
                              }
                            >
                              {userReaction
                                ? userReaction.reactionTypeName
                                : "Like"}
                            </Button>
                            <Popover
                              open={Boolean(anchorEl[post.postId])}
                              anchorEl={anchorEl[post.postId]}
                              onClose={() =>
                                handleReactionBarClose(post.postId)
                              }
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "center",
                              }}
                              transformOrigin={{
                                vertical: "bottom",
                                horizontal: "center",
                              }}
                              PaperProps={{
                                sx: {
                                  display: "flex",
                                  gap: 1,
                                  p: 0.5,
                                  borderRadius: 2,
                                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                                  background: "#fff",
                                  border: "1px solid #e0e0e0",
                                  overflow: "visible",
                                },
                              }}
                              disableRestoreFocus
                            >
                              {reactionTypes
                                .filter((rt) => rt.status === "active")
                                .map((rt) => (
                                  <Tooltip
                                    key={rt.reactionTypeId}
                                    title={rt.reactionName}
                                    arrow
                                    placement="top"
                                  >
                                    <IconButton
                                      onClick={() => handleReact(post, rt)}
                                      sx={{
                                        fontSize: 28,
                                        transition: "transform 0.2s ease",
                                        transform:
                                          userReaction?.reactionTypeId ===
                                          rt.reactionTypeId
                                            ? "scale(1.2)"
                                            : "scale(1)",
                                        "&:hover": {
                                          transform: "scale(1.4)",
                                          bgcolor: "#f0f2f5",
                                        },
                                      }}
                                      aria-label={`React with ${rt.reactionName}`}
                                    >
                                      <span>
                                        {unicodeToEmoji(rt.emojiUnicode)}
                                      </span>
                                    </IconButton>
                                  </Tooltip>
                                ))}
                            </Popover>
                          </Box>
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<CommentIcon />}
                            sx={{
                              textTransform: "none",
                              fontWeight: 600,
                              borderRadius: 20,
                              px: 2,
                            }}
                            aria-label={`Comment on post with ${
                              post.totalComment || 0
                            } comments`}
                            onClick={() => handleOpenCommentDialog(post)}
                          >
                            Comment ({post.totalComment || 0})
                          </Button>
                          <Box
                            sx={{
                              ml: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Tooltip title="Report this post">
                              <IconButton
                                size="small"
                                color="error"
                                aria-label="Report post"
                                onClick={() => handleOpenReportDialog(post)}
                                sx={{
                                  borderRadius: 2,
                                  bgcolor: "#fff0f0",
                                  "&:hover": { bgcolor: "#ffeaea" },
                                }}
                              >
                                <FlagIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </>
                );
              })
            ) : (
              <Typography color="#6b7280" className="group-posts-empty">
                No posts yet. Be the first to share!
              </Typography>
            )}
          </Box>
          <Box
            className="group-detail-description"
            sx={{
              textAlign: "center",
              p: 2,
              bgcolor: "#fff",
              borderRadius: 8,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                select
                label="Posts per Page"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                size="small"
                SelectProps={{ native: true }}
              >
                <option value={1}>1</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </TextField>
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={pageNumber}
                  onChange={(e, value) =>
                    setPageNumber(Math.max(1, Math.min(value, totalPages)))
                  }
                  color="primary"
                  variant="outlined"
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 20,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#e3f2fd",
                        boxShadow: "0 0 0 2px rgba(24,119,242,0.1)",
                      },
                      "&.Mui-selected": {
                        bgcolor: "#1877f2",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "#1557b0",
                        },
                      },
                    },
                    "& .MuiPaginationItem-ellipsis": {
                      color: "#6b7280",
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </>
      )}
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

      {/* Comment Dialog Popup */}
      <Dialog
        open={commentDialogOpen}
        onClose={handleCloseCommentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            boxShadow: 8,
            bgcolor: "#f0f2f5",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#fff",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            fontWeight: 700,
            color: "#1877f2",
            fontSize: 22,
            pb: 1,
          }}
        >
          Comments
          <IconButton onClick={handleCloseCommentDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            bgcolor: "#f0f2f5",
            minHeight: 320,
            p: 2,
            maxHeight: 420,
            overflowY: "auto",
          }}
        >
          <Box ref={commentListRef} sx={commentListStyles}>
            <div>
              {activeCommentPost && (
                <Box
                  sx={{
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px solid #e4e6eb",
                    bgcolor: "#fff",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="#1877f2"
                    fontWeight={700}
                  >
                    {activeCommentPost.user?.fullName || "User"}
                  </Typography>
                  <Typography variant="body2" color="#374151">
                    {activeCommentPost.content
                      ?.replace(/<[^>]+>/g, "")
                      .slice(0, 120) || ""}
                  </Typography>
                </Box>
              )}
              {comments.length === 0 && !commentLoading && (
                <Typography
                  color="#6b7280"
                  sx={{ textAlign: "center", width: "100%", py: 2 }}
                >
                  No comments yet. Be the first to comment!
                </Typography>
              )}
              {comments.map((c) =>
                editingComment && editingComment.commentId === c.commentId ? (
                  <Box
                    key={c.commentId}
                    sx={{
                      mb: 2,
                      bgcolor: "#fffbe7",
                      borderRadius: 2,
                      p: 1.5,
                      position: "relative",
                    }}
                  >
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Edit your comment"
                      type="text"
                      fullWidth
                      multiline
                      minRows={2}
                      maxRows={6}
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => {
                          setEditingComment(null);
                          setEditingCommentText("");
                        }}
                        color="secondary"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        onClick={async () => {
                          if (!editingCommentText.trim()) return;
                          try {
                            await apiPostCommentService.editCommentByUser(
                              editingComment.commentId,
                              {
                                postId: editingComment.postId,
                                commentText: editingCommentText,
                              }
                            );
                            setComments((prev) =>
                              prev.map((com) =>
                                com.commentId === editingComment.commentId
                                  ? { ...com, commentText: editingCommentText }
                                  : com
                              )
                            );
                            setEditingComment(null);
                            setEditingCommentText("");
                            setSnackbar({
                              open: true,
                              message: "Comment updated!",
                              severity: "success",
                            });
                          } catch (e) {
                            setSnackbar({
                              open: true,
                              message: e?.message || "Failed to edit comment.",
                              severity: "error",
                            });
                          }
                        }}
                        variant="contained"
                        color="primary"
                        disabled={!editingCommentText.trim()}
                      >
                        Save
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    key={c.commentId}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mb: 2,
                      bgcolor: c.userId === user?.userId ? "#e7f3ff" : "#fff",
                      borderRadius: 2,
                      p: 1.5,
                      position: "relative",
                    }}
                  >
                    <Avatar
                      src={c.userAvatar || "/placeholder-avatar.jpg"}
                      alt={c.userFullName || "User"}
                      sx={{ width: 36, height: 36, mr: 1.5 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="#1877f2"
                        >
                          {c.userFullName || "User"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#6b7280", ml: 1 }}
                        >
                          {new Date(c.createdAt).toLocaleString()}
                        </Typography>
                        {c.userId === user?.userId && (
                          <Box sx={{ ml: "auto", position: "relative" }}>
                            <IconButton
                              size="small"
                              onClick={(e) =>
                                handleCommentMenuOpen(e, c.commentId)
                              }
                              aria-label="Comment actions"
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#374151", wordBreak: "break-word" }}
                      >
                        {c.commentText}
                      </Typography>
                    </Box>
                    <Menu
                      anchorEl={commentMenuAnchorEl}
                      open={commentMenuCommentId === c.commentId}
                      onClose={handleCommentMenuClose}
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      transformOrigin={{ vertical: "top", horizontal: "right" }}
                      PaperProps={{
                        sx: { borderRadius: 2, minWidth: 140, boxShadow: 3 },
                      }}
                    >
                      <MenuItem onClick={() => handleEditComment(c)}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDeleteComment(c)}
                        sx={{ color: "#d32f2f" }}
                      >
                        Delete
                      </MenuItem>
                    </Menu>
                  </Box>
                )
              )}
              {commentLoading && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Skeleton
                        variant="circular"
                        width={36}
                        height={36}
                        sx={{ mr: 1.5 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton
                          variant="text"
                          width="30%"
                          height={18}
                          sx={{ mb: 0.5 }}
                        />
                        <Skeleton variant="text" width="60%" height={16} />
                      </Box>
                    </Box>
                  ))}
                </>
              )}
            </div>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            bgcolor: "#f0f2f5",
            p: 2,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <TextField
            size="small"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            sx={{ bgcolor: "#fff", borderRadius: 3, fontSize: 15 }}
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
            sx={{ fontWeight: 700, borderRadius: 1, ml: 1, minWidth: 80 }}
            disabled={!newComment.trim()}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog using MUI Dialog */}
      {imagePreviewDialogOpen && (
        <Dialog
          open={imagePreviewDialogOpen}
          onClose={() => setImagePreviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "rgba(0,0,0,0.85)",
              boxShadow: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 320,
              background: "transparent",
            }}
          >
            <IconButton
              onClick={() => setImagePreviewDialogOpen(false)}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                color: "#fff",
                background: "rgba(0,0,0,0.3)",
                zIndex: 2,
              }}
              aria-label="Close preview"
            >
              <CloseIcon fontSize="large" />
            </IconButton>
            <Box
              sx={{
                maxWidth: { xs: "90vw", md: "70vw" },
                maxHeight: { xs: "70vh", md: "80vh" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: 8,
                  boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
                  background: "#222",
                  objectFit: "contain",
                }}
              />
            </Box>
          </Box>
        </Dialog>
      )}

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700} color="#d32f2f">
          Report Post
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "#f0f2f5" }}>
          <Typography sx={{ mb: 2, color: "#374151", fontWeight: 500 }}>
            Please select a reason for reporting this post:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {reportReasons.map((reason) => (
              <Button
                key={reason.reasonId}
                variant={
                  selectedReportReason?.reasonId === reason.reasonId
                    ? "contained"
                    : "outlined"
                }
                color={
                  selectedReportReason?.reasonId === reason.reasonId
                    ? "error"
                    : "inherit"
                }
                onClick={() => setSelectedReportReason(reason)}
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  textAlign: "left",
                  fontWeight: 600,
                  color:
                    selectedReportReason?.reasonId === reason.reasonId
                      ? "#fff"
                      : "#d32f2f",
                  borderColor: "#d32f2f",
                  bgcolor:
                    selectedReportReason?.reasonId === reason.reasonId
                      ? "#d32f2f"
                      : "#fff",
                  "&:hover": {
                    bgcolor:
                      selectedReportReason?.reasonId === reason.reasonId
                        ? "#b71c1c"
                        : "#ffeaea",
                  },
                }}
              >
                {reason.reasonName}
              </Button>
            ))}
            {reportReasonPage < reportReasonTotalPages && (
              <Button
                onClick={handleLoadMoreReportReasons}
                disabled={reportLoading}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  color: "#d32f2f",
                  borderColor: "#d32f2f",
                }}
                variant="outlined"
              >
                {reportLoading ? (
                  <CircularProgress size={18} color="error" />
                ) : (
                  "Load more reasons"
                )}
              </Button>
            )}
          </Box>
          <TextField
            label="Details (optional)"
            multiline
            minRows={2}
            maxRows={4}
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            fullWidth
            sx={{ mt: 2, bgcolor: "#fff", borderRadius: 2 }}
            placeholder="Add more details (optional)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReport}
            variant="contained"
            color="error"
            disabled={!selectedReportReason || reportLoading}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {reportLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupDetail;
