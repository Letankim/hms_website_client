import { useEffect, useState, useContext, useCallback } from "react";
import {
  Eye,
  SearchNormal1,
  Filter,
  CloseCircle,
  Warning2,
  Calendar,
  ArrowRight2,
  ArrowLeft2,
  Activity,
  Chart,
  Profile2User,
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
import AuthContext from "contexts/AuthContext";
import apiBodyMeasurementService from "services/apiBodyMeasurementService";
import "./BodyMeasurementPage.css";
import {
  showError,
  showErrorFetchAPI,
} from "components/ErrorHandler/showStatusMessage";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

const BMICategories = {
  UNDERWEIGHT: { range: "<18.5", color: "#0288d1" },
  NORMAL: { range: "18.5-24.9", color: "#689f38" },
  OVERWEIGHT: { range: "25-29.9", color: "#ffca28" },
  OBESE: { range: "≥30", color: "#d32f2f" },
};

const pageSizeOptions = [5, 10, 20];

function BMIGauge({ bmi }) {
  if (!bmi || isNaN(bmi) || bmi === "-") {
    return (
      <div className="body-measurement-bmi-unavailable">
        BMI: Not available (Height data missing)
      </div>
    );
  }

  const getColor = (bmiValue) => {
    if (bmiValue < 18.5) return BMICategories.UNDERWEIGHT.color;
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return BMICategories.NORMAL.color;
    if (bmiValue >= 25 && bmiValue <= 29.9)
      return BMICategories.OVERWEIGHT.color;
    return BMICategories.OBESE.color;
  };

  const getCategory = (bmiValue) => {
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue >= 18.5 && bmiValue <= 24.9) return "Normal";
    if (bmiValue >= 25 && bmiValue <= 29.9) return "Overweight";
    return "Obese";
  };

  const needleAngle = ((bmi - 15) / 35) * 180 - 90;
  const category = getCategory(bmi);

  return (
    <div className="body-measurement-bmi-gauge">
      <svg width="200" height="120" className="body-measurement-bmi-svg">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="20"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor(bmi)}
          strokeWidth="15"
          strokeDasharray="50 50 50 50 50"
          transform="rotate(-90 100 100)"
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="#000"
          strokeWidth="2"
          transform={`rotate(${needleAngle} 100 100)`}
        />
        <circle cx="100" cy="100" r="5" fill="#000" />
        <text x="20" y="110" fill="#0288d1" fontSize="12">
          {BMICategories.UNDERWEIGHT.range}
        </text>
        <text x="70" y="110" fill="#689f38" fontSize="12">
          {BMICategories.NORMAL.range}
        </text>
        <text x="120" y="110" fill="#ffca28" fontSize="12">
          {BMICategories.OVERWEIGHT.range}
        </text>
        <text x="170" y="110" fill="#d32f2f" fontSize="12">
          {BMICategories.OBESE.range}
        </text>
      </svg>
      <div
        className="body-measurement-bmi-value"
        style={{ color: getColor(bmi) }}
      >
        Your BMI: {bmi.toFixed(1)}
      </div>
      <div className="body-measurement-bmi-category">Category: {category}</div>
    </div>
  );
}

