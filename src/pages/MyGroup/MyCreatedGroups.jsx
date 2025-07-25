import styles from "./MyCreatedGroups.module.css";
import { useContext, useEffect, useState, useCallback } from "react";
import {
  People,
  Eye,
  Add,
  Edit2,
  Trash,
  SearchNormal1,
  Filter,
  CloseCircle,
  TickCircle,
  Warning2,
  Setting2,
  ArrowRight2,
  ArrowLeft2,
  Gallery,
  Lock,
  Unlock,
  UserAdd,
  UserRemove,
  Calendar,
  Image,
} from "iconsax-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";
import apiGroupService from "services/apiGroupService";
import { apiUploadImageCloudService } from "services/apiUploadImageCloudService";
import { extractErrors } from "components/ErrorHandler/extractErrors";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusColors = {
  active: "success",
  inactive: "error",
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/bmp"];

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const MyCreatedGroups = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [newGroup, setNewGroup] = useState({
    groupId: 0,
    thumbnail: "",
    groupName: "",
    description: "",
    status: "active",
    isPrivate: false,
  });
  const [editGroup, setEditGroup] = useState({
    groupId: 0,
    thumbnail: "",
    groupName: "",
    description: "",
    status: "active",
    isPrivate: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editorData, setEditorData] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchGroups = useCallback(async () => {
    if (!user) {
      showInfoMessage("Please login to view your created groups.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    setLoading(true);
    try {
      const params = {
        pageNumber: pageNumber,
        pageSize: pageSize,
        searchTerm: search.trim(),
        status: status === "all" ? "" : status,
      };
      const res = await apiGroupService.getMyGroups(params);
      if (res.statusCode === 200 && res.data) {
        setGroups(res.data.groups || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } else {
        showErrorMessage("No groups found.");
        setGroups([]);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [user, pageNumber, pageSize, search, status, navigate]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPageNumber(1);
    }, 500),
    []
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showErrorMessage(
          `Invalid image type. Only ${ALLOWED_TYPES.join(", ")} are allowed.`
        );
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (editorData) => {
    const errors = {};

    if (!editorData?.groupName?.trim()) {
      errors.groupName = "Group name is required";
    } else if (
      editorData.groupName.length < 3 ||
      editorData.groupName.length > 255
    ) {
      errors.groupName = "Group name must be between 3 and 255 characters";
    }

    if (!editorData?.description.trim()) {
      errors.description = "Description is required";
    } else if (editorData.description.length > 2000) {
      errors.description = "Description cannot exceed 2000 characters";
    }

    const status = editorData.status?.trim().toLowerCase();
    if (status && !["active", "inactive"].includes(status)) {
      errors.status = "Status must be 'active' or 'inactive'";
    }

    return errors;
  };

  const validateAddForm = (groupData) => {
    const errors = {};

    if (!groupData?.groupName?.trim()) {
      errors.groupName = "Group name is required";
    } else if (
      groupData.groupName.length < 3 ||
      groupData.groupName.length > 255
    ) {
      errors.groupName = "Group name must be between 3 and 255 characters";
    }

    if (!groupData?.description.trim()) {
      errors.description = "Description is required";
    } else if (groupData.description.length > 2000) {
      errors.description = "Description cannot exceed 2000 characters";
    }

    const status = groupData.status?.trim().toLowerCase();
    if (status && !["active", "inactive"].includes(status)) {
      errors.status = "Status must be 'active' or 'inactive'";
    }

    return errors;
  };

  const handleCreateGroup = async () => {
    const errors = validateAddForm(newGroup);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      let thumbnailUrl = newGroup.thumbnail;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("user", user.userId || "anonymous");
        const res = await apiUploadImageCloudService.uploadImage(formData);
        if (res.isError) {
          showErrorMessage(res.message);
          setLoading(false);
          return;
        }
        thumbnailUrl = res.imageUrl;
      }

      const groupDto = {
        ...newGroup,
        thumbnail: thumbnailUrl,
        description: DOMPurify.sanitize(editorData),
      };

      const res = await apiGroupService.createGroup(groupDto);
      if (res.statusCode === 201) {
        showSuccessMessage("Group created successfully!");
        setCreateDialogOpen(false);
        document.body.style.overflow = "auto";
        resetCreateForm();
        await fetchGroups();
      } else {
        showErrorMessage("Failed to create group.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async () => {
    const errors = validateForm(editGroup);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showErrorMessage("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      let thumbnailUrl = editGroup.thumbnail;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("user", user.userId || "anonymous");
        const res = await apiUploadImageCloudService.uploadImage(formData);
        if (res.isError) {
          showErrorMessage(res.message);
          setLoading(false);
          return;
        }
        thumbnailUrl = res.imageUrl;
      }

      const groupDto = {
        ...editGroup,
        thumbnail: thumbnailUrl,
        description: DOMPurify.sanitize(editorData),
      };

      const res = await apiGroupService.updateGroup(
        editGroup.groupId,
        groupDto
      );
      if (res.statusCode === 200) {
        showSuccessMessage("Group updated successfully!");
        setEditDialogOpen(false);
        document.body.style.overflow = "auto";
        resetEditForm();
        await fetchGroups();
      } else {
        showErrorMessage("Failed to update group.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await apiGroupService.softDeleteGroup(id);
      showSuccessMessage("Group deleted successfully.");
      await fetchGroups();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const resetCreateForm = () => {
    setNewGroup({
      groupId: 0,
      thumbnail: "",
      groupName: "",
      description: "",
      status: "active",
      isPrivate: false,
    });
    setEditorData("");
    setImagePreview(null);
    setImageFile(null);
    setFormErrors({});
  };

  const resetEditForm = () => {
    setEditGroup({
      groupId: 0,
      thumbnail: "",
      groupName: "",
      description: "",
      status: "active",
      isPrivate: false,
    });
    setEditorData("");
    setImagePreview(null);
    setImageFile(null);
    setFormErrors({});
  };

  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setDetailDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleEditGroupDialog = (group) => {
    setEditGroup({
      groupId: group.groupId,
      thumbnail: group.thumbnail || "",
      groupName: group.groupName || "",
      description: group.description || "",
      status: group.status || "active",
      isPrivate: group.isPrivate || false,
    });
    setEditorData(group.description || "");
    setImagePreview(group.thumbnail || null);
    setImageFile(null);
    setFormErrors({});
    setEditDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCreateNewGroup = () => {
    resetCreateForm();
    setCreateDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleConfirmDelete = (groupId) => {
    setGroupToDelete(groupId);
    setDeleteDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleConfirmDeleteDialogClose = (confirm) => {
    setDeleteDialogOpen(false);
    document.body.style.overflow = "auto";
    if (confirm && groupToDelete) {
      handleDeleteGroup(groupToDelete);
    }
    setGroupToDelete(null);
  };

  const handleViewGroupPage = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleViewJoinRequests = (group) => {
    navigate(`/my-groups/${group.groupId}/requests?action=pending`);
  };

  const handleViewMembers = (group) => {
    navigate(`/my-groups/${group.groupId}/members`);
  };

  const handleViewBannedRequests = (group) => {
    navigate(`/my-groups/${group.groupId}/requests?action=banned`);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedGroup(null);
    document.body.style.overflow = "auto";
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    resetCreateForm();
    document.body.style.overflow = "auto";
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    resetEditForm();
    document.body.style.overflow = "auto";
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPageNumber(1);
  };

  const handleSearchChange = (e) => {
    debouncedSetSearch(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "var(--accent-success)";
      case "inactive":
        return "var(--accent-error)";
      default:
        return "var(--text-light)";
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pageNumber - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (pageNumber > 1) {
      pages.push(
        <button
          key="prev"
          className={styles["pagination-btn"]}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          <ArrowLeft2 size="16" />
        </button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={styles["pagination-btn"]}
          onClick={() => setPageNumber(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className={styles["pagination-dots"]}>
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles["pagination-btn"]} ${
            i === pageNumber ? styles["active"] : ""
          }`}
          onClick={() => setPageNumber(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className={styles["pagination-dots"]}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className={styles["pagination-btn"]}
          onClick={() => setPageNumber(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    if (pageNumber < totalPages) {
      pages.push(
        <button
          key="next"
          className={styles["pagination-btn"]}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className={styles["pagination-container"]}>{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div
      key={index}
      className={styles["group-card"] + " " + styles["skeleton-card"]}
    >
      <div
        className={
          styles["group-avatar"] +
          " " +
          styles["skeleton"] +
          " " +
          styles["skeleton-avatar"]
        }
      ></div>
      <div className={styles["group-content"]}>
        <div
          className={styles["skeleton"] + " " + styles["skeleton-title"]}
        ></div>
        <div
          className={styles["skeleton"] + " " + styles["skeleton-description"]}
        ></div>
        <div
          className={
            styles["skeleton"] +
            " " +
            styles["skeleton-description"] +
            " " +
            styles["short"]
          }
        ></div>
        <div className={styles["group-meta"]}>
          <div
            className={styles["skeleton"] + " " + styles["skeleton-chip"]}
          ></div>
          <div
            className={styles["skeleton"] + " " + styles["skeleton-chip"]}
          ></div>
          <div
            className={styles["skeleton"] + " " + styles["skeleton-date"]}
          ></div>
        </div>
      </div>
      <div className={styles["group-actions"]}>
        <div
          className={styles["skeleton"] + " " + styles["skeleton-action-btn"]}
        ></div>
        <div
          className={styles["skeleton"] + " " + styles["skeleton-action-btn"]}
        ></div>
        <div
          className={styles["skeleton"] + " " + styles["skeleton-action-btn"]}
        ></div>
      </div>
    </div>
  );

  if (loading && groups.length === 0) {
    return (
      <div className={styles["group-management-container"]}>
        <div className={styles["container"]}>
          <div className={styles["header-section"]}>
            <div
              className={
                styles["skeleton"] + " " + styles["skeleton-header-title"]
              }
            ></div>
            <div
              className={
                styles["skeleton"] + " " + styles["skeleton-header-desc"]
              }
            ></div>
          </div>

          <div className={styles["filter-section"]}>
            <div className={styles["filter-grid"]}>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={
                    styles["skeleton"] + " " + styles["skeleton-filter"]
                  }
                ></div>
              ))}
            </div>
          </div>

          <div className={styles["groups-list"]}>
            {[...Array(5)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["group-management-container"]}>
      <div className={styles["container"]}>
        {/* Header Section */}
        <div className={styles["header-section"]}>
          <div className={styles["header-content"]}>
            <div className={styles["header-icon"]}>
              <People size="40" color="var(--secondary-color)" variant="Bold" />
            </div>
            <h1 className={styles["header-title"]}>My Created Groups</h1>
          </div>
          <p className={styles["header-description"]}>
            Manage the fitness communities you've created
          </p>
        </div>

        {/* Filter Section */}
        <div className={styles["filter-section"]}>
          <div className={styles["filter-header"]}>
            <div className={styles["filter-title"]}>
              <Filter size="20" color="var(--accent-info)" variant="Bold" />
              <span>Search & Filter</span>
            </div>
            <div className={styles["filter-actions"]}>
              <button
                className={styles["create-group-btn"]}
                onClick={handleCreateNewGroup}
              >
                <Add size="20" color="#fff" />
                <span>Create New Group</span>
              </button>
              <button
                className={styles["mobile-filter-toggle"]}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>

          <div className={`filter-content ${showFilters ? "show" : ""}`}>
            <div className={styles["filter-grid"]}>
              <div className={styles["search-input-container"]}>
                <div className={styles["search-icon"]}>
                  <SearchNormal1 size="20" color="var(--accent-info)" />
                </div>
                <input
                  type="text"
                  placeholder="Search groups..."
                  defaultValue={search}
                  onChange={handleSearchChange}
                  className={styles["search-input"]}
                />
              </div>

              <div className={styles["select-container"]}>
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPageNumber(1);
                  }}
                  className={styles["filter-select"]}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                className={styles["clear-filters-btn"]}
                onClick={handleClearFilters}
              >
                <CloseCircle size="16" color="#1976d2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {!error && (
          <div className={styles["results-summary"]}>
            Found <strong>{totalCount}</strong> group
            {totalCount !== 1 ? "s" : ""}
            {status && ` with status "${status}"`}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Groups List */}
        {groups.length === 0 && !loading ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <People size="80" color="var(--text-secondary)" />
            </div>
            <h3 className={styles["empty-title"]}>No groups found</h3>
            <p className={styles["empty-description"]}>
              Try adjusting your search criteria or create a new group
            </p>
          </div>
        ) : (
          <>
            <div className={styles["groups-list"]}>
              {loading
                ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                    renderSkeletonCard(i)
                  )
                : groups.map((group) => (
                    <div key={group.groupId} className={styles["group-card"]}>
                      <div className={styles["group-avatar"]}>
                        {group.thumbnail ? (
                          <img
                            src={group.thumbnail || "/placeholder.svg"}
                            alt={group.groupName}
                          />
                        ) : (
                          <People size="24" color="white" variant="Bold" />
                        )}
                      </div>

                      <div className={styles["group-content"]}>
                        <h3
                          className={styles["group-title"]}
                          title={group.groupName}
                        >
                          {group.groupName}
                        </h3>

                        <div
                          className={styles["group-description"]}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              group.description ||
                                "<i>No description provided.</i>"
                            ),
                          }}
                        />

                        <div className={styles["group-meta"]}>
                          <span
                            className={styles["status-chip"]}
                            style={{
                              backgroundColor: getStatusColor(group.status),
                            }}
                            onClick={() => {
                              setStatus(group.status);
                              setPageNumber(1);
                            }}
                          >
                            {group.status.charAt(0).toUpperCase() +
                              group.status.slice(1)}
                          </span>
                          <span className={styles["privacy-chip"]}>
                            {group.isPrivate ? (
                              <>
                                <Lock size="12" color="#fff" />
                                Private
                              </>
                            ) : (
                              <>
                                <Unlock size="12" color="#fff" />
                                Public
                              </>
                            )}
                          </span>
                          <span
                            className={styles["group-date"]}
                            title={formatDate(group?.createdAt)}
                          >
                            <Calendar size="14" />
                            {formatDate(group?.createdAt)}
                          </span>
                        </div>

                        <div className={styles["group-stats"]}>
                          <span className={styles["member-count"]}>
                            <People size="14" />
                            {group.memberCount || 0} members
                          </span>
                          <span className={styles["group-id"]}>
                            #GROUP{group.groupId}
                          </span>
                        </div>
                      </div>

                      <div className={styles["group-actions"]}>
                        <button
                          className={
                            styles["action-btn"] + " " + styles["view-btn"]
                          }
                          onClick={() => handleViewDetails(group)}
                          title="View Details"
                        >
                          <Eye size="16" color="#fff" />
                        </button>
                        <button
                          className={
                            styles["action-btn"] + " " + styles["edit-btn"]
                          }
                          onClick={() => handleEditGroupDialog(group)}
                          title="Edit Group"
                        >
                          <Edit2 size="16" color="#fff" />
                        </button>
                        <button
                          className={
                            styles["action-btn"] + " " + styles["delete-btn"]
                          }
                          onClick={() => handleConfirmDelete(group.groupId)}
                          title="Delete Group"
                        >
                          <Trash size="16" color="#fff" />
                        </button>
                      </div>

                      <div className={styles["group-quick-actions"]}>
                        <button
                          className={styles["quick-action-btn"]}
                          onClick={() => handleViewGroupPage(group.groupId)}
                          title="View Group Page"
                        >
                          View Group
                        </button>
                        <button
                          className={styles["quick-action-btn"]}
                          onClick={() => handleViewJoinRequests(group)}
                          title="Join Requests"
                        >
                          <UserAdd size="16" color="#1976d2" />
                          Requests
                        </button>
                        <button
                          className={styles["quick-action-btn"]}
                          onClick={() => handleViewMembers(group)}
                          title="View Members"
                        >
                          <People size="16" color="#1976d2" />
                          Members
                        </button>
                        <button
                          className={
                            styles["quick-action-btn"] + " " + styles["banned"]
                          }
                          onClick={() => handleViewBannedRequests(group)}
                          title="Banned Requests"
                        >
                          <UserRemove size="16" color="#f44336" />
                          Banned
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            <div className={styles["pagination-section"]}>
              <div className={styles["page-size-selector"]}>
                <label>Items per page:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {renderPagination()}

              <div className={styles["pagination-info"]}>
                Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                groups
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailDialogOpen && selectedGroup && (
        <div className={styles["modal-overlay"]} onClick={handleCloseDialog}>
          <div
            className={styles["modal-container"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <div className={styles["modal-header-content"]}>
                <Eye size="24" color="white" variant="Bold" />
                <h2>Group Details</h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={handleCloseDialog}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              {selectedGroup.thumbnail && (
                <div className={styles["detail-image"]}>
                  <img
                    src={selectedGroup.thumbnail || "/placeholder.svg"}
                    alt={selectedGroup.groupName}
                  />
                </div>
              )}

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>Group Name</label>
                <input
                  type="text"
                  value={selectedGroup.groupName}
                  className={styles["form-input"]}
                  readOnly
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>Description</label>
                <div
                  className={styles["description-content"]}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      selectedGroup.description ||
                        "<i>No description provided.</i>"
                    ),
                  }}
                />
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Status</label>
                  <input
                    type="text"
                    value={selectedGroup.status}
                    className={styles["form-input"]}
                    readOnly
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Privacy</label>
                  <input
                    type="text"
                    value={selectedGroup.isPrivate ? "Private" : "Public"}
                    className={styles["form-input"]}
                    readOnly
                  />
                </div>
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Member Count</label>
                  <input
                    type="text"
                    value={selectedGroup.memberCount || 0}
                    className={styles["form-input"]}
                    readOnly
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Group ID</label>
                  <input
                    type="text"
                    value={"#GROUP" + selectedGroup?.groupId}
                    className={styles["form-input"]}
                    readOnly
                  />
                </div>
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Created At</label>
                  <input
                    type="text"
                    value={formatDate(selectedGroup?.createdAt)}
                    className={styles["form-input"]}
                    readOnly
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Updated At</label>
                  <input
                    type="text"
                    value={formatDate(selectedGroup?.updatedAt)}
                    className={styles["form-input"]}
                    readOnly
                  />
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>Created By</label>
                <input
                  type="text"
                  value={selectedGroup?.creator?.fullName || "Unknown"}
                  className={styles["form-input"]}
                  readOnly
                />
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={handleCloseDialog}
              >
                <CloseCircle size="18" color="#dc3545" />
                Close
              </button>
              <button
                className={styles["save-btn"]}
                onClick={() => {
                  handleCloseDialog();
                  handleEditGroupDialog(selectedGroup);
                }}
              >
                <Edit2 size="18" color="#fff" />
                Edit Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(createDialogOpen || editDialogOpen) && (
        <div
          className={styles["modal-overlay"]}
          onClick={
            createDialogOpen ? handleCloseCreateDialog : handleCloseEditDialog
          }
        >
          <div
            className={styles["modal-container"] + " " + styles["large-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <div className={styles["modal-header-content"]}>
                <Setting2 size="24" color="white" variant="Bold" />
                <h2>{createDialogOpen ? "Create New Group" : "Edit Group"}</h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={
                  createDialogOpen
                    ? handleCloseCreateDialog
                    : handleCloseEditDialog
                }
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  Group Name <span className={styles["required"]}>*</span>
                </label>
                <input
                  type="text"
                  value={
                    createDialogOpen
                      ? newGroup?.groupName
                      : editGroup?.groupName
                  }
                  onChange={(e) => {
                    if (createDialogOpen) {
                      setNewGroup({ ...newGroup, groupName: e.target.value });
                    } else {
                      setEditGroup({ ...editGroup, groupName: e.target.value });
                    }
                    setFormErrors((prev) => ({ ...prev, groupName: null }));
                  }}
                  className={`${styles["form-input"]} ${
                    formErrors.groupName ? styles["error"] : ""
                  }`}
                  placeholder="Enter group name"
                />
                {formErrors.groupName && (
                  <span className={styles["error-text"]}>
                    {formErrors.groupName}
                  </span>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  Description <span className={styles["required"]}>*</span>
                </label>
                <div
                  className={`editor-container ${
                    formErrors.description ? "error" : ""
                  }`}
                >
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    onReady={(editor) => {
                      editor.editing.view.change((writer) => {
                        writer.setStyle(
                          "min-height",
                          "150px",
                          editor.editing.view.document.getRoot()
                        );
                      });
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorData(data);
                      if (createDialogOpen) {
                        setNewGroup({ ...newGroup, description: data });
                      } else {
                        setEditGroup({ ...editGroup, description: data });
                      }
                      setFormErrors((prev) => ({ ...prev, description: null }));
                    }}
                    config={{
                      toolbar: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "blockQuote",
                        "|",
                        "undo",
                        "redo",
                      ],
                      placeholder: "Enter group description here...",
                    }}
                  />
                </div>
                {formErrors.description && (
                  <span className={styles["error-text"]}>
                    {formErrors.description}
                  </span>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>Thumbnail</label>
                <div className={styles["image-upload-container"]}>
                  <input
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    onChange={handleImageChange}
                    className={styles["file-input"]}
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className={styles["file-input-label"]}
                  >
                    <Image size="20" color="#fff" />
                    Choose Image
                  </label>
                  <span className={styles["file-input-text"]}>or</span>
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    value={
                      createDialogOpen
                        ? newGroup.thumbnail
                        : editGroup.thumbnail
                    }
                    onChange={(e) => {
                      if (createDialogOpen) {
                        setNewGroup({ ...newGroup, thumbnail: e.target.value });
                      } else {
                        setEditGroup({
                          ...editGroup,
                          thumbnail: e.target.value,
                        });
                      }
                    }}
                    className={styles["form-input"] + " " + styles["url-input"]}
                  />
                </div>
                {(imagePreview ||
                  (createDialogOpen
                    ? newGroup.thumbnail
                    : editGroup.thumbnail)) && (
                  <div className={styles["image-preview"]}>
                    <img
                      src={
                        imagePreview ||
                        (createDialogOpen
                          ? newGroup.thumbnail
                          : editGroup.thumbnail)
                      }
                      alt="Thumbnail Preview"
                    />
                  </div>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  Status <span className={styles["required"]}>*</span>
                </label>
                <select
                  value={createDialogOpen ? newGroup.status : editGroup.status}
                  onChange={(e) => {
                    const selectedStatus = e.target.value;
                    if (createDialogOpen) {
                      setNewGroup({ ...newGroup, status: selectedStatus });
                    } else {
                      setEditGroup({ ...editGroup, status: selectedStatus });
                    }
                    setFormErrors((prev) => ({ ...prev, status: null }));
                  }}
                  className={`${styles["form-input"]} ${
                    formErrors.status ? styles["error"] : ""
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {formErrors.status && (
                  <span className={styles["error-text"]}>
                    {formErrors.status}
                  </span>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>Privacy Settings</label>
                <div className={styles["privacy-toggle"]}>
                  <input
                    type="checkbox"
                    id="privacy-toggle"
                    checked={
                      createDialogOpen
                        ? newGroup.isPrivate
                        : editGroup.isPrivate
                    }
                    onChange={(e) => {
                      if (createDialogOpen) {
                        setNewGroup({
                          ...newGroup,
                          isPrivate: e.target.checked,
                        });
                      } else {
                        setEditGroup({
                          ...editGroup,
                          isPrivate: e.target.checked,
                        });
                      }
                    }}
                    className={styles["privacy-checkbox"]}
                  />
                  <label
                    htmlFor="privacy-toggle"
                    className={styles["privacy-label"]}
                  >
                    <span className={styles["privacy-icon"]}>
                      {(
                        createDialogOpen
                          ? newGroup.isPrivate
                          : editGroup.isPrivate
                      ) ? (
                        <Lock size="16" color="#fff" />
                      ) : (
                        <Unlock size="16" color="#000" />
                      )}
                    </span>
                    {(
                      createDialogOpen
                        ? newGroup.isPrivate
                        : editGroup.isPrivate
                    )
                      ? "Private Group"
                      : "Public Group"}
                  </label>
                </div>
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={
                  createDialogOpen
                    ? handleCloseCreateDialog
                    : handleCloseEditDialog
                }
              >
                <CloseCircle size="18" color="#dc3545" />
                Cancel
              </button>
              <button
                className={styles["save-btn"]}
                onClick={createDialogOpen ? handleCreateGroup : handleEditGroup}
              >
                <TickCircle size="18" color="#fff" />
                {createDialogOpen ? "Create" : "Update"} Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => handleConfirmDeleteDialogClose(false)}
        >
          <div
            className={styles["modal-container"] + " " + styles["delete-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles["modal-header"] + " " + styles["delete-header"]}
            >
              <div className={styles["modal-header-content"]}>
                <Warning2 size="24" color="white" variant="Bold" />
                <h2>Confirm Delete</h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={() => handleConfirmDeleteDialogClose(false)}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              <div className={styles["delete-confirmation"]}>
                <Warning2 size="48" color="var(--accent-error)" />
                <h3>Are you sure?</h3>
                <p>
                  Are you sure you want to delete this group? This action cannot
                  be undone.
                </p>
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={() => handleConfirmDeleteDialogClose(false)}
              >
                <CloseCircle size="18" color="#dc3545" />
                Cancel
              </button>
              <button
                className={styles["delete-confirm-btn"]}
                onClick={() => handleConfirmDeleteDialogClose(true)}
              >
                <Trash size="18" color="#fff" />
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className={styles["snackbar"] + " " + styles["success"]}>
          <div className={styles["snackbar-content"]}>
            <TickCircle size="20" color="white" variant="Bold" />
            <span>{successMessage}</span>
            <button
              className={styles["snackbar-close"]}
              onClick={handleCloseSuccess}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className={styles["snackbar"] + " " + styles["error"]}>
          <div className={styles["snackbar-content"]}>
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button
              className={styles["snackbar-close"]}
              onClick={handleCloseError}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCreatedGroups;
