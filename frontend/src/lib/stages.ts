import { UserStage } from "@/types/application";

export const STAGES: UserStage[] = [
  {
    id: "started",
    name: "STARTED",
    displayName: "Started",
    order: 0,
    colorRole: "neutral",
    isDefault: true,
  },
  {
    id: "applied",
    name: "APPLIED",
    displayName: "Applied",
    order: 1,
    colorRole: "active",
    isDefault: true,
  },
  {
    id: "interview",
    name: "INTERVIEW",
    displayName: "Interview",
    order: 2,
    colorRole: "active",
    isDefault: true,
  },
  {
    id: "accepted",
    name: "ACCEPTED",
    displayName: "Accepted",
    order: 3,
    colorRole: "win",
    isDefault: true,
  },
  {
    id: "rejected",
    name: "REJECTED",
    displayName: "Rejected",
    order: 4,
    colorRole: "loss",
    isDefault: true,
  },
];
