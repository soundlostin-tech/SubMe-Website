import { Campaign } from '../types';

/**
 * Checks whether a campaign is explicitly marked as a promotional / showcase task.
 * Regular creator community tasks and non-promotional tasks are fully actionable.
 */
export const isPromotionalCampaign = (campaign?: Campaign | null): boolean => {
  if (!campaign) return false;
  return campaign.isPromotional === true;
};

