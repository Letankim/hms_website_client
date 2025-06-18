import React, { useContext, useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import apiUserService from "services/apiUserService";
import apiNotificationService from "services/apiNotificationService";
import { Notification } from "iconsax-react";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import MuiAlert from "@mui/material/Alert";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarDropdown, setAvatarDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const [pagesDropdownOpen, setPagesDropdownOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const pagesDropdownRef = useRef(null);
  const NOTIF_CACHE_MINUTES = 15;
  const userId = user?.userId;
  const avatarRef = useRef(null);

  const fetchUserProfile = async () => {
    if (!userId) return;
    try {
      const res = await apiUserService.getUserActiveById(userId);
      setUserProfile(res.data || res);
      setLastFetch(Date.now());
      localStorage.setItem("userProfile", JSON.stringify(res.data || res));
      localStorage.setItem("userProfileLastFetch", Date.now().toString());
    } catch {}
  };

  const fetchNotifications = React.useCallback(async () => {
    if (!userId) return;
    setNotifLoading(true);
    try {
      const res = await apiNotificationService.getNotificationsByUserId(
        userId,
        { includeRead: true, PageSize: 5, PageNumber: 1 }
      );
      let notifs =
        res.data?.notifications || res.notifications || res.data || res;
      notifs = Array.isArray(notifs) ? notifs : [];
      notifs = notifs.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isRead ? 1 : -1;
      });
      setNotifications(notifs.slice(0, 5));
      setNotifUnreadCount(notifs.filter((n) => !n.isRead).length);
    } catch {
      setNotifications([]);
      setNotifUnreadCount(0);
    } finally {
      setNotifLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUserProfile(null);
      return;
    }
    const cache = localStorage.getItem("userProfile");
    const cacheTime = parseInt(
      localStorage.getItem("userProfileLastFetch") || "0"
    );
    if (cache && Date.now() - cacheTime < NOTIF_CACHE_MINUTES * 60 * 1000) {
      setUserProfile(JSON.parse(cache));
      setLastFetch(cacheTime);
    } else {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    window.addEventListener("popstate", closeMenu);
    return () => window.removeEventListener("popstate", closeMenu);
  }, []);

  useEffect(() => {
    if (!avatarDropdown) return;
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarDropdown]);

  useEffect(() => {
    if (!pagesDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (
        pagesDropdownRef.current &&
        !pagesDropdownRef.current.contains(e.target)
      ) {
        setPagesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pagesDropdownOpen]);

  const handleAvatarDropdown = () => {
    setMenuOpen(true);
    setAvatarDropdown((v) => !v);
    setNotifDropdown(false);
    if (Date.now() - lastFetch > NOTIF_CACHE_MINUTES * 60 * 1000)
      fetchUserProfile();
  };
  const handleNotifDropdown = () => {
    setMenuOpen(true);
    setNotifDropdown((v) => !v);
    setAvatarDropdown(false);
    if (Date.now() - lastFetch > NOTIF_CACHE_MINUTES * 60 * 1000)
      fetchUserProfile();
  };

  const handleMarkRead = async (id) => {
    try {
      const res = await apiNotificationService.markNotificationsRead({
        notificationIds: [id],
        isRead: true,
      });
      setSnackbar({
        open: true,
        message: res?.message || "Marked as read!",
        severity: "success",
      });
      fetchNotifications();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || "Failed to mark as read!",
        severity: "error",
      });
    }
  };

  const dropdownItemStyle = {
    display: "block",
    width: "100%",
    padding: "10px 20px",
    color: "#333",
    textDecoration: "none",
    background: "none",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    textAlign: "left",
  };

  const badgeStyle = {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    background: "#F44336",
    color: "#fff",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 700,
    display: notifUnreadCount > 0 ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    padding: "0 5px",
    boxShadow: "0 2px 8px #0002",
  };

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setNotifUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  return (
    <nav className={`navbar navbar-expand-lg ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <NavLink className="navbar-brand" to="/" aria-label="home">
          <img
            src="https://cdn.prod.website-files.com/675931be48143bd8073dddc4/676aa997883349b07ec15e80_header-logo.svg"
            alt="Nutrizen Logo"
            loading="lazy"
          />
        </NavLink>
        {user && (
          <div className="navbar-mobile-userbar">
            <button
              className="navbar-notif-btn"
              style={{
                border: "none",
                background: "none",
                padding: 0,
                marginRight: 8,
                cursor: "pointer",
                borderRadius: "50%",
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
              onClick={handleNotifDropdown}
              aria-label="Notifications"
            >
              <Notification
                size={26}
                color="#F47C54"
                variant={notifDropdown ? "Bold" : "Outline"}
              />
              <span style={badgeStyle}>
                {notifUnreadCount > 99 ? "99+" : notifUnreadCount}
              </span>
            </button>
            <div
              className="navbar-avatar-wrap"
              ref={avatarRef}
              style={{ position: "relative", display: "inline-block" }}
            >
              <button
                className="navbar-avatar-btn"
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  borderRadius: "50%",
                  overflow: "hidden",
                  width: 44,
                  height: 44,
                  boxShadow: avatarDropdown ? "0 0 0 2px #F47C54" : "none",
                  transition: "box-shadow .2s",
                }}
                onClick={handleAvatarDropdown}
                aria-label="User menu"
              >
                {userProfile?.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt="avatar"
                    style={{
                      width: 44,
                      height: 44,
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "#F47C54",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 22,
                      borderRadius: "50%",
                      textTransform: "uppercase",
                    }}
                  >
                    {userProfile?.fullName ? userProfile.fullName[0] : "U"}
                  </div>
                )}
              </button>
            </div>
            {/* Hamburger toggle chỉ hiện khi menu đóng */}
            {!menuOpen && (
              <button
                className="navbar-toggler mobile"
                type="button"
                aria-label="Toggle navigation"
                style={{
                  border: "none",
                  boxShadow: "none",
                  outline: "none",
                  background: "transparent",
                  padding: 0,
                  marginLeft: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setMenuOpen(true)}
              >
                <span
                  className="navbar-toggler-icon p-0 m-0"
                  style={{ boxShadow: "none", border: "none" }}
                >
                  {/* Hamburger icon */}
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      y="6"
                      width="30"
                      height="2.5"
                      rx="1.25"
                      fill="#F47C54"
                    />
                    <rect
                      y="13.5"
                      width="30"
                      height="2.5"
                      rx="1.25"
                      fill="#F47C54"
                    />
                    <rect
                      y="21"
                      width="30"
                      height="2.5"
                      rx="1.25"
                      fill="#F47C54"
                    />
                  </svg>
                </span>
              </button>
            )}
            {/* X icon chỉ hiện khi menu mở */}
            {menuOpen && (
              <button
                className="navbar-toggler mobile"
                type="button"
                aria-label="Close navigation"
                style={{
                  border: "none",
                  boxShadow: "none",
                  outline: "none",
                  background: "transparent",
                  padding: 0,
                  marginLeft: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setMenuOpen(false)}
              >
                <span
                  className="navbar-toggler-icon p-0 m-0"
                  style={{ boxShadow: "none", border: "none" }}
                >
                  {/* X icon */}
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="7"
                      y1="7"
                      x2="23"
                      y2="23"
                      stroke="#F47C54"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <line
                      x1="23"
                      y1="7"
                      x2="7"
                      y2="23"
                      stroke="#F47C54"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            )}
          </div>
        )}

        {/* Hamburger Toggle */}
        {!user && (
          <button
            className="navbar-toggler"
            type="button"
            aria-label="Toggle navigation"
            style={{
              border: "none",
              boxShadow: "none",
              outline: "none",
              background: "transparent",
              padding: 0,
            }}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span
              className="navbar-toggler-icon p-0 m-0"
              style={{ boxShadow: "none", border: "none" }}
            >
              {menuOpen ? (
                // X icon
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line
                    x1="7"
                    y1="7"
                    x2="23"
                    y2="23"
                    stroke="#F47C54"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1="23"
                    y1="7"
                    x2="7"
                    y2="23"
                    stroke="#F47C54"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // Hamburger icon
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 30 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    y="6"
                    width="30"
                    height="2.5"
                    rx="1.25"
                    fill="#F47C54"
                  />
                  <rect
                    y="13.5"
                    width="30"
                    height="2.5"
                    rx="1.25"
                    fill="#F47C54"
                  />
                  <rect
                    y="21"
                    width="30"
                    height="2.5"
                    rx="1.25"
                    fill="#F47C54"
                  />
                </svg>
              )}
            </span>
          </button>
        )}

        {/* Navigation Links */}
        <div
          className={`collapse navbar-collapse custom-navbar-anim${
            menuOpen ? " show" : ""
          }`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/services"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Services
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/groups"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Groups
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Blog
              </NavLink>
            </li>
          </ul>

          {/* Auth Buttons hoặc Avatar */}
          <div
            className="navbar-auth-buttons ms-3"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            {!user ? (
              <>
                <NavLink to="/login">
                  <button className="navbar-auth-btn login">Login</button>
                </NavLink>
                <NavLink to="/register">
                  <button className="navbar-auth-btn register">Register</button>
                </NavLink>
              </>
            ) : (
              <>
                {/* Notification icon */}
                <div style={{ position: "relative" }}>
                  <button
                    className="navbar-notif-btn"
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      marginRight: 8,
                      cursor: "pointer",
                      borderRadius: "50%",
                      width: 38,
                      height: 38,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background .15s",
                      position: "relative",
                    }}
                    onClick={handleNotifDropdown}
                    aria-label="Notifications"
                  >
                    <Notification
                      size={26}
                      color="#F47C54"
                      variant={notifDropdown ? "Bold" : "Outline"}
                    />
                    <span style={badgeStyle}>
                      {notifUnreadCount > 99 ? "99+" : notifUnreadCount}
                    </span>
                  </button>
                  {notifDropdown && (
                    <div
                      className="navbar-notif-dropdown show"
                      style={{
                        display: "block",
                        position: "absolute",
                        right: 0,
                        left: "auto",
                        top: "100%",
                        width: 360,
                        maxWidth: 400,
                        maxHeight: 480,
                        zIndex: 3001,
                        boxShadow: "0 8px 32px #0003",
                        borderRadius: 14,
                        background: "#fff",
                        opacity: 1,
                        pointerEvents: "auto",
                        animation: "fadeIn .2s",
                        overflowY: "auto",
                        paddingBottom: 0,
                        paddingTop: 0,
                        transition: "all .2s cubic-bezier(.4,0,.2,1)",
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 24px",
                          fontWeight: 700,
                          color: "#F47C54",
                          fontSize: 18,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          position: "sticky",
                          top: 0,
                          background: "#fff",
                          zIndex: 2,
                        }}
                      >
                        <Notification
                          size={22}
                          color="#F47C54"
                          variant="Bold"
                        />{" "}
                        Notifications
                      </div>
                      <hr style={{ margin: "8px 0", borderColor: "#eee" }} />
                      <div style={{ maxHeight: 370, overflowY: "auto" }}>
                        {notifLoading ? (
                          <div
                            style={{
                              padding: "24px 0",
                              textAlign: "center",
                              color: "#888",
                            }}
                          >
                            Loading...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div
                            style={{
                              padding: "16px 24px",
                              color: "#888",
                              fontSize: 15,
                              textAlign: "center",
                            }}
                          >
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.notificationId}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                padding: "12px 20px",
                                background: n.isRead ? "#fff" : "#fff7f3",
                                borderBottom: "1px solid #f6f6f6",
                                position: "relative",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: n.isRead ? 500 : 700,
                                    color: n.isRead ? "#333" : "#F47C54",
                                    fontSize: 15,
                                  }}
                                >
                                  {n.notificationType}
                                </div>
                                <div
                                  style={{
                                    fontSize: 13,
                                    color: "#888",
                                    marginTop: 2,
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: n.message,
                                  }}
                                />
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#bbb",
                                    marginTop: 2,
                                  }}
                                >
                                  {new Date(n.createdAt).toLocaleString()}
                                </div>
                              </div>
                              {!n.isRead && (
                                <Tooltip
                                  title="Mark as read"
                                  arrow
                                  PopperProps={{
                                    modifiers: [
                                      {
                                        name: "zIndex",
                                        enabled: true,
                                        phase: "main",
                                        fn: ({ state }) => {
                                          state.styles.popper.zIndex = 4000;
                                        },
                                      },
                                    ],
                                  }}
                                >
                                  <button
                                    onClick={() =>
                                      handleMarkRead(n.notificationId)
                                    }
                                    style={{
                                      border: "none",
                                      background: "none",
                                      color: "#F47C54",
                                      fontWeight: 600,
                                      fontSize: 18,
                                      cursor: "pointer",
                                      marginLeft: 8,
                                      padding: 0,
                                      borderRadius: 6,
                                      transition: "background .15s",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                    aria-label="Mark as read"
                                  >
                                    <svg
                                      width="22"
                                      height="22"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="#F47C54"
                                        strokeWidth="2"
                                        fill="#fff"
                                      />
                                      <path
                                        d="M8 12.5L11 15.5L16 10.5"
                                        stroke="#F47C54"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "10px 0 10px 0",
                          background: "#fff",
                          position: "sticky",
                          bottom: 0,
                          padding: "12px 0",
                          zIndex: 2,
                          marginTop: 8,
                          borderTop: "1px solid #f6f6f6",
                        }}
                      >
                        <NavLink
                          to="/notifications"
                          style={{
                            display: "inline-block",
                            color: "#F47C54",
                            fontWeight: 700,
                            fontSize: 15,
                            textDecoration: "none",
                            borderRadius: 4,
                            padding: "7px 18px",
                            border: "1px solid #F47C54",
                            background: "#fff",
                            transition: "background .15s, color .15s",
                          }}
                        >
                          View all
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
                {/* Avatar */}
                <div
                  className="navbar-avatar-wrap"
                  ref={avatarRef}
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <button
                    className="navbar-avatar-btn"
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      cursor: "pointer",
                      borderRadius: "50%",
                      overflow: "hidden",
                      width: 44,
                      height: 44,
                      boxShadow: avatarDropdown ? "0 0 0 2px #F47C54" : "none",
                      transition: "box-shadow .2s",
                    }}
                    onClick={handleAvatarDropdown}
                    aria-label="User menu"
                  >
                    {userProfile?.avatar ? (
                      <img
                        src={userProfile.avatar}
                        alt="avatar"
                        style={{
                          width: 44,
                          height: 44,
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          background: "#F47C54",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 22,
                          borderRadius: "50%",
                          textTransform: "uppercase",
                        }}
                      >
                        {userProfile?.fullName ? userProfile.fullName[0] : "U"}
                      </div>
                    )}
                  </button>
                  {avatarDropdown && (
                    <div
                      className="navbar-avatar-dropdown modern"
                      style={{
                        display: "block",
                        position: "fixed",
                        left: 0,
                        right: 0,
                        top: 70,
                        margin: "0 auto",
                        width: "100vw",
                        maxWidth: 400,
                        zIndex: 3002,
                        boxShadow: "0 8px 32px #0003",
                        borderRadius: 16,
                        background: "#fff",
                        opacity: 1,
                        pointerEvents: "auto",
                        animation: "fadeIn .2s",
                        border: "1px solid #f2f2f2",
                        padding: "0 0 8px 0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "24px 0 12px 0",
                          borderBottom: "1px solid #f2f2f2",
                          background:
                            "linear-gradient(90deg, #fff 60%, #ffe5d6 100%)",
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      >
                        {userProfile?.avatar ? (
                          <img
                            src={userProfile.avatar}
                            alt="avatar"
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: "50%",
                              objectFit: "cover",
                              marginBottom: 8,
                              border: "2px solid #F47C54",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 64,
                              height: 64,
                              background: "#F47C54",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 32,
                              borderRadius: "50%",
                              marginBottom: 8,
                            }}
                          >
                            {userProfile?.fullName
                              ? userProfile.fullName[0]
                              : "U"}
                          </div>
                        )}
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            color: "#F47C54",
                            marginBottom: 2,
                          }}
                        >
                          {userProfile?.fullName || userProfile?.email}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#888",
                            marginBottom: 2,
                          }}
                        >
                          {userProfile?.email}
                        </div>
                        <div style={{ fontSize: 13, color: "#aaa" }}>
                          {userProfile?.roles?.join(", ")}
                        </div>
                      </div>
                      <div style={{ padding: "8px 0" }}>
                        <NavLink
                          to="/profile"
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => setAvatarDropdown(false)}
                        >
                          <span style={{ color: "#F47C54" }}>
                            <i className="fa fa-user" />
                          </span>{" "}
                          View Profile
                        </NavLink>
                        <NavLink
                          to="/profile/edit"
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => setAvatarDropdown(false)}
                        >
                          <span style={{ color: "#F47C54" }}>
                            <i className="fa fa-edit" />
                          </span>{" "}
                          Edit Profile
                        </NavLink>
                        <NavLink
                          to="/profile/change-password"
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => setAvatarDropdown(false)}
                        >
                          <span style={{ color: "#F47C54" }}>
                            <i className="fa fa-key" />
                          </span>{" "}
                          Change Password
                        </NavLink>
                        <NavLink
                          to="/my-posts"
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => setAvatarDropdown(false)}
                        >
                          <span style={{ color: "#F47C54" }}>
                            <i className="fa fa-key" />
                          </span>{" "}
                          My Posts
                        </NavLink>
                        <NavLink
                          to="/my-subscriptions"
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => setAvatarDropdown(false)}
                        >
                          <span style={{ color: "#F47C54" }}>
                            <i className="fa fa-key" />
                          </span>{" "}
                          My Subscriptions
                        </NavLink>
                        <NavLink
                          to="/my-reports"
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => setAvatarDropdown(false)}
                        >
                          <span style={{ color: "#F47C54" }}>
                            <i className="fa fa-key" />
                          </span>{" "}
                          My Reports
                        </NavLink>
                        <button
                          className="navbar-avatar-item"
                          style={{
                            ...dropdownItemStyle,
                            color: "#F44336",
                            border: "none",
                            background: "none",
                            width: "100%",
                            textAlign: "left",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                          onClick={() => {
                            logout();
                            setAvatarDropdown(false);
                          }}
                        >
                          <span style={{ color: "#F44336" }}>
                            <i className="fa fa-sign-out" />
                          </span>{" "}
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </nav>
  );
};

export default Navbar;
