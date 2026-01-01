import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EthicsScreen() {
  const router = useRouter();

  const handleComplete = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(tabs)/dashboard');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ethics & Trust</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Honest Tracking</Text>
          <Text style={styles.sectionText}>
            We believe in honest self-assessment. No judgment, just data to help you improve.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          <Text style={styles.sectionText}>
            Your data stays private. We don't sell it. You can delete everything anytime.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ads Fund the App</Text>
          <Text style={styles.sectionText}>
            NGINE is free. Minimal ads keep it running. We never show ads during check-ins or failures.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Text style={styles.sectionText}>
            AI helps explain why resolutions fail. It's honest, non-judgmental, and actionable.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleComplete}
      >
        <Text style={styles.buttonText}>I Understand</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    margin: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

