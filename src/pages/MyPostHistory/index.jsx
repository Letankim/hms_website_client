import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  MenuItem,
  Skeleton,
  Chip,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import apiPostService from "services/apiPostService";
import "./index.css";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "deleted", label: "Deleted" },
];

const pageSizeOptions = [5, 10, 20, 50];

const MyPostHistory = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refresh, setRefresh] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search,
        status,
        startDate,
        endDate,
        pageNumber: page + 1,
        pageSize,
        sortBy,
        sortOrder,
      };
      params.status = params.status === "all" ? "" : params.status;
      const res = await apiPostService.getMyPosts(params);
      if (params.status === "") {
        params.status = "all";
      }
      setPosts(res.data.posts || []);
      setTotal(res.data.totalCount || 0);
    } catch (e) {
      setPosts([]);
      setTotal(0);
    }
    setLoading(false);
  }, [
    search,
    status,
    startDate,
    endDate,
    page,
    pageSize,
    sortBy,
    sortOrder,
    refresh,
  ]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setPage(0);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setPage(0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(0);
  };

  const handleChangePage = (e, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await apiPostService.softDeletePost(id);
      setRefresh((r) => !r);
    }
  };

  const skeletonRows = Array.from({ length: pageSize }).map((_, idx) => (
    <TableRow key={idx}>
      <TableCell>
        <Skeleton variant="text" width={40} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={60} height={40} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={120} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={200} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={100} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={120} height={36} />
      </TableCell>
    </TableRow>
  ));

  return (
    <Box className="my-post-history-container">
      <Typography variant="h5" fontWeight={700} mb={2}>
        My Post History
      </Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search content..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            select
            size="small"
            label="Status"
            value={status}
            onChange={handleStatusChange}
          >
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table className="my-post-history-table">
          <TableHead>
            <TableRow>
              <TableCell
                onClick={() => handleSort("postId")}
                style={{ cursor: "pointer" }}
              >
                No. {sortBy === "postId" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Content</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Status</TableCell>
              <TableCell
                onClick={() => handleSort("createdAt")}
                style={{ cursor: "pointer" }}
              >
                Created At{" "}
                {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              skeletonRows
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((row, index) => (
                <TableRow key={row.postId} hover>
                  <TableCell>{page * pageSize + index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={row.thumbnail || "/logo192.png"}
                      alt="thumbnail"
                      style={{
                        width: 60,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      dangerouslySetInnerHTML={{ __html: row.content }}
                    />
                  </TableCell>
                  <TableCell>
                    {row.tags && row.tags.length > 0
                      ? row.tags.map((tag) => (
                          <Chip
                            key={tag.tagId}
                            label={tag.tagName}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          />
                        ))
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status === "active" ? "Active" : "Deleted"}
                      color={row.status === "active" ? "success" : "default"}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          navigate(`/my-posts/${row.postId}/view`);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <span>
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            navigate(`/my-posts/${row.postId}/edit`);
                          }}
                          disabled={row.status !== "active"}
                        >
                          <EditIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(row.postId)}
                          disabled={row.status !== "active"}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={pageSizeOptions}
          labelRowsPerPage="Posts per page:"
        />
      </TableContainer>
    </Box>
  );
};

export default MyPostHistory;
