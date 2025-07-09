import { useContext, useEffect, useState } from "react";
import AuthContext from "contexts/AuthContext";
import apiFoodCategoryService from "services/apiFoodCategoryService";
import apiFoodService from "services/apiFoodService";
import "./FoodListPage.css";
import { showErrorFetchAPI } from "components/ErrorHandler/showStatusMessage";

const FoodListPage = () => {
  const { user } = useContext(AuthContext);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryRes = await apiFoodCategoryService.getAllActiveCategories(
          {
            PageNumber: 1,
            PageSize: 100,
            Status: "active",
          }
        );
        setCategories(categoryRes.categories || []);

        const queryParams = {
          PageNumber: pageNumber,
          PageSize: pageSize,
          SearchTerm: searchTerm || undefined,
          CategoryId: selectedCategory !== "all" ? selectedCategory : undefined,
          Status: selectedStatus !== "all" ? selectedStatus : undefined,
        };

        const foodRes = await apiFoodService.getAllActiveFoods(queryParams);
        setFoods(foodRes.foods || []);
        setTotalCount(foodRes.totalCount || 0);
        setTotalPages(foodRes.totalPages || 1);
      } catch (err) {
        showErrorFetchAPI(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    user,
    pageNumber,
    pageSize,
    searchTerm,
    selectedCategory,
    selectedStatus,
  ]);

  const handlePageChange = (page) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPageNumber(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPageNumber(1);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPageNumber(1);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setPageNumber(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("active");
    setPageNumber(1);
  };

  const handleViewDetails = (food) => {
    setSelectedFood(food);
    setOpenDetailsDialog(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedFood(null);
    document.body.style.overflow = "auto";
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

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const getCalorieColor = (calories) => {
    if (calories < 150) return "var(--accent-success)";
    if (calories < 250) return "#ff9800";
    return "var(--accent-error)";
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
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
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
          <span key="dots2" className="pagination-dots">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className="pagination-btn"
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
          className="pagination-btn"
          onClick={() => handlePageChange(pageNumber + 1)}
        >
          ›
        </button>
      );
    }

    return <div className="pagination-container">{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div key={index} className="food-card skeleton-card">
      <div className="food-image skeleton skeleton-image"></div>
      <div className="food-content">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-calories"></div>
        <div className="nutrition-chips">
          <div className="skeleton skeleton-chip"></div>
          <div className="skeleton skeleton-chip"></div>
          <div className="skeleton skeleton-chip"></div>
        </div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="food-list-container">
        <div className="container">
          <div className="header-section">
            <div className="skeleton skeleton-header-title"></div>
            <div className="skeleton skeleton-header-desc"></div>
          </div>

          <div className="filter-section">
            <div className="filter-grid">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="skeleton skeleton-filter"></div>
              ))}
            </div>
          </div>

          <div className="foods-grid">
            {[...Array(8)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="food-list-container">
      <div className="container">
        {/* Header Section */}
        <div className="header-section">
          <div className="header-content">
            <div className="header-icon">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h1 className="header-title">Healthy Food</h1>
          </div>
          <p className="header-description">
            Discover nutritious foods and track their nutritional values for a
            healthier lifestyle
          </p>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-header">
            <div className="filter-title">
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
              className="mobile-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          <div className={`filter-content ${showFilters ? "show" : ""}`}>
            <div className="filter-grid">
              <div className="search-input-container">
                <div className="search-icon">
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
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>

              <div className="select-container">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-container">
                <label>Status</label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                className="clear-filters-btn"
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
          <div className="error-message">
            <div className="error-content">
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
          <div className="results-summary">
            Found <strong>{totalCount}</strong> healthy food
            {totalCount !== 1 ? "s" : ""}
            {selectedCategory !== "all" &&
              ` in ${
                categories.find((c) => c.categoryId === selectedCategory)
                  ?.categoryName
              }`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}

        {/* Food Grid */}
        {foods.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
              </svg>
            </div>
            <h3 className="empty-title">No foods found</h3>
            <p className="empty-description">
              Try adjusting your search criteria or clear the filters
            </p>
          </div>
        ) : (
          <>
            <div className="foods-grid">
              {foods.map((food) => (
                <div key={food.foodId} className="food-card">
                  <div className="food-image-container">
                    <img
                      src={
                        food.image ||
                        "https://via.placeholder.com/300x180?text=No+Image"
                      }
                      alt={food.foodName}
                      className="food-image"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x180?text=No+Image";
                      }}
                    />
                    <span className="category-chip">
                      {food.categoryName || "N/A"}
                    </span>
                  </div>

                  <div className="food-content">
                    <h3 className="food-name" title={food.foodName}>
                      {food.foodName}
                    </h3>

                    <div className="calories-info">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ color: getCalorieColor(food.calories) }}
                      >
                        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                      </svg>
                      <span>{food.calories || "N/A"} kcal</span>
                    </div>

                    <div className="nutrition-chips">
                      <span className="nutrition-chip protein">
                        P: {food.protein || 0}g
                      </span>
                      <span className="nutrition-chip carbs">
                        C: {food.carbs || 0}g
                      </span>
                      <span className="nutrition-chip fats">
                        F: {food.fats || 0}g
                      </span>
                    </div>

                    <button
                      className="view-details-btn"
                      onClick={() => handleViewDetails(food)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                      View Details
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
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {renderPagination()}

              <div className="pagination-info">
                Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                foods
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {openDetailsDialog && selectedFood && (
        <div className="modal-overlay" onClick={handleCloseDetailsDialog}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h2>Food Nutrition Details</h2>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCloseDetailsDialog}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-image">
                <img
                  src={
                    selectedFood.image ||
                    "https://via.placeholder.com/400x250?text=No+Image"
                  }
                  alt={selectedFood.foodName}
                />
              </div>

              <div className="modal-body">
                <div className="food-header">
                  <h1 className="food-title">{selectedFood.foodName}</h1>
                  <span className="food-category">
                    {selectedFood.categoryName || "N/A"}
                  </span>
                </div>

                <div className="nutrition-grid">
                  <div className="nutrition-panel">
                    <h3 className="panel-title">Nutritional Information</h3>
                    <div className="nutrition-list">
                      <div className="nutrition-item">
                        <span className="nutrition-label">Calories</span>
                        <span
                          className="nutrition-value calories-badge"
                          style={{
                            backgroundColor: getCalorieColor(
                              selectedFood.calories
                            ),
                          }}
                        >
                          {selectedFood.calories || "N/A"} kcal
                        </span>
                      </div>
                      <div className="nutrition-divider"></div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Protein</span>
                        <span className="nutrition-value protein-value">
                          {selectedFood.protein || "N/A"} g
                        </span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Carbohydrates</span>
                        <span className="nutrition-value carbs-value">
                          {selectedFood.carbs || "N/A"} g
                        </span>
                      </div>
                      <div className="nutrition-item">
                        <span className="nutrition-label">Fats</span>
                        <span className="nutrition-value fats-value">
                          {selectedFood.fats || "N/A"} g
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="details-panel">
                    <h3 className="panel-title">Additional Details</h3>
                    <div className="details-list">
                      <div className="detail-item">
                        <span className="detail-label">Food ID</span>
                        <span className="detail-value">
                          #{selectedFood.foodId}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status</span>
                        <span className={`status-badge ${selectedFood.status}`}>
                          {selectedFood.status || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Created Date</span>
                        <span className="detail-value">
                          {formatDate(selectedFood.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="description-panel">
                  <h3 className="panel-title">Description</h3>
                  <p className="food-description">
                    {stripHtml(selectedFood.description) ||
                      "No description available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-close-footer-btn"
                onClick={handleCloseDetailsDialog}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodListPage;
