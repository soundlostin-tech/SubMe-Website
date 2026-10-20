import { Campaign } from '../types';

/**
 * Checks whether a campaign is a promotional / showcase task (created to attract users)
 * rather than a community task created by a registered user.
 */
export const isPromotionalCampaign = (campaign?: Campaign | null): boolean => {
  if (!campaign) return false;
  if (campaign.isPromotional === true) return true;

  // Initial 26 showcase tasks and shorts
  if (
    campaign.id.startsWith('camp_feat_') ||
    campaign.id.startsWith('camp_technogamerz') ||
    campaign.id.startsWith('camp_mrbeast') ||
    campaign.id.startsWith('camp_liveinsaan') ||
    campaign.id.startsWith('camp_totalgaming') ||
    campaign.id.startsWith('camp_carryminati') ||
    campaign.id.startsWith('camp_round2hell') ||
    campaign.id.startsWith('camp_ashish') ||
    campaign.id.startsWith('camp_mythpat') ||
    campaign.id.startsWith('camp_souravjvlogs') ||
    campaign.id.startsWith('camp_anshubisht') ||
    campaign.id.startsWith('camp_mrindianhacker') ||
    campaign.id.startsWith('camp_ishowspeed') ||
    ['camp_1', 'camp_2', 'camp_3', 'camp_4', 'camp_5', 'camp_6', 'camp_7', 'camp_8', 'camp_9'].includes(campaign.id)
  ) {
    return true;
  }

  // If creatorId matches known showcase IDs
  if (
    campaign.creatorId === 'featured_promotional' ||
    campaign.creatorId === 'usr_001' ||
    campaign.creatorId === 'usr_002' ||
    campaign.creatorId === 'user_crypto' ||
    campaign.creatorId === 'user_dev' ||
    campaign.creatorId === 'user_synth' ||
    campaign.creatorId === 'user_audio'
  ) {
    return true;
  }

  return false;
};
