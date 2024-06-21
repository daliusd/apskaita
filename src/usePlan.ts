import { useSession } from 'next-auth/react';
import useSWR from 'swr';

export const usePlan = () => {
  const { data: session } = useSession();
  const { data: plan, isLoading } = useSWR(session && '/api/settings/__plan');

  if (isLoading || !plan) {
    return { endDate: null, isFree: null, isLoading };
  }

  const planInfo: { endDate?: string } = plan.value
    ? JSON.parse(plan.value)
    : {};

  const endDate = planInfo.endDate ? new Date(planInfo.endDate) : null;
  const now = new Date();
  const isFree = !endDate || endDate < now;

  return { endDate, isFree, isLoading: false };
};
