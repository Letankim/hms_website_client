import { useContext, useEffect, useState, useCallback } from "react";
import {
  Eye,
  Add,
  SearchNormal1,
  Filter,
  CloseCircle,
  Warning2,
  DocumentText,
  Calendar,
  ArrowRight2,
  ArrowLeft2,
  Profile,
  Link,
  Document,
  Bill,
} from "iconsax-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiTrainerApplicationService from "services/apiTrainerApplicationService";
import "./MyTrainerApplicationHistory.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const statusColors = {
  pending: "var(--accent-warning)",
  approved: "var(--accent-success)",
  rejected: "var(--accent-error)",
  deleted: "var(--text-light)",
};

const MyTrainerApplicationHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [socialLinksDialogOpen, setSocialLinksDialogOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [canApply, setCanApply] = useState(false);
  const [canApplyLoading, setCanApplyLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!user?.userId) {
      showInfoMessage("Please login to view your application history.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        searchTerm: search.trim(),
        status: status === "all" ? "" : status,
      };
      const res = await apiTrainerApplicationService.getMyApplication(params);
      if (res.statusCode === 200 && res.data) {
        setApplications(res.data.applications || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } else {
        showErrorMessage("No applications found.");
        setApplications([]);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [user, pageNumber, pageSize, search, status, navigate]);

  const checkCanApply = useCallback(async () => {
    if (!user?.userId) return;
    setCanApplyLoading(true);
    try {
      const canApplyResult =
        await apiTrainerApplicationService.canApplyNewApplication();
      setCanApply(canApplyResult?.data);
    } catch (e) {
      showErrorFetchAPI(e);
      setCanApply(false);
    } finally {
      setCanApplyLoading(false);
    }
  }, [user]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPageNumber(1);
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
    fetchApplications();
    checkCanApply();
  }, [fetchApplications, checkCanApply, search]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPageNumber(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleViewTrainerDetails = (trainerId) => {
    navigate(`/trainer/view/${trainerId}`);
  };

  const handleCreateNewApplication = () => {
    navigate("/trainer-registration");
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedApplication(null);
    document.body.style.overflow = "auto";
  };

  const handleOpenSocialLinks = () => {
    const splitLinks =
      selectedApplication?.socialLinks
        ?.split(",")
        .map((link) => link.trim())
        .filter((link) => link && /^https?:\/\//.test(link)) || [];
    setLinks(splitLinks);
    setSocialLinksDialogOpen(true);
  };

  const handleCloseSocialLinks = () => {
    setSocialLinksDialogOpen(false);
    setLinks([]);
  };

  const handleClickLink = (link) => {
    window.open(link, "_blank", "noopener,noreferrer");
    handleCloseSocialLinks();
  };

  const handleClearFilters = () => {
    setTempSearch("");
    setSearch("");
    setStatus("");
    setPageNumber(1);
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
    return statusColors[status?.toLowerCase()] || "var(--text-light)";
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

    if (pageNumber > 1) {
      pages.push(
        <button
          key="prev"
          className="pagination-btn"
          onClick={() => setPageNumber(pageNumber - 1)}
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
          onClick={() => setPageNumber(1)}
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
          className={`pagination-btn ${i === pageNumber ? "active" : ""}`}
          onClick={() => setPageNumber(i)}
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
          onClick={() => setPageNumber(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    if (pageNumber < totalPages) {
      pages.push(
        <button
          key="next"
          className="pagination-btn"
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className="pagination-container">{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div key={index} className="application-card skeleton-card">
      <div className="application-avatar skeleton skeleton-avatar"></div>
      <div className="application-content">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-description"></div>
        <div className="skeleton skeleton-description short"></div>
        <div className="application-meta">
          <div className="skeleton skeleton-chip"></div>
          <div className="skeleton skeleton-date"></div>
        </div>
      </div>
      <div className="application-actions">
        <div className="skeleton skeleton-action-btn"></div>
      </div>
    </div>
  );

  if (loading && applications.length === 0) {
    return (
      <div className="application-history-container">
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
          <div className="applications-list">
            {[...Array(5)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="application-history-container">
      <div className="container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <Profile
                size="40"
                color="var(--secondary-color)"
                variant="Bold"
              />
            </div>
            <h1 className="header-title">My Trainer Application History</h1>
          </div>
          <p className="header-description">
            View and manage your trainer application history
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
              {canApplyLoading ? (
                <div className="skeleton skeleton-button"></div>
              ) : canApply ? (
                <button
                  className="create-application-btn"
                  onClick={handleCreateNewApplication}
                >
                  <Add size="20" color="#FFF" />
                  Create New Application
                </button>
              ) : (
                <div className="ineligible-message">
                  <Warning2
                    size="16"
                    color="var(--accent-warning)"
                    onClick={() => {
                      showInfoMessage(
                        "Not eligible to submit a new application"
                      );
                    }}
                  />
                </div>
              )}
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
                  placeholder="Search Full Name/Email..."
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
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="select-container">
                <label>Per Page</label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="filter-select"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
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

        {/* Error Message */}
        {error && showError && (
          <div className="error-message">
            <div className="error-content">
              <Warning2 size="20" color="white" />
              {error}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!error && (
          <div className="results-summary">
            Found <strong>{totalCount}</strong> application
            {totalCount !== 1 ? "s" : ""}
            {status && ` with status "${status}"`}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 && !loading ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Profile size="80" color="var(--text-secondary)" />
            </div>
            <h3 className="empty-title">No applications found</h3>
            <p className="empty-description">
              Try adjusting your search criteria or create a new application
            </p>
          </div>
        ) : (
          <>
            <div className="applications-list">
              {loading
                ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                    renderSkeletonCard(i)
                  )
                : applications.map((app) => (
                    <div
                      key={app.trainerApplicationId}
                      className="application-card"
                    >
                      <div className="application-avatar">
                        {app.profileImageUrl ? (
                          <img
                            src={
                              app.profileImageUrl || "/placeholder-avatar.jpg"
                            }
                            alt={app.fullName || "Trainer"}
                            className="avatar-image"
                          />
                        ) : (
                          <Bill size="24" color="white" variant="Bold" />
                        )}
                      </div>
                      <div className="application-content">
                        <h3 className="application-title" title={app.fullName}>
                          {app.fullName || "Unknown"}
                        </h3>
                        <div className="application-description">
                          {app.bio ? (
                            <span>{app.bio}</span>
                          ) : (
                            <em>No bio provided.</em>
                          )}
                        </div>
                        <div className="application-id">
                          Application ID: #APPLICATION{app.trainerApplicationId}
                        </div>
                        <div className="application-meta">
                          <span
                            className="status-chip"
                            style={{
                              backgroundColor: getStatusColor(app.status),
                            }}
                            onClick={() => {
                              setStatus(app.status);
                              setPageNumber(1);
                            }}
                          >
                            {app.status
                              ? app.status.charAt(0).toUpperCase() +
                                app.status.slice(1)
                              : "N/A"}
                          </span>
                          <span
                            className="application-date"
                            title={formatDate(app.submittedAt)}
                          >
                            <Calendar size="14" />
                            {formatDate(app.submittedAt)}
                          </span>
                        </div>
                        {app.status === "approved" && (
                          <button
                            className="trainer-profile-btn"
                            onClick={() => handleViewTrainerDetails(app.userId)}
                          >
                            View Trainer Profile
                          </button>
                        )}
                      </div>
                      <div className="application-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(app)}
                          title="View Details"
                        >
                          <Eye size="16" color="#FFF" />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <div className="page-size-selector">
                <label>Items per page:</label>
                <select value={pageSize} onChange={handlePageSizeChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              {renderPagination()}
              <div className="pagination-info">
                Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                applications
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {detailDialogOpen && selectedApplication && (
        <div className="modal-overlay" onClick={handleCloseDialog}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div className="header-content">
                <div className="header-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                </div>
                <h2 className="modal-title">Application Details</h2>
              </div>
              <button className="close-btn" onClick={handleCloseDialog}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="modal-content">
              <div className="details-grid">
                {/* Personal Information */}
                <div className="section">
                  <h3 className="section-title">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Personal Information
                  </h3>
                  <div className="section-grid">
                    <div className="detail-item">
                      <label className="detail-label">Full Name</label>
                      <span className="detail-value">
                        {selectedApplication.fullName || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Email</label>
                      <span className="detail-value">
                        {selectedApplication.email || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Phone Number</label>
                      <span className="detail-value">
                        {selectedApplication.phoneNumber || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Date of Birth</label>
                      <span className="detail-value">
                        {selectedApplication.dateOfBirth
                          ? new Date(
                              selectedApplication.dateOfBirth
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Gender</label>
                      <span className="detail-value">
                        {selectedApplication.gender || "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Experience Years</label>
                      <span className="detail-value">
                        {selectedApplication.experienceYears || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="section">
                  <h3 className="section-title">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Professional Information
                  </h3>
                  <div className="section-content">
                    <div className="detail-item-full">
                      <label className="detail-label">Bio</label>
                      <div className="detail-value-text">
                        {selectedApplication.bio || "No bio provided"}
                      </div>
                    </div>
                    <div className="detail-item-full">
                      <label className="detail-label">Specialties</label>
                      <div
                        className="detail-value-html"
                        dangerouslySetInnerHTML={{
                          __html:
                            selectedApplication.specialties ||
                            "No specialties provided",
                        }}
                      />
                    </div>
                    <div className="detail-item-full">
                      <label className="detail-label">Certifications</label>
                      <div
                        className="detail-value-html"
                        dangerouslySetInnerHTML={{
                          __html:
                            selectedApplication.certifications ||
                            "No certifications provided",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="section">
                  <h3 className="section-title">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polyline points="9,11 12,14 22,4" />
                      <path d="m21,3l-6.5,18a.55.55,0,0,1-1,0l-3.5-7l-7-3.5a.55.55,0,0,1,0-1z" />
                    </svg>
                    Application Status
                  </h3>
                  <div className="section-grid">
                    <div className="detail-item">
                      <label className="detail-label">Status</label>
                      <span
                        className="status-chip"
                        style={{
                          backgroundColor: getStatusColor(
                            selectedApplication.status
                          ),
                        }}
                      >
                        {selectedApplication.status
                          ? selectedApplication.status.charAt(0).toUpperCase() +
                            selectedApplication.status.slice(1)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Submitted At</label>
                      <span className="detail-value">
                        {formatDate(selectedApplication.submittedAt)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label className="detail-label">Reviewed At</label>
                      <span className="detail-value">
                        {selectedApplication.reviewedAt
                          ? formatDate(selectedApplication.reviewedAt)
                          : "Not reviewed"}
                      </span>
                    </div>
                    <div className="detail-item-full">
                      <label className="detail-label">Notes</label>
                      <div className="detail-value-text">
                        {selectedApplication.notes || "No notes provided"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents & Links */}
                {(selectedApplication.cvFileUrl ||
                  selectedApplication.socialLinks) && (
                  <div className="section">
                    <h3 className="section-title">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      Documents & Links
                    </h3>
                    <div className="section-content">
                      {selectedApplication.cvFileUrl && (
                        <div className="file-item">
                          <div className="file-icon">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                              <polyline points="14,2 14,8 20,8" />
                            </svg>
                          </div>
                          <div className="file-content">
                            <label className="detail-label">CV Document</label>
                            <a
                              href={selectedApplication.cvFileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-link"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15,3 21,3 21,9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              View CV Document
                            </a>
                          </div>
                        </div>
                      )}
                      {selectedApplication.socialLinks && (
                        <div className="file-item">
                          <div className="file-icon">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                          </div>
                          <div className="file-content">
                            <label className="detail-label">Social Links</label>
                            <button
                              onClick={handleOpenSocialLinks}
                              className="file-link"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15,3 21,3 21,9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              View Social Links
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              {selectedApplication.status === "approved" && (
                <button
                  className="primary-btn"
                  onClick={() =>
                    handleViewTrainerDetails(selectedApplication.userId)
                  }
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  View Trainer Profile
                </button>
              )}
              <button className="secondary-btn" onClick={handleCloseDialog}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Links Modal */}
      {socialLinksDialogOpen && (
        <div className="modal-overlay" onClick={handleCloseSocialLinks}>
          <div
            className="modal-container social-links-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-content">
                <Link size="24" color="white" variant="Bold" />
                <h2>Choose a Link to View</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseSocialLinks}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>
            <div className="modal-content">
              {links.length > 0 ? (
                <div className="links-list">
                  {links.map((link, index) => (
                    <button
                      key={index}
                      className="link-item"
                      onClick={() => handleClickLink(link)}
                    >
                      <Link size="16" />
                      <span>{link}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-links">
                  <Warning2 size="48" color="var(--text-secondary)" />
                  <p>No valid social links provided.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseSocialLinks}>
                <CloseCircle size="18" color="#dc3545" />
                Close
              </button>
            </div>
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

export default MyTrainerApplicationHistory;
