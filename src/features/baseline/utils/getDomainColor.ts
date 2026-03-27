// utils/getDomainColor.ts


import { DOMAIN_COLORS } from './../../../constants/domains';

export const getDomainColor = (apiKey: string): string => {
  switch (apiKey) {
    case "cognitive_capacity":
      return DOMAIN_COLORS.cognitive.color;

    case "recovery_readiness":
      return DOMAIN_COLORS.recovery.color;

    case "immersion_flow":
      return DOMAIN_COLORS.flow.color;

    case "strategic_alignment":
      return DOMAIN_COLORS.identity.color;

    case "friction_load":
      return DOMAIN_COLORS.friction.color;

    default:
      return "#9CA3AF"; // fallback neutral gray
  }
};