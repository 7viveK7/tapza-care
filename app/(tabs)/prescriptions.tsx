import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrescriptionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Prescriptions</Text>
        <Text style={styles.subtitle}>
          Track your treatment plan and medication reminders.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medication list</Text>
          <Text style={styles.cardText}>
            This placeholder screen will list active prescriptions soon.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 22,
  },
});
