import type { ComponentType } from "react";

import { CategoryChips } from "./sections/CategoryChips";
import { DoctorCarousel } from "./sections/DoctorCarousel";
import { HeroBanner } from "./sections/HeroBanner";
import { OfferStrip } from "./sections/OfferStrip";
import { QuickActions } from "./sections/QuickActions";
import { ServiceGrid } from "./sections/ServiceGrid";
import type { HomeSection } from "@/types/config";

export type HomeSectionComponent = ComponentType<{ section: HomeSection }>;

export const sectionRegistry: Record<string, HomeSectionComponent> = {
  heroBanner: HeroBanner,
  categoryChips: CategoryChips,
  quickActions: QuickActions,
  serviceGrid: ServiceGrid,
  doctorCarousel: DoctorCarousel,
  offerStrip: OfferStrip,
};

export function getSectionComponent(
  type: string,
): HomeSectionComponent | undefined {
  return sectionRegistry[type];
}
