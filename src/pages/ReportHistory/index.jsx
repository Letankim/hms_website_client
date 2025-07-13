import { useContext, useEffect, useState, useCallback } from "react";
import {
  Eye,
  SearchNormal1,
  Filter,
  CloseCircle,
  Warning2,
  DocumentText,
  Calendar,
  ArrowRight2,
  ArrowLeft2,
  Flag,
} from "iconsax-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiPostReportService from "services/apiPostReportService";
import "./MyReportHistory.css";
import {
  showErrorFetchAPI,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "handled", label: "Handled" },
];

const pageSizeOptions = [5, 10, 20, 50];

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const MyReportHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!user?.userId) {
      showInfoMessage("Please login to view your report history.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    setLoading(true);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        ValidPageSize: 10,
        SearchTerm: search.trim(),
        Status: status === "all" ? "" : status,
      };
      const res = await apiPostReportService.getMyReports(params);
      if (res.data) {
        setReports(res.data.reports || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } else {
        setReports([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setReports([]);
      setTotalPages(1);
      setTotalCount(0);
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);
    debouncedSetSearch(value);
  };

  useEffect(() => {
    setTempSearch(search);
    fetchReports();
  }, [fetchReports]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPageNumber(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number.parseInt(e.target.value, 10));
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    setPageNumber(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseDialog = () => {
    setDetailDialogOpen(false);
    setSelectedReport(null);
    document.body.style.overflow = "auto";
  };

  const handleClearFilters = () => {
    setTempSearch("");
    setSearch("");
    setStatus("");
    setPageNumber(1);
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
      case "pending":
        return "var(--accent-warning)";
      case "approved":
        return "var(--accent-success)";
      case "rejected":
        return "var(--accent-error)";
      case "handled":
        return "var(--accent-info)";
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

    if (pageNumber > 1) {
      pages.push(
        <button
          key="prev"
          className="report-pagination-btn"
          onClick={() => handlePageChange(pageNumber - 1)}
        >
          <ArrowLeft2 size="16" />
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className="report-pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="report-pagination-dots">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`report-pagination-btn ${
            i === pageNumber ? "active" : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="report-pagination-dots">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="report-pagination-btn"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    if (pageNumber < totalPages) {
      pages.push(
        <button
          key="next"
          className="report-pagination-btn"
          onClick={() => handlePageChange(pageNumber + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className="report-pagination-container">{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div key={index} className="report-card report-skeleton-card">
      <div className="report-avatar report-skeleton report-skeleton-avatar"></div>
      <div className="report-content">
        <div className="report-skeleton report-skeleton-title"></div>
        <div className="report-skeleton report-skeleton-description"></div>
        <div className="report-skeleton report-skeleton-description short"></div>
        <div className="report-meta">
          <div className="report-skeleton report-skeleton-chip"></div>
          <div className="report-skeleton report-skeleton-date"></div>
        </div>
      </div>
      <div className="report-actions">
        <div className="report-skeleton report-skeleton-action-btn"></div>
      </div>
    </div>
  );

  if (loading && reports.length === 0) {
    return (
      <div className="report-history-container">
        <div className="report-container">
          <div className="report-header-section">
            <div className="report-header-content">
              <div className="report-skeleton report-skeleton-header-title"></div>
            </div>
            <div className="report-skeleton report-skeleton-header-desc"></div>
          </div>
          <div className="report-filter-section">
            <div className="report-filter-grid">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="report-skeleton report-skeleton-filter"
                ></div>
              ))}
            </div>
          </div>
          <div className="report-list">
            {[...Array(5)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-history-container">
      <div className="report-container">
        {/* Header Section */}
        <div className="report-header-section">
          <div className="report-header-content">
            <div className="report-header-icon">
              <Flag size="40" color="var(--secondary-color)" variant="Bold" />
            </div>
            <h1 className="report-header-title">My Report History</h1>
          </div>
          <p className="report-header-description">
            View and manage your submitted report history
          </p>
        </div>

        {/* Filter Section */}
        <div className="report-filter-section">
          <div className="report-filter-header">
            <div className="report-filter-title">
              <Filter size="20" color="var(--accent-info)" variant="Bold" />
              <span>Search & Filter</span>
            </div>
            <div className="report-filter-actions">
              <button
                className="report-mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>
          <div className={`report-filter-content ${showFilters ? "show" : ""}`}>
            <div className="report-filter-grid">
              <div className="report-search-input-container">
                <div className="report-search-icon">
                  <SearchNormal1 size="20" color="var(--accent-info)" />
                </div>
                <input
                  type="text"
                  placeholder="Search reason/details..."
                  value={tempSearch}
                  onChange={handleSearchChange}
                  className="report-search-input"
                />
              </div>
              <div className="report-select-container">
                <label>Status</label>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="report-filter-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="report-select-container">
                <label>Per Page</label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="report-filter-select"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <button className="report-search-btn" onClick={fetchReports}>
                <SearchNormal1 size="16" color="#FFF" />
                Search
              </button>
              <button
                className="report-clear-filters-btn"
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
          <div className="report-error-message">
            <div className="report-error-content">
              <Warning2 size="20" color="white" />
              {error}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!error && (
          <div className="report-results-summary">
            Found <strong>{totalCount}</strong> report
            {totalCount !== 1 ? "s" : ""}
            {status && ` with status "${status}"`}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 && !loading ? (
          <div className="report-empty-state">
            <div className="report-empty-icon">
              <Flag size="80" color="var(--text-secondary)" />
            </div>
            <h3 className="report-empty-title">No reports found</h3>
            <p className="report-empty-description">
              Try adjusting your search criteria or submit a new report
            </p>
          </div>
        ) : (
          <>
            <div className="report-list">
              {loading
                ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                    renderSkeletonCard(i)
                  )
                : reports.map((report, index) => (
                    <div key={report.reportId} className="report-card">
                      <div className="report-avatar">
                        <Flag size="24" color="white" variant="Bold" />
                      </div>
                      <div className="report-content">
                        <div className="report-number">
                          #REPORT{(pageNumber - 1) * pageSize + index + 1}
                        </div>
                        <h3 className="report-reason" title={report.reasonText}>
                          {report.reasonText || "No reason provided"}
                        </h3>
                        <div
                          className="report-details"
                          dangerouslySetInnerHTML={{
                            __html:
                              report.details || "<em>No details provided.</em>",
                          }}
                        />
                        <div className="report-ids">
                          Report ID: #{report.reportId} | Post ID: #
                          {report.postId}
                        </div>
                        <div className="report-meta">
                          <span
                            className="report-status-chip"
                            style={{
                              backgroundColor: getStatusColor(report.status),
                            }}
                            onClick={() => {
                              setStatus(report.status);
                              setPageNumber(1);
                            }}
                          >
                            {report.status
                              ? report.status.charAt(0).toUpperCase() +
                                report.status.slice(1)
                              : "N/A"}
                          </span>
                          <span
                            className="report-date"
                            title={formatDate(report.createdAt)}
                          >
                            <Calendar size="14" />
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="report-actions">
                        <button
                          className="report-action-btn report-view-btn"
                          onClick={() => handleViewDetails(report)}
                          title="View Details"
                        >
                          <Eye size="16" color="#FFF" />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            <div className="report-pagination-section">
              <div className="report-page-size-selector">
                <label>Items per page:</label>
                <select value={pageSize} onChange={handlePageSizeChange}>
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              {renderPagination()}
              <div className="report-pagination-info">
                Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                reports
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {detailDialogOpen && selectedReport && (
        <div className="report-modal-overlay" onClick={handleCloseDialog}>
          <div
            className="report-modal-container report-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="report-modal-header">
              <div className="report-modal-header-content">
                <DocumentText size="24" color="white" variant="Bold" />
                <h2>Report Details</h2>
              </div>
              <button
                className="report-modal-close-btn"
                onClick={handleCloseDialog}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>
            <div className="report-modal-content">
              <div className="report-details-grid">
                <div className="report-detail-item">
                  <label>Report ID</label>
                  <span>#{selectedReport.reportId}</span>
                </div>
                <div className="report-detail-item">
                  <label>Post ID</label>
                  <span>#{selectedReport.postId}</span>
                </div>
                <div className="report-detail-item report-full-width">
                  <label>Reason</label>
                  <span>
                    {selectedReport.reasonText || "No reason provided"}
                  </span>
                </div>
                <div className="report-detail-item report-full-width">
                  <label>Details</label>
                  <span
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedReport.details ||
                        "<em>No details provided.</em>",
                    }}
                  />
                </div>
                <div className="report-detail-item report-full-width">
                  <label>Note</label>
                  <span>{selectedReport.note || "No note provided"}</span>
                </div>
                <div className="report-detail-item">
                  <label>Status</label>
                  <span
                    className="report-status-chip"
                    style={{
                      backgroundColor: getStatusColor(selectedReport.status),
                    }}
                  >
                    {selectedReport.status
                      ? selectedReport.status.charAt(0).toUpperCase() +
                        selectedReport.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="report-detail-item">
                  <label>Created At</label>
                  <span>{formatDate(selectedReport.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="report-modal-footer">
              <button className="report-cancel-btn" onClick={handleCloseDialog}>
                <CloseCircle size="18" color="var(--accent-error)" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="report-snackbar error">
          <div className="report-snackbar-content">
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button
              className="report-snackbar-close"
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

export default MyReportHistory;
