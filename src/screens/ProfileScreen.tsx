import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Field } from '@/components/ui';
import { AppColors, Radius, Space } from '@/constants/appTheme';
import type { AppStackParamList } from '@/navigation/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function ProfileScreen() {
  const { profile, user, logout, updateUserProfile } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [editing, setEditing] = useState(false);

  const initials =
    (profile?.firstName?.[0] ?? '') + (profile?.lastName?.[0] ?? '') || 'U';

  const onLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={{ alignItems: 'center' }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials.toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile?.fullName || 'Traveller'}</Text>
          <Text style={styles.email}>{profile?.email || user?.email}</Text>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Card>
          <InfoRow icon="person-outline" label="First name" value={profile?.firstName || '—'} />
          <Divider />
          <InfoRow icon="person-outline" label="Last name" value={profile?.lastName || '—'} />
          <Divider />
          <InfoRow icon="mail-outline" label="Email" value={profile?.email || user?.email || '—'} />
          <Divider />
          <InfoRow icon="call-outline" label="Phone" value={profile?.phone || '—'} />
        </Card>

        <Button
          title="Edit Profile"
          variant="outline"
          icon="create-outline"
          onPress={() => setEditing(true)}
          style={{ marginTop: Space.lg }}
        />

        <Card
          style={{ marginTop: Space.lg }}
          onPress={() => navigation.navigate('Developers')}>
          <View style={styles.aboutRow}>
            <View style={styles.aboutIcon}>
              <Ionicons name="people" size={20} color={AppColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutTitle}>Meet the Developers</Text>
              <Text style={styles.aboutSub}>The team behind this app</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={AppColors.textMuted} />
          </View>
        </Card>

        <Card style={{ marginTop: Space.lg }}>
          <View style={styles.aboutRow}>
            <View style={styles.aboutIcon}>
              <Ionicons name="train" size={20} color={AppColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutTitle}>Railway Ticket</Text>
              <Text style={styles.aboutSub}>Bangladesh Railway · v1.0.0</Text>
            </View>
          </View>
        </Card>

        <Button
          title="Log Out"
          variant="danger"
          icon="log-out-outline"
          onPress={onLogout}
          style={{ marginTop: Space.xl }}
        />
      </ScrollView>

      <EditProfileModal
        visible={editing}
        initial={{
          firstName: profile?.firstName ?? '',
          lastName: profile?.lastName ?? '',
          phone: profile?.phone ?? '',
        }}
        onClose={() => setEditing(false)}
        onSave={updateUserProfile}
      />
    </View>
  );
}

function EditProfileModal({
  visible,
  initial,
  onClose,
  onSave,
}: {
  visible: boolean;
  initial: { firstName: string; lastName: string; phone: string };
  onClose: () => void;
  onSave: (d: { firstName: string; lastName: string; phone: string }) => Promise<void>;
}) {
  const toast = useToast();
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);

  // Re-sync fields whenever the modal opens with fresh data.
  const onShow = () => {
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
    setPhone(initial.phone);
  };

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({ firstName, lastName, phone });
      onClose();
      toast.success('Profile updated.');
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onShow={onShow}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </Pressable>
          </View>

          <Field
            label="First name"
            icon="person-outline"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
          />
          <Field
            label="Last name"
            icon="person-outline"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
          />
          <Field
            label="Phone"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="01XXXXXXXXX"
          />

          <Button title="Save changes" icon="checkmark" onPress={save} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={AppColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  header: {
    backgroundColor: AppColors.primary,
    paddingBottom: Space.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: AppColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.md,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: AppColors.white },
  name: { fontSize: 22, fontWeight: '800', color: AppColors.white, marginTop: Space.md },
  email: { fontSize: 14, color: AppColors.primaryLight, marginTop: 2 },
  body: { padding: Space.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingVertical: Space.sm },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: { fontSize: 12, color: AppColors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 16, color: AppColors.text, fontWeight: '700', marginTop: 1 },
  divider: { height: 1, backgroundColor: AppColors.border, marginVertical: Space.xs },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  aboutIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: { fontSize: 16, fontWeight: '800', color: AppColors.text },
  aboutSub: { fontSize: 13, color: AppColors.textMuted, marginTop: 2 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: AppColors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Space.xl,
    paddingBottom: Space.xxl,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: AppColors.border,
    alignSelf: 'center',
    marginBottom: Space.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Space.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: AppColors.text },
});
