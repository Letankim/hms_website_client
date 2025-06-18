import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  Grid,
  Skeleton,
  IconButton,
  Tooltip,
  Chip,
  Pagination,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import apiServicePackageService from "services/apiServicePackageService";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import "./index.css";

const ServicePackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        Status: "active",
      };
      const res = await apiServicePackageService.getAllActivePackages(params);
      setPackages(res.data?.packages || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (e) {
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [pageNumber]);

  const handleOpenDetail = (pkg) => {
    navigate(`/service-packages/${pkg.packageId}`);
  };

  return (
    <Box className="service-package-container">
      <Box className="service-package-header">
        <Typography variant="h4">Service Packages</Typography>
      </Box>

      {loading ? (
        <Grid container spacing={2}>
          {[...Array(pageSize)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card className="service-package-card">
                <Box className="card-header">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box className="card-title">
                    <Skeleton width="60%" height={20} />
                    <Skeleton width="40%" height={16} />
                  </Box>
                </Box>
                <Skeleton height={56} sx={{ mb: 1 }} />
                <Skeleton width="40%" height={16} />
                <Skeleton width="30%" height={16} />
                <Skeleton height={32} sx={{ mt: "auto" }} />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : packages.length === 0 ? (
        <Typography className="no-packages">
          No service packages found.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {packages.map((pkg) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={pkg.packageId}
              className="box-card"
            >
              <Card className="service-package-card">
                <Box className="card-header">
                  <Avatar
                    src={pkg.trainerAvatar || "/placeholder-avatar.jpg"}
                    alt={pkg.trainerFullName}
                  />
                  <Box className="card-title">
                    <Typography variant="h6" title={pkg.packageName}>
                      {pkg.packageName}
                    </Typography>
                    <Typography
                      variant="body2"
                      title={`by ${pkg.trainerFullName}`}
                    >
                      by {pkg.trainerFullName}
                    </Typography>
                  </Box>
                  <Tooltip title="View package details">
                    <IconButton onClick={() => handleOpenDetail(pkg)}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box className="card-content">
                  <Typography
                    className="card-description"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(pkg.description),
                    }}
                  />
                  <Box className="card-chips">
                    <Chip label={`${pkg.durationDays} days`} color="info" />
                    <Chip
                      label={
                        pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)
                      }
                      color="success"
                    />
                  </Box>
                </Box>

                <Box className="card-footer">
                  <Typography variant="h6">
                    {pkg.price.toLocaleString()} VND
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDetail(pkg)}
                    fullWidth
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {totalPages > 1 && (
        <Box className="pagination-container">
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={(e, value) => setPageNumber(value)}
            color="primary"
            variant="outlined"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
};

export default ServicePackage;