const BodyMeasurementPage = () => {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bmiData, setBmiData] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({
    minWeight: "",
    maxWeight: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [selectedPart, setSelectedPart] = useState("shoulder");
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user || !user.userId) throw new Error("Not logged in");
      const queryParams = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        StartDate: startDate || undefined,
        EndDate: endDate || undefined,
        MinWeight: filters.minWeight ? Number(filters.minWeight) : undefined,
        MaxWeight: filters.maxWeight ? Number(filters.maxWeight) : undefined,
        Status: "active",
      };
      const res = await apiBodyMeasurementService.getMyBodyMeasurements(
        queryParams
      );
      const recs = res.data?.records || [];
      setRecords(recs);
      setTotalCount(res.data?.totalCount || 0);
      setTotalPages(res.data?.totalPages || 1);

      if (recs.length > 0) {
        const latest = recs.reduce((latest, current) =>
          new Date(current.measurementDate) > new Date(latest.measurementDate)
            ? current
            : latest
        );
        setSelectedMeasurement(latest);
      }

      const bmiResults = {};
      for (const rec of recs) {
        if (
          !rec.weight ||
          !rec.height ||
          isNaN(rec.weight) ||
          isNaN(rec.height)
        ) {
          bmiResults[rec.measurementId] = { bmi: "-", weightCategory: "-" };
          continue;
        }
        const bmi = calculateBMI(rec.weight, rec.height);
        const category = getWeightCategory(bmi);
        bmiResults[rec.measurementId] = { bmi, weightCategory: category };
      }
      setBmiData(bmiResults);
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setLoading(false);
    }
  }, [user, pageNumber, pageSize, startDate, endDate, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateBMI = (weight, height) => {
    if (!weight || !height || isNaN(weight) || isNaN(height)) return "-";
    const heightM = height / 100;
    return Number((weight / (heightM * heightM)).toFixed(2));
  };

  const getWeightCategory = (bmi) => {
    if (bmi === "-") return "-";
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi <= 24.9) return "Normal";
    if (bmi >= 25 && bmi <= 29.9) return "Overweight";
    return "Obese";
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

  const handleViewClick = (record) => {
    setSelectedRecord(record);
    setOpenViewDialog(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseDialog = () => {
    setOpenViewDialog(false);
    setSelectedRecord(null);
    document.body.style.overflow = "auto";
  };

  const handleMeasurementChange = (e) => {
    const measurementId = e.target.value;
    const selected = records.find((rec) => rec.measurementId === measurementId);
    setSelectedMeasurement(selected);
    setSelectedPart("shoulder");
  };

  const handleBodyPartClick = (part) => {
    setSelectedPart(part);
  };

  const getMeasurementValue = (part) => {
    if (!selectedMeasurement) return "N/A";
    switch (part) {
      case "head":
        return selectedMeasurement.neckCm
          ? `${selectedMeasurement.neckCm.toFixed(1)} cm (Neck)`
          : "N/A";
      case "cheast":
        return selectedMeasurement.chestCm
          ? `${selectedMeasurement.chestCm.toFixed(1)} cm (Chest)`
          : "N/A";
      case "stomach":
        return selectedMeasurement.waistCm
          ? `${selectedMeasurement.waistCm.toFixed(1)} cm (Waist)`
          : "N/A";
      case "arm":
        return selectedMeasurement.bicepCm
          ? `${selectedMeasurement.bicepCm.toFixed(1)} cm (Bicep)`
          : "N/A";
      case "legs":
        return selectedMeasurement.thighCm
          ? `${selectedMeasurement.thighCm.toFixed(1)} cm (Thigh)`
          : "N/A";
      case "shoulder":
        return selectedMeasurement.weight
          ? `${selectedMeasurement.weight.toFixed(1)} kg (Weight)`
          : "N/A";
      case "hands":
        return selectedMeasurement.bodyFatPercentage
          ? `${selectedMeasurement.bodyFatPercentage.toFixed(1)} % (Body Fat)`
          : "N/A";
      default:
        return "N/A";
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
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
    labels: records.map((entry) => formatDate(entry.measurementDate)),
    datasets: [
      {
        label: "Weight (kg)",
        data: records.map((entry) => entry.weight || 0),
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
      {
        label: "Body Fat (%)",
        data: records.map((entry) => entry.bodyFatPercentage || 0),
        fill: false,
        borderColor: "#d81b60",
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#d81b60",
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
        text: "Weight & Body Fat Trends",
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
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            return `${label}: ${value}${
              label === "Weight (kg)" ? " kg" : " %"
            }`;
          },
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
          text: "Value (kg or %)",
          font: { size: 14, weight: "bold" },
          color: "#1a3c34",
        },
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { color: "#333" },
        suggestedMin:
          records.length > 0
            ? Math.min(
                ...records.map((entry) =>
                  Math.min(entry.weight || 0, entry.bodyFatPercentage || 0)
                )
              ) - 5
            : 0,
        suggestedMax:
          records.length > 0
            ? Math.max(
                ...records.map((entry) =>
                  Math.max(entry.weight || 0, entry.bodyFatPercentage || 0)
                )
              ) + 5
            : 100,
      },
    },
  };

  const averageStatistics =
    records.length > 0
      ? {
          weight: (
            records.reduce((sum, rec) => sum + (rec.weight || 0), 0) /
            records.length
          ).toFixed(1),
          bodyFatPercentage: (
            records.reduce(
              (sum, rec) => sum + (rec.bodyFatPercentage || 0),
              0
            ) / records.length
          ).toFixed(1),
        }
      : { weight: 0, bodyFatPercentage: 0 };

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
          className="body-measurement-pagination-btn"
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
          className="body-measurement-pagination-btn"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots1" className="body-measurement-pagination-dots">
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
          className={`body-measurement-pagination-btn ${
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
          <span key="dots2" className="body-measurement-pagination-dots">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="body-measurement-pagination-btn"
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
          className="body-measurement-pagination-btn"
          onClick={() => handlePageChange(pageNumber + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className="body-measurement-pagination-container">{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <tr key={index} className="body-measurement-skeleton-row">
      <td className="body-measurement-skeleton body-measurement-skeleton-date"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-value"></td>
      <td className="body-measurement-skeleton body-measurement-skeleton-action"></td>
    </tr>
  );

  const isFemale = true;

  if (loading && records.length === 0) {
    return (
      <div className="body-measurement-container">
        <div className="body-measurement-loading">
          <div className="body-measurement-loading-spinner">
            <Activity size="40" color="var(--accent-info)" />
          </div>
          <p>Loading measurements...</p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="body-measurement-container">
        <div className="body-measurement-error">
          <div className="body-measurement-error-card">
            <div className="body-measurement-error-icon">
              <Warning2 size="80" color="var(--accent-error)" />
            </div>
            <h2 className="body-measurement-error-title">Error Loading Data</h2>
            <p className="body-measurement-error-description">{error}</p>
            <button className="body-measurement-retry-btn" onClick={fetchData}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="body-measurement-container">
      <div className="body-measurement-content">
        {/* Header Section */}
        <div className="body-measurement-header-section">
          <div className="body-measurement-header-content">
            <div className="body-measurement-header-icon">
              <Profile2User
                size="40"
                color="var(--secondary-color)"
                variant="Bold"
              />
            </div>
            <h1 className="body-measurement-header-title">Body Measurements</h1>
          </div>
          <p className="body-measurement-header-description">
            Track and monitor your body measurement progress
          </p>
        </div>

        {/* Human Body SVG */}
        <div className="body-measurement-human-body-section">
          <div className="body-measurement-human-body-card">
            <div className="body-measurement-human-body-header">
              <h2 className="body-measurement-section-title">
                <Profile2User
                  size="24"
                  color="var(--secondary-color)"
                  variant="Bold"
                />
                Tracker
              </h2>
              {records.length > 0 && (
                <div className="body-measurement-selector">
                  <label>Select Measurement:</label>
                  <select
                    value={selectedMeasurement?.measurementId || ""}
                    onChange={handleMeasurementChange}
                    className="body-measurement-select"
                  >
                    {records.map((rec) => (
                      <option key={rec.measurementId} value={rec.measurementId}>
                        {formatDate(rec.measurementDate)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="body-measurement-human-body">
              {isFemale && (
                <svg
                  data-position="hair"
                  className={`body-measurement-hair ${
                    selectedPart === "head" ? "selected" : ""
                  }`}
                  onClick={() => handleBodyPartClick("head")}
                  xmlns="http://www.w3.org/2000/svg"
                  width="56.594"
                  height="20"
                  viewBox="0 0 56.594 20"
                >
                  <path
                    d="M10 20 C15 10, 25 0, 28.297 0 C31.594 0, 41.594 10, 46.594 20 L56.594 20 L56.594 15 C51.594 5, 41.594-5, 28.297 5 C15 15, 5 5, 0 15 L0 20 Z"
                    fill="#57c9d5"
                  />
                </svg>
              )}
              <svg
                data-position="head"
                className={`body-measurement-head ${
                  selectedPart === "head" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("head")}
                xmlns="http://www.w3.org/2000/svg"
                width="56.594"
                height="95.031"
                viewBox="0 0 56.594 95.031"
              >
                <path d="M15.92 68.5l8.8 12.546 3.97 13.984-9.254-7.38-4.622-15.848zm27.1 0l-8.8 12.546-3.976 13.988 9.254-7.38 4.622-15.848zm6.11-27.775l.108-11.775-21.16-14.742L8.123 26.133 8.09 40.19l-3.24.215 1.462 9.732 5.208 1.81 2.36 11.63 9.72 11.018 10.856-.324 9.56-10.37 1.918-11.952 5.207-1.81 1.342-9.517zm-43.085-1.84l-.257-13.82L28.226 11.9l23.618 15.755-.216 10.37 4.976-17.085L42.556 2.376 25.49 0 10.803 3.673.002 24.415z" />
              </svg>
              <svg
                data-position="shoulder"
                className={`body-measurement-shoulder ${
                  selectedPart === "shoulder" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("shoulder")}
                xmlns="http://www.w3.org/2000/svg"
                width="109.532"
                height="46.594"
                viewBox="0 0 109.532 46.594"
              >
                <path d="M38.244-.004l1.98 9.232-11.653 2.857-7.474-2.637zm33.032 0l-1.98 9.232 11.653 2.857 7.474-2.637zm21.238 10.54l4.044-2.187 12.656 14 .07 5.33S92.76 10.66 92.515 10.535zm-1.285.58c-.008.28 17.762 18.922 17.762 18.922l.537 16.557-6.157-10.55L91.5 30.988 83.148 15.6zm-74.224-.58L12.962 8.35l-12.656 14-.062 5.325s16.52-17.015 16.764-17.14zm1.285.58C18.3 11.396.528 30.038.528 30.038L-.01 46.595l6.157-10.55 11.87-5.056L26.374 15.6z" />
              </svg>
              <svg
                data-position="arm"
                className={`body-measurement-arm ${
                  selectedPart === "arm" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("arm")}
                xmlns="http://www.w3.org/2000/svg"
                width="156.344"
                height="119.25"
                viewBox="0 0 156.344 119.25"
              >
                <path d="M21.12 56.5a1.678 1.678 0 0 1-.427.33l.935 8.224 12.977-13.89 1.2-8.958A168.2 168.2 0 0 0 21.12 56.5zm1.387 12.522l-18.07 48.91 5.757 1.333 19.125-39.44 3.518-22.047zm-5.278-18.96l2.638 18.74-17.2 46.023L.01 113.05l6.644-35.518zm118.015 6.44a1.678 1.678 0 0 0 .426.33l-.934 8.222-12.977-13.89-1.2-8.958A168.2 168.2 0 0 1 135.24 56.5zm-1.39 12.52l18.073 48.91-5.758 1.333-19.132-39.44-3.52-22.05zm5.28-18.96l-2.64 18.74 17.2 46.023 2.658-1.775-6.643-35.518zm-103.1-12.323a1.78 1.78 0 0 1 .407-.24l3.666-27.345L33.07.015l-7.258 10.58-6.16 37.04.566 4.973a151.447 151.447 0 0 1 15.808-14.87zm84.3 0a1.824 1.824 0 0 0-.407-.24l-3.666-27.345L123.3.015l7.258 10.58 6.16 37.04-.566 4.973a151.447 151.447 0 0 0-15.822-14.87zM22.288 8.832l-3.3 35.276-2.2-26.238zm111.79 0l3.3 35.276 2.2-26.238z" />
              </svg>
              <svg
                data-position="cheast"
                className={`body-measurement-cheast ${
                  selectedPart === "cheast" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("cheast")}
                xmlns="http://www.w3.org/2000/svg"
                width="86.594"
                height="45.063"
                viewBox="0 0 86.594 45.063"
              >
                {isFemale ? (
                  <path d="M19.32 0l-9.225 16.488c0 5 5 10 10 10 5 0 10-5 10-10l-1.775 28.212-10-4.616-17.85 8.828 4.452-34.7zm47.934 0l9.225 16.488c0 5-5 10-10 10-5 0-10-5-10-10l1.775 28.212 10-4.616 17.844-8.828-4.45-34.7z" />
                ) : (
                  <path d="M19.32 0l-9.225 16.488-10.1 5.056 6.15 4.836 4.832 14.07 11.2 4.616 17.85-8.828-4.452-34.7zm47.934 0l9.225 16.488 10.1 5.056-6.15 4.836-4.833 14.07-11.2 4.616-17.844-8.828 4.45-34.7z" />
                )}
              </svg>
              <svg
                data-position="stomach"
                className={`body-measurement-stomach ${
                  selectedPart === "stomach" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("stomach")}
                xmlns="http://www.w3.org/2000/svg"
                width="75.25"
                height="107.594"
                viewBox="0 0 75.25 107.594"
              >
                <path d="M19.25 7.49l16.6-7.5-.5 12.16-14.943 7.662zm-10.322 8.9l6.9 3.848-.8-9.116zm5.617-8.732L1.32 2.15 6.3 15.6zm-8.17 9.267l9.015 5.514 1.54 11.028-8.795-5.735zm15.53 5.89l.332 8.662 12.286-2.665.664-11.826zm14.61 84.783L33.28 76.062l-.08-20.53-11.654-5.736-1.32 37.5zM22.735 35.64L22.57 46.3l11.787 3.166.166-16.657zm-14.16-5.255L16.49 35.9l1.1 11.25-8.8-7.06zm8.79 22.74l-9.673-7.28-.84 9.78L-.006 68.29l10.564 14.594 5.5.883 1.98-20.735zM56 7.488l-16.6-7.5.5 12.16 14.942 7.66zm10.32 8.9l-6.9 3.847.8-9.116zm-5.617-8.733L73.93 2.148l-4.98 13.447zm8.17 9.267l-9.015 5.514-1.54 11.03 8.8-5.736zm-15.53 5.89l-.332 8.662-12.285-2.665-.664-11.827zm-14.61 84.783l3.234-31.536.082-20.532 11.65-5.735 1.32 37.5zm13.78-71.957l.166 10.66-11.786 3.168-.166-16.657zm14.16-5.256l-7.915 5.514-1.1 11.25 8.794-7.06zm-8.79 22.743l9.673-7.28.84 9.78 6.862 12.66-10.564 14.597-5.5.883-1.975-20.74z" />
              </svg>
              <svg
                data-position="legs"
                className={`body-measurement-legs ${
                  selectedPart === "legs" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("legs")}
                xmlns="http://www.w3.org/2000/svg"
                width="93.626"
                height="286.625"
                viewBox="0 0 93.626 286.625"
              >
                <path d="M17.143 138.643l-.664 5.99 4.647 5.77 1.55 9.1 3.1 1.33 2.655-13.755 1.77-4.88-1.55-3.107zm20.582.444l-3.32 9.318-7.082 13.755 1.77 12.647 5.09-14.2 4.205-7.982zm-26.557-12.645l5.09 27.29-3.32-1.777-2.656 8.875zm22.795 42.374l-1.55 4.88-3.32 20.634-.442 27.51 4.65 26.847-.223-34.39 4.87-13.754.663-15.087zM23.34 181.24l1.106 41.267 8.853 33.28-9.628-4.55-16.045-57.8 5.533-36.384zm15.934 80.536l-.664 18.415-1.55 6.435h-4.647l-1.327-4.437-1.55-.222.332 4.437-5.864-1.778-1.55-.887-6.64-1.442-.22-5.214 6.418-10.87 4.426-5.548 10.844-4.437zM13.63 3.076v22.476l15.71 31.073 9.923 30.85L38.23 66.1zm25.49 30.248l.118-.148-.793-2.024L21.9 12.992l-1.242-.44L31.642 40.93zM32.865 44.09l6.812 17.6 2.274-21.596-1.344-3.43zM6.395 61.91l.827 25.34 12.816 35.257-3.928 10.136L3.5 88.133zM30.96 74.69l.345.826 6.47 15.48-4.177 38.342-6.594-3.526 5.715-35.7zm45.5 63.953l.663 5.99-4.647 5.77-1.55 9.1-3.1 1.33-2.655-13.755-1.77-4.88 1.55-3.107zm-20.582.444l3.32 9.318 7.08 13.755-1.77 12.647-5.09-14.2-4.2-7.987zm3.762 29.73l1.55 4.88 3.32 20.633.442 27.51-4.648 26.847.22-34.39-4.867-13.754-.67-15.087zm10.623 12.424l-1.107 41.267-8.852 33.28 9.627-4.55 16.046-57.8-5.533-36.384zM54.33 261.777l.663 18.415 1.546 6.435h4.648l1.328-4.437 1.55-.222-.333 4.437 5.863-1.778 1.55-.887 6.638-1.442.222-5.214-6.418-10.868-4.426-5.547-10.844-4.437zm25.643-258.7v22.476L64.26 56.625l-9.923 30.85L55.37 66.1zM54.48 33.326l-.118-.15.793-2.023L71.7 12.993l1.24-.44L61.96 40.93zm6.255 10.764l-6.812 17.6-2.274-21.595 1.344-3.43zm26.47 17.82l-.827 25.342-12.816 35.256 3.927 10.136 12.61-44.51zM62.64 74.693l-.346.825-6.47 15.48 4.178 38.342 6.594-3.527-5.715-35.7zm19.792 51.75l-5.09 27.29 3.32-1.776 2.655 8.875zM9.495-.007l.827 21.373-7.028 42.308-3.306-34.155zm2.068 27.323L26.24 59.707l3.307 26-6.2 36.58L9.91 85.046l-.827-38.342zM84.103-.01l-.826 21.375 7.03 42.308 3.306-34.155zm-2.066 27.325L67.36 59.707l-3.308 26 6.2 36.58 13.436-37.24.827-38.34z" />
              </svg>
              <svg
                data-position="hands"
                className={`body-measurement-hands ${
                  selectedPart === "hands" ? "selected" : ""
                }`}
                onClick={() => handleBodyPartClick("hands")}
                xmlns="http://www.w3.org/2000/svg"
                width="205"
                height="38.938"
                viewBox="0 0 205 38.938"
              >
                <path d="M21.255-.002l2.88 6.9 8.412 1.335.664 12.458-4.427 17.8-2.878-.22 2.8-11.847-2.99-.084-4.676 12.6-3.544-.446 4.4-12.736-3.072-.584-5.978 13.543-4.428-.445 6.088-14.1-2.1-1.25-7.528 12.012-3.764-.445L12.4 12.9l-1.107-1.78L.665 15.57 0 13.124l8.635-7.786zm162.49 0l-2.88 6.9-8.412 1.335-.664 12.458 4.427 17.8 2.878-.22-2.8-11.847 2.99-.084 4.676 12.6 3.544-.446-4.4-12.736 3.072-.584 5.978 13.543 4.428-.445-6.088-14.1 2.1-1.25 7.528 12.012 3.764-.445L192.6 12.9l1.107-1.78 10.628 4.45.665-2.447-8.635-7.786z" />
              </svg>
            </div>
            <div className="body-measurement-area-text">
              Area:{" "}
              <span className="body-measurement-data">
                {getMeasurementValue(selectedPart)}
              </span>
            </div>
          </div>
        </div>

        {/* Average Statistics */}
        <div className="body-measurement-stats-section">
          <div className="body-measurement-stats-card">
            <div className="body-measurement-stats-header">
              <h2 className="body-measurement-section-title">
                <Chart
                  size="24"
                  color="var(--secondary-color)"
                  variant="Bold"
                />
                Average Statistics
              </h2>
            </div>
            <div className="body-measurement-stats-grid">
              <div className="body-measurement-stat-item">
                <div className="body-measurement-stat-label">
                  Average Weight
                </div>
                <div className="body-measurement-stat-value">
                  {averageStatistics.weight} kg
                </div>
              </div>
              <div className="body-measurement-stat-item">
                <div className="body-measurement-stat-label">
                  Average Body Fat
                </div>
                <div className="body-measurement-stat-value">
                  {averageStatistics.bodyFatPercentage} %
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="body-measurement-filter-section">
          <div className="body-measurement-filter-header">
            <div className="body-measurement-filter-title">
              <Filter size="20" color="var(--accent-info)" variant="Bold" />
              <span>Search & Filter</span>
            </div>
            <div className="body-measurement-filter-actions">
              <button
                className="body-measurement-mobile-filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>
          <div
            className={`body-measurement-filter-content ${
              showFilters ? "show" : ""
            }`}
          >
            <div className="body-measurement-filter-grid">
              <div className="body-measurement-select-container">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="body-measurement-filter-select"
                />
              </div>
              <div className="body-measurement-select-container">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="body-measurement-filter-select"
                />
              </div>
              <div className="body-measurement-select-container">
                <label>Min Weight (kg)</label>
                <input
                  type="number"
                  name="minWeight"
                  value={filters.minWeight}
                  onChange={handleFilterChange}
                  className="body-measurement-filter-select"
                  placeholder="Min weight"
                />
              </div>
              <div className="body-measurement-select-container">
                <label>Max Weight (kg)</label>
                <input
                  type="number"
                  name="maxWeight"
                  value={filters.maxWeight}
                  onChange={handleFilterChange}
                  className="body-measurement-filter-select"
                  placeholder="Max weight"
                />
              </div>
              <div className="body-measurement-select-container">
                <label>Per Page</label>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="body-measurement-filter-select"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="body-measurement-clear-filters-btn"
                onClick={handleClearFilters}
              >
                <CloseCircle size="16" color="#1976d2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="body-measurement-chart-section">
          <div className="body-measurement-chart-card">
            <div className="body-measurement-chart-header">
              <h2 className="body-measurement-section-title">
                <Chart
                  size="24"
                  color="var(--secondary-color)"
                  variant="Bold"
                />
                Trends
              </h2>
            </div>
            <div className="body-measurement-chart-container">
              <Line
                data={chartData}
                options={chartOptions}
                plugins={[gradientPlugin]}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {!error && (
          <div className="body-measurement-results-summary">
            Found <strong>{totalCount}</strong> measurement
            {totalCount !== 1 ? "s" : ""}
            {startDate && ` from ${formatDate(startDate)}`}
            {endDate && ` to ${formatDate(endDate)}`}
          </div>
        )}

        {/* Table Section */}
        <div className="body-measurement-table-section">
          <div className="body-measurement-table-card">
            <div className="body-measurement-table-header">
              <h2 className="body-measurement-section-title">
                <Profile2User
                  size="24"
                  color="var(--secondary-color)"
                  variant="Bold"
                />
                Records
              </h2>
            </div>
            {records.length === 0 && !loading ? (
              <div className="body-measurement-empty-state">
                <div className="body-measurement-empty-icon">
                  <Profile2User size="80" color="var(--text-secondary)" />
                </div>
                <h3 className="body-measurement-empty-title">
                  No measurements found
                </h3>
                <p className="body-measurement-empty-description">
                  Try adjusting your filters or add your first measurement
                </p>
              </div>
            ) : (
              <>
                <div className="body-measurement-table-container">
                  <table className="body-measurement-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight (kg)</th>
                        <th>Body Fat (%)</th>
                        <th>Chest (cm)</th>
                        <th>Waist (cm)</th>
                        <th>Hip (cm)</th>
                        <th>Bicep (cm)</th>
                        <th>Thigh (cm)</th>
                        <th>Neck (cm)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                            renderSkeletonCard(i)
                          )
                        : records.map((rec) => (
                            <tr
                              key={rec.measurementId}
                              className="body-measurement-table-row"
                            >
                              <td>{formatDate(rec.measurementDate)}</td>
                              <td>
                                {rec.weight ? rec.weight.toFixed(1) : "-"}
                              </td>
                              <td>
                                {rec.bodyFatPercentage
                                  ? rec.bodyFatPercentage.toFixed(1)
                                  : "-"}
                              </td>
                              <td>
                                {rec.chestCm ? rec.chestCm.toFixed(1) : "-"}
                              </td>
                              <td>
                                {rec.waistCm ? rec.waistCm.toFixed(1) : "-"}
                              </td>
                              <td>{rec.hipCm ? rec.hipCm.toFixed(1) : "-"}</td>
                              <td>
                                {rec.bicepCm ? rec.bicepCm.toFixed(1) : "-"}
                              </td>
                              <td>
                                {rec.thighCm ? rec.thighCm.toFixed(1) : "-"}
                              </td>
                              <td>
                                {rec.neckCm ? rec.neckCm.toFixed(1) : "-"}
                              </td>
                              <td>
                                <button
                                  className="body-measurement-action-btn body-measurement-view-btn"
                                  onClick={() => handleViewClick(rec)}
                                  title="View Details"
                                >
                                  <Eye size="16" color="#FFF" />
                                </button>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="body-measurement-pagination-section">
                  <div className="body-measurement-page-size-selector">
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
                  <div className="body-measurement-pagination-info">
                    Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                    {Math.min(pageNumber * pageSize, totalCount)} of{" "}
                    {totalCount} measurements
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {openViewDialog && selectedRecord && (
        <div
          className="body-measurement-modal-overlay"
          onClick={handleCloseDialog}
        >
          <div
            className="body-measurement-modal-container body-measurement-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="body-measurement-modal-header">
              <div className="body-measurement-modal-header-content">
                <Profile2User size="24" color="white" variant="Bold" />
                <h2>Measurement Details</h2>
              </div>
              <button
                className="body-measurement-modal-close-btn"
                onClick={handleCloseDialog}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>
            <div className="body-measurement-modal-content">
              <div className="body-measurement-details-grid">
                <div className="body-measurement-detail-item">
                  <label>Measurement Date</label>
                  <span>{formatDate(selectedRecord.measurementDate)}</span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Weight (kg)</label>
                  <span>
                    {selectedRecord.weight
                      ? selectedRecord.weight.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Height (cm)</label>
                  <span>
                    {selectedRecord.height
                      ? selectedRecord.height.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Body Fat (%)</label>
                  <span>
                    {selectedRecord.bodyFatPercentage
                      ? selectedRecord.bodyFatPercentage.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Chest (cm)</label>
                  <span>
                    {selectedRecord.chestCm
                      ? selectedRecord.chestCm.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Waist (cm)</label>
                  <span>
                    {selectedRecord.waistCm
                      ? selectedRecord.waistCm.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Hip (cm)</label>
                  <span>
                    {selectedRecord.hipCm
                      ? selectedRecord.hipCm.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Bicep (cm)</label>
                  <span>
                    {selectedRecord.bicepCm
                      ? selectedRecord.bicepCm.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Thigh (cm)</label>
                  <span>
                    {selectedRecord.thighCm
                      ? selectedRecord.thighCm.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item">
                  <label>Neck (cm)</label>
                  <span>
                    {selectedRecord.neckCm
                      ? selectedRecord.neckCm.toFixed(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="body-measurement-detail-item body-measurement-full-width">
                  <label>Notes</label>
                  <span>{selectedRecord.notes || "No notes provided"}</span>
                </div>
                <div className="body-measurement-detail-item body-measurement-full-width">
                  <label>BMI Information</label>
                  <div className="body-measurement-bmi-container">
                    <BMIGauge
                      bmi={bmiData[selectedRecord.measurementId]?.bmi || "-"}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="body-measurement-modal-footer">
              <button
                className="body-measurement-cancel-btn"
                onClick={handleCloseDialog}
              >
                <CloseCircle size="18" color="#1976d2" />
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className="body-measurement-snackbar success">
          <div className="body-measurement-snackbar-content">
            <Activity size="20" color="white" variant="Bold" />
            <span>{successMessage}</span>
            <button
              className="body-measurement-snackbar-close"
              onClick={handleCloseSuccess}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMeasurementPage;
