/**
 * Utility function to format dates as time ago strings
 * e.g. "3 hrs ago", "10 mins ago", "4 days ago", etc.
 */

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (secondsAgo < 60) {
    return "just now";
  }

  // Less than an hour
  if (secondsAgo < 3600) {
    const minutes = Math.floor(secondsAgo / 60);
    return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
  }

  // Less than a day
  if (secondsAgo < 86400) {
    const hours = Math.floor(secondsAgo / 3600);
    return `${hours} ${hours === 1 ? "hr" : "hrs"} ago`;
  }

  // Less than a week
  if (secondsAgo < 604800) {
    const days = Math.floor(secondsAgo / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Less than a month
  if (secondsAgo < 2592000) {
    const weeks = Math.floor(secondsAgo / 604800);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  // Less than a year
  if (secondsAgo < 31536000) {
    const months = Math.floor(secondsAgo / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  }

  // More than a year
  const years = Math.floor(secondsAgo / 31536000);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
};

/**
 * Formats a date to a user-friendly string format
 * Example: "May 15, 2025"
 */
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

/**
 * Formats a date to a time string
 * Example: "3:30 PM"
 */
export const formatTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return date.toLocaleTimeString("en-US", options);
};

/**
 * Formats a date to a full date and time string
 * Example: "May 15, 2025, 3:30 PM"
 */
export const formatDateTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

/**
 * Returns "Today", "Tomorrow", "Yesterday", or the formatted date
 */
export const getRelativeDay = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }

  if (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  ) {
    return "Tomorrow";
  }

  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  return formatDate(date);
};
