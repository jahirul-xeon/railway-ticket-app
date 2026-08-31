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
import type { AppStackParamList } from '@/navigation/types';
import { Button, Card, Field } from '@/components/ui';
import { AppColors, Radius, Space } from '@/constants/appTheme';
import { GENDERS, PAYMENT_METHODS } from '@/constants/seedData';
import { createBooking } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatBDT, formatDate } from '@/utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Passenger'>;

const METHOD_ICONS: Record<number, keyof typeof Ionicons.glyphMap> = {
  1: 'card-outline',
  2: 'card',
  3: 'phone-portrait-outline',
  4: 'wallet-outline',
};

export function PassengerScreen({ route, navigation }: Props) {
  const { train, carriage, date, seats } = route.params;
  const { user, profile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(profile?.fullName ?? '');
  const [age, setAge] = useState('');
  const [genderId, setGenderId] = useState(GENDERS[0].id);
  const [methodId, setMethodId] = useState(PAYMENT_METHODS[0].id);
  const [loading, setLoading] = useState(false);

  const total = carriage.fare * seats.length;

  const onConfirm = async () => {
    if (!name.trim()) return toast.error('Please enter the passenger name.');
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return toast.error('Please enter a valid age.');
    }
    if (!user) return toast.error('Session expired. Please log in again.');

    setLoading(true);
    try {
      const res = await createBooking({
        userId: user.uid,
        train,
        carriage,
        journeyDate: date,
        seats,
        passengerName: name.trim(),
        passengerAge: ageNum,
        genderId,
        paymentMethodId: methodId,
      });
      toast.success('Booking confirmed!');
      navigation.replace('Confirmation', {
        bookingId: res.bookingId,
        trainName: train.name,
        fromStation: train.fromStation,
        toStation: train.toStation,
        date,
        className: carriage.name,
        seats: res.seats,
        totalFare: res.totalFare,
        passengerName: name.trim(),
      });
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: AppColors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {/* Trip summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Ionicons name="train" size={20} color={AppColors.primary} />
            <Text style={styles.summaryTrain}>{train.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <SummaryItem
              icon="git-compare-outline"
              label="Route"
              value={`${train.fromStation.replace(' Railway Station', '')} → ${train.toStation.replace(
                ' Railway Station',
                ''
              )}`}
            />
            <SummaryItem icon="calendar-outline" label="Date" value={formatDate(date)} />
          </View>
          <View style={styles.summaryRow}>
            <SummaryItem icon="business-outline" label="Class" value={carriage.name} />
            <SummaryItem icon="grid-outline" label="Seats" value={seats.join(', ')} />
          </View>
        </Card>

        {/* Passenger */}
        <Text style={styles.section}>Passenger details</Text>
        <Card>
          <Field
            label="Full name"
            icon="person-outline"
            placeholder="Passenger name"
            value={name}
            onChangeText={setName}
          />
          <Field
            label="Age"
            icon="calendar-number-outline"
            placeholder="Age"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />
          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.chips}>
            {GENDERS.map((g) => (
              <Chip
                key={g.id}
                label={g.name}
                icon={g.id === 1 ? 'male' : 'female'}
                active={genderId === g.id}
                onPress={() => setGenderId(g.id)}
              />
            ))}
          </View>
        </Card>

        {/* Payment */}
        <Text style={styles.section}>Payment method</Text>
        <Card>
          <View style={styles.methods}>
            {PAYMENT_METHODS.map((m) => (
              <Pressable
                key={m.id}
                style={[styles.method, methodId === m.id && styles.methodActive]}
                onPress={() => setMethodId(m.id)}>
                <Ionicons
                  name={METHOD_ICONS[m.id] ?? 'cash-outline'}
                  size={22}
                  color={methodId === m.id ? AppColors.primary : AppColors.textMuted}
                />
                <Text
                  style={[styles.methodText, methodId === m.id && styles.methodTextActive]}>
                  {m.name}
                </Text>
                {methodId === m.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={AppColors.primary}
                    style={styles.methodCheck}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Fare breakdown */}
        <Card style={{ marginTop: Space.lg }}>
          <Row label={`Fare (${formatBDT(carriage.fare)} × ${seats.length})`} value={formatBDT(total)} />
          <View style={styles.divider} />
          <Row label="Total payable" value={formatBDT(total)} bold />
        </Card>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          title={`Confirm & Pay  ${formatBDT(total)}`}
          icon="shield-checkmark-outline"
          onPress={onConfirm}
          loading={loading}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons name={icon} size={16} color={AppColors.textMuted} />
      <View>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={active ? AppColors.white : AppColors.textMuted} />
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, bold && styles.priceBold]}>{label}</Text>
      <Text style={[styles.priceValue, bold && styles.priceBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { padding: Space.lg, paddingBottom: Space.xxl },
  summaryCard: { backgroundColor: AppColors.primaryLight, borderColor: '#CFE6DC' },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginBottom: Space.md },
  summaryTrain: { fontSize: 17, fontWeight: '800', color: AppColors.primaryDark },
  summaryRow: { flexDirection: 'row', gap: Space.md, marginTop: Space.sm },
  summaryItem: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  summaryLabel: { fontSize: 11, color: AppColors.textMuted, fontWeight: '600' },
  summaryValue: { fontSize: 14, color: AppColors.text, fontWeight: '700', marginTop: 1 },
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.text,
    marginTop: Space.xl,
    marginBottom: Space.md,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: AppColors.textMuted, marginBottom: Space.sm },
  chips: { flexDirection: 'row', gap: Space.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.bg,
  },
  chipActive: { backgroundColor: AppColors.primary, borderColor: AppColors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: AppColors.textMuted },
  chipTextActive: { color: AppColors.white },
  methods: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md },
  method: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    padding: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.bg,
  },
  methodActive: { borderColor: AppColors.primary, backgroundColor: AppColors.primaryLight },
  methodText: { fontSize: 14, fontWeight: '600', color: AppColors.textMuted },
  methodTextActive: { color: AppColors.primaryDark },
  methodCheck: { position: 'absolute', top: 6, right: 6 },
  divider: { height: 1, backgroundColor: AppColors.border, marginVertical: Space.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 14, color: AppColors.textMuted },
  priceValue: { fontSize: 14, color: AppColors.text, fontWeight: '600' },
  priceBold: { fontSize: 17, fontWeight: '800', color: AppColors.text },
  footer: {
    backgroundColor: AppColors.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    padding: Space.lg,
  },
});
