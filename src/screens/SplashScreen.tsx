import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Space } from '@/constants/appTheme';

export function AppSplash({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Ionicons name="train" size={64} color={AppColors.white} />
      </View>
      <Text style={styles.title}>Railway Ticket</Text>
      <Text style={styles.subtitle}>Bangladesh Railway</Text>
      <ActivityIndicator
        color={AppColors.white}
        style={{ marginTop: Space.xl }}
        size="small"
      />
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AppColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: AppColors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: AppColors.primaryLight,
    marginTop: Space.xs,
  },
  message: {
    marginTop: Space.md,
    color: AppColors.primaryLight,
    fontSize: 13,
  },
});
