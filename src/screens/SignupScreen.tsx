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

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth();
  const toast = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signup({ firstName, lastName, email, phone, password });
      toast.success('Account created successfully!');
    } catch (e) {
      toast.error(authErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={AppColors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Create account</Text>
        <Text style={styles.headerSub}>Join to start booking tickets</Text>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}>
        <ScrollView contentContainerStyle={styles.sheet} keyboardShouldPersistTaps="handled">
          <View style={styles.row}>
            <View style={styles.half}>
              <Field
                label="First name"
                icon="person-outline"
                placeholder="Tanmoy"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={styles.half}>
              <Field
                label="Last name"
                placeholder="Mahmud"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

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
            label="Phone"
            icon="call-outline"
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Field
            label="Password"
            icon="lock-closed-outline"
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Field
            label="Confirm password"
            icon="lock-closed-outline"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <Button title="Sign Up" onPress={onSignup} loading={loading} icon="person-add-outline" />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.primary },
  header: { paddingHorizontal: Space.xl, paddingBottom: Space.lg },
  back: { marginTop: Space.sm, marginBottom: Space.md },
  headerTitle: { fontSize: 26, fontWeight: '800', color: AppColors.white },
  headerSub: { fontSize: 14, color: AppColors.primaryLight, marginTop: 4 },
  sheetWrap: { flex: 1 },
  sheet: {
    backgroundColor: AppColors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Space.xl,
    paddingTop: Space.xxl,
    flexGrow: 1,
  },
  row: { flexDirection: 'row', gap: Space.md },
  half: { flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Space.xl },
  footerText: { color: AppColors.textMuted, fontSize: 14 },
  footerLink: { color: AppColors.primary, fontSize: 14, fontWeight: '700' },
});
