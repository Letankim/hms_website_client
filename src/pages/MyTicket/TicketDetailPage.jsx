import { useContext, useEffect, useState } from "react";
import {
  ArrowLeft2,
  Send2,
  MessageText,
  DocumentText,
  Calendar,
  User,
  Warning2,
  TickCircle,
  CloseCircle,
} from "iconsax-react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import DOMPurify from "dompurify";
import apiTicketUserService from "services/apiTicketUserService";
import { extractErrors } from "components/ErrorHandler/extractErrors";
import "./TicketDetailPage.css";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";
import { DoneAll } from "@mui/icons-material";

const TicketDetailPage = () => {
  const { ticketId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTicketDetails = async () => {
    setLoading(true);
    try {
      if (!user?.userId || !ticketId) {
        throw new Error("Invalid user or ticket ID.");
      }
      const response = await apiTicketUserService.getTicketById(ticketId);
      if (response.statusCode === 200 && response.data) {
        setTicket(response.data);
      } else {
        throw new Error("Failed to fetch ticket details.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const params = { pageNumber: 1, pageSize: 100 };
      const response = await apiTicketUserService.getResponsesForUser(
        ticketId,
        params
      );
      if (response.statusCode === 200 && response.data) {
        setResponses(response.data.responses || []);
      } else {
        throw new Error("Failed to fetch responses.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleAddResponse = async () => {
    if (!newResponse.trim()) {
      showErrorMessage("Response cannot be empty");
      return;
    }

    if (newResponse.length > 1000) {
      showErrorMessage("Response cannot exceed 1000 characters");
      return;
    }

    try {
      const responseData = { responseText: newResponse };
      await apiTicketUserService.addResponse(ticketId, responseData);
      showSuccessMessage("Response added successfully.");
      setNewResponse("");
      await fetchResponses();
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTicketDetails();
      fetchResponses();
    }
  }, [user, ticketId]);

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setNewResponse(data);
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

  if (loading) {
    return (
      <div className="ticket-detail-container">
        <div className="ticket-detail-loading">
          <div className="loading-skeleton">
            <div className="skeleton skeleton-header"></div>
            <div className="skeleton skeleton-content"></div>
            <div className="skeleton skeleton-responses"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-container">
        <div className="ticket-detail-error">
          <div className="error-card">
            <div className="error-icon">
              <Warning2 size="80" color="var(--accent-error)" />
            </div>
            <h2 className="error-title">Ticket Not Found</h2>
            <p className="error-description">
              The ticket you're looking for doesn't exist or has been removed.
            </p>
            <button
              className="back-button"
              onClick={() => navigate("/my-ticket")}
            >
              <ArrowLeft2 size="20" color="#fff" />
              Back to My Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-container">
      <div className="ticket-detail-content">
        {/* Header Section */}
        <div className="ticket-header">
          <div className="header-top">
            <button
              className="back-button"
              onClick={() => navigate("/my-ticket")}
            >
              <ArrowLeft2 size="20" color="#fff" />
              Back to Tickets
            </button>
            <div className="ticket-id">#TICKET{ticketId}</div>
          </div>
          <div className="header-main">
            <div className="ticket-icon">
              <DocumentText
                size="32"
                color="var(--secondary-color)"
                variant="Bold"
              />
            </div>
            <div className="ticket-info">
              <h1 className="ticket-title">{ticket.title || "N/A"}</h1>
              <div className="ticket-meta">
                <span
                  className="status-chip"
                  style={{
                    backgroundColor: getStatusColor(ticket.status),
                  }}
                >
                  {ticket.status
                    ? ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)
                    : "N/A"}
                </span>
                <span
                  className="priority-chip"
                  style={{
                    backgroundColor: getPriorityColor(ticket.priority),
                  }}
                >
                  {ticket.priority
                    ? ticket.priority.charAt(0).toUpperCase() +
                      ticket.priority.slice(1)
                    : "N/A"}
                </span>
                <span className="meta-item">
                  <Calendar size="16" />
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Details Card */}
        <div className="ticket-details-card">
          <div className="card-header">
            <h2 className="card-title">Ticket Details</h2>
          </div>
          <div className="card-content">
            <div className="details-grid">
              <div className="detail-item">
                <label>Request ID</label>
                <span>#TICKET{ticket.ticketId || "N/A"}</span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span
                  className="status-chip"
                  style={{
                    backgroundColor: getStatusColor(ticket.status),
                    color: "#fff",
                  }}
                >
                  {ticket.status
                    ? ticket.status.charAt(0).toUpperCase() +
                      ticket.status.slice(1)
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <label>Priority</label>
                <span
                  className="priority-chip"
                  style={{
                    backgroundColor: getPriorityColor(ticket.priority),
                  }}
                >
                  {ticket.priority
                    ? ticket.priority.charAt(0).toUpperCase() +
                      ticket.priority.slice(1)
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <label>Category</label>
                <span>{ticket.category || "N/A"}</span>
              </div>
              <div className="detail-item">
                <label>Assigned To</label>
                <span>{ticket.assignedToFullName || "Unassigned"}</span>
              </div>
              <div className="detail-item">
                <label>Created At</label>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="detail-item">
                <label>Updated At</label>
                <span>{formatDate(ticket.updatedAt) || "Not updated"}</span>
              </div>
              <div className="detail-item">
                <label>Resolved At</label>
                <span>{formatDate(ticket.resolvedAt) || "Not resolved"}</span>
              </div>
            </div>
            <div className="ticket-description">
              <h3 className="description-title">Description</h3>
              <div
                className="description-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(ticket.description),
                }}
              />
            </div>
          </div>
        </div>

        {/* Responses Section */}
        <div className="responses-section">
          <div className="section-header">
            <h2 className="section-title">
              <MessageText
                size="24"
                color="var(--secondary-color)"
                variant="Bold"
              />
              Conversation
            </h2>
            <span className="responses-count">
              {responses.length} responses
            </span>
          </div>
          <div className="responses-list">
            {responses.length === 0 ? (
              <div className="no-responses">
                <div className="no-responses-icon">
                  <MessageText size="48" color="var(--text-secondary)" />
                </div>
                <p className="no-responses-text">
                  No responses yet. Be the first to reply!
                </p>
              </div>
            ) : (
              responses.map((res) => (
                <div key={res.responseId} className="response-item">
                  <div className="response-header">
                    <div className="response-author">
                      <div className="author-avatar">
                        <User size="20" color="white" variant="Bold" />
                      </div>
                      <div className="author-info">
                        <span className="author-name">
                          {res.userId === user.userId ? "You" : "HMS Support"}
                        </span>
                        <span className="author-email">
                          {res.userId === user.userId
                            ? user.email
                            : "3docorp@gmail.com"}
                        </span>
                      </div>
                    </div>
                    <div className="response-time">
                      <Calendar size="14" />
                      {formatDate(res.createdAt)}
                    </div>
                  </div>
                  <div
                    className={`response-content ${
                      res.userId === user.userId
                        ? "user-response"
                        : "support-response"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: res.responseText }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply Section */}
        <div className="reply-section">
          <div className="section-header">
            <h2 className="section-title">
              {ticket.status === "resolved" ? (
                <>
                  <DoneAll
                    size="24"
                    color="var(--secondary-color)"
                    variant="Bold"
                  />
                </>
              ) : (
                <>
                  <Send2
                    size="24"
                    color="var(--secondary-color)"
                    variant="Bold"
                  />
                </>
              )}

              {ticket.status === "resolved" ? "Resolved" : "Add Reply"}
            </h2>
          </div>

          {ticket.status === "resolved" ? (
            <div
              className="resolved-message"
              style={{ color: "gray", fontStyle: "italic", marginTop: "1rem" }}
            >
              This ticket has been resolved. No further replies can be added.
            </div>
          ) : (
            <div className="reply-form">
              <div className="editor-container">
                <CKEditor
                  editor={ClassicEditor}
                  data={newResponse}
                  onChange={handleEditorChange}
                  onReady={(editor) => {
                    editor.editing.view.change((writer) => {
                      writer.setStyle(
                        "min-height",
                        "150px",
                        editor.editing.view.document.getRoot()
                      );
                    });
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
                    placeholder: "Enter your response here...",
                  }}
                />
              </div>
              <div className="form-actions">
                <button
                  className="back-button secondary"
                  onClick={() => navigate("/my-ticket")}
                >
                  <ArrowLeft2 size="18" color="#fff" />
                  Back
                </button>
                <button className="send-button" onClick={handleAddResponse}>
                  <Send2 size="18" color="#fff" />
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="snackbar success">
          <div className="snackbar-content">
            <TickCircle size="20" color="white" variant="Bold" />
            <span>{successMessage}</span>
            <button className="snackbar-close" onClick={handleCloseSuccess}>
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="snackbar error">
          <div className="snackbar-content">
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button className="snackbar-close" onClick={handleCloseError}>
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;
