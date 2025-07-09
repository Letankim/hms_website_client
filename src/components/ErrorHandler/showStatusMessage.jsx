import { enqueueSnackbar } from "notistack";
import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export function extractErrors(error) {
  if (error?.errors) return Object.values(error.errors).flat();
  if (error?.response?.data?.errors)
    return Object.values(error.response.data.errors).flat();

  return [
    error?.response?.data?.message || error?.message || "Unexpected error",
  ];
}

export const showErrorFetchAPI = (error) => {
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
