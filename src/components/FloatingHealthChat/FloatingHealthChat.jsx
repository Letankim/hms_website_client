import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./FloatingHealthChat.module.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
} from "components/ErrorHandler/showStatusMessage";
import apiTrialRecommendationService from "services/apiTrialRecommendationService";
import Select from "react-select";

const HeartIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <circle cx="6" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <line x1="12" y1="9" x2="12" y2="6" />
    <line x1="12" y1="15" x2="12" y2="18" />
    <line x1="6" y1="8" x2="10" y2="10" />
    <line x1="6" y1="16" x2="10" y2="14" />
    <line x1="18" y1="8" x2="14" y2="10" />
    <line x1="18" y1="16" x2="14" y2="14" />
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

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const MinimizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2z" />
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

const VolumeUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .5-.1.7-.3L14.4 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12H5v-2h8v2zm3-3H5V9h11v2zm0-3H5V6h11v2z" />
  </svg>
);
const fitnessGoalOptions = [
  { value: "Weight Loss", label: "Weight Loss" },
  { value: "Muscle Gain", label: "Muscle Gain" },
  { value: "Endurance", label: "Endurance" },
  { value: "Weight Gain", label: "Weight Gain" },
  { value: "Fat Loss", label: "Fat Loss" },
  { value: "Muscle Definition", label: "Muscle Definition" },
  { value: "Cutting", label: "Cutting" },
  { value: "Bulking", label: "Bulking" },
];

const dietaryOptions = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "Low-carb", label: "Low-carb" },
  { value: "High-protein", label: "High-protein" },
  { value: "No dairy", label: "No dairy" },
  { value: "Gluten-free", label: "Gluten-free" },
  { value: "Keto", label: "Keto" },
  { value: "Pescatarian", label: "Pescatarian" },
];
const FloatingHealthChat = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState({});
  const messagesEndRef = useRef(null);
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
  const [formDataMultiple, setFormDataMultiple] = useState({
    fitnessGoals: [],
    dietaryPreferences: [],
  });

  const [sessionId, setSessionId] = useState(
    localStorage.getItem("trialSessionId") || ""
  );
  const [synthesis, setSynthesis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        setSynthesis(window.speechSynthesis);
      }
    }
  }, []);

  const speakText = (text) => {
    if (!synthesis) {
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        setError("Please provide your health information to start chatting.");
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
      }
    };

    if (isOpen) {
      validateSession();
    }
  }, [sessionId, isOpen]);

  const fetchChatHistory = async () => {
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
  };

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

  const parseNestedJson = useCallback((jsonString) => {
    try {
      const parsed = jsonString;

      if (parsed?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return JSON.parse(parsed?.candidates[0].content.parts[0].text);
      }
      return parsed;
    } catch (error) {
      console.error("Error parsing nested JSON:", error);
      return null;
    }
  }, []);

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
      } else {
        parsedContent = {
          type: "chat",
          content: { message: msg.content },
        };
      }
    } catch (e) {
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

  return (
    <>
      {/* Floating Chat Button */}
      <div
        className={styles["floating-chat-button"]}
        onClick={() => setIsOpen(true)}
      >
        <div className={styles["chat-button-icon"]}>
          <HeartIcon />
        </div>
        <div className={styles["chat-button-pulse"]}></div>
      </div>

      {/* Chat Modal */}
      {isOpen && (
        <div className={styles["chat-modal-overlay"]}>
          <div className={styles["chat-modal"]}>
            {/* Modal Header */}
            <div className={styles["modal-header"]}>
              <div className={styles["header-content"]}>
                <div
                  className={styles["header-icon"]}
                  onClick={() => {
                    navigate("chat");
                    setIsOpen(false);
                  }}
                >
                  <HeartIcon />
                </div>
                <div className={styles["header-text"]}>
                  <h3 className={styles["header-title"]}>HMS Assistant</h3>
                  <p className={styles["header-subtitle"]}>
                    Your AI-powered health companion
                  </p>
                </div>
              </div>
              <div className={styles["header-actions"]}>
                <button
                  className={styles["minimize-button"]}
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                >
                  <MinimizeIcon />
                </button>
                <button
                  className={styles["close-button"]}
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className={styles["error-banner"]}>
                <WarningIcon className={styles["error-icon"]} />
                <span>{error}</span>
              </div>
            )}

            {/* Chat Content */}
            <div className={styles["chat-content"]}>
              {!isSessionValid ? (
                // Health Form
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
                        <label className={styles["form-label"]}>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          className={styles["form-input"]}
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Gender{" "}
                          <span className={styles["required-indicator"]}>
                            *
                          </span>
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
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Age{" "}
                          <span className={styles["required-indicator"]}>
                            *
                          </span>
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
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Height (cm){" "}
                          <span className={styles["required-indicator"]}>
                            *
                          </span>
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
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Weight (kg){" "}
                          <span className={styles["required-indicator"]}>
                            *
                          </span>
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
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Activity Level{" "}
                          <span className={styles["required-indicator"]}>
                            *
                          </span>
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
                            Moderate (1-3 days/week)
                          </option>
                          <option value="active">Active (3-5 days/week)</option>
                        </select>
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Fitness Goals{" "}
                          <span className={styles["required-indicator"]}>
                            *
                          </span>
                        </label>
                        <Select
                          isMulti
                          name="fitnessGoals"
                          options={fitnessGoalOptions}
                          classNamePrefix="select"
                          value={fitnessGoalOptions.filter((opt) =>
                            formDataMultiple.fitnessGoals.includes(opt.value)
                          )}
                          onChange={(selected) => {
                            const selectedValues = selected.map((s) => s.value);
                            setFormDataMultiple((prev) => ({
                              ...prev,
                              fitnessGoals: selectedValues,
                            }));

                            setFormData((prev) => ({
                              ...prev,
                              fitnessGoal: selectedValues.join(", "),
                            }));
                          }}
                        />
                      </div>
                      <div className={styles["form-group"]}>
                        <label className={styles["form-label"]}>
                          Dietary Preferences
                        </label>
                        <Select
                          isMulti
                          name="dietaryPreferences"
                          options={dietaryOptions}
                          classNamePrefix="select"
                          value={dietaryOptions.filter((opt) =>
                            formDataMultiple.dietaryPreferences.includes(
                              opt.value
                            )
                          )}
                          onChange={(selected) => {
                            const selectedValues = selected.map((s) => s.value);
                            setFormDataMultiple((prev) => ({
                              ...prev,
                              dietaryPreferences: selectedValues,
                            }));

                            setFormData((prev) => ({
                              ...prev,
                              dietaryPreferences: selectedValues.join(", "),
                            }));
                          }}
                        />
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
              ) : (
                // Chat Interface
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
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHealthChat;
