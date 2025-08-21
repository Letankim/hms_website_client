import { useContext, useEffect, useState, useCallback } from "react";
import {
  Activity,
  Eye,
  Edit2,
  Trash,
  SearchNormal1,
  Filter,
  CloseCircle,
  Warning2,
  DocumentText,
  Calendar,
  ArrowRight2,
  ArrowLeft2,
  Image as ImageIcon,
  Tag,
} from "iconsax-react";
import { useNavigate } from "react-router-dom";
import apiPostService from "services/apiPostService";
import "./MyPostHistory.css";
import {
  showErrorFetchAPI,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import AuthContext from "contexts/AuthContext";
import apiGroupMemberService from "services/apiGroupMemberService";

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
];

const pageSizeOptions = [5, 10, 20, 50];

const MyPostHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim(),
        status: status === "all" ? "" : status,
        startDate,
        endDate,
        pageNumber: page + 1,
        pageSize,
        sortBy,
        sortOrder,
      };
      const res = await apiPostService.getMyPosts(user.userId, params);
      if (res.data) {
        setPosts(res.data.posts || []);
        setTotal(res.data.totalCount || 0);
      } else {
        setPosts([]);
        setTotal(0);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setPosts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    search,
    status,
    startDate,
    endDate,
    page,
    pageSize,
    sortBy,
    sortOrder,
    refresh,
  ]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(0);
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);
    debouncedSetSearch(value);
  };

  useEffect(() => {
    setTempSearch(search);
    fetchPosts();
  }, [fetchPosts]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(0);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(0);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setPageSize(Number.parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    try {
      await apiPostService.softDeletePost(id);
      showSuccessMessage("Post deleted successfully");
      setShowSuccess(true);
      setRefresh((r) => !r);
    } catch (e) {
      showErrorFetchAPI(e);
      setError(e.message);
      setShowError(true);
    }
  };

  const handleConfirmDelete = async (post) => {
    try {
      const membershipResponse = await apiGroupMemberService.isUserInGroup(
        Number(post?.groupId)
      );

      if (membershipResponse.data) {
        setPostToDelete(post?.postId);
        setDeleteDialogOpen(true);
        document.body.style.overflow = "hidden";
      } else {
        showInfoMessage(
          "You are no longer a member of this group. Please rejoin to manage your posts."
        );
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleConfirmDeleteDialogClose = (confirm) => {
    setDeleteDialogOpen(false);
    document.body.style.overflow = "auto";
    if (confirm && postToDelete) {
      handleDelete(postToDelete);
    }
    setPostToDelete(null);
  };

  const handleClearFilters = () => {
    setTempSearch("");
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage(null);
  };

  const handleCloseError = () => {
    setShowError(false);
    setError(null);
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
      case "deleted":
        return "var(--text-light)";
      default:
        return "var(--text-light)";
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const currentPage = page + 1;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          className="pagination-btn"
          onClick={() => handleChangePage(page - 1)}
        >
          <ArrowLeft2 size="16" />
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="pagination-btn"
          onClick={() => handleChangePage(0)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="pagination-dots">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => handleChangePage(i - 1)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="pagination-dots">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
          onClick={() => handleChangePage(totalPages - 1)}
        >
          {totalPages}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          className="pagination-btn"
          onClick={() => handleChangePage(page + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className="pagination-container">{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div key={index} className="post-card skeleton-card">
      <div className="post-avatar skeleton skeleton-avatar"></div>
      <div className="post-content">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-description"></div>
        <div className="skeleton skeleton-description short"></div>
        <div className="post-meta">
          <div className="skeleton skeleton-chip"></div>
          <div className="skeleton skeleton-chip"></div>
          <div className="skeleton skeleton-date"></div>
        </div>
      </div>
      <div className="post-actions">
        <div className="skeleton skeleton-action-btn"></div>
        <div className="skeleton skeleton-action-btn"></div>
        <div className="skeleton skeleton-action-btn"></div>
      </div>
    </div>
  );

  if (loading && posts.length === 0) {
    return (
      <div className="post-history-container">
        <div className="container">
          <div className="header-section">
            <div className="skeleton skeleton-header-title"></div>
            <div className="skeleton skeleton-header-desc"></div>
          </div>
          <div className="filter-section">
            <div className="filter-grid">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="skeleton skeleton-filter"></div>
              ))}
            </div>
          </div>
          <div className="posts-list">
            {[...Array(5)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-history-container">
      <div className="container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <DocumentText
                size="40"
                color="var(--secondary-color)"
                variant="Bold"
              />
            </div>
            <h1 className="header-title">My Post History</h1>
          </div>
          <p className="header-description">
            View and manage your published posts
          </p>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-header">
            <div className="filter-title">
              <Filter size="20" color="var(--accent-info)" variant="Bold" />
              <span>Search & Filter</span>
            </div>
            <div className="filter-actions">
              <button
                className="mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>
          <div className={`filter-content ${showFilters ? "show" : ""}`}>
            <div className="filter-grid">
              <div className="search-input-container">
                <div className="search-icon">
                  <SearchNormal1 size="20" color="var(--accent-info)" />
                </div>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={tempSearch}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
              <div className="select-container">
                <label>Status</label>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="filter-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="select-container">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="filter-select"
                />
              </div>
              <div className="select-container">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="filter-select"
                />
              </div>
              <div className="select-container">
                <label>Per Page</label>
                <select
                  value={pageSize}
                  onChange={handleChangeRowsPerPage}
                  className="filter-select"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                <CloseCircle size="16" color="#1976d2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {showError && (
          <div className="snackbar error">
            <div className="snackbar-content">
              <Warning2 size="20" color="white" variant="Bold" />
              <span>{error}</span>
              <button className="snackbar-close" onClick={handleCloseError}>
                <CloseCircle size="16" color="white" />
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!error && (
          <div className="results-summary">
            Found <strong>{total}</strong> post{total !== 1 ? "s" : ""}
            {status !== "all" && ` with status "${status}"`}
            {search && ` matching "${search}"`}
            {startDate && ` from ${formatDate(startDate)}`}
            {endDate && ` to ${formatDate(endDate)}`}
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <DocumentText size="80" color="var(--text-secondary)" />
            </div>
            <h3 className="empty-title">No posts found</h3>
            <p className="empty-description">
              Try adjusting your search criteria or create a new post
            </p>
          </div>
        ) : (
          <>
            <div className="posts-list">
              {loading
                ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                    renderSkeletonCard(i)
                  )
                : posts.map((post, index) => (
                    <div key={post.postId} className="post-card">
                      <div className="post-thumbnail">
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail || "/placeholder.png"}
                            alt="Post thumbnail"
                            className="thumbnail-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.png";
                            }}
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <ImageIcon size="24" color="white" variant="Bold" />
                          </div>
                        )}
                      </div>
                      <div className="post-content">
                        <div className="post-number">
                          #POST{page * pageSize + index + 1}
                        </div>
                        <div
                          className="post-description"
                          dangerouslySetInnerHTML={{
                            __html: post.content,
                          }}
                        />
                        <div className="post-tags">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.map((tag) => (
                              <span key={tag.tagId} className="tag-chip">
                                <Tag size="12" />
                                {tag.tagName}
                              </span>
                            ))
                          ) : (
                            <span className="no-tags">No tags</span>
                          )}
                        </div>
                        <div className="post-meta">
                          <span
                            className="status-chip"
                            style={{
                              backgroundColor: getStatusColor(post.status),
                            }}
                            onClick={() => {
                              setStatus(post.status);
                              setPage(0);
                            }}
                          >
                            {post.status.charAt(0).toUpperCase() +
                              post.status.slice(1)}
                          </span>
                          <span
                            className="post-date"
                            title={formatDate(post.createdAt)}
                          >
                            <Calendar size="14" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="post-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() =>
                            navigate(`/my-posts/${post.postId}/view`)
                          }
                          title="View Details"
                        >
                          <Eye size="16" color="#FFF" />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() =>
                            navigate(`/my-posts/${post.postId}/edit`)
                          }
                          title="Edit Post"
                          disabled={post.status !== "active"}
                        >
                          <Edit2 size="16" color="#FFF" />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleConfirmDelete(post)}
                          title="Delete Post"
                          disabled={post.status !== "active"}
                        >
                          <Trash size="16" color="#FFF" />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <div className="page-size-selector">
                <label>Items per page:</label>
                <select value={pageSize} onChange={handleChangeRowsPerPage}>
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              {renderPagination()}
              <div className="pagination-info">
                Showing {page * pageSize + 1} to{" "}
                {Math.min((page + 1) * pageSize, total)} of {total} posts
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div
          className="modal-overlay"
          onClick={() => handleConfirmDeleteDialogClose(false)}
        >
          <div
            className="modal-container delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header delete-header">
              <div className="modal-header-content">
                <Warning2 size="24" color="white" variant="Bold" />
                <h2>Confirm Delete</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => handleConfirmDeleteDialogClose(false)}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>
            <div className="modal-content">
              <div className="delete-confirmation">
                <Warning2 size="48" color="var(--accent-error)" />
                <h3>Are you sure?</h3>
                <p>
                  Are you sure you want to delete this post? This action cannot
                  be undone.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => handleConfirmDeleteDialogClose(false)}
              >
                <CloseCircle size="18" />
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={() => handleConfirmDeleteDialogClose(true)}
              >
                <Trash size="18" />
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="snackbar success">
          <div className="snackbar-content">
            <Activity size="20" color="white" variant="Bold" />
            <span>{successMessage}</span>
            <button className="snackbar-close" onClick={handleCloseSuccess}>
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="snackbar error">
          <div className="snackbar-content">
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button className="snackbar-close" onClick={handleCloseError}>
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPostHistory;
