import React, { useEffect, useState } from "react";
import "./index.css";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  CircularProgress,
  TextField,
  Button,
  Pagination,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import ReportIcon from "@mui/icons-material/Flag";
import apiPostReportService from "services/apiPostReportService";
import Skeleton from "@mui/material/Skeleton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  handled: "info",
};

const MyReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        ValidPageSize: 10,
        SearchTerm: search,
        Status: status === "all" ? "" : status,
      };
      const res = await apiPostReportService.getMyReports(params);
      setReports(res.data?.reports || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalCount(res.data?.totalCount || 0);
    } catch (e) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [pageNumber, pageSize, status]);

  return (
    <Box
      className="report-history-container"
      sx={{
        bgcolor: "linear-gradient(135deg, #fff 0%, #f9fafb 100%)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <Typography
        className="report-history-title"
        sx={{
          fontSize: { xs: "1.8rem", sm: "2.2rem" },
          color: "#d32f2f",
          fontWeight: 800,
          mb: 3,
          pl: 2,
        }}
      >
        <ReportIcon sx={{ fontSize: 40, verticalAlign: "middle", mr: 1 }} />
        My Report History
      </Typography>
      <Box className="report-history-filters">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            p: 2,
            bgcolor: "#fff",
            boxShadow: "0 2px 10px rgba(211, 47, 47, 0.06)",
          }}
        >
          <TextField
            label="Search Reason/Details"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              minWidth: 220,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#f9fafb",
                borderRadius: 2,
              },
            }}
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            size="small"
            SelectProps={{ native: true }}
            sx={{
              minWidth: 140,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#f9fafb",
                borderRadius: 2,
              },
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </TextField>
          <TextField
            select
            label="Reports per Page"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            size="small"
            SelectProps={{ native: true }}
            sx={{
              minWidth: 120,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#f9fafb",
                borderRadius: 2,
              },
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </TextField>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setPageNumber(1);
              fetchReports();
            }}
            sx={{
              fontWeight: 700,
              px: 3,
              boxShadow: "0 2px 6px rgba(211, 47, 47, 0.2)",
              "&:hover": { bgcolor: "#b71c1c" },
              borderRadius: 2,
            }}
          >
            Search
          </Button>
        </Stack>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 6 }}>
          {[...Array(pageSize > 5 ? 5 : pageSize)].map((_, i) => (
            <Card
              key={i}
              className="report-history-card"
              sx={{ bgcolor: "#fff" }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Skeleton
                    variant="circular"
                    width={56}
                    height={56}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={28}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={20}
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="30%"
                      height={28}
                      sx={{ mb: 1, borderRadius: 2 }}
                    />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : reports.length === 0 ? (
        <Typography className="report-history-empty">
          No reports found.
        </Typography>
      ) : (
        <Box>
          {reports.map((r) => (
            <Card
              key={r.reportId}
              className="report-history-card"
              sx={{ bgcolor: "linear-gradient(135deg, #fff 0%, #ffebee 100%)" }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems="flex-start"
                >
                  <Avatar
                    className="report-history-avatar"
                    sx={{ bgcolor: "#d32f2f", width: 56, height: 56 }}
                  >
                    <ReportIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="#d32f2f"
                      sx={{ mb: 1 }}
                    >
                      {r.reasonText}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="body2"
                        color="#374151"
                        sx={{
                          mb: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                          pr: 1,
                        }}
                      >
                        {r.details || <i>No details provided.</i>}
                      </Typography>
                      <Tooltip title="View full details of this report">
                        <IconButton
                          size="small"
                          aria-label="View details"
                          onClick={() => {
                            setSelectedReport(r);
                            setDetailDialogOpen(true);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box className="report-history-meta">
                      <Chip
                        className="report-history-status-chip"
                        label={
                          r.status.charAt(0).toUpperCase() + r.status.slice(1)
                        }
                        color={statusColors[r.status] || "default"}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatus(r.status);
                          setPageNumber(1);
                        }}
                      />
                      <Tooltip
                        title={
                          r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : ""
                        }
                      >
                        <Typography
                          variant="caption"
                          color="#6b7280"
                          sx={{ ml: 1 }}
                        >
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : ""}
                        </Typography>
                      </Tooltip>
                    </Box>
                    <Typography
                      className="report-history-id"
                      sx={{ mt: 1, color: "#9e9e9e" }}
                    >
                      Report ID: #{r.reportId} | Post ID: #{r.postId}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {totalPages > 1 && (
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}
            >
              <Pagination
                count={totalPages}
                page={pageNumber}
                onChange={(e, value) =>
                  setPageNumber(Math.max(1, Math.min(value, totalPages)))
                }
                color="error"
                variant="outlined"
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 20,
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#ffebee",
                      boxShadow: "0 0 0 2px rgba(211, 47, 47, 0.1)",
                    },
                  },
                  "& .Mui-selected": {
                    bgcolor: "#d32f2f",
                    color: "#fff",
                    "&:hover": { bgcolor: "#b71c1c" },
                  },
                  "& .MuiPaginationItem-ellipsis": { color: "#9e9e9e" },
                }}
              />
            </Box>
          )}
        </Box>
      )}
      {selectedReport && (
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: "#d32f2f" }}>
            Report Details
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: "#f9fafb" }}>
            <TextField
              label="Reason"
              value={selectedReport.reasonText}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Details"
              value={selectedReport.details || ""}
              fullWidth
              margin="dense"
              multiline
              minRows={2}
              maxRows={6}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Note"
              value={selectedReport.note || ""}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Status"
              value={selectedReport.status}
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Created At"
              value={
                selectedReport.createdAt
                  ? new Date(selectedReport.createdAt).toLocaleString()
                  : ""
              }
              fullWidth
              margin="dense"
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDetailDialogOpen(false)}
              color="error"
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default MyReportHistory;
