import styles from "./index.module.css";
import { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";
import apiGroupService from "services/apiGroupService";
import apiGroupMemberService from "services/apiGroupMemberService";
import {
  showErrorFetchAPI,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const GroupPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState(new Set());
  const [pendingActions, setPendingActions] = useState(new Set());
  const [view, setView] = useState("all");
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("ID");
  const [sortDescending, setSortDescending] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        PageNumber: page,
        PageSize: pageSize,
        ValidPageSize: pageSize,
        SearchTerm: search.trim(),
        Status: view === "all" ? "active" : undefined,
        StartDate: startDate,
        EndDate: endDate,
        SortBy: sortBy,
        SortDescending: sortDescending,
      };
      let res;
      if (view === "joined") {
        res = await apiGroupService.getMyJoinedGroups(0, params);
      } else {
        res = await apiGroupService.getAllActiveGroups(params);
      }
      const data = res.data || res;
      const processedGroups = (data.groups || []).map((group) => ({
        ...group,
        isOwner:
          group.isOwner !== undefined
            ? group.isOwner
            : group?.creator?.userId === user?.userId,
      }));
      setGroups(processedGroups);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
      const joined = new Set(
        processedGroups.filter((g) => g.isJoin).map((g) => g.groupId)
      );
      setJoinedGroups(joined);
    } catch (e) {
      setGroups([]);
      setError("Failed to load groups. Please try again.");
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    startDate,
    endDate,
    view,
    user,
    sortBy,
    sortDescending,
  ]);

  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setSearch(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (event) => {
    const value = event.target.value;
    debouncedSetSearch(value);
  };

  const handleJoinGroup = async (groupId, isJoined) => {
    if (!user) {
      showInfoMessage("Please log in to join groups.");
      return;
    }
    setPendingActions((prev) => new Set(prev).add(groupId));
    try {
      if (isJoined) {
        const confirmed = window.confirm(
          "Are you sure you want to leave this group?"
        );
        if (confirmed) {
          await apiGroupMemberService.leaveGroup(groupId);
          setJoinedGroups((prev) => {
            const newSet = new Set(prev);
            newSet.delete(groupId);
            return newSet;
          });
        }
        showSuccessMessage("Left group successfully!");
      } else {
        await apiGroupMemberService.joinGroup(groupId);
        setJoinedGroups((prev) => new Set(prev).add(groupId));
        showSuccessMessage("Joined group successfully!");
      }
      await fetchGroups();
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setPendingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSortBy("ID");
    setSortDescending(false);
    setPage(1);
  };

  const handleViewChange = (newView) => {
    if (newView !== null) {
      setView(newView);
      setPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(1);
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
    setPage(1);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (page > 1) {
      pages.push(
        <button
          key="prev"
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(page - 1)}
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
            i === page ? styles["active"] : ""
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

    if (page < totalPages) {
      pages.push(
        <button
          key="next"
          className={styles["pagination-btn"]}
          onClick={() => handlePageChange(page + 1)}
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
      className={`${styles["group-card"]} ${styles["skeleton-card"]}`}
    >
      <div className={styles["group-thumbnail"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-image"]}`}
        ></div>
      </div>
      <div className={styles["group-info"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-title"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-description"]} ${styles["short"]}`}
        ></div>
        <div className={styles["group-meta"]}>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-chip"]}`}
          ></div>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-chip"]}`}
          ></div>
        </div>
        <div className={styles["group-creator"]}>
          <div
            className={`${styles["skeleton"]} ${styles["skeleton-avatar"]}`}
          ></div>
          <div className={styles["creator-info"]}>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-name"]}`}
            ></div>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-email"]}`}
            ></div>
          </div>
        </div>
      </div>
      <div className={styles["group-actions"]}>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-button"]}`}
        ></div>
        <div
          className={`${styles["skeleton"]} ${styles["skeleton-button"]}`}
        ></div>
      </div>
    </div>
  );

  const GroupIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.37 17 14.46 17 16V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loading) {
    return (
      <div className={styles["group-page-container"]}>
        <div className={styles["container"]}>
          <div className={styles["header-section"]}>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-header-title"]}`}
            ></div>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-header-desc"]}`}
            ></div>
          </div>
          <div className={styles["view-toggle-section"]}>
            <div
              className={`${styles["skeleton"]} ${styles["skeleton-toggle"]}`}
            ></div>
          </div>
          <div className={styles["filter-section"]}>
            <div className={styles["filter-grid"]}>
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`${styles["skeleton"]} ${styles["skeleton-filter"]}`}
                ></div>
              ))}
            </div>
          </div>
          <div className={styles["group-list"]}>
            {[...Array(9)].map((_, i) => renderSkeletonCard(i))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["group-page-container"]}>
      <div className={styles["container"]}>
        {/* Header Section */}
        <div className={styles["header-section"]}>
          <div className={styles["header-content"]}>
            <div className={styles["header-icon"]}>
              <GroupIcon />
            </div>
            <h1 className={styles["header-title"]}>Health & Fitness Groups</h1>
          </div>
          <p className={styles["header-description"]}>
            Join communities to share your fitness journey and stay motivated
          </p>
        </div>

        {/* View Toggle Section */}
        <div className={styles["view-toggle-section"]}>
          <div className={styles["toggle-container"]}>
            <button
              className={`${styles["toggle-button"]} ${
                view === "all" ? styles["active"] : ""
              }`}
              onClick={() => handleViewChange("all")}
            >
              All Groups
            </button>
            {user && (
              <button
                className={`${styles["toggle-button"]} ${
                  view === "joined" ? styles["active"] : ""
                }`}
                onClick={() => handleViewChange("joined")}
              >
                My Joined Groups
              </button>
            )}
          </div>
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
                  placeholder="Search groups..."
                  defaultValue={search}
                  onChange={handleSearchChange}
                  className={styles["search-input"]}
                />
              </div>
              <div className={styles["select-container"]}>
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  max={endDate || undefined}
                  className={styles["filter-select"]}
                />
              </div>
              <div className={styles["select-container"]}>
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  min={startDate || undefined}
                  className={styles["filter-select"]}
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
                  <option value="groupname-asc">Group Name (A-Z)</option>
                  <option value="groupname-desc">Group Name (Z-A)</option>
                  <option value="membercount-asc">
                    Member Count (Low to High)
                  </option>
                  <option value="membercount-desc">
                    Member Count (High to Low)
                  </option>
                  <option value="createdat-asc">
                    Created At (Oldest to Newest)
                  </option>
                  <option value="createdat-desc">
                    Created At (Newest to Oldest)
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
            Found <strong>{totalCount}</strong> group
            {totalCount !== 1 ? "s" : ""}
            {view === "joined" && " that you've joined"}
            {search && ` matching "${search}"`}
          </div>
        )}

        {/* Group List */}
        {groups.length === 0 && !error ? (
          <div className={styles["empty-state"]}>
            <div className={styles["empty-icon"]}>
              <GroupIcon />
            </div>
            <h3 className={styles["empty-title"]}>No groups found</h3>
            <p className={styles["empty-description"]}>
              Try adjusting your search criteria or clear the filters
            </p>
          </div>
        ) : (
          <>
            <div className={styles["group-list"]}>
              {groups.map((group) => (
                <div key={group.groupId} className={styles["group-card"]}>
                  <div className={styles["group-thumbnail"]}>
                    <img
                      src={
                        group.thumbnail ||
                        "https://via.placeholder.com/300x120?text=No+Thumbnail"
                      }
                      alt={group.groupName}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/300x120?text=No+Thumbnail";
                      }}
                    />
                  </div>
                  <div className={styles["group-info"]}>
                    <h3
                      className={styles["group-title"]}
                      title={group.groupName}
                    >
                      {group.groupName}
                    </h3>
                    <div
                      className={styles["group-description"]}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(group.description),
                      }}
                    />
                    <div className={styles["group-meta"]}>
                      {group.isPrivate ? (
                        <span
                          className={`${styles["group-status"]} ${styles["private"]}`}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 0 0-4 0v2a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2zm-8-2a4 4 0 0 1 8 0v2H8V9zm10 9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5z" />
                          </svg>
                          Private Group
                        </span>
                      ) : (
                        <span
                          className={`${styles["group-status"]} ${styles["public"]}`}
                        >
                          <svg
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9l11.21 11.21C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 4.69C8.45 3.63 10.15 3 12 3c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" />
                          </svg>
                          Public Group
                        </span>
                      )}
                      <span className={styles["group-date"]}>
                        Created:{" "}
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles["group-creator"]}>
                      <img
                        src={group.creator?.avatar || `/placeholder-avatar.jpg`}
                        alt={group.creator?.fullName || "Admin"}
                        className={styles["creator-avatar"]}
                        onError={(e) => {
                          e.target.src = "/placeholder-avatar.jpg";
                        }}
                      />
                      <div className={styles["creator-info"]}>
                        <div className={styles["creator-name"]}>
                          {group.creator?.fullName || "Admin"}
                        </div>
                        <div className={styles["creator-email"]}>
                          {group.creator?.email || ""}
                        </div>
                      </div>
                      <div className={styles["member-count"]}>
                        <svg
                          width="18"
                          height="18"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.37 17 14.46 17 16V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                        <span>{group.memberCount || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles["group-actions"]}>
                    {pendingActions.has(group.groupId) ? (
                      <button className={styles["group-join-btn"]} disabled>
                        {joinedGroups.has(group.groupId)
                          ? "Leaving..."
                          : "Joining..."}
                      </button>
                    ) : group.creator == null ? (
                      <button
                        className={styles["group-join-btn"]}
                        onClick={() => handleJoinGroup(group.groupId, false)}
                      >
                        Join Group
                      </button>
                    ) : group.isOwner ? (
                      <span className={styles["owner-badge"]}>Owner</span>
                    ) : group.isRequested ? (
                      <button className={styles["group-pending-btn"]} disabled>
                        Request Pending...
                      </button>
                    ) : group.isJoin ? (
                      <div className={styles["joined-actions"]}>
                        <span className={styles["joined-badge"]}>Joined</span>
                        <button
                          className={styles["group-leave-btn"]}
                          onClick={() => handleJoinGroup(group.groupId, true)}
                        >
                          Leave Group
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles["group-join-btn"]}
                        onClick={() => handleJoinGroup(group.groupId, false)}
                      >
                        Join Group
                      </button>
                    )}
                    <button
                      className={styles["group-view-btn"]}
                      onClick={() => navigate(`/groups/${group.groupId}`)}
                    >
                      View Group
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
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={15}>15</option>
                  <option value={18}>18</option>
                </select>
              </div>
              {renderPagination()}
              <div className={styles["pagination-info"]}>
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, totalCount)} of {totalCount} groups
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupPage;
