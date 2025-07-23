import React, { useEffect, useRef, useContext, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { Video, Users } from "lucide-react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import apiUChatSupportService from "services/chatSupport";
import {
  showErrorMessage,
  showErrorFetchAPI,
} from "components/ErrorHandler/showStatusMessage";
import styles from "./ChatSupport.module.css";
import AuthContext from "contexts/AuthContext";
import signalRClient from "pages/signalr/signalRClient";

function randomID(len = 5) {
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

const ChatSupport = () => {
  const { joinNow, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hostName = searchParams.get("hostName");
  const { user } = useContext(AuthContext);
  const [trainerId, setTrainerId] = useState("");
  const [roomID, setRoomID] = useState(roomId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [startCall, setStartCall] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    if (joinNow === "true" && roomId) {
      setStartCall(true);
      return;
    }
    console.log(user);

    // if (!user?.userId) {
    //   showErrorMessage("Please log in to access chat support.");
    //   navigate("/login");
    //   return;
    // }
  }, [joinNow, roomId, user?.userId, navigate]);

  useEffect(() => {
    if (!startCall || !roomID) return;

    const userName = hostName || "HMS_3DO_" + randomID();
    const userZegoID = "HMS_3DO_" + randomID();
    const appID = 795723764;
    const serverSecret = "8781bdc781148d78d309bd38e80ff3da";

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userZegoID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      if (!containerRef.current) {
        setError("Video call container is not available.");
        setStartCall(false);
        return;
      }

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: "Copy Link",
            url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        onJoinRoom: () => {
          console.log("Successfully joined video call room:", roomID);
        },
        onLeaveRoom: () => {
          console.log("Left video call room:", roomID);
          setStartCall(false);
        },
        onError: (error) => {
          console.error("Zego joinRoom error:", error);
          setError("Failed to join video call. Please try again.");
          setStartCall(false);
        },
      });
    } catch (err) {
      console.error("Zego initialization error:", err);
      setError("Failed to initialize video call. Please try again.");
      setStartCall(false);
    }
  }, [startCall, roomID, hostName]);

  const handleCreateRoom = async () => {
    if (!user?.userId) {
      showErrorMessage("Please log in to create a video call.");
      navigate("/login");
      return;
    }
    if (!trainerId) {
      showErrorMessage("Please enter a Trainer ID.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiUChatSupportService.getRoomChatSupport(
        user.userId,
        trainerId
      );
      const data = response?.data;
      if (data?.roomId) {
        setRoomID(data.roomId);
        setStartCall(true);
      } else {
        showErrorMessage("Failed to create video call room.");
      }
    } catch (error) {
      showErrorFetchAPI(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;

    signalRClient
      .start()
      .then(() => {
        return signalRClient.invoke("JoinGroup", user.userId.toString());
      })
      .catch(console.error);

    return () => {
      if (signalRClient.state === "Connected") {
        signalRClient.invoke("LeaveGroup", user.userId.toString());
        signalRClient.stop();
      }
    };
  }, [user]);

  const handleJoinRoom = () => {
    // if (!user?.userId) {
    //   showErrorMessage("Please log in to join a room.");
    //   navigate("/login");
    //   return;
    // }
    if (!roomID) {
      showErrorMessage("Please enter a Room ID to join.");
      return;
    }
    setStartCall(true);
  };

  if (startCall) {
    return (
      <div className={styles.videoCallContainer}>
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button
              onClick={() => {
                setError("");
                setStartCall(false);
              }}
              className={styles.errorButton}
            >
              Back to Form
            </button>
          </div>
        )}
        <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.mainWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Video size={32} />
          </div>
          <h1 className={styles.headerTitle}>Chat Support</h1>
          <p className={styles.headerSubtitle}>
            Connect with trainers through video calls
          </p>
        </div>

        {/* Main Card */}
        <div className={styles.mainCard}>
          {/* Form Section */}
          <div className={styles.formSection}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Users size={16} />
                  Trainer ID
                </label>
                <input
                  type="text"
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter Trainer ID"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Video size={16} />
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomID}
                  onChange={(e) => setRoomID(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter Room ID to join"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className={styles.primaryButton}
              >
                <Video size={20} />
                {isLoading ? "Creating..." : "Create Video Call"}
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className={styles.secondaryButton}
              >
                <Users size={20} />
                Join Room
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
              <Video size={24} />
            </div>
            <h3 className={styles.featureTitle}>Video Calls</h3>
            <p className={styles.featureDescription}>
              High-quality video calls with trainers
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>
              <Users size={24} />
            </div>
            <h3 className={styles.featureTitle}>Easy Connection</h3>
            <p className={styles.featureDescription}>
              Simple room creation and joining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
