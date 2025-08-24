import styles from "./GroupDetail.module.css";
import { useEffect, useState, useCallback, useContext, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  DialogContentText,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
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
  AdminPanelSettings,
  VisibilityOff,
  MoreHoriz,
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
import { apiUploadImageCloudService } from "services/apiUploadImageCloudService";
import { DeleteIcon, EditIcon, Share2 } from "lucide-react";

import {
  People,
  InfoCircle,
  Calendar,
  SearchNormal1,
  Edit,
} from "iconsax-react";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
  showWarningMessage,
} from "components/ErrorHandler/showStatusMessage";

const base64ToFile = (base64, filename, mimeType) => {
  const byteString = atob(base64.split(",")[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp"];

const editorStyles = {
  border: "1px solid var(--border-light)",
  borderRadius: "0 0 var(--border-radius) var(--border-radius)",
  padding: "12px",
  minHeight: "150px",
  bgcolor: "var(--background-white)",
  "& .ProseMirror": {
    minHeight: "120px",
    outline: "none",
    fontSize: "16px",
    lineHeight: "1.6",
    color: "var(--text-primary)",
    "& p.is-empty::before": {
      content: '"What\'s on your mind?"',
      color: "var(--text-secondary)",
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
      borderRadius: "var(--border-radius)",
      margin: "8px 0",
    },
    "& a": {
      color: "var(--primary-color)",
      textDecoration: "underline",
    },
    "&:focus": {
      borderColor: "var(--primary-color)",
      boxShadow: "0 0 0 2px rgba(244, 124, 84, 0.1)",
    },
  },
};

const LeftSidebar = ({ user, groupId }) => {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchJoinedGroups = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = {
          PageNumber: 1,
          PageSize: 5,
          ValidPageSize: 5,
          Status: "active",
        };
        const res = await apiGroupService.getMyJoinedGroups(groupId, params);
        const data = res.data || res;
        setJoinedGroups(data.groups);
      } catch (error) {
        showErrorFetchAPI(error);
      } finally {
        setLoading(false);
      }
    };
    if (groupId) {
      fetchJoinedGroups();
    }
  }, [user]);

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  return (
    <div className={styles["left-sidebar"]}>
      <div className={styles["sidebar-header"]}>
        <People size="24" color="#1f2937" />
        <h3>Your Groups</h3>
      </div>

      <div className={styles["sidebar-content"]}>
        {loading ? (
          <div className={styles["loading-skeleton"]}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles["group-item-skeleton"]}>
                <div className={styles["skeleton-avatar"]}></div>
                <div className={styles["skeleton-content"]}>
                  <div className={styles["skeleton-line"]}></div>
                  <div className={styles["skeleton-line-small"]}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles["groups-list"]}>
            {joinedGroups.map((group) => (
              <div
                key={group.groupId}
                className={styles["group-item"]}
                onClick={() => handleGroupClick(group.groupId)}
              >
                <Avatar
                  src={group.thumbnail}
                  alt={group.groupName}
                  className={styles["group-avatar"]}
                />
                <div className={styles["group-info"]}>
                  <h4 className={styles["group-name"]}>{group.groupName}</h4>
                  <div className={styles["group-meta"]}>
                    <People size="14" />
                    <span>{group.memberCount} members</span>
                    {group.isPrivate && (
                      <LockIcon className={styles["private-icon"]} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className={styles["sidebar-footer"]}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SearchNormal1 size="16" />}
                onClick={() => navigate("/groups")}
                className={styles["discover-button"]}
              >
                Discover Groups
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RightSidebar = ({
  group,
  members,
  isAdmin,
  onMembersClick,
  navigate,
}) => {
  if (!group) return null;

  return (
    <div className={styles["right-sidebar"]}>
      <div className={styles["sidebar-header"]}>
        <InfoCircle size="24" color="#1f2937" />
        <h3>Group Info</h3>
      </div>
      <div className={styles["sidebar-content"]}>
        <div className={styles["group-info-card"]}>
          <div className={styles["group-avatar-section"]}>
            <h2 className={styles["group-title"]}>{group.groupName}</h2>
          </div>

          <div className={styles["group-stats"]}>
            <div className={styles["stat-item"]}>
              <People size="20" color="var(--primary-color)" />
              <div className={styles["stat-content"]}>
                <span className={styles["stat-number"]}>
                  {group.memberCount || 0}
                </span>
                <span className={styles["stat-label"]}>Members</span>
              </div>
            </div>

            <div className={styles["stat-item"]}>
              <Calendar size="20" color="var(--primary-color)" />
              <div className={styles["stat-content"]}>
                <span className={styles["stat-number"]}>
                  {group.createdAt
                    ? new Date(group.createdAt).getFullYear()
                    : "N/A"}
                </span>
                <span className={styles["stat-label"]}>Created</span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className={styles["group-actions"]}>
              <button
                className={styles["edit-group-button"]}
                onClick={() =>
                  navigate(
                    "/my-groups/view#action=edit?group=" + group?.groupId
                  )
                }
              >
                <Edit
                  size={18}
                  className={styles["edit-group-icon"]}
                  color="#fff"
                />
                <span>Edit Group</span>
              </button>
            </div>
          )}

          <div className={styles["group-privacy"]}>
            <div className={styles["privacy-badge"]}>
              {group.isPrivate ? (
                <>
                  <LockIcon className={styles["privacy-icon"]} />
                  <span>Private Group</span>
                </>
              ) : (
                <>
                  <PublicIcon className={styles["privacy-icon"]} />
                  <span>Public Group</span>
                </>
              )}
            </div>
          </div>

          <div className={styles["group-description"]}>
            <h4>About</h4>
            <div
              className={styles["description-content"]}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  group.description || "No description available."
                ),
              }}
            />
          </div>

          <div className={styles["group-admin"]}>
            <h4>Admin</h4>
            <div className={styles["admin-info"]}>
              <Avatar
                src={group.creator?.avatar || "/placeholder-avatar.jpg"}
                alt={group.creator?.fullName || "Admin"}
                className={styles["admin-avatar"]}
              />
              <div className={styles["admin-details"]}>
                <span className={styles["admin-name"]}>
                  {group.creator?.fullName || "Admin"}
                </span>
                <span className={styles["admin-role"]}>Group Admin</span>
              </div>
            </div>
          </div>

          {members.length > 0 && (
            <div className={styles["recent-members"]}>
              <h4>Recent Members</h4>
              <div className={styles["members-preview"]}>
                <AvatarGroup
                  max={4}
                  onClick={onMembersClick}
                  className={styles["members-avatars"]}
                >
                  {members.slice(0, 4).map((member) => (
                    <Avatar
                      key={member.memberId}
                      src={member.avatar || "/placeholder-avatar.jpg"}
                      alt={member.userFullName || "Member"}
                      className={styles["member-avatar"]}
                    />
                  ))}
                </AvatarGroup>
                {members.length > 4 && (
                  <span
                    className={styles["see-all-members"]}
                    onClick={onMembersClick}
                  >
                    +{members.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [userAddPost, setUserAddPost] = useState(null);
  const [group, setGroup] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [members, setMembers] = useState([]);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
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
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState({});
  const location = useLocation();

  const handleMoreMenuOpen = (event, postId) => {
    setMoreMenuAnchorEl((prev) => ({ ...prev, [postId]: event.currentTarget }));
  };

  const handleMoreMenuClose = (postId) => {
    setMoreMenuAnchorEl((prev) => ({ ...prev, [postId]: null }));
  };

  const handleDeletePost = (post) => {
    handleMoreMenuClose(post.postId);
  };

  const handleHidePost = (post) => {
    handleMoreMenuClose(post.postId);
  };

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
      setIsAdmin(data?.createdBy == user?.userId || false);
      if (user) {
        const membersRes =
          await apiGroupMemberService.getJoinedRequestsActiveByGroup(groupId, {
            pageNumber: 1,
            pageSize: 50,
          });
        setMembers(membersRes.data.requests || []);
      }
    } catch (e) {
      showErrorFetchAPI(e);
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
      showErrorFetchAPI(e);
    } finally {
      setPostLoading(false);
    }
  }, [group?.isJoin, search, selectedTags, groupId, pageNumber, pageSize]);

  useEffect(() => {
    const fetchReactionTypes = async () => {
      try {
        const data = await apiReactionTypeService.getAllReactionTypes();
        setReactionTypes(data?.data?.reactionTypes || data || []);
      } catch (e) {
        showErrorFetchAPI(e);
        setReactionTypes([]);
      }
    };
    if (user) {
      fetchReactionTypes();
    }
  }, [user]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await apiTagService.getAllActiveTags();
        setAllTags(res?.data?.tags || []);
      } catch (e) {
        showErrorFetchAPI(e);
        setAllTags([]);
      }
    };
    if (user) {
      fetchTags();
    }
  }, [user]);

  useEffect(() => {
    const fetchIfJoined = async () => {
      if (group?.isJoin) {
        try {
          await fetchPosts();
        } catch (e) {
          showErrorFetchAPI(e);
        }
      }
    };
    fetchIfJoined();
  }, [group?.isJoin, fetchPosts, pageNumber, pageSize]);

  const handleJoin = async () => {
    if (!user) {
      showInfoMessage("Please login to join the group.");
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
        const confirmed = window.confirm(
          "Are you sure you want to leave this group?"
        );
        if (!confirmed) {
          setJoinLoading(false);
          return;
        }

        await apiGroupMemberService.leaveGroup(groupId);
        setGroup((prev) => ({
          ...prev,
          isJoin: false,
          memberCount: Math.max(0, prev.memberCount - 1),
        }));
        showSuccessMessage("Left group successfully!");
      } else {
        await apiGroupMemberService.joinGroup(groupId);
        setGroup((prev) => {
          const isPrivate = prev.isPrivate;
          return {
            ...prev,
            isJoin: isPrivate ? false : true,
            isRequested: isPrivate ? true : false,
            memberCount: isPrivate ? prev.memberCount : prev.memberCount + 1,
          };
        });
        showSuccessMessage(
          group.isPrivate
            ? "Join request sent! Please wait for approval."
            : "Joined group successfully!"
        );
      }
    } catch (e) {
      showErrorMessage(
        e?.message || `Failed to ${group.isJoin ? "leave" : "join"} group.`
      );
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
          showErrorMessage("Failed to fetch user data.");
        }
      } catch (e) {
        showErrorFetchAPI(e);
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
      if (ALLOWED_TYPES.includes(file.type)) {
        setPostImage(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
          setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        showErrorMessage(
          `Invalid image type. Only ${ALLOWED_TYPES.join(", ")} are allowed.`
        );
        setImagePreview("");
        setPostImage(null);
      }
    }
  };

  const handleImageLink = () => {
    if (imageLink) {
      setImagePreview(imageLink);
      setPostImage(null);
    } else {
      showWarningMessage("Please enter a valid image URL.");
    }
  };

  const handleRemoveImage = () => {
    setPostImage(null);
    setImagePreview("");
    setImageLink("");
  };

  const handlePostSubmit = async () => {
    if (!editor || !editor.getHTML().trim()) {
      showWarningMessage("Please enter post content.");
      return;
    }

    if (!group?.isJoin) {
      showWarningMessage("You must join the group to post.");
      return;
    }

    const content = editor.getHTML().trim();
    if (content.length < 1 || content.length > 500) {
      showWarningMessage("Content must be between 1 and 500 characters.");
      return;
    }

    setPostLoadingBtn(true);

    try {
      let thumbnail = imagePreview;

      if (postImage && imageType === "upload") {
        const formData = new FormData();
        const fileName = `post_thumbnail-${Date.now()}.${
          postImage.type.split("/")[1]
        }`;
        formData.append("file", postImage, fileName);

        const uploadResponse = await apiUploadImageCloudService.uploadImage(
          formData,
          "post_thumbnails",
          user.userId
        );

        if (uploadResponse.isError) {
          throw new Error(uploadResponse.message);
        }

        thumbnail = uploadResponse.imageUrl;
      } else if (imageType === "link" && imageLink) {
        thumbnail = imageLink;
      } else {
        thumbnail = "";
      }

      if (thumbnail.length > 255) {
        showWarningMessage(
          "Image URL (thumbnail) must be 255 characters or fewer."
        );

        return;
      }

      if (!user?.userId || user.userId <= 0) {
        showErrorMessage("Invalid user.");
        return;
      }

      const parsedGroupId = Number(groupId);
      if (isNaN(parsedGroupId) || parsedGroupId <= 0) {
        showErrorMessage("Invalid group.");
        return;
      }

      if (!selectedTagsPost || selectedTagsPost.length === 0) {
        showWarningMessage("Please select at least one tag for your post.");
        return;
      }

      const tagIds = selectedTagsPost?.map((t) => t.tagId) || [];

      const postDto = {
        postId: 0,
        userId: user.userId,
        groupId: parsedGroupId,
        thumbnail,
        content,
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
        updatedAt: new Date().toISOString(),
        tagIds,
      };

      await apiPostService.createPost(postDto);
      showSuccessMessage("Post created successfully!");
      handleClosePostDialog();
      fetchPosts();
    } catch (e) {
      showErrorFetchAPI(e);
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

    try {
      return unicode
        .trim()
        .split(/\s+/)
        .map((u) => {
          const hex = u.trim().toUpperCase().replace(/^U\+/, "");
          const code = Number.parseInt(hex, 16);
          if (Number.isNaN(code)) {
            console.warn("❌ Invalid code point:", u);
            return "";
          }
          return String.fromCodePoint(code);
        })
        .join("");
    } catch (error) {
      console.error("⚠️ Error converting emoji:", error);
      return "";
    }
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
      showInfoMessage("Please login to react.");
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
          showSuccessMessage("Reaction removed!");
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
          showSuccessMessage(`Reacted with ${reactionType.reactionName}!`);
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
        showSuccessMessage(`Reacted with ${reactionType.reactionName}!`);
      }
    } catch (e) {
      showErrorFetchAPI(e);
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
      showErrorFetchAPI(e);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleAddComment = async () => {
    const commentText = newComment.trim();

    if (!activeCommentPost || !activeCommentPost.postId) {
      showWarningMessage("Missing post to comment on.");
      return;
    }

    if (!user?.userId || user.userId <= 0) {
      showWarningMessage("User is not valid.");
      return;
    }

    if (!commentText) {
      showWarningMessage("Comment cannot be empty.");
      return;
    }

    if (commentText.length > 500) {
      showWarningMessage("Comment must be 500 characters or fewer.");
      return;
    }

    try {
      await apiPostCommentService.addCommentByUser({
        postId: activeCommentPost.postId,
        commentText,
      });

      showSuccessMessage("Comment posted successfully.");
      setNewComment("");
      await fetchComments(activeCommentPost.postId, 1, true);
      await fetchPosts();
    } catch (e) {
      showErrorFetchAPI(e);
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

  const confirmDeleteComment = (comment) => {
    handleCommentMenuClose();
    setCommentToDelete(comment);
    setConfirmOpen(true);
  };

  const handleSubmitEditComment = async () => {
    const trimmedText = editingCommentText.trim();
    if (!trimmedText) {
      showWarningMessage("Comment cannot be empty.");
      return;
    }

    if (trimmedText.length > 500) {
      showWarningMessage("Comment must be 500 characters or fewer.");
      return;
    }

    try {
      await apiPostCommentService.editCommentByUser(editingComment.commentId, {
        postId: editingComment.postId,
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
      setEditingCommentText("");
      showSuccessMessage("Comment updated!");
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (!commentToDelete) return;
    try {
      const deleteResponse = await apiPostCommentService.deleteCommentByUser(
        commentToDelete.commentId
      );
      if (deleteResponse.statusCode === 200) {
        await fetchComments(commentToDelete.postId, 1, true);
        showSuccessMessage(`Comment deleted successfully.!`);
      } else {
        showErrorMessage("Failed to delete comment.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleLoadMoreComments = useCallback(async () => {
    if (!activeCommentPost) return;
    const nextPage = commentPage + 1;
    setCommentPage(nextPage);
    await fetchComments(activeCommentPost.postId, nextPage);
  }, [activeCommentPost, commentPage]);

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
      if (userReport.statusCode === 200 && userReport.data == true) {
        showWarningMessage("You have already reported this post.");
        return;
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
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

  const handleOpenMembersDialog = () => {
    setMembersDialogOpen(true);
  };

  const handleCloseMembersDialog = () => {
    setMembersDialogOpen(false);
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
      showErrorFetchAPI(e);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!postReport?.postId || postReport.postId <= 0) {
      showWarningMessage("Invalid post to report.");
      return;
    }

    if (!user?.userId || user.userId <= 0) {
      showWarningMessage("You must be logged in to report.");
      return;
    }

    if (!selectedReportReason || !selectedReportReason.reasonId) {
      showWarningMessage("Please select a reason for reporting.");
      return;
    }

    const reasonText = selectedReportReason.reasonName?.trim() || "";
    const detailsText = reportDetails?.trim() || "";

    if (reasonText.length > 100) {
      showWarningMessage("Reason must be 100 characters or fewer.");
      return;
    }

    if (detailsText.length > 500) {
      showWarningMessage("Details must be 500 characters or fewer.");
      return;
    }

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
      showSuccessMessage("Report submitted successfully.");
      handleCloseReportDialog();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleSharePost = (post) => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.postId}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showSuccessMessage("Post link copied to clipboard!");
        })
        .catch(() => {
          showErrorMessage("Failed to copy link.");
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const success = document.execCommand("copy");
        showSuccessMessage(
          success ? "Post link copied to clipboard!" : "Failed to copy link."
        );
      } catch (err) {
        showErrorMessage("Failed to copy link.");
      }

      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.getElementById(hash.substring(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  if (loading) {
    return (
      <div className={styles["three-column-layout"]}>
        <LeftSidebar user={(user, groupId)} />

        <div className={styles["main-content"]}>
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
        </div>

        <div className={styles["right-sidebar"]}>
          <div className={styles["loading-skeleton"]}>
            <div
              className={styles["skeleton-avatar"] + " " + styles["large"]}
            ></div>
            <div className={styles["skeleton-line"]}></div>
            <div className={styles["skeleton-line-small"]}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div
        className={styles["three-column-layout"] + " " + styles["group-detail"]}
      >
        <LeftSidebar user={user} />

        <div className={styles["main-content"]}>
          <Box className={styles["group-detail-empty"]}>
            <Typography color="var(--text-secondary)">
              Group not found.
            </Typography>
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
        </div>

        <div className={styles["right-sidebar"]}></div>
      </div>
    );
  }

  const commentListStyles = {
    maxHeight: 360,
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
    <div className={styles["three-column-layout"]}>
      {/* Left Sidebar */}
      <LeftSidebar user={user} groupId={groupId} />

      {/* Main Content */}
      <div className={styles["main-content"]}>
        <Box className={styles["group-wrapper"]}>
          <Box className={styles["group-detail-container"]}>
            <Box className={styles["group-detail-cover"]}>
              <img
                src={group.thumbnail || "/placeholder-cover.jpg"}
                alt={`${group.groupName} cover`}
                aria-label="Group cover image"
              />
            </Box>
            <Box className={styles["group-detail-header"]}>
              <Box className={styles["group-detail-avatar"]}>
                <Avatar
                  src={group.thumbnail}
                  alt={group.groupName}
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 80, sm: 100, md: 120 },
                    borderRadius: 3,
                    border: "4px solid var(--background-white)",
                    boxShadow: "0 2px 8px var(--shadow-color)",
                  }}
                  aria-label="Group avatar"
                />
              </Box>
              <Box className={styles["group-detail-info"]}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="var(--primary-color)"
                  sx={{
                    fontSize: { xs: "1.6rem", sm: "2rem", md: "2.5rem" },
                    mb: 1,
                  }}
                >
                  {group.groupName}
                </Typography>
                <Box className={styles["group-detail-meta"]}>
                  <div
                    className={`group-meta-item ${
                      group.isPrivate ? "private" : "public"
                    }`}
                  >
                    {group.isPrivate ? (
                      <>
                        <LockIcon className={styles["meta-icon"]} />
                        <b>Private Group</b>
                      </>
                    ) : (
                      <>
                        <PublicIcon className={styles["meta-icon"]} />
                        <b>Public Group</b>
                      </>
                    )}
                  </div>
                  <div
                    className={
                      styles["group-meta-item"] + " " + styles["members-info"]
                    }
                  >
                    <PeopleIcon className={styles["meta-icon"]} />
                    <b>{group.memberCount || 0}</b> members
                  </div>
                  <div
                    className={
                      styles["group-meta-item"] + " " + styles["join-btn"]
                    }
                  >
                    {isAdmin ? (
                      <Typography
                        variant="body2"
                        className={styles["admin-badge"]}
                      >
                        <AdminPanelSettings sx={{ fontSize: 18 }} />
                        Your Group
                      </Typography>
                    ) : group.isJoin ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={handleJoin}
                        disabled={joinLoading}
                        className={styles["leave-button"]}
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
                        className={styles["pending-button"]}
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
                        className={styles["join-button"]}
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
                {/* <Box className={styles["group-detail-creator"]}>
                  <Avatar
                    src={group.creator?.avatar || "/placeholder-avatar.jpg"}
                    alt={group.creator?.fullName || "Admin"}
                    className={styles["creator-avatar"]}
                    aria-label="Group creator avatar"
                  />
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      variant="body1"
                      className={styles["creator-name"]}
                    >
                      {group.creator?.fullName || "Admin"}
                    </Typography>
                    {group.creator?.email && (
                      <Typography
                        variant="caption"
                        className={styles["creator-email"]}
                      >
                        {group.creator.email}
                      </Typography>
                    )}
                  </Box>
                </Box> */}
              </Box>
            </Box>

            {group.isJoin && (
              <Box
                className={styles["group-detail-description"]}
                sx={{
                  border: "1px solid #fafafa",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  mb: 2,
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: 1,
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
                onClick={handleOpenPostDialog}
              >
                <Avatar
                  src={group?.creator?.avatar || ""}
                  alt="user avatar"
                  sx={{ mr: 2 }}
                />
                <Box sx={{ color: "#555" }}>What's on your mind?</Box>
              </Box>
            )}

            <Dialog
              open={openPostDialog}
              onClose={handleClosePostDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle fontWeight={700} color="var(--primary-color)">
                Create New Post
              </DialogTitle>
              <DialogContent
                dividers
                sx={{ bgcolor: "var(--background-light)", p: 0 }}
              >
                <Box>
                  <Box className={styles["post-dialog-header"]}>
                    <Avatar
                      src={userAddPost?.avatar || "/placeholder-avatar.jpg"}
                      alt={userAddPost?.fullName || "User"}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Typography fontWeight={700} color="var(--primary-color)">
                      {userAddPost?.fullName || "User"}
                    </Typography>
                  </Box>
                  <Typography className={styles["post-dialog-placeholder"]}>
                    What's on your mind today?
                  </Typography>
                </Box>
                <Box sx={{ p: 2, pt: 1 }}>
                  <Box className={styles["editor-container"]}>
                    {editor && (
                      <>
                        <Box className={styles["editor-toolbar"]}>
                          <IconButton
                            onClick={() =>
                              editor.chain().focus().toggleBold().run()
                            }
                            disabled={
                              !editor.can().chain().focus().toggleBold().run()
                            }
                            color={
                              editor.isActive("bold") ? "primary" : "default"
                            }
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
                            color={
                              editor.isActive("italic") ? "primary" : "default"
                            }
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
                              !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleBulletList()
                                .run()
                            }
                            color={
                              editor.isActive("bulletList")
                                ? "primary"
                                : "default"
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
                              !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleOrderedList()
                                .run()
                            }
                            color={
                              editor.isActive("orderedList")
                                ? "primary"
                                : "default"
                            }
                            size="small"
                            aria-label="Toggle ordered list"
                          >
                            <FormatListNumbered />
                          </IconButton>
                          <IconButton
                            onClick={() => setImageType("link")}
                            color={
                              editor.isActive("link") ? "primary" : "default"
                            }
                            size="small"
                            aria-label="Add link"
                          >
                            <LinkIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => setImageType("upload")}
                            color={
                              editor.isActive("image") ? "primary" : "default"
                            }
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
                          key={option.tagId}
                          label={option.tagName}
                          {...getTagProps({ index })}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className={styles["tag-chip"]}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Select tags"
                        size="small"
                        className={styles["tags-input"]}
                      />
                    )}
                    sx={{ mb: 2 }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <TextField
                      select
                      label="Image Type"
                      value={imageType}
                      onChange={(e) => setImageType(e.target.value)}
                      size="small"
                      className={styles["image-type-select"]}
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
                        className={styles["upload-button"]}
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
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <TextField
                          size="small"
                          label="Image Link"
                          value={imageLink}
                          onChange={(e) => setImageLink(e.target.value)}
                          className={styles["image-link-input"]}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleImageLink}
                          disabled={!imageLink}
                          className={styles["select-button"]}
                        >
                          Select
                        </Button>
                      </Box>
                    )}
                    {imagePreview && (
                      <Box sx={{ position: "relative" }}>
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="preview"
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            objectFit: "cover",
                            border: "1px solid var(--border-light)",
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bgcolor: "var(--background-white)",
                            border: "1px solid var(--border-light)",
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
                  disabled={
                    !editor || !editor.getText().trim() || postLoadingBtn
                  }
                  className={styles["post-submit-button"]}
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
              <Card className={styles["search-filter-card"]}>
                <Box className={styles["search-filter-content"]}>
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
                      <TextField
                        {...params}
                        label="Filter by tags"
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiInputBase-root": {
                            paddingY: "4px",
                          },
                          "& .MuiInputBase-input": {
                            fontSize: { xs: "0.85rem", sm: "1rem" },
                          },
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          label={option.tagName}
                          size="small"
                          {...getTagProps({ index })}
                          sx={{
                            maxWidth: "100%",
                            fontSize: { xs: "0.7rem", sm: "0.85rem" },
                            marginBottom: "4px",
                          }}
                        />
                      ))
                    }
                    sx={{
                      width: "100%",
                      maxWidth: { xs: "100%", sm: 300 },
                      "& .MuiAutocomplete-tag": {
                        margin: "2px",
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    onClick={fetchPosts}
                    className={styles["filter-button"]}
                  >
                    Filter / Search
                  </Button>
                </Box>
              </Card>
            )}

            {group.isJoin && (
              <>
                <Box className={styles["group-detail-description"]}>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={2}
                    color="var(--text-primary)"
                  >
                    Group Posts
                  </Typography>
                  {postLoading ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        py: 4,
                      }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <Card
                          key={i}
                          sx={{ p: 2, borderRadius: 3, boxShadow: 1 }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
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
                      const totalReactions = Object.values(
                        reactionCounts
                      ).reduce((sum, count) => sum + count, 0);
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
                            className={styles["group-post-card"]}
                            id={`post-${post.postId}`}
                          >
                            <CardContent sx={{ pb: 1 }}>
                              <Box className={styles["post-header"]}>
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Avatar
                                    src={
                                      post.user?.avatar ||
                                      "/placeholder-avatar.jpg"
                                    }
                                    alt={post.user?.fullName || "User"}
                                    className={styles["post-author-avatar"]}
                                    aria-label={`Post author ${
                                      post.user?.fullName || "Unknown"
                                    }`}
                                  />
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      className={styles["post-author-name"]}
                                    >
                                      {post.user?.fullName || "Anonymous"}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      className={styles["post-date"]}
                                    >
                                      {new Date(
                                        post.createdAt
                                      ).toLocaleString()}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box>
                                  <IconButton
                                    size="small"
                                    aria-label="More options"
                                    onClick={(e) =>
                                      handleMoreMenuOpen(e, post.postId)
                                    }
                                    className={styles["post-menu-button"]}
                                  >
                                    <MoreHoriz fontSize="small" />
                                  </IconButton>
                                  <Menu
                                    anchorEl={moreMenuAnchorEl[post.postId]}
                                    open={Boolean(
                                      moreMenuAnchorEl[post.postId]
                                    )}
                                    onClose={() =>
                                      handleMoreMenuClose(post.postId)
                                    }
                                    PaperProps={{ className: "post-menu" }}
                                  >
                                    {/* Nếu là Admin thì có Delete + Hide */}
                                    {isAdmin && (
                                      <>
                                        <MenuItem
                                          onClick={() => handleDeletePost(post)}
                                          className={styles["delete-menu-item"]}
                                        >
                                          <DeleteIcon sx={{ mr: 1 }} />
                                          Delete Post
                                        </MenuItem>
                                        <MenuItem
                                          onClick={() => handleHidePost(post)}
                                          className={styles["hide-menu-item"]}
                                        >
                                          <VisibilityOff sx={{ mr: 1 }} />
                                          Hide Post
                                        </MenuItem>
                                      </>
                                    )}

                                    {/* Nếu không phải Admin thì vẫn có Share */}
                                    {!isAdmin && (
                                      <MenuItem
                                        onClick={() => handleSharePost(post)}
                                        className={styles["share-menu-item"]}
                                      >
                                        <Share2 sx={{ mr: 1 }} />
                                        Share Post
                                      </MenuItem>
                                    )}

                                    {/* Nếu là chủ bài viết (dù Admin hay không) thì có Edit */}
                                    {post.userId === user.userId && (
                                      <MenuItem
                                        onClick={() =>
                                          navigate(
                                            `/my-posts/${post.postId}/edit`
                                          )
                                        }
                                        className={styles["edit-menu-item"]}
                                      >
                                        <EditIcon sx={{ mr: 1 }} />
                                        Edit Post
                                      </MenuItem>
                                    )}
                                  </Menu>
                                </Box>
                              </Box>
                              {post?.tags && post?.tags?.length > 0 && (
                                <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                                  {post.tags.map((tag) => (
                                    <Chip
                                      key={tag.tagId}
                                      label={`#${tag.tagName}`}
                                      size="small"
                                      className={styles["post-tag"]}
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
                                      src={
                                        post.thumbnail || "/default_image.png"
                                      }
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
                            </CardContent>
                            <Box className={styles["group-post-reactions"]}>
                              {totalReactions > 0 ? (
                                <Box className={styles["reactions-summary"]}>
                                  <Box className={styles["reaction-emojis"]}>
                                    {Object.entries(reactionCounts).map(
                                      ([emojiUnicode, count]) => (
                                        <span
                                          key={emojiUnicode}
                                          style={{
                                            fontSize: 18,
                                            marginRight: 4,
                                          }}
                                        >
                                          {unicodeToEmoji(emojiUnicode)}
                                        </span>
                                      )
                                    )}
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    className={styles["reactions-count"]}
                                    onClick={(e) =>
                                      handlePreviewOpen(e, post.postId)
                                    }
                                  >
                                    {totalReactions} reactions
                                  </Typography>
                                  <Popover
                                    open={Boolean(previewAnchorEl[post.postId])}
                                    anchorEl={previewAnchorEl[post.postId]}
                                    onClose={() =>
                                      handlePreviewClose(post.postId)
                                    }
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
                                      sx: {
                                        width: 400,
                                        maxHeight: 500,
                                        p: 2,
                                      },
                                    }}
                                  >
                                    <Tabs
                                      value={previewTab[post.postId] || "all"}
                                      onChange={(_, v) =>
                                        handlePreviewTabChange(post.postId, v)
                                      }
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
                                                  sx={{
                                                    color:
                                                      "var(--text-secondary)",
                                                  }}
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
                                              sx={{
                                                width: 28,
                                                height: 28,
                                                mr: 1,
                                              }}
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
                                          sx={{
                                            color: "var(--text-secondary)",
                                          }}
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
                                  No one has expressed any reactions to this
                                  post yet.
                                </Typography>
                              )}
                              <Box className={styles["group-post-actions"]}>
                                <Box className={styles["reaction-button"]}>
                                  <Button
                                    size="small"
                                    color={
                                      userReaction ? "secondary" : "primary"
                                    }
                                    startIcon={
                                      <span
                                        role="img"
                                        aria-label={
                                          userReaction?.reactionTypeName ||
                                          "Like"
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
                                    className={`${styles["reaction-btn"]} ${
                                      userReaction ? styles["reacted"] : ""
                                    }`}
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
                                      className: "reaction-picker",
                                    }}
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
                                            onClick={() =>
                                              handleReact(post, rt)
                                            }
                                            className={`reaction-option ${
                                              userReaction?.reactionTypeId ===
                                              rt.reactionTypeId
                                                ? "active"
                                                : ""
                                            }`}
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
                                  className={styles["comment-button"]}
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
                                      onClick={() =>
                                        handleOpenReportDialog(post)
                                      }
                                      className={styles["report-button"]}
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
                    <Typography
                      color="var(--text-secondary)"
                      className={styles["group-posts-empty"]}
                    >
                      No posts yet. Be the first to share!
                    </Typography>
                  )}
                </Box>
                <Box className={styles["pagination-container"]}>
                  <Box className={styles["pagination-controls"]}>
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
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 2 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={pageNumber}
                        onChange={(e, value) =>
                          setPageNumber(
                            Math.max(1, Math.min(value, totalPages))
                          )
                        }
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                        className={styles["custom-pagination"]}
                      />
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        group={group}
        members={members}
        isAdmin={isAdmin}
        onMembersClick={handleOpenMembersDialog}
        navigate={navigate}
      />

      {/* Members Dialog */}
      <Dialog
        open={membersDialogOpen}
        onClose={handleCloseMembersDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: "members-dialog",
        }}
      >
        <DialogTitle className={styles["members-dialog-title"]}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <People size="24" color="var(--primary-color)" />
            <Typography
              variant="h6"
              fontWeight={700}
              color="var(--primary-color)"
            >
              Group Members ({members.length})
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseMembersDialog}
            className={styles["close-button"]}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className={styles["members-dialog-content"]}>
          <List className={styles["members-list"]}>
            {members
              .slice()
              .sort((a, b) => {
                const aPriority =
                  a.userId === group?.createdBy
                    ? 0
                    : a.userId === user?.userId
                    ? 1
                    : 2;
                const bPriority =
                  b.userId === group?.createdBy
                    ? 0
                    : b.userId === user?.userId
                    ? 1
                    : 2;
                return aPriority - bPriority;
              })
              .map((member, index) => {
                const isCurrentUser = member.userId === user?.userId;
                const isGroupAdmin = member.userId === group?.createdBy;

                return (
                  <Box key={member.memberId}>
                    <ListItem
                      className={`${styles["member-item"]} ${
                        isCurrentUser ? styles["current-user"] : ""
                      } ${isGroupAdmin ? styles["admin"] : ""}`}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={member.avatar || "/placeholder-avatar.jpg"}
                          alt={member.userFullName || "Member"}
                          className={styles["member-avatar-large"]}
                          onError={(e) =>
                            (e.target.src = "/placeholder-avatar.jpg")
                          }
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              className={styles["member-name"]}
                            >
                              {isCurrentUser
                                ? "You"
                                : member.userFullName || "Unknown"}
                            </Typography>
                            {isGroupAdmin && (
                              <Chip
                                label="Admin"
                                size="small"
                                className={styles["admin-chip"]}
                                icon={<AdminPanelSettings />}
                              />
                            )}
                            {isCurrentUser && !isGroupAdmin && (
                              <Chip
                                label="You"
                                size="small"
                                className={styles["you-chip"]}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            className={styles["member-join-date"]}
                          >
                            Joined:{" "}
                            {member.joinedAt
                              ? new Date(member.joinedAt).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        }
                      />

                      <Box className={styles["member-actions"]}>
                        {!isCurrentUser && (
                          <Tooltip title="View Profile">
                            <IconButton
                              size="small"
                              className={styles["profile-button"]}
                            >
                              <InfoCircle size="18" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </ListItem>

                    {index < members.length - 1 && <Divider />}
                  </Box>
                );
              })}
          </List>
          {members.length === 0 && (
            <Box className={styles["no-members"]}>
              <People size="48" color="var(--text-secondary)" />
              <Typography
                variant="body1"
                color="var(--text-secondary)"
                sx={{ mt: 2 }}
              >
                No members found
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions className={styles["members-dialog-actions"]}>
          <Button
            onClick={handleCloseMembersDialog}
            variant="contained"
            className={styles["close-dialog-button"]}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comment Dialog */}
      <Dialog
        open={commentDialogOpen}
        onClose={handleCloseCommentDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "comment-dialog",
        }}
      >
        <DialogTitle className={styles["comment-dialog-title"]}>
          Comments
          <IconButton onClick={handleCloseCommentDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className={styles["comment-dialog-content"]}>
          <Box ref={commentListRef} sx={commentListStyles}>
            <div>
              {activeCommentPost && (
                <Box className={styles["original-post"]}>
                  <Typography
                    variant="subtitle2"
                    className={styles["original-post-author"]}
                  >
                    {activeCommentPost.user?.fullName || "User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={styles["original-post-content"]}
                  >
                    {activeCommentPost.content
                      ?.replace(/<[^>]+>/g, "")
                      .slice(0, 120) || ""}
                  </Typography>
                </Box>
              )}
              {comments.length === 0 && !commentLoading && (
                <Typography className={styles["no-comments"]}>
                  No comments yet. Be the first to comment!
                </Typography>
              )}
              {comments.map((c) =>
                editingComment && editingComment.commentId === c.commentId ? (
                  <Box key={c.commentId} className={styles["editing-comment"]}>
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
                    <Box className={styles["edit-actions"]}>
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
                        onClick={handleSubmitEditComment}
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
                    className={`${styles["comment-item"]} ${
                      c.userId === user?.userId ? styles["own-comment"] : ""
                    }`}
                  >
                    <Avatar
                      src={c.userAvatar || "/placeholder-avatar.jpg"}
                      alt={c.userFullName || "User"}
                      className={styles["comment-avatar"]}
                      onError={(e) =>
                        (e.target.src = "/placeholder-avatar.jpg")
                      }
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box className={styles["comment-header"]}>
                        <Typography
                          variant="subtitle2"
                          className={styles["comment-author"]}
                        >
                          {c.userFullName || "User"}
                        </Typography>
                        <Typography
                          variant="caption"
                          className={styles["comment-date"]}
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
                        className={styles["comment-text"]}
                      >
                        {c.commentText}
                      </Typography>
                    </Box>

                    <Menu
                      anchorEl={commentMenuAnchorEl}
                      open={commentMenuCommentId === c.commentId}
                      onClose={handleCommentMenuClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                      PaperProps={{
                        sx: { borderRadius: 2, minWidth: 140, boxShadow: 3 },
                      }}
                    >
                      <MenuItem onClick={() => handleEditComment(c)}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => confirmDeleteComment(c)}
                        sx={{ color: "var(--accent-error)" }}
                      >
                        Delete
                      </MenuItem>
                    </Menu>
                  </Box>
                )
              )}
              <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to delete this comment? This action
                    cannot be undone.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setConfirmOpen(false)} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmDelete} color="error">
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
              {commentLoading && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
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
        <DialogActions className={styles["comment-dialog-actions"]}>
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
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle fontWeight={700} color="var(--accent-error)">
          Report Post
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: "var(--background-light)" }}>
          <Typography
            sx={{ mb: 2, color: "var(--text-primary)", fontWeight: 500 }}
          >
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
                      ? "var(--text-white)"
                      : "var(--accent-error)",
                  borderColor: "var(--accent-error)",
                  bgcolor:
                    selectedReportReason?.reasonId === reason.reasonId
                      ? "var(--accent-error)"
                      : "var(--background-white)",
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
                  color: "var(--accent-error)",
                  borderColor: "var(--accent-error)",
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
            sx={{ mt: 2, bgcolor: "var(--background-white)", borderRadius: 2 }}
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
    </div>
  );
};

export default GroupDetail;
