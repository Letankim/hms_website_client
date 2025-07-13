import styles from "./ServicePackage.module.css";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import apiServicePackageService from "services/apiServicePackageService";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";
import { Box, TextField, Button, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const ServicePackage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: search.trim(),
        Status: "active",
      };
      const res = await apiServicePackageService.getAllActivePackages(params);
      setPackages(res.data?.packages || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      setPackages([]);
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search]);

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

  const handleClearSearch = () => {
    setTempSearch("");
    setSearch("");
    setPageNumber(1);
  };

  useEffect(() => {
    setTempSearch(search);
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenDetail = (pkg) => {
    navigate(`/service-packages/${pkg.packageId}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setPageNumber(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pageNumber - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (pageNumber > 1) {
      pages.push(
        <button
          key="prev"
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(pageNumber - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
      );
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(1)}
          aria-label="Page 1"
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

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles["pagination-btn"]} ${
            i === pageNumber ? styles["active"] : ""
          }`}
          onClick={() => handlePageChange(i)}
          aria-label={`Page ${i}`}
        >
          {i}
        </button>
      );
    }


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
          onClick={() => handlePageChange(totalPages)}
          aria-label={`Page ${totalPages}`}
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
          onClick={() => handlePageChange(pageNumber + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      );
    }

    return <div className={styles["pagination-container"]}>{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div
      key={index}
      className={`${styles["service-card"]} ${styles["skeleton-card"]}`}
    >
      <div className={styles["card-header"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-avatar"]}`}
        ></div>
        <div className={styles["card-title"]}>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-title"]}`}
          ></div>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-subtitle"]}`}
          ></div>
        </div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-icon"]}`}
        ></div>
      </div>
      <div className={styles["card-content"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]} ${styles["short"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]} ${styles["shorter"]}`}
        ></div>
        <div className={styles["card-chips"]}>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-chip"]}`}
          ></div>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-chip"]}`}
          ></div>
        </div>
      </div>
      <div className={styles["card-footer"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-price"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-button"]}`}
        ></div>
      </div>
    </div>
  );

  const PackageIcon = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
    </svg>
  );

  return (
    <div className={styles["service-package-container"]}>
      <div className={styles["container"]}>
        {/* Header Section */}
        <div className={styles["header-section"]}>
          <div className={styles["header-content"]}>
            <div className={styles["header-icon"]}>
              <PackageIcon />
            </div>
            <h1 className={styles["header-title"]}>Service Packages</h1>
          </div>
          <p className={styles["header-description"]}>
            Explore our fitness packages tailored to help you achieve your
            health goals
          </p>
        </div>

        {/* Search Section */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          <TextField
            placeholder="Search packages..."
            size="small"
            value={tempSearch}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "var(--accent-info)" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 300 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "var(--background-white)",
                "&:hover fieldset": { borderColor: "var(--accent-info)" },
                "&.Mui-focused fieldset": { borderColor: "var(--accent-info)" },
              },
            }}
          />
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              color: "var(--accent-error)",
              borderColor: "var(--accent-error)",
              "&:hover": {
                bgcolor: "rgba(211, 47, 47, 0.04)",
                borderColor: "var(--accent-error)",
              },
            }}
          >
            Clear Search
          </Button>
        </Box>

        {/* Error State */}
        {error && (
          <div className={styles["error-state"]}>
            <p className={styles["error-message"]}>{error}</p>
          </div>
        )}

        {/* Package Grid */}
        {loading ? (
          <div className={styles["packages-grid"]}>
            {[...Array(pageSize)].map((_, i) => renderSkeletonCard(i))}
          </div>
        ) : packages.length === 0 ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <PackageIcon />
            </div>
            <h3 className={styles["empty-title"]}>No service packages found</h3>
            <p className={styles["empty-description"]}>
              Try adjusting your search or check back later for new packages
            </p>
          </div>
        ) : (
          <div className={styles["packages-grid"]}>
            {packages.map((pkg) => (
              <div key={pkg.packageId} className={styles["service-card"]}>
                <div className={styles["card-header"]}>
                  <div className={styles["trainer-avatar"]}>
                    <img
                      src={pkg.trainerAvatar || "/placeholder-avatar.jpg"}
                      alt={pkg.trainerFullName || "Trainer avatar"}
                      onError={(e) => {
                        e.target.src = "/placeholder-avatar.jpg";
                      }}
                    />
                  </div>
                  <div className={styles["card-title"]}>
                    <h3
                      className={styles["package-name"]}
                      title={pkg.packageName}
                    >
                      {pkg.packageName || "Unnamed Package"}
                    </h3>
                    <p
                      className={styles["trainer-name"]}
                      title={`by ${pkg.trainerFullName}`}
                    >
                      by {pkg.trainerFullName || "Unknown Trainer"}
                    </p>
                  </div>
                  <button
                    className={styles["info-button"]}
                    onClick={() => handleOpenDetail(pkg)}
                    aria-label={`View details for ${pkg.packageName}`}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                  </button>
                </div>
                <div className={styles["card-content"]}>
                  <div
                    className={styles["package-description"]}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        pkg.description || "No description available"
                      ),
                    }}
                  />
                  <div className={styles["card-chips"]}>
                    <span
                      className={`${styles["chip"]} ${styles["chip-info"]}`}
                    >
                      {pkg.durationDays || 0} days
                    </span>
                    <span
                      className={`${styles["chip"]} ${styles["chip-success"]}`}
                    >
                      {pkg.status
                        ? pkg.status.charAt(0).toUpperCase() +
                          pkg.status.slice(1)
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className={styles["card-footer"]}>
                  <div className={styles["package-price"]}>
                    {(pkg.price || 0).toLocaleString()} VND
                  </div>
                  <button
                    className={styles["view-details-btn"]}
                    onClick={() => handleOpenDetail(pkg)}
                    aria-label={`View details for ${pkg.packageName}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default ServicePackage;
