import React, { useEffect, useState, useContext } from "react";
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
import {
  Filter,
  CloseCircle,
  Eye,
  ArrowLeft2,
  ArrowRight2,
  TrendUp,
  Calendar,
  Drop,
  Warning2,
} from "iconsax-react";
import AuthContext from "contexts/AuthContext";
import apiUserWaterLogService from "services/apiUserWaterLogService";
import "./UserWaterLogPage.css";
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

const UserWaterLogPage = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({ minAmount: "", maxAmount: "" });
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchData();
  }, [user, pageNumber, pageSize, startDate, endDate, filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user || !user.userId) throw new Error("Not logged in");

      const queryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        StartDate: startDate || undefined,
        EndDate: endDate || undefined,
        MinAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
        MaxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
        Status: "active",
      };

      const res = await apiUserWaterLogService.getMyWaterLogs(queryParams);
      const recs = res.data?.records || [];
      setRecords(recs);
      setTotalCount(res.data?.totalCount || 0);
      setTotalPages(res.data?.totalPages || 1);
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
    setFilters({ minAmount: "", maxAmount: "" });
    setPageNumber(1);
  };

  const handlePageChange = (value) => {
    setPageNumber(value);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageNumber(1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedRecord(null);
  };

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
  };

  const gradientPlugin = {
    id: "gradientBackground",
    beforeDraw: (chart) => {
      const {
        ctx,
        chartArea: { top, bottom, left, right },
      } = chart;
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0, "rgba(200, 230, 255, 0.3)");
      gradient.addColorStop(1, "rgba(204, 245, 255, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(left, top, right - left, bottom - top);
    },
  };

  ChartJS.register(gradientPlugin);

  const chartData = {
    labels: records.map((entry) => entry.consumptionDate),
    datasets: [
      {
        label: "Water Intake (ml)",
        data: records.map((entry) => entry.amountMl || 0),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "var(--accent-info)",
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "var(--accent-info)",
        pointBorderColor: "var(--background-white)",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "var(--background-white)",
        titleColor: "var(--text-primary)",
        bodyColor: "var(--text-secondary)",
        borderColor: "var(--accent-info)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "var(--text-secondary)", font: { size: 12 } },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { color: "var(--text-secondary)", font: { size: 12 } },
      },
    },
  };

  const averageWaterIntake =
    records.length > 0
      ? (
          records.reduce((sum, rec) => sum + (rec.amountMl || 0), 0) /
          records.length
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <div className="user-water-log-loading">
        <div className="user-water-log-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-water-log-error-container">
        <div className="user-water-log-error-content">
          <div className="user-water-log-error-card">
            <Warning2 size={48} color="var(--accent-error)" />
            <h3>Error Loading Water Logs</h3>
            <p>{error}</p>
            <button className="user-water-log-retry-btn" onClick={fetchData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-water-log-container">
      {/* Header */}
      <div className="user-water-log-header">
        <div className="user-water-log-header-content">
          <div className="user-water-log-header-info">
            <div className="user-water-log-header-icon">
              <Drop size={24} color="var(--accent-info)" />
            </div>
            <div className="user-water-log-header-text">
              <h1>Water Intake Logs</h1>
              <p>Track your daily hydration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="user-water-log-content">
        {/* Stats Cards */}
        <div className="user-water-log-stats">
          <div className="user-water-log-stat-card user-water-log-stat-average">
            <div className="user-water-log-stat-content">
              <div className="user-water-log-stat-info">
                <span className="user-water-log-stat-label">
                  Average Intake
                </span>
                <span className="user-water-log-stat-value">
                  {averageWaterIntake} ml
                </span>
              </div>
              <TrendUp size={32} color="var(--accent-success)" />
            </div>
          </div>

          <div className="user-water-log-stat-card user-water-log-stat-total">
            <div className="user-water-log-stat-content">
              <div className="user-water-log-stat-info">
                <span className="user-water-log-stat-label">Total Records</span>
                <span className="user-water-log-stat-value">{totalCount}</span>
              </div>
              <Calendar size={32} color="var(--accent-info)" />
            </div>
          </div>

          <div className="user-water-log-stat-card user-water-log-stat-week">
            <div className="user-water-log-stat-content">
              <div className="user-water-log-stat-info">
                <span className="user-water-log-stat-label">This Week</span>
                <span className="user-water-log-stat-value">
                  {records.length}
                </span>
              </div>
              <Drop size={32} color="var(--accent-warning)" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="user-water-log-filters-card">
          <div className="user-water-log-filters-header">
            <div className="user-water-log-filters-title">
              <Filter size={20} color="var(--accent-info)" />
              <span>Filters</span>
            </div>
            <button
              className="user-water-log-filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
          <div
            className={`user-water-log-filters-content ${
              showFilters ? "user-water-log-filters-show" : ""
            }`}
          >
            <div className="user-water-log-filters-grid">
              <div className="user-water-log-filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="user-water-log-filter-input"
                />
              </div>
              <div className="user-water-log-filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="user-water-log-filter-input"
                />
              </div>
              <div className="user-water-log-filter-group">
                <label>Min Amount (ml)</label>
                <input
                  type="number"
                  name="minAmount"
                  value={filters.minAmount}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="user-water-log-filter-input"
                />
              </div>
              <div className="user-water-log-filter-group">
                <label>Max Amount (ml)</label>
                <input
                  type="number"
                  name="maxAmount"
                  value={filters.maxAmount}
                  onChange={handleFilterChange}
                  placeholder="5000"
                  className="user-water-log-filter-input"
                />
              </div>
              <div className="user-water-log-filter-group">
                <button
                  className="user-water-log-clear-btn"
                  onClick={handleClearFilters}
                >
                  <CloseCircle size={16} color="#dc3545" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="user-water-log-chart-card">
          <div className="user-water-log-chart-header">
            <h3>Water Intake Trends</h3>
          </div>
          <div className="user-water-log-chart-content">
            {records.length === 0 ? (
              <div className="user-water-log-empty-state">
                <Drop size={80} color="var(--text-secondary)" />
                <h4>No water intake records found</h4>
                <p>Try adjusting your filters or add a new water log</p>
              </div>
            ) : (
              <div className="user-water-log-chart">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="user-water-log-table-card">
          <div className="user-water-log-table-header">
            <h3>Water Log Records</h3>
            <div className="user-water-log-page-size">
              <label>Records per page</label>
              <select
                value={pageSize.toString()}
                onChange={handlePageSizeChange}
                className="user-water-log-page-size-select"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
              </select>
            </div>
          </div>
          <div className="user-water-log-table-content">
            {records.length === 0 ? (
              <div className="user-water-log-empty-state">
                <Drop size={80} color="var(--text-secondary)" />
                <h4>No water log records found</h4>
                <p>Try adjusting your filters or add a new water log</p>
              </div>
            ) : (
              <>
                <div className="user-water-log-table-wrapper">
                  <table className="user-water-log-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount (ml)</th>
                        <th className="user-water-log-hide-mobile">Notes</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec) => (
                        <tr key={rec.logId}>
                          <td className="user-water-log-date-cell">
                            {rec.consumptionDate}
                          </td>
                          <td>
                            <span className="user-water-log-amount">
                              {rec.amountMl ? rec.amountMl.toFixed(0) : "-"}
                            </span>
                          </td>
                          <td className="user-water-log-hide-mobile user-water-log-notes-cell">
                            {rec.notes || "-"}
                          </td>
                          <td>
                            <span
                              className={`user-water-log-status ${
                                rec.status === "active"
                                  ? "user-water-log-status-active"
                                  : "user-water-log-status-default"
                              }`}
                            >
                              {rec.status || "-"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="user-water-log-view-btn"
                              onClick={() => handleViewClick(rec)}
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="user-water-log-pagination">
                    <div className="user-water-log-pagination-info">
                      Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                      {Math.min(pageNumber * pageSize, totalCount)} of{" "}
                      {totalCount} results
                    </div>
                    <div className="user-water-log-pagination-controls">
                      <button
                        className="user-water-log-pagination-btn"
                        onClick={() =>
                          handlePageChange(Math.max(1, pageNumber - 1))
                        }
                        disabled={pageNumber === 1}
                      >
                        <ArrowLeft2 size={16} />
                      </button>
                      <span className="user-water-log-pagination-text">
                        Page {pageNumber} of {totalPages}
                      </span>
                      <button
                        className="user-water-log-pagination-btn"
                        onClick={() =>
                          handlePageChange(Math.min(totalPages, pageNumber + 1))
                        }
                        disabled={pageNumber === totalPages}
                      >
                        <ArrowRight2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* View Dialog */}
      {openViewDialog && (
        <div
          className="user-water-log-modal-overlay"
          onClick={handleCloseViewDialog}
        >
          <div
            className="user-water-log-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="user-water-log-modal-header">
              <h3>Water Log Details</h3>
              <button
                className="user-water-log-modal-close"
                onClick={handleCloseViewDialog}
              >
                <CloseCircle size={20} />
              </button>
            </div>
            <div className="user-water-log-modal-content">
              {selectedRecord && (
                <div className="user-water-log-modal-fields">
                  <div className="user-water-log-modal-field">
                    <label>Consumption Date</label>
                    <input
                      type="date"
                      value={selectedRecord.consumptionDate || ""}
                      readOnly
                      className="user-water-log-modal-input"
                    />
                  </div>
                  <div className="user-water-log-modal-field">
                    <label>Amount (ml)</label>
                    <input
                      type="number"
                      value={
                        selectedRecord.amountMl
                          ? selectedRecord.amountMl.toFixed(1)
                          : ""
                      }
                      readOnly
                      className="user-water-log-modal-input"
                    />
                  </div>
                  <div className="user-water-log-modal-field">
                    <label>Recorded At</label>
                    <input
                      type="datetime-local"
                      value={
                        selectedRecord.recordedAt
                          ? new Date(selectedRecord.recordedAt)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      readOnly
                      className="user-water-log-modal-input"
                    />
                  </div>
                  <div className="user-water-log-modal-field">
                    <label>Notes</label>
                    <textarea
                      value={selectedRecord.notes || ""}
                      readOnly
                      rows={3}
                      className="user-water-log-modal-textarea"
                    />
                  </div>
                  <div className="user-water-log-modal-field">
                    <label>Status</label>
                    <input
                      type="text"
                      value={selectedRecord.status || ""}
                      readOnly
                      className="user-water-log-modal-input"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="user-water-log-modal-footer">
              <button
                className="user-water-log-modal-btn"
                onClick={handleCloseViewDialog}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div
          className={`user-water-log-snackbar user-water-log-snackbar-${snackbar.severity}`}
        >
          <span>{snackbar.message}</span>
          <button
            className="user-water-log-snackbar-close"
            onClick={handleCloseSnackbar}
          >
            <CloseCircle size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserWaterLogPage;
