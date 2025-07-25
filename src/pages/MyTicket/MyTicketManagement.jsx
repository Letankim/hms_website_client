import styles from "./MyTicketManagement.module.css";
import { useContext, useEffect, useState, useCallback } from "react";
import {
  Activity,
  Eye,
  Add,
  Edit2,
  Trash,
  SearchNormal1,
  Filter,
  CloseCircle,
  TickCircle,
  Warning2,
  DocumentText,
  Calendar,
  Setting2,
  ArrowRight2,
  ArrowLeft2,
  Ticket2,
} from "iconsax-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiTicketUserService from "services/apiTicketUserService";
import { extractErrors } from "components/ErrorHandler/extractErrors";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import Swal from "sweetalert2";

const statusColors = {
  open: "info",
  "in-progress": "warning",
  resolved: "success",
};

const priorityColors = {
  low: "success",
  medium: "warning",
  high: "error",
};

const categoryOptions = [
  { value: "Technical", label: "Technical Issue" },
  { value: "Billing", label: "Billing or Payment Issue" },
  { value: "WorkoutPlan", label: "Workout Plan Inquiry" },
  { value: "Account", label: "Account Problem" },
  { value: "MobileApp", label: "Mobile App Error" },
  { value: "FeatureRequest", label: "Feature Request" },
  { value: "Feedback", label: "General Feedback" },
  { value: "Other", label: "Other / Not Listed" },
];

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const MyTicketManagement = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editorData, setEditorData] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!user) {
      showInfoMessage("Please login to view your tickets.");
      setTimeout(() => navigate("/login"), 1000);
      return;
    }
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        searchTerm: search.trim(),
        status: status === "all" ? "" : status,
        priority: priority === "all" ? "" : priority,
        category: category === "all" ? "" : category,
      };
      const res = await apiTicketUserService.getMyTickets(params);
      if (res.statusCode === 200 && res.data) {
        setTickets(res.data.tickets || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.totalCount || 0);
      } else {
        showErrorMessage("No tickets found.");
        setTickets([]);
      }
    } catch (e) {
      showErrorFetchAPI(e);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    pageNumber,
    pageSize,
    search,
    status,
    priority,
    category,
    navigate,
  ]);

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

  const handleClearFilters = () => {
    setTempSearch("");
    setSearch("");
    setStatus("");
    setPriority("");
    setCategory("");
    setPageNumber(1);
  };

  useEffect(() => {
    setTempSearch(search);
    fetchTickets();
  }, [fetchTickets]);

  const handleViewDetails = (ticket) => {
    navigate(`/my-ticket/detail/${ticket.ticketId}`);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket({
      ticketId: ticket.ticketId,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      category: ticket.category,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      assignedTo: ticket.assignedTo,
      resolvedAt: ticket.resolvedAt,
    });
    setEditorData(ticket.description || "");
    setFormErrors({});
    setEditDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCreateNewTicket = () => {
    setSelectedTicket({
      title: "",
      description: "",
      priority: "low",
      status: "open",
      category: "Technical",
      createdAt: null,
      updatedAt: null,
      assignedTo: null,
      resolvedAt: null,
    });
    setEditorData("");
    setFormErrors({});
    setEditDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const validPriorities = ["low", "medium", "high"];
  const validStatuses = ["open", "inprogress", "resolved"];
  const validCategories = [
    "Technical",
    "Billing",
    "WorkoutPlan",
    "Account",
    "MobileApp",
    "FeatureRequest",
    "Feedback",
    "Other",
  ];

  const validateForm = () => {
    const errors = {};

    if (!selectedTicket?.title?.trim()) {
      errors.title = "Title is required";
    } else if (selectedTicket.title.length > 255) {
      errors.title = "Title cannot exceed 255 characters";
    }

    if (!editorData?.trim()) {
      errors.description = "Description is required";
    } else if (editorData.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (!selectedTicket?.priority?.trim()) {
      errors.priority = "Priority is required";
    } else if (
      selectedTicket.priority.length > 20 ||
      !validPriorities.includes(selectedTicket.priority.toLowerCase())
    ) {
      errors.priority = "Priority must be one of: low, medium, high";
    }

    if (selectedTicket?.status?.trim()) {
      if (
        selectedTicket.status.length > 20 ||
        !validStatuses.includes(selectedTicket.status.toLowerCase())
      ) {
        errors.status = "Status must be one of: open, inprogress, resolved";
      }
    }

    if (selectedTicket?.category?.trim()) {
      if (!validCategories.includes(selectedTicket.category)) {
        errors.category = `Category must be one of: ${validCategories.join(
          ", "
        )}`;
      }
    }

    return errors;
  };

  const handleSaveTicket = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showErrorMessage("Please check all fields valid.");
      return;
    }

    const ticketData = {
      title: selectedTicket.title,
      description: editorData,
      priority: selectedTicket.priority,
      status: selectedTicket.status,
      category: selectedTicket.category,
      createdAt: selectedTicket.createdAt,
      updatedAt: selectedTicket.updatedAt,
      assignedTo: selectedTicket.assignedTo,
      resolvedAt: selectedTicket.resolvedAt,
    };
    Swal.fire({
      title: "Processing...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      if (selectedTicket.ticketId) {
        const updatedTicketData = {
          ...ticketData,
          ticketId: selectedTicket.ticketId,
        };
        await apiTicketUserService.updateTicket(
          selectedTicket.ticketId,
          updatedTicketData
        );
      } else {
        await apiTicketUserService.createTicket(ticketData);
      }
      showSuccessMessage(
        selectedTicket.ticketId
          ? "Ticket updated successfully."
          : "Ticket created successfully."
      );
      setEditDialogOpen(false);
      document.body.style.overflow = "auto";
      await fetchTickets();
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      Swal.close();
    }
  };

  const handleDeleteTicket = async (id) => {
    try {
      await apiTicketUserService.deleteTicket(id);
      showSuccessMessage("Ticket deleted successfully.");
      await fetchTickets();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleConfirmDelete = (ticketId) => {
    setTicketToDelete(ticketId);
    setDeleteDialogOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleConfirmDeleteDialogClose = (confirm) => {
    setDeleteDialogOpen(false);
    document.body.style.overflow = "auto";
    if (confirm && ticketToDelete) {
      handleDeleteTicket(ticketToDelete);
    }
    setTicketToDelete(null);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedTicket(null);
    setEditorData("");
    setFormErrors({});
    document.body.style.overflow = "auto";
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
      case "open":
        return "var(--accent-info)";
      case "in-progress":
        return "var(--accent-warning)";
      case "resolved":
        return "var(--accent-success)";
      default:
        return "var(--text-light)";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "var(--accent-success)";
      case "medium":
        return "var(--accent-warning)";
      case "high":
        return "var(--accent-error)";
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

    // Previous button
    if (pageNumber > 1) {
      pages.push(
        <button
          key="prev"
          className={styles["pagination-btn"]}
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
          className={styles["pagination-btn"]}
          onClick={() => setPageNumber(1)}
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

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`${styles["pagination-btn"]} ${
            i === pageNumber ? styles["active"] : ""
          }`}
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
          <span key="dots2" className={styles["pagination-dots"]}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          className={styles["pagination-btn"]}
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
          className={styles["pagination-btn"]}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          <ArrowRight2 size="16" />
        </button>
      );
    }

    return <div className={styles["pagination-container"]}>{pages}</div>;
  };

  const renderSkeletonCard = (index) => (
    <div
      key={index}
      className={`${styles["ticket-card"]} ${styles["skeleton-card"]}`}
    >
      <div
        className={`${styles["ticket-avatar"]} ${styles["skeleton"]} ${styles["skeleton-avatar"]}`}
      ></div>
      <div className={styles["ticket-content"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-title"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]} ${styles["short"]}`}
        ></div>
        <div className={styles["ticket-meta"]}>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-chip"]}`}
          ></div>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-chip"]}`}
          ></div>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-date"]}`}
          ></div>
        </div>
      </div>
      <div className={styles["ticket-actions"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-action-btn"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-action-btn"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-action-btn"]}`}
        ></div>
      </div>
    </div>
  );

  if (loading && tickets.length === 0) {
    return (
      <div className={styles["ticket-management-container"]}>
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
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className={`${styles["skeleton"]} ${styles["skeleton-filter"]}`}
                ></div>
              ))}
            </div>
          </div>

          <div className={styles["tickets-list"]}>
            {[...Array(5)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["ticket-management-container"]}>
      <div className={styles["container"]}>
        {/* Header Section */}
        <div className={styles["header-section"]}>
          <div className={styles["header-content"]}>
            <div className={styles["header-icon"]}>
              <Activity
                size="40"
                color="var(--secondary-color)"
                variant="Bold"
              />
            </div>
            <h1 className={styles["header-title"]}>My Ticket Management</h1>
          </div>
          <p className={styles["header-description"]}>
            View, create, and manage your support tickets
          </p>
        </div>

        {/* Filter Section */}
        <div className={styles["filter-section"]}>
          <div className={styles["filter-header"]}>
            <div className={styles["filter-title"]}>
              <Filter size="20" color="var(--accent-info)" variant="Bold" />
              <span>Search & Filter</span>
            </div>
            <div className={styles["filter-actions"]}>
              <button
                className={styles["create-ticket-btn"]}
                onClick={handleCreateNewTicket}
              >
                <Add size="20" color="#FFF" />
                <span>Create New Ticket</span>
              </button>
              <button
                className={styles["mobile-filter-toggle"]}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>

          <div className={`filter-content ${showFilters ? "show" : ""}`}>
            <div className={styles["filter-grid"]}>
              <div className={styles["search-input-container"]}>
                <div className={styles["search-icon"]}>
                  <SearchNormal1 size="20" color="var(--accent-info)" />
                </div>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={tempSearch}
                  onChange={handleSearchChange}
                  className={styles["search-input"]}
                />
              </div>

              <div className={styles["select-container"]}>
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPageNumber(1);
                  }}
                  className={styles["filter-select"]}
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className={styles["select-container"]}>
                <label>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setPageNumber(1);
                  }}
                  className={styles["filter-select"]}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className={styles["select-container"]}>
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPageNumber(1);
                  }}
                  className={styles["filter-select"]}
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles["select-container"]}>
                <label>Per Page</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                  className={styles["filter-select"]}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <button
                className={styles["clear-filters-btn"]}
                onClick={handleClearFilters}
              >
                <CloseCircle size="16" color="#1976d2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && !showError && (
          <div className={styles["error-message"]}>
            <div className={styles["error-content"]}>
              <Warning2 size="20" color="white" />
              {error}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!error && (
          <div className={styles["results-summary"]}>
            Found <strong>{totalCount}</strong> ticket
            {totalCount !== 1 ? "s" : ""}
            {status && ` with status "${status}"`}
            {priority && ` with priority "${priority}"`}
            {category &&
              ` in category "${
                categoryOptions.find((c) => c.value === category)?.label
              }"`}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Tickets List */}
        {tickets.length === 0 && !loading ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <DocumentText size="80" color="var(--text-secondary)" />
            </div>
            <h3 className={styles["empty-title"]}>No tickets found</h3>
            <p className={styles["empty-description"]}>
              Try adjusting your search criteria or create a new ticket
            </p>
          </div>
        ) : (
          <>
            <div className={styles["tickets-list"]}>
              {loading
                ? [...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) =>
                    renderSkeletonCard(i)
                  )
                : tickets.map((ticket) => (
                    <div
                      key={ticket.ticketId}
                      className={styles["ticket-card"]}
                    >
                      <div className={styles["ticket-avatar"]}>
                        <Ticket2 size="24" color="white" variant="Bold" />
                      </div>

                      <div className={styles["ticket-content"]}>
                        <h3
                          className={styles["ticket-title"]}
                          title={ticket.title}
                        >
                          {ticket.title}
                        </h3>

                        <div
                          className={styles["ticket-description"]}
                          dangerouslySetInnerHTML={{
                            __html: ticket.description,
                          }}
                        />

                        <div className={styles["ticket-meta"]}>
                          <span
                            className={styles["status-chip"]}
                            style={{
                              backgroundColor: getStatusColor(ticket.status),
                            }}
                            onClick={() => {
                              setStatus(ticket.status);
                              setPageNumber(1);
                            }}
                          >
                            {ticket.status.charAt(0).toUpperCase() +
                              ticket.status.slice(1)}
                          </span>
                          <span
                            className={styles["priority-chip"]}
                            style={{
                              backgroundColor: getPriorityColor(
                                ticket.priority
                              ),
                            }}
                            onClick={() => {
                              setPriority(ticket.priority);
                              setPageNumber(1);
                            }}
                          >
                            {ticket.priority.charAt(0).toUpperCase() +
                              ticket.priority.slice(1)}
                          </span>
                          <span
                            className={styles["ticket-date"]}
                            title={formatDate(ticket.createdAt)}
                          >
                            <Calendar size="14" />
                            {formatDate(ticket.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className={styles["ticket-actions"]}>
                        <button
                          className={`${styles["action-btn"]} ${styles["view-btn"]}`}
                          onClick={() => handleViewDetails(ticket)}
                          title="View Details"
                        >
                          <Eye size="16" color="#FFF" />
                        </button>
                        <button
                          className={`${styles["action-btn"]} ${styles["delete-btn"]}`}
                          onClick={() => handleConfirmDelete(ticket.ticketId)}
                          title="Delete Ticket"
                        >
                          <Trash size="16" color="#FFF" />
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Pagination */}
            <div className={styles["pagination-section"]}>
              <div className={styles["page-size-selector"]}>
                <label>Items per page:</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {renderPagination()}

              <div className={styles["pagination-info"]}>
                Showing {(pageNumber - 1) * pageSize + 1} to{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}{" "}
                tickets
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editDialogOpen && selectedTicket && (
        <div className={styles["modal-overlay"]} onClick={handleCloseDialog}>
          <div
            className={styles["modal-container"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <div className={styles["modal-header-content"]}>
                <Setting2 size="24" color="white" variant="Bold" />
                <h2>
                  {selectedTicket.ticketId
                    ? "Edit Ticket"
                    : "Create New Ticket"}
                </h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={handleCloseDialog}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  Title <span className={styles["required"]}>*</span>
                </label>
                <input
                  type="text"
                  value={selectedTicket.title || ""}
                  onChange={(e) => {
                    setSelectedTicket({
                      ...selectedTicket,
                      title: e.target.value,
                    });
                    setFormErrors((prev) => ({ ...prev, title: null }));
                  }}
                  className={`${styles["form-input"]} ${
                    formErrors.title ? styles.error : ""
                  }`}
                  placeholder="Enter ticket title"
                />
                {formErrors.title && (
                  <span className={styles["error-text"]}>
                    {formErrors.title}
                  </span>
                )}
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Category</label>
                  <select
                    value={selectedTicket.category || "Technical"}
                    onChange={(e) =>
                      setSelectedTicket({
                        ...selectedTicket,
                        category: e.target.value,
                      })
                    }
                    className={styles["form-select"]}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Priority</label>
                  <select
                    value={selectedTicket.priority || "low"}
                    onChange={(e) =>
                      setSelectedTicket({
                        ...selectedTicket,
                        priority: e.target.value,
                      })
                    }
                    className={styles["form-select"]}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>Status</label>
                <select
                  value={selectedTicket.status || "open"}
                  onChange={(e) =>
                    setSelectedTicket({
                      ...selectedTicket,
                      status: e.target.value,
                    })
                  }
                  className={styles["form-select"]}
                  disabled
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]}>
                  Description <span className={styles["required"]}>*</span>
                </label>
                <div
                  className={`editor-container ${
                    formErrors.description ? "error" : ""
                  }`}
                >
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    onReady={(editor) => {
                      editor.editing.view.change((writer) => {
                        writer.setStyle(
                          "min-height",
                          "150px",
                          editor.editing.view.document.getRoot()
                        );
                      });
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorData(data);
                      setSelectedTicket({
                        ...selectedTicket,
                        description: data,
                      });
                      setFormErrors((prev) => ({ ...prev, description: null }));
                    }}
                    config={{
                      toolbar: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "blockQuote",
                        "|",
                        "undo",
                        "redo",
                      ],
                      placeholder: "Enter your ticket description here...",
                    }}
                  />
                </div>
                {formErrors.description && (
                  <span className={styles["error-text"]}>
                    {formErrors.description}
                  </span>
                )}
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={handleCloseDialog}
              >
                <CloseCircle size="18" color="#dc3545" />
                Cancel
              </button>
              <button className={styles["save-btn"]} onClick={handleSaveTicket}>
                <TickCircle size="18" color="#FFF" />
                {selectedTicket.ticketId ? "Update" : "Create"} Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialogOpen && (
        <div
          className={styles["modal-overlay"]}
          onClick={() => handleConfirmDeleteDialogClose(false)}
        >
          <div
            className={`${styles["modal-container"]} ${styles["delete-modal"]}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`${styles["modal-header"]} ${styles["delete-header"]}`}
            >
              <div className={styles["modal-header-content"]}>
                <Warning2 size="24" color="white" variant="Bold" />
                <h2>Confirm Delete</h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={() => handleConfirmDeleteDialogClose(false)}
              >
                <CloseCircle size="24" color="white" />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              <div className={styles["delete-confirmation"]}>
                <Warning2 size="48" color="var(--accent-error)" />
                <h3>Are you sure?</h3>
                <p>
                  Are you sure you want to delete this ticket? This action
                  cannot be undone.
                </p>
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={() => handleConfirmDeleteDialogClose(false)}
              >
                <CloseCircle size="18" color="#dc3545" />
                Cancel
              </button>
              <button
                className={styles["delete-confirm-btn"]}
                onClick={() => handleConfirmDeleteDialogClose(true)}
              >
                <Trash size="18" color="#fff" />
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div className={`${styles["snackbar"]} ${styles["success"]}`}>
          <div className={styles["snackbar-content"]}>
            <TickCircle size="20" color="white" variant="Bold" />
            <span>{successMessage}</span>
            <button
              className={styles["snackbar-close"]}
              onClick={handleCloseSuccess}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className={`${styles["snackbar"]} ${styles["error"]}`}>
          <div className={styles["snackbar-content"]}>
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button
              className={styles["snackbar-close"]}
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

export default MyTicketManagement;
