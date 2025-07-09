import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./HealthChatInterface.module.css";
import axios from "axios";
import apiTrialRecommendationService from "services/apiTrialRecommendationService";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";

const HeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

const WarningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4zm0-4h-2v-6h2v6z" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);

const FitnessIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
  </svg>
);

const MealIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
  </svg>
);

const MoreVertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const VolumeUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const HealthChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "",
    fitnessGoal: "",
    dietaryPreferences: "",
    email: "",
  });

  const [sessionId, setSessionId] = useState(
    localStorage.getItem("trialSessionId") || ""
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMessageDeleteConfirm, setShowMessageDeleteConfirm] =
    useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const [synthesis, setSynthesis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [messageMenus, setMessageMenus] = useState({});
  const menuRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }

      const messageMenuElements = document.querySelectorAll(
        ".message-menu-container"
      );
      let clickedInsideMessageMenu = false;

      messageMenuElements.forEach((element) => {
        if (element.contains(event.target)) {
          clickedInsideMessageMenu = true;
        }
      });

      if (!clickedInsideMessageMenu) {
        setMessageMenus({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const speakText = (text) => {
    if (!synthesis) {
      console.warn("Speech synthesis not supported");
      return;
    }

    if (isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.speak(utterance);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  const handleDeleteSession = async () => {
    setIsDeleting(true);
    try {
      await apiTrialRecommendationService.deleteSession(sessionId);
      localStorage.removeItem("trialSessionId");
      setSessionId("");
      setIsSessionValid(false);
      setMessages([]);
      setExpandedAccordions({});
      setError("");
      setInput("");
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  const handleDeleteSessionClick = () => {
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteSession();
  };

  const handleDeleteMessageClick = (messageId) => {
    setMessageToDelete(messageId);
    setShowMessageDeleteConfirm(true);
  };

  const handleCancelMessageDelete = () => {
    setShowMessageDeleteConfirm(false);
    setMessageToDelete(null);
  };

  const handleConfirmMessageDelete = async () => {
    if (!messageToDelete) return;

    try {
      await apiTrialRecommendationService.deleteMessage(
        sessionId,
        messageToDelete
      );
      setMessages((prev) =>
        prev.filter((msg) => msg.messageId !== messageToDelete)
      );
      console.log("Message deleted successfully:", messageToDelete);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete message.");
      console.error("Message deletion error:", err);
    } finally {
      setShowMessageDeleteConfirm(false);
      setMessageToDelete(null);
    }
  };

  const handleMessageMenuToggle = (messageId) => {
    setMessageMenus((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleMessageMenuClose = (messageId) => {
    setMessageMenus((prev) => ({
      ...prev,
      [messageId]: false,
    }));
  };

  const handleDeleteFromMenu = (messageId) => {
    handleDeleteMessageClick(messageId);
    handleMessageMenuClose(messageId);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        showInfoMessage(
          "Please provide your health information to start chatting."
        );
        setIsSessionValid(false);
        return;
      }

      try {
        const response = await apiTrialRecommendationService.validateSession(
          sessionId
        );

        if (response.data.status === "Success") {
          setIsSessionValid(true);
          await fetchChatHistory();
        } else {
          showErrorMessage(
            "Session expired or invalid. Please provide your health information."
          );
          setIsSessionValid(false);
          localStorage.removeItem("trialSessionId");
          setSessionId("");
        }
      } catch (err) {
        showErrorFetchAPI(err);
        setIsSessionValid(false);
        localStorage.removeItem("trialSessionId");
        setSessionId("");
        console.error("Session validation error:", err);
      }
    };

    validateSession();
  }, [sessionId]);

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await apiTrialRecommendationService.getChatHistory(
        sessionId
      );
      if (
        response.data.status === "Success" &&
        Array.isArray(response.data.data)
      ) {
        const historyMessages = response.data.data.map((msg) => ({
          sessionId: msg.sessionId,
          role: msg.role,
          content:
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content),
          timestamp: msg.timestamp,
          messageId: msg.messageId || `msg-${Date.now() + Math.random()}`,
        }));
        setMessages(historyMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      showErrorFetchAPI(err);
      setMessages([]);
    }
  }, [sessionId]);

  const parseNestedJson = useCallback((jsonString) => {
    try {
      const parsed = jsonString;

      if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
        return JSON.parse(parsed.candidates[0].content.parts[0].text);
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing nested JSON:", error);
      return null;
    }
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiTrialRecommendationService.createRecommendation(
        formData
      );
      const { sessionId: newSessionId, response: recommendations } =
        response.data.data;
      localStorage.setItem("trialSessionId", newSessionId);
      setSessionId(newSessionId);
      setIsSessionValid(true);

      setMessages([
        {
          sessionId: newSessionId,
          role: "assistant",
          content: JSON.stringify(recommendations),
          timestamp: new Date().toISOString(),
          messageId: `msg-${Date.now()}`,
        },
      ]);
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!sessionId || !isSessionValid) {
      showInfoMessage("Please provide your health information to continue.");
      return;
    }

    const userMessage = {
      sessionId,
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      messageId: `msg-${Date.now()}`,
    };

    const currentInput = input;
    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiTrialRecommendationService.sendMessage(
        sessionId,
        currentInput
      );

      const assistantMessage = {
        sessionId,
        role: "assistant",
        content: JSON.stringify(
          response.data.data || {
            type: "chat",
            content: { message: "No response provided" },
          }
        ),
        timestamp: new Date().toISOString(),
        messageId: `msg-${Date.now()}`,
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, assistantMessage]);
      }, 300);
    } catch (err) {
      showErrorFetchAPI(err);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleAccordion = (key) => {
    setExpandedAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  function formatMessageSmart(message) {
    if (!message) return "";
    message = message.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

    message = message.replace(
      /(Phase \d+:.*?)(?=\n|\*\*|$)/g,
      "<br><br><b>$1</b>"
    );

    message = message.replace(
      /Important Considerations:/g,
      "<br><br><b>Important Considerations:</b>"
    );

    message = message.replace(/(?:^|\n)\* (.*?)(?=\n|$)/g, "<li>$1</li>");

    if (message.includes("<li>")) {
      message = message.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    }

    message = message.replace(/\n/g, "<br>");

    message = message.replace(/<b><br\s*\/?><br\s*\/?>/g, "<b>");
    message = message.replace(/<br\s*\/?><br\s*\/?><\/b>/g, "</b>");

    message = message.replace(/<b>\s*<b>(.*?)<\/b>\s*<\/b>/g, "<b>$1</b>");

    return message.trim();
  }

  const renderMessage = (msg, index) => {
    let parsedContent;
    try {
      if (
        typeof msg.content === "string" &&
        msg.content.trim().startsWith("{")
      ) {
        parsedContent = JSON.parse(msg.content);
        const rawContent = JSON.parse(msg.content);
        parsedContent = {
          type: rawContent.type || "chat",
          content: {
            user_data: rawContent.content.user_data,
            goal_plan: parseNestedJson(rawContent.content.goal_plan),
            meal_recommendations: parseNestedJson(
              rawContent.content.meal_recommendations
            ),
            exercise_recommendations: parseNestedJson(
              rawContent.content.exercise_recommendations
            ),
            message: formatMessageSmart(rawContent?.content?.message),
          },
        };

        console.log(parsedContent);
      } else {
        parsedContent = {
          type: "chat",
          content: { message: msg.content },
        };
      }
    } catch (e) {
      console.error("JSON parse error:", e);
      parsedContent = {
        type: "error",
        content: { error: `Invalid response format: ${e.message}` },
      };
    }

    return (
      <div
        key={index}
        className={`${styles["message-container"]} ${styles[msg.role]}`}
      >
        <div
          className={`${styles["message-bubble"]} ${
            styles[msg.role == "user" ? "message-bubble-user" : ""]
          }`}
        >
          <div className={styles["message-header"]}>
            <div className={styles["message-header-left"]}>
              <div
                className={`${styles["message-avatar"]} ${styles[msg.role]}`}
              >
                {msg.role === "user" ? <UserIcon /> : <BotIcon />}
              </div>
              <span className={styles["message-author"]}>
                {msg.role === "user" ? "You" : "HMS Chat Bot"}
              </span>
              {msg.role === "assistant" && parsedContent.type === "chat" && (
                <button
                  onClick={() =>
                    speakText(parsedContent.content?.message || msg.content)
                  }
                  className={styles["voice-button"]}
                  style={{
                    padding: "0.25rem",
                    minWidth: "auto",
                    marginLeft: "0.5rem",
                    background: isSpeaking
                      ? "var(--error-color)"
                      : "var(--accent-teal)",
                  }}
                  title={isSpeaking ? "Stop reading" : "Read aloud"}
                >
                  <VolumeUpIcon />
                </button>
              )}
            </div>

            <div className={styles["message-header-right"]}>
              {msg.messageId && (
                <div
                  className={`${styles["message-menu-container"]} message-menu-container`}
                >
                  <button
                    className={styles["message-menu-button"]}
                    onClick={() => handleMessageMenuToggle(msg.messageId)}
                    title="Message options"
                  >
                    <MoreVertIcon style={{ width: "12px", height: "12px" }} />
                  </button>
                  {messageMenus[msg.messageId] && (
                    <div className={styles["message-menu-dropdown"]}>
                      <button
                        className={`${styles["message-menu-item"]} ${styles.danger}`}
                        onClick={() => handleDeleteFromMenu(msg.messageId)}
                      >
                        <DeleteIcon style={{ width: "12px", height: "12px" }} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={`${styles["message-content"]} ${styles[msg.role]} ${
              parsedContent.content?.error ? styles.error : ""
            }`}
          >
            {parsedContent.content?.error ? (
              <p className={styles["message-text"]}>
                {parsedContent.content.error}
              </p>
            ) : parsedContent.type === "recommendations" ? (
              <div className={styles["recommendations-card"]}>
                <div className={styles["recommendations-header"]}>
                  <HeartIcon />
                  Your Personalized Health Plan
                </div>

                {/* User Data Section */}
                <div className={styles.accordion}>
                  <button
                    className={`${styles["accordion-header"]} ${
                      expandedAccordions["user-data"] ? styles.expanded : ""
                    }`}
                    onClick={() => toggleAccordion("user-data")}
                  >
                    <span>Your Health Profile</span>
                    <ChevronDownIcon className={styles["accordion-icon"]} />
                  </button>
                  {expandedAccordions["user-data"] && (
                    <div className={styles["accordion-content"]}>
                      <div className={styles["user-data-grid"]}>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>Gender</span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.gender ||
                              parsedContent.content.user_data?.gender ||
                              "N/A"}
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>Age</span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.age ||
                              parsedContent.content.user_data?.age ||
                              "N/A"}{" "}
                            years
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>Height</span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.height_cm ||
                              parsedContent.content.user_data?.height_cm ||
                              "N/A"}{" "}
                            cm
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>Weight</span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.weight_kg ||
                              parsedContent.content.user_data?.weight_kg ||
                              "N/A"}{" "}
                            kg
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>
                            Activity Level
                          </span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.activity_level ||
                              parsedContent.content.user_data?.activity_level ||
                              "N/A"}
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>
                            Fitness Goal
                          </span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.fitness_goal ||
                              parsedContent.content.user_data?.fitness_goal ||
                              "N/A"}
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>BMI</span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data?.bmi ||
                              parsedContent.content.user_data?.bmi ||
                              "N/A"}
                          </span>
                        </div>
                        <div className={styles["data-item"]}>
                          <span className={styles["data-label"]}>
                            Dietary Preferences
                          </span>
                          <span className={styles["data-value"]}>
                            {parsedContent.content.input_data
                              ?.dietary_preferences ||
                              parsedContent.content.user_data
                                ?.dietary_preferences ||
                              "None"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.accordion}>
                  <button
                    className={`${styles["accordion-header"]} ${
                      expandedAccordions["goal-plan"] ? styles.expanded : ""
                    }`}
                    onClick={() => toggleAccordion("goal-plan")}
                  >
                    <span>Your Fitness Journey Plan</span>
                    <ChevronDownIcon className={styles["accordion-icon"]} />
                  </button>
                  {expandedAccordions["goal-plan"] && (
                    <div className={styles["accordion-content"]}>
                      <div className={styles["plan-section"]}>
                        <div className={styles["plan-title"]}>
                          <CalendarIcon />
                          Evaluation
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Evaluation
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content.goal_plan.evaluation
                              ?.summary || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-title"]}>
                          <CalendarIcon />
                          One-Month Plan
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Exercise Schedule
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content.goal_plan.goal_plan
                              ?.one_month_plan?.exercise_schedule || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Nutrition Targets
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content.goal_plan.goal_plan
                              ?.one_month_plan?.nutrition_targets || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Milestones
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content.goal_plan.goal_plan
                              ?.one_month_plan?.milestones || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Expert Advice
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content.goal_plan.goal_plan
                              ?.one_month_plan?.advice || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className={styles["plan-section"]}>
                        <div className={styles["plan-title"]}>
                          <CalendarIcon />
                          Two-Month Plan
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Exercise Schedule
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content?.goal_plan.goal_plan
                              ?.two_month_plan?.exercise_schedule || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Nutrition Targets
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content?.goal_plan?.goal_plan
                              ?.two_month_plan?.nutrition_targets || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Milestones
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content?.goal_plan?.goal_plan
                              ?.two_month_plan?.milestones || "N/A"}
                          </div>
                        </div>
                        <div className={styles["plan-item"]}>
                          <div className={styles["plan-item-title"]}>
                            Expert Advice
                          </div>
                          <div className={styles["plan-item-content"]}>
                            {parsedContent.content?.goal_plan.goal_plan
                              ?.two_month_plan?.advice || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meal Recommendations Section */}
                <div className={styles.accordion}>
                  <button
                    className={`${styles["accordion-header"]} ${
                      expandedAccordions["meals"] ? styles.expanded : ""
                    }`}
                    onClick={() => toggleAccordion("meals")}
                  >
                    <span>Meal Recommendations</span>
                    <ChevronDownIcon className={styles["accordion-icon"]} />
                  </button>
                  {expandedAccordions["meals"] && (
                    <div className={styles["accordion-content"]}>
                      <p className={styles["plan-item-content"]}>
                        {parsedContent.content.meal_recommendations
                          ?.evaluation || "N/A"}
                      </p>
                      {parsedContent.content.meal_recommendations?.meals?.map(
                        (meal, i) => (
                          <div key={i} className={styles["meal-card"]}>
                            <div className={styles["card-title"]}>
                              <MealIcon />
                              {meal.name} ({meal.meal_type})
                            </div>
                            <div className={styles["card-details"]}>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Calories:
                                </span>{" "}
                                {meal.calories || "N/A"}
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Protein:
                                </span>{" "}
                                {meal.protein_g || "N/A"}g
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Carbs:
                                </span>{" "}
                                {meal.carbs_g || "N/A"}g
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Fats:
                                </span>{" "}
                                {meal.fats_g || "N/A"}g
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Portion:
                                </span>{" "}
                                {meal.portion_size || "N/A"}
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Score:
                                </span>{" "}
                                {meal.suitability_score || "N/A"}
                                /10
                              </div>
                            </div>
                            {meal.notes && (
                              <div className={styles["card-notes"]}>
                                <InfoIcon /> {meal.notes}
                              </div>
                            )}
                          </div>
                        )
                      ) || (
                        <p className={styles["plan-item-content"]}>
                          No meals available
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Exercise Recommendations Section */}
                <div className={styles.accordion}>
                  <button
                    className={`${styles["accordion-header"]} ${
                      expandedAccordions["exercises"] ? styles.expanded : ""
                    }`}
                    onClick={() => toggleAccordion("exercises")}
                  >
                    <span>Exercise Recommendations</span>
                    <ChevronDownIcon className={styles["accordion-icon"]} />
                  </button>
                  {expandedAccordions["exercises"] && (
                    <div className={styles["accordion-content"]}>
                      <p className={styles["plan-item-content"]}>
                        {parsedContent.content.exercise_recommendations
                          ?.evaluation || "N/A"}
                      </p>
                      {parsedContent.content.exercise_recommendations?.exercises?.map(
                        (exercise, i) => (
                          <div key={i} className={styles["exercise-card"]}>
                            <div className={styles["card-title"]}>
                              <FitnessIcon />
                              {exercise.ExerciseName || exercise.name} (
                              {exercise.type})
                            </div>
                            <div className={styles["card-details"]}>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Duration:
                                </span>{" "}
                                {exercise.duration || "N/A"}
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Sets:
                                </span>{" "}
                                {exercise.sets || "N/A"}
                              </div>
                              <div className={styles["detail-item"]}>
                                <span className={styles["detail-label"]}>
                                  Reps:
                                </span>{" "}
                                {exercise.reps || "As many as possible"}
                              </div>
                            </div>
                            {(exercise.note || exercise.notes) && (
                              <div className={styles["card-notes"]}>
                                <InfoIcon /> {exercise.note || exercise.notes}
                              </div>
                            )}
                          </div>
                        )
                      ) || (
                        <p className={styles["plan-item-content"]}>
                          No exercises available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p
                className={styles["message-text"]}
                dangerouslySetInnerHTML={{
                  __html:
                    parsedContent.content?.message ||
                    parsedContent.content?.error ||
                    "No response provided",
                }}
              ></p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isSessionValid) {
    return (
      <div className={styles["chat-container"]}>
        <div className={styles["chat-wrapper"]}>
          <div className={styles["chat-header"]}>
            <div className={styles["header-content"]}>
              <h1 className={styles["header-title"]}>
                Health & Fitness Assistant
              </h1>
              <p className={styles["header-subtitle"]}>
                Your personal AI-powered health companion
              </p>
            </div>
          </div>

          {error && (
            <div className={styles["error-banner"]}>
              <WarningIcon className={styles["error-icon"]} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles["health-form"]}>
            <div className={styles["form-title"]}>
              <InfoIcon />
              Tell us about yourself
            </div>
            <p className={styles["form-description"]}>
              Please provide your health information so we can create a
              personalized fitness and nutrition plan just for you.
            </p>

            <form onSubmit={handleFormSubmit}>
              <div className={styles["form-grid"]}>
                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Gender{" "}
                    <span className={styles["required-indicator"]}>*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className={styles["form-select"]}
                    required
                  >
                    <option value="">Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <span className={styles["form-helper"]}>
                    Select your gender
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Age <span className={styles["required-indicator"]}>*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleFormChange}
                    className={styles["form-input"]}
                    min="12"
                    max="120"
                    required
                    placeholder="Enter your age"
                  />
                  <span className={styles["form-helper"]}>
                    Age between 12 and 120 years
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Height (cm){" "}
                    <span className={styles["required-indicator"]}>*</span>
                  </label>
                  <input
                    type="number"
                    name="heightCm"
                    value={formData.heightCm}
                    onChange={handleFormChange}
                    className={styles["form-input"]}
                    min="100"
                    max="250"
                    required
                    placeholder="Enter your height"
                  />
                  <span className={styles["form-helper"]}>
                    Height between 100 and 250 cm
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Weight (kg){" "}
                    <span className={styles["required-indicator"]}>*</span>
                  </label>
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleFormChange}
                    className={styles["form-input"]}
                    min="30"
                    max="300"
                    required
                    placeholder="Enter your weight"
                  />
                  <span className={styles["form-helper"]}>
                    Weight between 30 and 300 kg
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Activity Level{" "}
                    <span className={styles["required-indicator"]}>*</span>
                  </label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleFormChange}
                    className={styles["form-select"]}
                    required
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">
                      Sedentary (little to no exercise)
                    </option>
                    <option value="moderate">
                      Moderate (light exercise 1-3 days/week)
                    </option>
                    <option value="active">
                      Active (moderate exercise 3-5 days/week)
                    </option>
                  </select>
                  <span className={styles["form-helper"]}>
                    Select your daily activity level
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Fitness Goal{" "}
                    <span className={styles["required-indicator"]}>*</span>
                  </label>
                  <select
                    name="fitnessGoal"
                    value={formData.fitnessGoal}
                    onChange={handleFormChange}
                    className={styles["form-select"]}
                    required
                  >
                    <option value="">Select your goal</option>
                    <option value="weight loss">Weight Loss</option>
                    <option value="muscle gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="weight gain">Weight Gain</option>
                  </select>
                  <span className={styles["form-helper"]}>
                    What do you want to achieve?
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>
                    Dietary Preferences
                  </label>
                  <input
                    type="text"
                    name="dietaryPreferences"
                    value={formData.dietaryPreferences}
                    onChange={handleFormChange}
                    className={styles["form-input"]}
                    placeholder="e.g., vegetarian, low-carb, no dairy"
                  />
                  <span className={styles["form-helper"]}>
                    Any dietary restrictions or preferences
                  </span>
                </div>

                <div className={styles["form-group"]}>
                  <label className={styles["form-label"]}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={styles["form-input"]}
                    placeholder="your.email@example.com"
                  />
                  <span className={styles["form-helper"]}>
                    For updates and progress tracking
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={styles["submit-button"]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles["loading-spinner"]}></div>
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <HeartIcon />
                    Start My Health Journey
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["chat-container"]}>
      <div className={styles["chat-wrapper"]}>
        <div className={styles["chat-header"]}>
          <div className={styles["header-content"]}>
            <h1 className={styles["header-title"]}>
              Health & Fitness Assistant
            </h1>
            <p className={styles["header-subtitle"]}>
              Ask me anything about your health and fitness journey
            </p>
          </div>
        </div>

        {error && (
          <div className={styles["error-banner"]}>
            <WarningIcon className={styles["error-icon"]} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles["chat-interface"]}>
          <div className={styles["chat-messages"]}>
            <div className={styles["messages-container"]}>
              {messages.map((msg, index) => renderMessage(msg, index))}
              {isLoading && (
                <div
                  className={`${styles["message-container"]} ${styles.assistant} ${styles.thinking}`}
                >
                  <div className={styles["message-bubble"]}>
                    <div className={styles["message-header"]}>
                      <div
                        className={`${styles["message-avatar"]} ${styles.assistant}`}
                      >
                        <BotIcon />
                      </div>
                      <span className={styles["message-author"]}>
                        HMS Chat Bot
                      </span>
                    </div>
                    <div
                      className={`${styles["message-content"]} ${styles.assistant}`}
                    >
                      <div className={styles["thinking-animation"]}>
                        <div className={styles["thinking-dots"]}>
                          <div className={styles["thinking-dot"]}></div>
                          <div className={styles["thinking-dot"]}></div>
                          <div className={styles["thinking-dot"]}></div>
                        </div>
                        <span className={styles["thinking-text"]}>
                          Analyzing your health data...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className={styles["message-spacer"]}></div>
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className={styles["chat-input-container"]}>
            <div className={styles["input-wrapper"]}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles["chat-input"]}
                placeholder="Ask me about nutrition, exercises, or your health plan..."
                rows="1"
                disabled={isLoading}
              />
              <div className={styles["input-actions"]}>
                <div className={styles["chat-controls"]}>
                  <div className={styles["menu-container"]} ref={menuRef}>
                    <button
                      className={styles["menu-button"]}
                      onClick={() => setShowMenu(!showMenu)}
                      title="More options"
                    >
                      <MoreVertIcon />
                    </button>
                    {showMenu && (
                      <div className={styles["menu-dropdown"]}>
                        <button
                          className={`${styles["menu-item"]} ${styles.danger}`}
                          onClick={handleDeleteSessionClick}
                        >
                          <TrashIcon />
                          Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  className={styles["send-button"]}
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? (
                    <div className={styles["loading-spinner"]}></div>
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Session Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles["modal-overlay"]} onClick={handleCancelDelete}>
          <div
            className={styles["modal-container"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <div className={styles["modal-header-content"]}>
                <WarningIcon />
                <h2 className={styles["modal-title"]}>Clear Chat Session</h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={handleCancelDelete}
              >
                <CloseIcon />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              <div className={styles["confirmation-icon"]}>
                <TrashIcon style={{ width: "32px", height: "32px" }} />
              </div>
              <h3 className={styles["confirmation-title"]}>Are you sure?</h3>
              <p className={styles["confirmation-message"]}>
                This will permanently delete your current chat session,
                including all messages and your health profile data.
              </p>
              <p className={styles["confirmation-warning"]}>
                This action cannot be undone.
              </p>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={handleCancelDelete}
              >
                <CloseIcon />
                Cancel
              </button>
              <button
                className={styles["confirm-delete-btn"]}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className={styles["loading-spinner"]}></div>
                    Clearing...
                  </>
                ) : (
                  <>
                    <TrashIcon />
                    Clear Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {showMessageDeleteConfirm && (
        <div
          className={styles["modal-overlay"]}
          onClick={handleCancelMessageDelete}
        >
          <div
            className={styles["modal-container"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["modal-header"]}>
              <div className={styles["modal-header-content"]}>
                <WarningIcon />
                <h2 className={styles["modal-title"]}>Delete Message</h2>
              </div>
              <button
                className={styles["modal-close-btn"]}
                onClick={handleCancelMessageDelete}
              >
                <CloseIcon />
              </button>
            </div>

            <div className={styles["modal-content"]}>
              <div className={styles["confirmation-icon"]}>
                <DeleteIcon style={{ width: "32px", height: "32px" }} />
              </div>
              <h3 className={styles["confirmation-title"]}>
                Delete this message?
              </h3>
              <p className={styles["confirmation-message"]}>
                This will permanently remove this message from your chat
                history.
              </p>
              <p className={styles["confirmation-warning"]}>
                This action cannot be undone.
              </p>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={styles["cancel-btn"]}
                onClick={handleCancelMessageDelete}
              >
                <CloseIcon />
                Cancel
              </button>
              <button
                className={styles["confirm-delete-btn"]}
                onClick={handleConfirmMessageDelete}
              >
                <DeleteIcon />
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className={styles["success-notification"]}>
          <CheckIcon />
          <span>
            Session cleared successfully! You can start a new health journey.
          </span>
        </div>
      )}
    </div>
  );
};

export default HealthChatInterface;
