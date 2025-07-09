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
  TickCircle,
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
  const [status, setStatus] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [socialLinksDialogOpen, setSocialLinksDialogOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPageNumber(1);
  };

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

    // Previous button
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

    // First page
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

    // Visible pages
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

    // Last page
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

    // Next button
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
              <button
                className="create-application-btn"
                onClick={handleCreateNewApplication}
              >
                <Add size="20" color="#FFF" />
                Create New Application
              </button>
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
                  value={search}
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
              <button className="search-btn" onClick={fetchApplications}>
                Search
              </button>
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
                            src={app.profileImageUrl || "/placeholder.svg"}
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
          <div
            className="modal-container details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-content">
                <DocumentText size="24" color="white" variant="Bold" />
                <h2>Application Details</h2>
              </div>
              <button className="modal-close-btn" onClick={handleCloseDialog}>
                <CloseCircle size="24" color="white" />
              </button>
            </div>
            <div className="modal-content">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Full Name</label>
                  <span>{selectedApplication.fullName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{selectedApplication.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <span>{selectedApplication.phoneNumber || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <span>
                    {selectedApplication.dateOfBirth
                      ? new Date(
                          selectedApplication.dateOfBirth
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <span>{selectedApplication.gender || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Experience Years</label>
                  <span>{selectedApplication.experienceYears || "N/A"}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Bio</label>
                  <span>{selectedApplication.bio || "No bio provided"}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Specialties</label>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedApplication.specialties ||
                        "No specialties provided",
                    }}
                  ></span>
                </div>
                <div className="detail-item full-width">
                  <label>Certifications</label>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedApplication.certifications ||
                        "No certifications provided",
                    }}
                  ></span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
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
                  <label>Submitted At</label>
                  <span>{formatDate(selectedApplication.submittedAt)}</span>
                </div>
                <div className="detail-item">
                  <label>Reviewed At</label>
                  <span>
                    {selectedApplication.reviewedAt
                      ? formatDate(selectedApplication.reviewedAt)
                      : "Not reviewed"}
                  </span>
                </div>
                <div className="detail-item full-width">
                  <label>Notes</label>
                  <span>
                    {selectedApplication.notes || "No notes provided"}
                  </span>
                </div>
                {selectedApplication.cvFileUrl && (
                  <div className="detail-item full-width">
                    <label>CV</label>
                    <div className="file-link">
                      <Document size="16" />
                      <a
                        href={selectedApplication.cvFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View CV
                      </a>
                    </div>
                  </div>
                )}
                {selectedApplication.socialLinks && (
                  <div className="detail-item full-width">
                    <label>Social Links</label>
                    <div className="social-links">
                      <Link size="16" />
                      <button
                        onClick={handleOpenSocialLinks}
                        className="link-btn"
                      >
                        View Social Links
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedApplication.status === "approved" && (
                <button
                  className="trainer-profile-btn"
                  onClick={() =>
                    handleViewTrainerDetails(selectedApplication.userId)
                  }
                >
                  <Profile size="18" />
                  View Trainer Profile
                </button>
              )}
              <button className="cancel-btn" onClick={handleCloseDialog}>
                <CloseCircle size="18" color="#dc3545" />
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
