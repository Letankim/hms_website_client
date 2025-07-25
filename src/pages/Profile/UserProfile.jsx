import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Cropper from "react-easy-crop";
import AuthContext from "contexts/AuthContext";
import apiUserService from "services/apiUserService";
import { apiUploadImageCloudService } from "services/apiUploadImageCloudService";
import "./UserProfile.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import { Profile2User } from "iconsax-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp"];

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

export default function UserProfile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarSource, setAvatarSource] = useState("file");
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [newAvatarBase64, setNewAvatarBase64] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) {
        setLoading(false);
        showErrorMessage("You are not authorized to view this profile.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiUserService.getUserActiveById(user.userId);
        if (!response.data) throw new Error("No user data received");
        setProfile(response.data);
      } catch (err) {
        showErrorFetchAPI(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && ALLOWED_TYPES.includes(file.type)) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setNewAvatarBase64(reader.result);
      reader.readAsDataURL(file);
    } else {
      showErrorMessage(
        `Please upload a valid image file (${ALLOWED_TYPES.join(", ")}).`
      );
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_TYPES.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
  });

  const handleUpdateAvatar = async () => {
    if (avatarSource === "file" && !newAvatarBase64) {
      showErrorMessage("Please upload an image.");
      return;
    }
    if (avatarSource === "url" && !avatarUrl) {
      showErrorMessage("Please enter a valid image URL.");
      return;
    }

    setAvatarLoading(true);
    setAvatarError(null);
    try {
      let avatarData;
      if (avatarSource === "file") {
        const mimeType = newAvatarBase64.split(";")[0].split(":")[1];
        const fileName = `avatar-${Date.now()}.${mimeType.split("/")[1]}`;
        const file = base64ToFile(newAvatarBase64, fileName, mimeType);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user", user?.userId || "anonymous");

        const uploadResponse = await apiUploadImageCloudService.uploadImage(
          formData
        );
        if (uploadResponse.isError) {
          throw new Error(uploadResponse.message);
        }
        avatarData = uploadResponse.imageUrl;
      } else {
        avatarData = avatarUrl;
      }

      await apiUserService.updateAvatar(user.userId, avatarData);
      const response = await apiUserService.getUserActiveById(user.userId);
      setProfile(response.data);
      setAvatarDialogOpen(false);
      showSuccessMessage("Avatar updated successfully!");
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleCloseAvatarDialog = () => {
    setAvatarDialogOpen(false);
    setNewAvatarFile(null);
    setNewAvatarBase64("");
    setAvatarUrl("");
    setAvatarError(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    document.body.style.overflow = "auto";
  };

  const handleOpenAvatarDialog = () => {
    setAvatarDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "inactive":
        return "error";
      default:
        return "default";
    }
  };

  const quickActions = [
    {
      icon: "✏️",
      title: "Edit Profile",
      description: "Update your personal information",
      path: "/profile/edit",
      color: "var(--accent-info)",
    },
    {
      icon: "🔒",
      title: "Change Password",
      description: "Update your account security",
      path: "/profile/change-password",
      color: "var(--accent-info)",
    },
    {
      icon: "📊",
      title: "Weight History",
      description: "View your weight tracking progress",
      path: "/profile/weight-history",
      color: "var(--accent-success)",
    },
    {
      icon: "💪",
      title: "Body Measurements",
      description: "Track your body measurements",
      path: "/profile/body-measurements",
      color: "var(--accent-warning)",
    },
    {
      icon: "💧",
      title: "Water Log",
      description: "Track your water intake",
      path: "/profile/water-log",
      color: "var(--accent-info)",
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3 className="loading-text">Loading your profile...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-container">
        <div className="container">
          <div className="error-message">
            <div className="error-content">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <span>{error}</span>
              <button
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <Profile2User fontSize={16} color="#45653a" />
            </div>
            <h1 className="header-title">User Profile</h1>
          </div>
          <p className="header-description">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-banner"></div>
          <div className="profile-content">
            <div className="profile-info-section">
              {/* Avatar Section */}
              <div className="avatar-section">
                <div className="avatar-container">
                  <img
                    src={profile?.avatar || "/placeholder-avatar.jpg"}
                    alt={profile?.fullName}
                    className="avatar-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="avatar-fallback" style={{ display: "none" }}>
                    {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <button
                    className="avatar-edit-btn"
                    onClick={handleOpenAvatarDialog}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="profile-details">
                <h2 className="profile-name">{profile?.fullName || "N/A"}</h2>
                <p className="profile-email">{profile?.email || "N/A"}</p>
                <div className="profile-badges">
                  <span
                    className={`status-badge ${getStatusColor(
                      profile?.status
                    )}`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {profile?.status || "Unknown"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-item">
                  <div className="stat-icon level">⭐</div>
                  <div className="stat-value">
                    {profile?.levelAccount || "N/A"}
                  </div>
                  <div className="stat-label">Level</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon experience">📈</div>
                  <div className="stat-value">{profile?.experience || "0"}</div>
                  <div className="stat-label">XP</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon streak">🔥</div>
                  <div className="stat-value">
                    {profile?.currentStreak || "0"}
                  </div>
                  <div className="stat-label">Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-card">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="action-card"
                onClick={() => handleNavigation(action.path)}
              >
                <div className="action-header">
                  <div
                    className="action-icon"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <span style={{ color: action.color }}>{action.icon}</span>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="action-arrow"
                  >
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                </div>
                <h4 className="action-title">{action.title}</h4>
                <p className="action-description">{action.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="personal-info-card">
          <div className="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <h3 className="section-title">Personal Information</h3>
          </div>
          <div className="info-list">
            {[
              { icon: "👤", label: "Username", value: profile?.username },
              { icon: "📧", label: "Email", value: profile?.email },
              { icon: "📱", label: "Phone", value: profile?.phone },
              { icon: "⚧", label: "Gender", value: profile?.gender },
              {
                icon: "🎂",
                label: "Birth Date",
                value: formatDate(profile?.birthDate),
              },
            ].map((item, index) => (
              <div key={index} className="info-item">
                <div className="info-icon">{item.icon}</div>
                <div className="info-content">
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Avatar Update Modal */}
      {avatarDialogOpen && (
        <div className="modal-overlay" onClick={handleCloseAvatarDialog}>
          <div
            className="modal-container avatar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-content">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                <h2>Update Your Avatar</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseAvatarDialog}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="modal-content">
              {avatarError && (
                <div className="error-message">
                  <div className="error-content">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                    {avatarError}
                  </div>
                </div>
              )}
              <div className="avatar-source-selector">
                <label>Avatar Source</label>
                <select
                  value={avatarSource}
                  onChange={(e) => {
                    setAvatarSource(e.target.value);
                    setNewAvatarFile(null);
                    setNewAvatarBase64("");
                    setAvatarUrl("");
                    setAvatarError(null);
                  }}
                  className="avatar-source-select"
                >
                  <option value="file">📁 Upload File</option>
                  <option value="url">🔗 Enter URL</option>
                </select>
              </div>
              {avatarSource === "file" ? (
                <div className="file-upload-section">
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? "active" : ""}`}
                  >
                    <input {...getInputProps()} />
                    <div className="dropzone-content">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14 2H6A2 2 0 0 0 4 4v16A2 2 0 0 0 6 22h12a2 2 0 0 0 2-20H14V2zm4 18H6V4h7v5h5v11z" />
                      </svg>
                      <h3>
                        {isDragActive
                          ? "Drop the image here..."
                          : "Drag & drop an image here"}
                      </h3>
                      <p>or click to select a file</p>
                    </div>
                  </div>
                  {newAvatarBase64 && (
                    <div className="cropper-container">
                      <Cropper
                        image={newAvatarBase64}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(croppedArea, croppedAreaPixels) =>
                          setCroppedAreaPixels(croppedAreaPixels)
                        }
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="url-input-section">
                  <label>Image URL</label>
                  <div className="url-input-container">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.01 7 1.9 9.11 1.9 12s2.11 5 5 5h4v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9.1-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.89 0 5-2.11 5-5s-2.11-5-5-5z" />
                    </svg>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="url-input"
                    />
                  </div>
                </div>
              )}
              {((avatarSource === "file" && newAvatarBase64) ||
                (avatarSource === "url" && avatarUrl)) && (
                <div className="avatar-preview">
                  <h4>Preview</h4>
                  <div className="preview-avatar">
                    <img
                      src={
                        avatarSource === "file" ? newAvatarBase64 : avatarUrl
                      }
                      alt="Avatar preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div
                      className="preview-fallback"
                      style={{ display: "none" }}
                    >
                      ❌
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseAvatarDialog}>
                Cancel
              </button>
              <button
                className="update-btn"
                onClick={handleUpdateAvatar}
                disabled={avatarLoading}
              >
                {avatarLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Update Avatar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className={`snackbar ${snackbar.severity}`}>
          <div className="snackbar-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              {snackbar.severity === "success" ? (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              ) : (
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              )}
            </svg>
            <span>{snackbar.message}</span>
            <button className="snackbar-close" onClick={handleCloseSnackbar}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
