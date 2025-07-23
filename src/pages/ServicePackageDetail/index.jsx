import React, { useContext, useEffect, useState } from "react";
import {
  Calendar,
  TickCircle,
  Clock,
  Profile,
  Flash,
  Tag,
  Sms,
  Star,
  Warning2,
  CloseCircle,
  People,
  Whatsapp,
  Facebook,
  Link1,
} from "iconsax-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import AuthContext from "contexts/AuthContext";
import apiServicePackageService from "services/apiServicePackageService";
import apiTrainerRatingService from "services/apiTrainerRatingService";
import "./ServicePackageDetail.css";
import { Twitter } from "lucide-react";
import {
  showErrorFetchAPI,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "components/ErrorHandler/showStatusMessage";

const statusColors = {
  active: "var(--accent-success)",
  inactive: "var(--accent-error)",
  pending: "#ff9800",
};

const RatingsCard = ({
  ratingsData,
  ratingsLoading,
  packageId,
  setError,
  setShowError,
}) => {
  const [starFilter, setStarFilter] = useState("all");
  const filteredRatings =
    starFilter === "all"
      ? ratingsData?.ratings || []
      : ratingsData?.ratings?.filter(
          (rating) => rating.rating === parseInt(starFilter)
        ) || [];

  return (
    <div className="service-package-ratings-card">
      <div className="service-package-ratings-header">
        <div className="service-package-ratings-title">
          <Star size="24" color="var(--secondary-color)" variant="Bold" />
          <span>Ratings & Reviews</span>
        </div>
      </div>
      {ratingsData?.ratings?.length > 0 && (
        <>
          <div className="service-package-rating-summary">
            <div className="service-package-rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size="20"
                  color={
                    star <= (ratingsData.averageRating || 0)
                      ? "#ffc107"
                      : "#e0e0e0"
                  }
                  variant={
                    star <= (ratingsData.averageRating || 0)
                      ? "Bold"
                      : "Outline"
                  }
                />
              ))}
            </div>
            <span className="service-package-rating-text">
              {ratingsData.averageRating || 0} ({ratingsData.totalRatings || 0}{" "}
              reviews)
            </span>
          </div>
          <div className="service-package-filter-container">
            <label>Filter by Stars:</label>
            <select
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
              className="service-package-filter-select"
            >
              <option value="all">All Stars</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} Star{star > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="service-package-ratings-divider"></div>
      {ratingsLoading ? (
        <div className="service-package-ratings-loading">
          {[1, 2].map((i) => (
            <div key={i} className="service-package-rating-skeleton">
              <div className="service-package-skeleton service-package-skeleton-avatar"></div>
              <div className="service-package-rating-skeleton-content">
                <div className="service-package-skeleton service-package-skeleton-name"></div>
                <div className="service-package-skeleton service-package-skeleton-date"></div>
                <div className="service-package-skeleton service-package-skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredRatings.length > 0 ? (
        <div className="service-package-ratings-list">
          {filteredRatings.map((rating) => (
            <div key={rating.ratingId} className="service-package-rating-item">
              <div className="service-package-rating-user">
                <div className="service-package-rating-avatar">
                  {rating.userAvatar ? (
                    <img
                      src={rating.userAvatar || "/placeholder.svg"}
                      alt={rating.userFullName}
                    />
                  ) : (
                    <Profile size="20" color="white" variant="Bold" />
                  )}
                </div>
                <div className="service-package-rating-user-info">
                  <span className="service-package-rating-user-name">
                    {rating.userFullName}
                  </span>
                  <span className="service-package-rating-date">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="service-package-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size="16"
                    color={star <= rating.rating ? "#ffc107" : "#e0e0e0"}
                    variant={star <= rating.rating ? "Bold" : "Outline"}
                  />
                ))}
              </div>
              <p className="service-package-rating-feedback">
                {rating.feedbackText}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="service-package-no-ratings">
          <Star size="48" color="var(--text-secondary)" />
          <p>
            No reviews{" "}
            {starFilter !== "all"
              ? `for ${starFilter} star${starFilter > 1 ? "s" : ""}`
              : "yet"}
            .
          </p>
        </div>
      )}
    </div>
  );
};

const ServicePackageDetail = () => {
  const { user } = useContext(AuthContext);
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pkg, setPkg] = useState(null);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [ratingsData, setRatingsData] = useState(null);
  const [trainerAverageRating, setTrainerAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);
  const [showShareMessage, setShowShareMessage] = useState(false);

  const fetchPackage = async () => {
    setLoading(true);
    try {
      const response = await apiServicePackageService.getPackageById(packageId);
      if (response.statusCode === 200 && response.data) {
        setPkg(response.data);
        fetchRelatedPackages(response.data.trainerId);
        fetchRatings();
        fetchTrainerAverageRating(response.data.trainerId);
      } else {
        showErrorMessage("Package not found.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPackages = async (trainerId) => {
    setRelatedLoading(true);
    try {
      const response =
        await apiServicePackageService.getRelativePackageServiceByTrainer(
          trainerId,
          packageId,
          {
            PageNumber: 1,
            PageSize: 4,
          }
        );
      if (response.statusCode === 200 && response.data?.packages) {
        setRelatedPackages(
          response.data.packages.filter((p) => p.packageId !== packageId)
        );
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setRelatedLoading(false);
    }
  };

  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      const response = await apiTrainerRatingService.getRatingsByPackageId(
        packageId,
        {
          pageNumber: 1,
          pageSize: 50,
        }
      );
      if (response.statusCode === 200 && response.data) {
        setRatingsData(response.data);
      } else {
        showErrorMessage("Failed to fetch ratings.");
      }
    } catch (e) {
      showErrorFetchAPI(e);
    } finally {
      setRatingsLoading(false);
    }
  };

  const fetchTrainerAverageRating = async (trainerId) => {
    try {
      const response =
        await apiTrainerRatingService.getAvarageRatingByTrainerId(trainerId);
      if (response.statusCode === 200 && response.data !== null) {
        setTrainerAverageRating(response.data);
      }
    } catch (e) {
      showErrorFetchAPI(e);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}${location.pathname}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccessMessage("Link copied to clipboard!");
    } catch (e) {
      showErrorMessage("Failed to copy link.");
    }
  };

  const handleShare = (platform) => {
    const shareUrl = `${window.location.origin}${location.pathname}`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(pkg?.packageName || "Training Package");
    let shareLink;

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`;
        break;
      case "whatsapp":
        shareLink = `https://api.whatsapp.com/send?text=${title}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(shareLink, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    fetchPackage();
  }, [packageId]);

  const handleBookNow = () => {
    if (!user) {
      showInfoMessage("Please login before performing this action.");
      setTimeout(() => navigate("/login"), 1000);
    } else {
      navigate(`/checkout/${packageId}`);
    }
  };

  const handleViewTrainerDetails = () => {
    if (pkg?.trainerId) {
      navigate(`/trainer/view/${pkg.trainerId}`);
    }
  };

  const handleBack = () => {
    navigate("/services");
  };

  const handleRelatedPackageClick = (relatedPackageId) => {
    navigate(`/service-packages/${relatedPackageId}`);
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleCloseShareMessage = () => {
    setShowShareMessage(false);
  };

  const getAvailableSlots = () => {
    if (!pkg.maxSubscribers) return "Unlimited";
    const remaining = pkg.maxSubscribers - pkg.currentSubscribers;
    return remaining > 0 ? remaining : 0;
  };

  const isFullyBooked = () => {
    if (!pkg.maxSubscribers) return false;
    return pkg.currentSubscribers >= pkg.maxSubscribers;
  };

  const LoadingSkeleton = () => (
    <div className="service-package-container">
      <div className="service-package-content">
        <div className="service-package-loading">
          <div className="service-package-loading-card">
            <div className="service-package-skeleton service-package-skeleton-header"></div>
            <div className="service-package-skeleton service-package-skeleton-content"></div>
            <div className="service-package-skeleton service-package-skeleton-actions"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  if (error && !pkg) {
    return (
      <div className="service-package-container">
        <div className="service-package-content">
          <div className="service-package-error-state">
            <div className="service-package-error-card">
              <div className="service-package-error-icon">
                <Flash size="80" color="var(--accent-error)" />
              </div>
              <h2 className="service-package-error-title">
                Oops! Something went wrong
              </h2>
              <p className="service-package-error-description">{error}</p>
              <button
                className="service-package-error-btn"
                onClick={handleBack}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-package-container">
      <div className="service-package-content">
        {/* Header Section */}
        <div className="service-package-header-section">
          <div className="service-package-header-content">
            <div className="service-package-header-icon">
              <Tag size="40" color="var(--secondary-color)" variant="Bold" />
            </div>
            <h1 className="service-package-header-title">
              Service Package Details
            </h1>
          </div>
          <p className="service-package-header-description">
            Explore details of {pkg ? pkg.packageName : "the training package"}{" "}
            offered by {pkg ? pkg.trainerFullName : "the trainer"}
          </p>
        </div>

        {/* Main Card */}
        <div className="service-package-main-card">
          <div className="service-package-hero-section">
            <div className="service-package-hero-content">
              <div className="service-package-trainer-info">
                <div className="service-package-trainer-avatar">
                  {pkg.trainerAvatar ? (
                    <img
                      src={pkg.trainerAvatar || "/placeholder.svg"}
                      alt={pkg.trainerFullName}
                    />
                  ) : (
                    <Profile size="40" color="white" variant="Bold" />
                  )}
                  <div className="service-package-verified-badge">
                    <TickCircle size="24" color="white" variant="Bold" />
                  </div>
                </div>
                <div className="service-package-trainer-details">
                  <h2 className="service-package-name">{pkg.packageName}</h2>
                  <div className="service-package-trainer-meta">
                    <div className="service-package-trainer-name">
                      <Profile size="20" color="white" />
                      <span>by {pkg.trainerFullName}</span>
                    </div>
                    <div className="service-package-rating-display">
                      <div className="service-package-rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size="16"
                            color={
                              star <= (ratingsData?.averageRating || 0)
                                ? "#ffc107"
                                : "rgba(255,255,255,0.3)"
                            }
                            variant={
                              star <= (ratingsData?.averageRating || 0)
                                ? "Bold"
                                : "Outline"
                            }
                          />
                        ))}
                      </div>
                      <span>
                        {ratingsData?.averageRating || 0} (
                        {ratingsData?.totalRatings || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="service-package-share-actions">
                <button
                  className="service-package-share-btn"
                  onClick={handleCopyLink}
                  title="Copy Link"
                >
                  <Link1 size={20} color="white" />
                </button>
                <button
                  className="service-package-share-btn"
                  onClick={() => handleShare("facebook")}
                  title="Share on Facebook"
                >
                  <Facebook size={20} color="white" />
                </button>
                <button
                  className="service-package-share-btn"
                  onClick={() => handleShare("twitter")}
                  title="Share on Twitter"
                >
                  <Twitter size={20} color="white" />
                </button>
                <button
                  className="service-package-share-btn"
                  onClick={() => handleShare("whatsapp")}
                  title="Share on WhatsApp"
                >
                  <Whatsapp size={20} color="white" />
                </button>
              </div>
            </div>
          </div>

          <div className="service-package-details-content">
            {/* Package Info Cards */}
            <div className="service-package-info-grid">
              <div className="service-package-info-card">
                <div className="service-package-info-header">
                  <Calendar size="24" color="var(--accent-info)" />
                  <span>Duration</span>
                </div>
                <div className="service-package-info-value">
                  {pkg.durationDays} Days
                </div>
              </div>
              <div className="service-package-info-card">
                <div className="service-package-info-header">
                  <TickCircle size="24" color="var(--accent-info)" />
                  <span>Status</span>
                </div>
                <div
                  className="service-package-status-chip"
                  style={{ backgroundColor: statusColors[pkg.status] }}
                >
                  {pkg.status.charAt(0).toUpperCase() + pkg.status.slice(1)}
                </div>
              </div>
              <div className="service-package-info-card">
                <div className="service-package-info-header">
                  <Flash size="24" color="var(--accent-info)" />
                  <span>Price</span>
                </div>
                <div className="service-package-info-value">
                  {pkg.price.toLocaleString()} VND
                </div>
              </div>
              <div className="service-package-info-card">
                <div className="service-package-info-header">
                  <People size="24" color="var(--accent-info)" />
                  <span>Available Slots</span>
                </div>
                <div className="service-package-info-value">
                  {pkg.maxSubscribers ? (
                    <div className="service-package-slots-info">
                      <span
                        className={`service-package-slots-count ${
                          isFullyBooked() ? "fully-booked" : ""
                        }`}
                      >
                        {getAvailableSlots()}
                      </span>
                      <span className="service-package-slots-total">
                        / {pkg.maxSubscribers}
                      </span>
                      {isFullyBooked() && (
                        <span className="service-package-fully-booked">
                          Fully Booked
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="service-package-unlimited">Unlimited</span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="service-package-description-section">
              <h3 className="service-package-section-title">
                About This Package
              </h3>
              <div className="service-package-description-card">
                <div
                  className="service-package-description-content"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      pkg.description || "<i>No description provided.</i>"
                    ),
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="service-package-actions">
              {user?.userId === pkg.trainerId ? (
                <span className="your-service-label">Your Service</span>
              ) : (
                <>
                  <button
                    className={`service-package-book-btn ${
                      isFullyBooked() ? "disabled" : ""
                    }`}
                    onClick={handleBookNow}
                    disabled={isFullyBooked()}
                  >
                    {isFullyBooked() ? "Fully Booked" : "Book Now"}
                  </button>
                  <button
                    className="service-package-contact-btn"
                    onClick={handleViewTrainerDetails}
                  >
                    Contact Trainer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="service-package-additional-info">
          <div className="service-package-trainer-card">
            <h3 className="service-package-section-title">
              Trainer Information
            </h3>
            <div className="service-package-trainer-profile">
              <div className="service-package-trainer-avatar-large">
                {pkg.trainerAvatar ? (
                  <img
                    src={pkg.trainerAvatar || "/placeholder.svg"}
                    alt={pkg.trainerFullName}
                  />
                ) : (
                  <Profile size="32" color="white" variant="Bold" />
                )}
              </div>
              <div className="service-package-trainer-info-details">
                <h4 className="service-package-trainer-name-large">
                  {pkg.trainerFullName}
                </h4>
                <div className="service-package-trainer-contact">
                  <Sms size="16" color="var(--accent-info)" />
                  <span>{pkg.trainerEmail}</span>
                </div>
                {trainerAverageRating !== null && (
                  <div className="service-package-trainer-rating">
                    <div className="service-package-rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size="16"
                          color={
                            star <= trainerAverageRating.averageRating
                              ? "#ffc107"
                              : "#e0e0e0"
                          }
                          variant={
                            star <= trainerAverageRating.averageRating
                              ? "Bold"
                              : "Outline"
                          }
                        />
                      ))}
                    </div>
                    <span>
                      Trainer Rating: {trainerAverageRating.averageRating}
                    </span>
                  </div>
                )}
                <button
                  className="service-package-view-trainer-btn"
                  onClick={handleViewTrainerDetails}
                >
                  View Trainer Details
                </button>
              </div>
            </div>
          </div>

          <div className="service-package-details-card">
            <h3 className="service-package-section-title">Package Details</h3>
            <div className="service-package-features-list">
              <div className="service-package-feature-item">
                <Clock size="20" color="var(--accent-info)" />
                <span>Duration: {pkg.durationDays} days</span>
              </div>
              <div className="service-package-feature-item">
                <Profile size="20" color="var(--accent-info)" />
                <span>Personal training included</span>
              </div>
              <div className="service-package-feature-item">
                <TickCircle size="20" color="var(--accent-info)" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>

          <div className="service-package-warranty-card">
            <h3 className="service-package-section-title">
              Warranty Information
            </h3>
            <div className="service-package-features-list">
              <div className="service-package-feature-item">
                <TickCircle size="20" color="var(--accent-info)" />
                <span>Warranty period: 30 days</span>
              </div>
              <div className="service-package-feature-item">
                <TickCircle size="20" color="var(--accent-info)" />
                <span>Full refund if unsatisfied</span>
              </div>
              <div className="service-package-feature-item">
                <TickCircle size="20" color="var(--accent-info)" />
                <span>Contact trainer for claims</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <RatingsCard
          ratingsData={ratingsData}
          ratingsLoading={ratingsLoading}
          packageId={packageId}
          setError={setError}
          setShowError={setShowError}
        />

        {/* Related Packages */}
        {relatedPackages.length > 0 && (
          <div className="service-package-related-section">
            <div className="service-package-related-header">
              <div className="service-package-related-title">
                <Tag size="24" color="var(--secondary-color)" variant="Bold" />
                <span>More from {pkg.trainerFullName}</span>
              </div>
              <p className="service-package-related-description">
                Discover other training packages by this trainer
              </p>
            </div>
            <div className="service-package-related-content">
              {relatedLoading ? (
                <div className="service-package-related-loading">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="service-package-related-skeleton">
                      <div className="service-package-skeleton service-package-skeleton-card"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="service-package-related-grid">
                  {relatedPackages.map((relatedPkg) => (
                    <div
                      key={relatedPkg.packageId}
                      className="service-package-related-card"
                      onClick={() =>
                        handleRelatedPackageClick(relatedPkg.packageId)
                      }
                    >
                      <div className="service-package-related-card-header">
                        <div className="service-package-related-avatar">
                          {pkg.trainerAvatar ? (
                            <img
                              src={pkg.trainerAvatar || "/placeholder.svg"}
                              alt={pkg.trainerFullName}
                            />
                          ) : (
                            <Profile size="24" color="white" variant="Bold" />
                          )}
                        </div>
                        <div className="service-package-related-info">
                          <h4 className="service-package-related-name">
                            {relatedPkg.packageName}
                          </h4>
                          <span className="service-package-related-duration">
                            {relatedPkg.durationDays} days
                          </span>
                        </div>
                      </div>
                      <div
                        className="service-package-related-description"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            relatedPkg.description ||
                              "<i>No description provided.</i>"
                          ),
                        }}
                      />
                      <div className="service-package-related-footer">
                        <span className="service-package-related-price">
                          {relatedPkg.price.toLocaleString()} VND
                        </span>
                        <div
                          className="service-package-related-status"
                          style={{
                            backgroundColor: statusColors[relatedPkg.status],
                          }}
                        >
                          {relatedPkg.status.charAt(0).toUpperCase() +
                            relatedPkg.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Notification */}
      {showError && (
        <div className="service-package-snackbar error">
          <div className="service-package-snackbar-content">
            <Warning2 size="20" color="white" variant="Bold" />
            <span>{error}</span>
            <button
              className="service-package-snackbar-close"
              onClick={handleCloseError}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Share Message Notification */}
      {showShareMessage && (
        <div
          className={`service-package-snackbar ${
            shareMessage?.includes("Failed") ? "error" : "success"
          }`}
        >
          <div className="service-package-snackbar-content">
            <TickCircle size="20" color="white" variant="Bold" />
            <span>{shareMessage}</span>
            <button
              className="service-package-snackbar-close"
              onClick={handleCloseShareMessage}
            >
              <CloseCircle size="16" color="white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePackageDetail;
