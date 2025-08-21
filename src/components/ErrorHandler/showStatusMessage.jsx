import { enqueueSnackbar } from "notistack";
import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

export function extractErrors(error) {
  if (error?.errors) return Object.values(error.errors).flat();
  if (error?.response?.data?.errors)
    return Object.values(error.response.data.errors).flat();

  return [
    error?.response?.data?.message || error?.message || "Unexpected error",
  ];
}

const checkMaintenance = async () => {
  try {
    const res = await axios.get("https://3docorp.id.vn/maintain.json");
    if (res.data?.maintenance) {
      return (
        res.data?.message ||
        "Our system is currently undergoing scheduled maintenance to improve service quality. We apologize for the inconvenience. Please try again later or check back after some time."
      );
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const showErrorFetchAPI = (error) => {
  const status = error?.status;
  if (status === 521) {
    checkMaintenance()
      .then((maintenanceMessage) => {
        if (maintenanceMessage) {
          showWarningMessage(maintenanceMessage);
          return;
        }
      })
      .catch(() => {
        const messages = extractErrors(error);
        messages.forEach((msg, index) => {
          setTimeout(() => {
            showErrorMessage(msg);
          }, index * 1000);
        });
      });
  } else {
    const messages = extractErrors(error);

    messages.forEach((msg) => {
      enqueueSnackbar(msg, {
        variant: "error",
        action: (snackbarId) => (
          <IconButton
            onClick={() => window.snackbarClose(snackbarId)}
            sx={{ color: "#fff" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ),
      });
    });
  }
};

export const showErrorMessage = (message) => {
  enqueueSnackbar(message, {
    variant: "error",
    action: (snackbarId) => (
      <IconButton
        onClick={() => window.snackbarClose(snackbarId)}
        sx={{ color: "#fff" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    ),
  });
};

export const showSuccessMessage = (message) => {
  enqueueSnackbar(message, {
    variant: "success",
    action: (snackbarId) => (
      <IconButton
        onClick={() => window.snackbarClose(snackbarId)}
        sx={{ color: "#fff" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    ),
  });
};

export const showWarningMessage = (message) => {
  enqueueSnackbar(message, {
    variant: "warning",
    action: (snackbarId) => (
      <IconButton
        onClick={() => window.snackbarClose(snackbarId)}
        sx={{ color: "#fff" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    ),
  });
};

export const showInfoMessage = (message) => {
  enqueueSnackbar(message, {
    variant: "info",
    action: (snackbarId) => (
      <IconButton
        onClick={() => window.snackbarClose(snackbarId)}
        sx={{ color: "#fff" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    ),
  });
};
