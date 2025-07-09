import React, { useState, useEffect } from "react";
import {
  Filter,
  CloseCircle,
  Warning2,
  ArrowRight2,
  ArrowLeft2,
  Activity,
  Chart,
  Weight,
} from "iconsax-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import apiWeightHistoryService from "services/apiWeightHistoryService";
import { extractErrors } from "components/ErrorHandler/extractErrors";
import "./WeightHistoryPage.css";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const pageSizeOptions = [5, 10, 20];

const WeightHistoryPage = () => {
  const [weightHistory, setWeightHistory] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({ minWeight: "", maxWeight: "" });
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchWeightHistory();
  }, [pageNumber, pageSize, startDate, endDate, filters]);

  const fetchWeightHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        pageNumber,
        pageSize,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        minWeight: filters.minWeight ? Number(filters.minWeight) : undefined,
        maxWeight: filters.maxWeight ? Number(filters.maxWeight) : undefined,
      };
      const response = await apiWeightHistoryService.getMyWeightHistory(
        queryParams
      );
      setWeightHistory(response.data.records || []);
      setTotalCount(response.data.totalCount || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPageNumber(1);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPageNumber(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilters({ minWeight: "", maxWeight: "" });
    setPageNumber(1);
  };

  const handlePageChange = (newPage) => {
    setPageNumber(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
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

  const gradientPlugin = {
    id: "gradientBackground",
    beforeDraw: (chart) => {
      const {
        ctx,
        chartArea: { top, bottom, left, right },
      } = chart;
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0, "rgba(220, 237, 200, 0.3)");
      gradient.addColorStop(1, "rgba(255, 245, 204, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(left, top, right - left, bottom - top);
    },
  };

  const chartData = {
    labels: weightHistory.map((entry) => formatDate(entry.recordedAt)),
    datasets: [
      {
        label: "Weight (kg)",
        data: weightHistory.map((entry) => entry.weight),
        fill: true,
        backgroundColor: "rgba(104, 159, 56, 0.2)",
        borderColor: "#689f38",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: "#689f38",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14, weight: "bold" },
          color: "#333",
        },
      },
      title: {
        display: true,
        text: "Weight Trends",
        font: { size: 20, weight: "bold" },
        color: "#1a3c34",
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1a3c34",
        bodyColor: "#333",
        borderColor: "#689f38",
        borderWidth: 1,
        callbacks: {
          label: (context) => `Weight: ${context.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Date",
          font: { size: 14, weight: "bold" },
          color: "#1a3c34",
        },
        grid: { display: false },
        ticks: { color: "#333" },
      },
      y: {
        title: {
          display: true,
          text: "Weight (kg)",
          font: { size: 14, weight: "bold" },
          color: "#1a3c34",
        },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { color: "#333" },
        suggestedMin:
          weightHistory.length > 0
            ? Math.min(...weightHistory.map((entry) => entry.weight)) - 5
            : 0,
        suggestedMax:
          weightHistory.length > 0
            ? Math.max(...weightHistory.map((entry) => entry.weight)) + 5
            : 100,
      },
    },
  };

  const averageWeight =
    weightHistory.length > 0
      ? (
          weightHistory.reduce((sum, entry) => sum + (entry.weight || 0), 0) /
          weightHistory.length
        ).toFixed(1)
      : 0;

  const latestWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1].weight.toFixed(1)
      : 0;

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
          className="weight-history-pagination-btn"
          onClick={() => handlePageChange(pageNumber - 1)}
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
          className="weight-history-pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="weight-history-pagination-dots">
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
          className={`weight-history-pagination-btn ${
            i === pageNumber ? "active" : ""
          }`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots2" className="weight-history-pagination-dots">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="weight-history-pagination-btn"
          onClick={() => handlePageChange(totalPages)}
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
          className="weight-history-pagination-btn"
          onClick={() => handlePageChange(pageNumber + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className="weight-history-pagination-container">{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <tr key={index} className="weight-history-skeleton-row">
      <td className="weight-history-skeleton weight-history-skeleton-date"></td>
      <td className="weight-history-skeleton weight-history-skeleton-value"></td>
    </tr>
  );

  if (loading && weightHistory.length === 0) {
    return (
      <div className="weight-history-container">
        <div className="weight-history-loading">
          <div className="weight-history-loading-spinner">
            <Activity size="40" color="var(--accent-info)" />
          </div>
          <p>Loading weight history...</p>
        </div>
      </div>
    );
  }

  if (error && weightHistory.length === 0) {
    return (
      <div className="weight-history-container">
        <div className="weight-history-error">
          <div className="weight-history-error-card">
            <div className="weight-history-error-icon">
              <Warning2 size="80" color="var(--accent-error)" />
            </div>
            <h2 className="weight-history-error-title">Error Loading Data</h2>
            <p className="weight-history-error-description">{error}</p>
            <button
              className="weight-history-retry-btn"
              onClick={fetchWeightHistory}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weight-history-container">
      <div className="weight-history-content">
        {/* Header Section */}
        <div className="weight-history-header-section">
          <div className="weight-history-header-content">
            <div className="weight-history-header-icon">
              <Weight size="40" color="var(--secondary-color)" variant="Bold" />
            </div>
            <h1 className="weight-history-header-title">Weight History</h1>
          </div>
          <p className="weight-history-header-description">
            Track your weight changes over time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="weight-history-stats-section">
          <div className="weight-history-stats-grid">
            <div className="weight-history-stat-card">
              <div className="weight-history-stat-content">
                <div className="weight-history-stat-label">Average Weight</div>
                <div className="weight-history-stat-value">
                  {averageWeight} kg
                </div>
              </div>
            </div>
            <div className="weight-history-stat-card">
              <div className="weight-history-stat-content">
                <div className="weight-history-stat-label">Total Records</div>
                <div className="weight-history-stat-value">{totalCount}</div>
              </div>
            </div>
            <div className="weight-history-stat-card">
              <div className="weight-history-stat-content">
                <div className="weight-history-stat-label">Latest Weight</div>
                <div className="weight-history-stat-value">
                  {latestWeight} kg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="weight-history-filter-section">
          <div className="weight-history-filter-header">
            <div className="weight-history-filter-title">
              <Filter size="20" color="var(--accent-info)" variant="Bold" />
              <span>Search & Filter</span>
            </div>
            <div className="weight-history-filter-actions">
              <button
                className="weight-history-mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>
          <div
            className={`weight-history-filter-content ${
              showFilters ? "show" : ""
            }`}
          >
            <div className="weight-history-filter-grid">
              <div className="weight-history-select-container">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="weight-history-filter-select"
                />
              </div>
              <div className="weight-history-select-container">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="weight-history-filter-select"
                />
              </div>
              <div className="weight-history-select-container">
                <label>Min Weight (kg)</label>
                <input
                  type="number"
                  name="minWeight"
                  value={filters.minWeight}
                  onChange={handleFilterChange}
                  className="weight-history-filter-select"
                  placeholder="Min weight"
                />
              </div>
              <div className="weight-history-select-container">
                <label>Max Weight (kg)</label>
                <input
                  type="number"
                  name="maxWeight"
                  value={filters.maxWeight}
                  onChange={handleFilterChange}
                  className="weight-history-filter-select"
                  placeholder="Max weight"
                />
              </div>
              <div className="weight-history-select-container">
                <label>Per Page</label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="weight-history-filter-select"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="weight-history-clear-filters-btn"
                onClick={handleClearFilters}
              >
                <CloseCircle size="16" color="#1976d2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="weight-history-chart-section">
          <div className="weight-history-chart-card">
            <div className="weight-history-chart-header">
              <h2 className="weight-history-section-title">
                <Chart
                  size="24"
                  color="var(--secondary-color)"
                  variant="Bold"
                />
                Weight Trends
              </h2>
            </div>
            <div className="weight-history-chart-container">
              {weightHistory.length === 0 ? (
                <div className="weight-history-empty-chart">
                  <div className="weight-history-empty-icon">
                    <Weight size="80" color="var(--text-secondary)" />
                  </div>
                  <h3 className="weight-history-empty-title">
                    No weight records found
                  </h3>
                  <p className="weight-history-empty-description">
                    Try adjusting your filters or add a new weight record
                  </p>
                </div>
              ) : (
                <Line
                  data={chartData}
                  options={chartOptions}
                  plugins={[gradientPlugin]}
                />
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && showError && (
          <div className="weight-history-error-message">
            <div className="weight-history-error-content">
              <Warning2 size="20" color="white" />
              {error}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!error && (
          <div className="weight-history-results-summary">
            Found <strong>{totalCount}</strong> weight record
            {totalCount !== 1 ? "s" : ""}
            {startDate && ` from ${formatDate(startDate)}`}
            {endDate && ` to ${formatDate(endDate)}`}
          </div>
        )}

        {/* Table Section */}
        <div className="weight-history-table-section">
          <div className="weight-history-table-card">
            <div className="weight-history-table-header">
              <h2 className="weight-history-section-title">
                <Weight
                  size="24"
                  color="var(--secondary-color)"
                  variant="Bold"
                />
                Weight Records
              </h2>
            </div>
            {weightHistory.length === 0 && !loading ? (
              <div className="weight-history-empty-state">
                <div className="weight-history-empty-icon">
                  <Weight size="80" color="var(--text-secondary)" />
                </div>
                <h3 className="weight-history-empty-title">
                  No weight records found
                </h3>
                <p className="weight-history-empty-description">
                  Try adjusting your filters or add your first weight record
                </p>
              </div>
            ) : (
              <>
                <div className="weight-history-table-container">
                  <table className="weight-history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                            renderSkeletonCard(i)
                          )
                        : weightHistory.map((entry) => (
                            <tr
                              key={entry.historyId}
                              className="weight-history-table-row"
                            >
                              <td>{formatDate(entry.recordedAt)}</td>
                              <td>
                                <span className="weight-history-weight-value">
                                  {entry.weight.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="weight-history-pagination-section">
                  <div className="weight-history-page-size-selector">
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
                  <div className="weight-history-pagination-info">
                    Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                    {Math.min(pageNumber * pageSize, totalCount)} of{" "}
                    {totalCount} records
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="weight-history-snackbar success">
          <div className="weight-history-snackbar-content">
            <Activity size="20" color="white" variant="Bold" />
            <span>{successMessage}</span>
            <button
              className="weight-history-snackbar-close"
              onClick={handleCloseSuccess}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="weight-history-snackbar error">
          <div className="weight-history-snackbar-content">
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button
              className="weight-history-snackbar-close"
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

export default WeightHistoryPage;
