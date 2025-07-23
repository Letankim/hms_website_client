import styles from "./ServicePackage.module.css";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import apiServicePackageService from "services/apiServicePackageService";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";

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
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("ID");
  const [sortDescending, setSortDescending] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: search.trim(),
        Status: "active",
        SortBy: sortBy,
        SortDescending: sortDescending,
      };
      const res = await apiServicePackageService.getAllActivePackages(params);
      setPackages(res.data?.packages || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalCount(res.data?.totalCount || 0);
    } catch (e) {
      setPackages([]);
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search, sortBy, sortDescending]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPageNumber(1);
    }, 500),
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    debouncedSetSearch(value);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSortBy("ID");
    setSortDescending(false);
    setPageNumber(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPageNumber(1);
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (value === "ID") {
      setSortBy("ID");
      setSortDescending(false);
    } else {
      const [field, direction] = value.split("-");
      setSortBy(field);
      setSortDescending(direction === "desc");
    }
    setPageNumber(1);
  };

  useEffect(() => {
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
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (pageNumber > 1) {
      pages.push(
        <button
          key="prev"
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(pageNumber - 1)}
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
        >
          {totalPages}
        </button>
      );
    }

    if (pageNumber < totalPages) {
      pages.push(
        <button
          key="next"
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(pageNumber + 1)}
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

  if (loading) {
    return (
      <div className={styles["service-package-container"]}>
        <div className={styles["container"]}>
          <div className={styles["header-section"]}>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-header-title"]}`}
            ></div>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-header-desc"]}`}
            ></div>
          </div>
          <div className={styles["filter-section"]}>
            <div className={styles["filter-grid"]}>
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className={`${styles["skeleton"]} ${styles["skeleton-filter"]}`}
                ></div>
              ))}
            </div>
          </div>
          <div className={styles["packages-grid"]}>
            {[...Array(8)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

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

        {/* Filter Section */}
        <div className={styles["filter-section"]}>
          <div className={styles["filter-header"]}>
            <div className={styles["filter-title"]}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
              </svg>
              <span>Search & Filter</span>
            </div>
            <button
              className={styles["mobile-filter-toggle"]}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>
          <div
            className={`${styles["filter-content"]} ${
              showFilters ? styles["show"] : ""
            }`}
          >
            <div className={styles["filter-grid"]}>
              <div className={styles["search-input-container"]}>
                <div className={styles["search-icon"]}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search packages..."
                  defaultValue={search}
                  onChange={handleSearchChange}
                  className={styles["search-input"]}
                />
              </div>
              <div className={styles["select-container"]}>
                <label>Sort By</label>
                <select
                  value={
                    sortBy ? `${sortBy}-${sortDescending ? "desc" : "asc"}` : ""
                  }
                  onChange={handleSortChange}
                  className={styles["filter-select"]}
                >
                  <option value="ID">Default</option>
                  <option value="packagename-asc">Package Name (A-Z)</option>
                  <option value="packagename-desc">Package Name (Z-A)</option>
                  <option value="trainer-asc">Trainer Name (A-Z)</option>
                  <option value="trainer-desc">Trainer Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="duration-asc">Duration (Short to Long)</option>
                  <option value="duration-desc">
                    Duration (Long to Short)
                  </option>
                  <option value="subscribers-asc">
                    Subscribers (Low to High)
                  </option>
                  <option value="subscribers-desc">
                    Subscribers (High to Low)
                  </option>
                </select>
              </div>
              <button
                className={styles["clear-filters-btn"]}
                onClick={handleClearFilters}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles["error-message"]}>
            <div className={styles["error-content"]}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!error && (
          <div className={styles["results-summary"]}>
            Found <strong>{totalCount}</strong> service package
            {totalCount !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Package Grid */}
        {packages.length === 0 && !error ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <PackageIcon />
            </div>
            <h3 className={styles["empty-title"]}>No service packages found</h3>
            <p className={styles["empty-description"]}>
              Try adjusting your search criteria or clear the filters
            </p>
          </div>
        ) : (
          <>
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

            {/* Pagination */}
            <div className={styles["pagination-section"]}>
              <div className={styles["page-size-selector"]}>
                <label>Items per page:</label>
                <select value={pageSize} onChange={handlePageSizeChange}>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={20}>20</option>
                </select>
              </div>
              {renderPagination()}
              <div className={styles["pagination-info"]}>
                Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                packages
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServicePackage;
