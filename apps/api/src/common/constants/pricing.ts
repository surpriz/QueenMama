import { Plan } from '@prisma/client';

export const PRICE_PER_LEAD_MAP: Record<Plan, number> = {
  [Plan.PAY_PER_LEAD]: 60,
  [Plan.STARTER]: 30,
  [Plan.GROWTH]: 25,
  [Plan.SCALE]: 20,
};

export function getPricePerLead(plan: Plan): number {
  return PRICE_PER_LEAD_MAP[plan] ?? PRICE_PER_LEAD_MAP[Plan.PAY_PER_LEAD];
}
