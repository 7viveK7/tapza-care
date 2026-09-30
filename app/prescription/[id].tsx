import { useLocalSearchParams } from "expo-router";

import { PrescriptionDetailScreen } from "@/features/prescriptions/PrescriptionDetailScreen";

export default function PrescriptionRoute() {
  const { id = "" } = useLocalSearchParams<{ id?: string }>();
  return <PrescriptionDetailScreen prescriptionId={id} />;
}
