import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { Button, Field } from '@/components/ui';
import { AppColors, Space } from '@/constants/appTheme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authErrorMessage } from '@/utils/format';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // On success, App switches to the app navigator automatically.
    } catch (e) {
      toast.error(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <SafeAreaView>
          <View style={styles.logoCircle}>
            <Ionicons name="train" size={40} color={AppColors.white} />
          </View>
          <Text style={styles.heroTitle}>Railway Ticket</Text>
          <Text style={styles.heroSubtitle}>Book your journey in seconds</Text>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}>
        <ScrollView
          contentContainerStyle={styles.sheet}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to continue</Text>

          <Field
            label="Email"
            icon="mail-outline"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button title="Log In" onPress={onLogin} loading={loading} icon="log-in-outline" />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primary },
  hero: {
    paddingHorizontal: Space.xl,
    paddingBottom: Space.xxl,
    alignItems: 'center',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: AppColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Space.md,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.white,
    textAlign: 'center',
    marginTop: Space.md,
  },
  heroSubtitle: {
    fontSize: 14,
    color: AppColors.primaryLight,
    textAlign: 'center',
    marginTop: 4,
  },
  sheetWrap: { flex: 1 },
  sheet: {
    backgroundColor: AppColors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Space.xl,
    paddingTop: Space.xxl,
    flexGrow: 1,
  },
  title: { fontSize: 24, fontWeight: '800', color: AppColors.text },
  subtitle: { fontSize: 15, color: AppColors.textMuted, marginTop: 4, marginBottom: Space.xl },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Space.xl },
  footerText: { color: AppColors.textMuted, fontSize: 14 },
  footerLink: { color: AppColors.primary, fontSize: 14, fontWeight: '700' },
});
