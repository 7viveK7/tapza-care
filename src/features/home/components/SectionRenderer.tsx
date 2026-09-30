import { StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { getSectionComponent } from "../registry";
import type { HomeSection } from "@/types/config";
import { SectionBackground } from "./SectionBackground";

type Props = {
  section: HomeSection;
  index: number;
};

export function SectionRenderer({ section, index }: Props) {
  const Component = getSectionComponent(section.type);
  if (!Component) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 55).springify()}
      style={styles.band}
    >
      <SectionBackground background={section.background}>
        <Component section={section} />
      </SectionBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    width: "100%",
  },
});
