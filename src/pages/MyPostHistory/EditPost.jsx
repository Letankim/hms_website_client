import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import apiPostService from "services/apiPostService";
import apiTagService from "services/apiTagService";
import { apiUploadImageCloudService } from "services/apiUploadImageCloudService";
import AuthContext from "contexts/AuthContext";
import "./EditPost.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp"];

const EditPost = () => {
  const { postId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailMode, setThumbnailMode] = useState("url");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailBase64, setThumbnailBase64] = useState("");
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const postRes = await apiPostService.getPostById(postId);
        setPost(postRes.data);
        setContent(postRes.data.content);
        setThumbnail(postRes.data.thumbnail || "");
        setThumbnailBase64(postRes.data.thumbnail || "");
        setTags(postRes.data.tags || []);
        setSelectedTagIds(postRes.data.tags?.map((tag) => tag.tagId) || []);

        const tagsRes = await apiTagService.getAllActiveTags({});
        setAvailableTags(tagsRes?.data?.tags || []);
      } catch (e) {
        showErrorFetchAPI(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleThumbnailModeChange = (event) => {
    const newMode = event.target.value;
    setThumbnailMode(newMode);
    setThumbnail("");
    setThumbnailFile(null);
    setThumbnailBase64("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && ALLOWED_TYPES.includes(file.type)) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailBase64(reader.result);
        setThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      showErrorMessage(
        `Please select a valid image file (${ALLOWED_TYPES.join(", ")}).`
      );
      setThumbnailFile(null);
      setThumbnailBase64("");
      setThumbnail("");
    }
  };

  const handleTagChange = (event) => {
    const newTagIds = event.target.value;
    setSelectedTagIds(newTagIds);
    const newTags = availableTags
      .filter((tag) => newTagIds.includes(tag.tagId))
      .map((tag) => ({ tagId: tag.tagId, tagName: tag.tagName }));
    setTags(newTags);
  };

  const handleSave = async () => {
    const trimmedContent = content.trim();
    const finalTagIds = selectedTagIds || [];

    if (!trimmedContent) {
      showErrorMessage("Content is required.");
      return;
    }

    if (trimmedContent.length > 500) {
      showErrorMessage("Content must be 500 characters or fewer.");
      return;
    }

    if (!post?.userId || post.userId <= 0) {
      showErrorMessage("Invalid user.");
      return;
    }

    if (!post?.groupId || post.groupId <= 0) {
      showErrorMessage("Invalid group.");
      return;
    }

    if (!Array.isArray(finalTagIds) || finalTagIds.length === 0) {
      showErrorMessage("At least one tag is required.");
      return;
    }

    if (thumbnail && thumbnail.length > 255) {
      showErrorMessage("Thumbnail URL must be 255 characters or fewer.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let finalThumbnail = thumbnail;

      if (thumbnailMode === "file" && thumbnailFile) {
        const formData = new FormData();
        const fileName = `post_thumbnail-${Date.now()}.${
          thumbnailFile.type.split("/")[1]
        }`;
        formData.append("file", thumbnailFile, fileName);

        const uploadResponse = await apiUploadImageCloudService.uploadImage(
          formData,
          "post_thumbnails",
          user.userId
        );
        if (uploadResponse.isError) {
          throw new Error(uploadResponse.message);
        }
        finalThumbnail = uploadResponse.imageUrl;
      } else if (thumbnailMode !== "url") {
        finalThumbnail = "";
      }

      const updatedPost = {
        postId: parseInt(postId),
        userId: post.userId,
        groupId: parseInt(post.groupId),
        thumbnail: finalThumbnail,
        content: trimmedContent,
        status: post.status || "active",
        createdAt: post.createdAt,
        createdBy: post.createdBy,
        updatedAt: new Date().toISOString(),
        totalComment: post.totalComment || 0,
        tagIds: finalTagIds,
        tags,
      };

      await apiPostService.updatePost(postId, updatedPost);
      await apiTagService.addTagsToPost(postId, finalTagIds);

      showSuccessMessage("Post updated successfully!");
      setTimeout(() => navigate(`/my-posts/${postId}/view`), 2000);
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        className="edit-post-container"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="edit-post-container">
      <Typography variant="h5" fontWeight={700} mb={3}>
        Edit Post
      </Typography>

      <Snackbar
        open={error || success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={error ? "error" : "success"}
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      <Card className="edit-card">
        <CardContent>
          <Grid container spacing={3}>
            <Grid
              item
              xs={12}
              sx={{
                width: "100%",
                "& .ck-editor__editable_inline": { minHeight: 200 },
              }}
            >
              <Typography variant="h6" fontWeight={600} mb={1}>
                Content
              </Typography>
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setContent(data);
                }}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "underline",
                    "|",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "alignment",
                    "|",
                    "link",
                    "imageUpload",
                    "|",
                    "undo",
                    "redo",
                  ],
                  image: {
                    toolbar: [
                      "imageStyle:inline",
                      "imageStyle:block",
                      "imageStyle:side",
                      "|",
                      "imageTextAlternative",
                    ],
                  },
                  placeholder: "Enter post content...",
                  height: 500,
                }}
                className="ckeditor-editor"
              />
            </Grid>

            <Grid item xs={12} sx={{ width: "100%" }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Thumbnail
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="thumbnail-mode-label">
                  Thumbnail Source
                </InputLabel>
                <Select
                  labelId="thumbnail-mode-label"
                  value={thumbnailMode}
                  onChange={handleThumbnailModeChange}
                  label="Thumbnail Source"
                  className="modern-select"
                >
                  <MenuItem value="url">Image URL</MenuItem>
                  <MenuItem value="file">Upload from Device</MenuItem>
                </Select>
              </FormControl>
              {thumbnailMode === "url" ? (
                <TextField
                  fullWidth
                  value={thumbnail}
                  onChange={(e) => {
                    setThumbnail(e.target.value);
                    setThumbnailBase64(e.target.value);
                  }}
                  placeholder="Enter image URL..."
                  variant="outlined"
                  className="modern-textfield"
                />
              ) : (
                <TextField
                  fullWidth
                  type="file"
                  onChange={handleFileChange}
                  variant="outlined"
                  className="modern-textfield"
                  inputProps={{ accept: ALLOWED_TYPES.join(",") }}
                />
              )}
              {thumbnailBase64 && (
                <CardMedia
                  component="img"
                  height="150"
                  image={thumbnailBase64}
                  alt="Thumbnail Preview"
                  className="thumbnail-preview"
                  sx={{ mt: 2 }}
                />
              )}
            </Grid>

            <Grid item xs={12} sx={{ width: "100%" }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Tags
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="tags-select-label">Select Tags</InputLabel>
                <Select
                  labelId="tags-select-label"
                  multiple
                  value={selectedTagIds}
                  onChange={handleTagChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((tagId) => {
                        const tag = availableTags.find(
                          (t) => t.tagId === tagId
                        );
                        return tag ? (
                          <Chip
                            key={tag.tagId}
                            label={tag.tagName}
                            className="tag-chip"
                          />
                        ) : null;
                      })}
                    </Box>
                  )}
                  className="modern-select"
                >
                  {availableTags.map((tag) => (
                    <MenuItem key={tag.tagId} value={tag.tagId}>
                      {tag.tagName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ width: "100%" }}>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || post?.status !== "active"}
                  className="action-button"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate(`/my-posts/${postId}/view`)}
                  className="action-button"
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditPost;
