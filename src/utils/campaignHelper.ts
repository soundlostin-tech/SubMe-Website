import { Campaign } from '../types';

export const TASK_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

/**
 * Checks whether a campaign is explicitly marked as a promotional / showcase task.
 * Regular creator community tasks and non-promotional tasks are fully actionable.
 */
export const isPromotionalCampaign = (campaign?: Campaign | null): boolean => {
  if (!campaign) return false;
  return campaign.isPromotional === true;
};

/**
 * Determines whether a task has expired (user-created tasks stay live for strictly 24 hours).
 */
export const isTaskExpired = (campaign?: Campaign | null): boolean => {
  if (!campaign) return false;
  if (campaign.isPromotional) return false;
  if (campaign.status === 'expired') return true;

  const now = Date.now();
  // 1. Explicit expiresAt
  if (campaign.expiresAt) {
    return now > campaign.expiresAt;
  }

  // 2. User-created task check (has creatorId and is not system admin showcase)
  if (campaign.creatorId && campaign.creatorId !== 'usr_admin_01' && campaign.createdAt) {
    return (now - campaign.createdAt) > TASK_LIFETIME_MS;
  }

  return false;
};

/**
 * Calculates remaining live time for a 24-hour task.
 */
export const getTaskTimeRemaining = (campaign?: Campaign | null): {
  isExpired: boolean;
  hours: number;
  minutes: number;
  formatted: string;
} | null => {
  if (!campaign || campaign.isPromotional) return null;

  const expiry = campaign.expiresAt || (campaign.createdAt ? campaign.createdAt + TASK_LIFETIME_MS : null);
  if (!expiry) return null;

  const now = Date.now();
  const diff = expiry - now;

  if (diff <= 0 || campaign.status === 'expired') {
    return {
      isExpired: true,
      hours: 0,
      minutes: 0,
      formatted: 'Expired',
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}h ${minutes}m left`;
  } else {
    formatted = `${minutes}m left`;
  }

  return {
    isExpired: false,
    hours,
    minutes,
    formatted,
  };
};

