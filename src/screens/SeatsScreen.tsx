import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/types';
import { Button, Loader } from '@/components/ui';
import { AppColors, Radius, Space, cardShadow } from '@/constants/appTheme';
import { getSeats, type SeatCell } from '@/services/api';
import { SEATS_PER_ROW } from '@/constants/seedData';
import { useToast } from '@/context/ToastContext';
import { formatBDT } from '@/utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Seats'>;

const MAX_SEATS = 4;

export function SeatsScreen({ route, navigation }: Props) {
  const { train, carriage, date } = route.params;
  const toast = useToast();
  const [seats, setSeats] = useState<SeatCell[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const load = () => {
    getSeats(train.code, carriage.carriageId, date)
      .then((r) => setSeats(r.seats))
      .catch(() => setSeats([]));
  };
  useEffect(load, [train.code, carriage.carriageId, date]);

  const rows = useMemo(() => {
    if (!seats) return [];
    const grouped: SeatCell[][] = [];
    for (let i = 0; i < seats.length; i += SEATS_PER_ROW) {
      grouped.push(seats.slice(i, i + SEATS_PER_ROW));
    }
    return grouped;
  }, [seats]);

  const toggle = (seat: SeatCell) => {
    if (seat.booked) return;
    setSelected((prev) => {
      if (prev.includes(seat.seat)) return prev.filter((s) => s !== seat.seat);
      if (prev.length >= MAX_SEATS) {
        toast.info(`You can select up to ${MAX_SEATS} seats per booking.`);
        return prev;
      }
      return [...prev, seat.seat];
    });
  };

  const total = carriage.fare * selected.length;

  const onContinue = () => {
    if (!selected.length) {
      toast.error('Please select at least one seat.');
      return;
    }
    navigation.navigate('Passenger', {
      train,
      carriage,
      date,
      seats: selected,
    });
  };

  if (!seats) return <Loader label="Loading seat map…" />;

  return (
    <View style={styles.container}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>
          {train.name} · {carriage.name}
        </Text>
        <Text style={styles.headSub}>Tap a seat to select (max {MAX_SEATS})</Text>
      </View>

      <View style={styles.legend}>
        <Legend color={AppColors.seatFree} border label="Available" />
        <Legend color={AppColors.seatSelected} label="Selected" />
        <Legend color={AppColors.seatBooked} label="Booked" />
      </View>

      <ScrollView contentContainerStyle={styles.mapWrap}>
        <View style={styles.coach}>
          <View style={styles.engineRow}>
            <Ionicons name="train" size={20} color={AppColors.textMuted} />
            <Text style={styles.engineText}>Front of coach</Text>
          </View>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.seatRow}>
              {row.map((seat, ci) => (
                <View key={seat.seat} style={styles.seatSlot}>
                  <SeatButton
                    seat={seat}
                    selected={selected.includes(seat.seat)}
                    onPress={() => toggle(seat)}
                  />
                  {ci === SEATS_PER_ROW / 2 - 1 && <View style={styles.aisle} />}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>
              {selected.length
                ? `${selected.length} seat(s): ${selected.join(', ')}`
                : 'No seats selected'}
            </Text>
            <Text style={styles.footerTotal}>{formatBDT(total)}</Text>
          </View>
          <Button
            title="Continue"
            icon="arrow-forward"
            onPress={onContinue}
            style={{ paddingHorizontal: Space.xl }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function SeatButton({
  seat,
  selected,
  onPress,
}: {
  seat: SeatCell;
  selected: boolean;
  onPress: () => void;
}) {
  const bg = seat.booked
    ? AppColors.seatBooked
    : selected
    ? AppColors.seatSelected
    : AppColors.seatFree;
  const fg = selected ? AppColors.white : seat.booked ? AppColors.textMuted : AppColors.text;
  return (
    <Pressable
      disabled={seat.booked}
      onPress={onPress}
      style={[
        styles.seat,
        { backgroundColor: bg, borderColor: selected ? AppColors.seatSelected : AppColors.border },
      ]}>
      <Ionicons
        name={seat.booked ? 'close' : 'person'}
        size={13}
        color={fg}
        style={{ opacity: seat.booked ? 0.6 : selected ? 1 : 0.35 }}
      />
      <Text style={[styles.seatText, { color: fg }]}>{seat.seat}</Text>
    </Pressable>
  );
}

function Legend({ color, border, label }: { color: string; border?: boolean; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendBox,
          { backgroundColor: color, borderColor: border ? AppColors.border : color },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  head: { padding: Space.lg, paddingBottom: Space.sm },
  headTitle: { fontSize: 17, fontWeight: '800', color: AppColors.text },
  headSub: { fontSize: 13, color: AppColors.textMuted, marginTop: 2 },
  legend: {
    flexDirection: 'row',
    gap: Space.lg,
    paddingHorizontal: Space.lg,
    paddingBottom: Space.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1 },
  legendText: { fontSize: 12, color: AppColors.textMuted },
  mapWrap: { padding: Space.lg, alignItems: 'center' },
  coach: {
    backgroundColor: AppColors.card,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...cardShadow,
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: Space.md,
    paddingBottom: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    borderStyle: 'dashed',
  },
  engineText: { fontSize: 12, color: AppColors.textMuted },
  seatRow: { flexDirection: 'row', marginBottom: Space.sm },
  seatSlot: { flexDirection: 'row', alignItems: 'center' },
  seat: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  seatText: { fontSize: 10, fontWeight: '700', marginTop: 1 },
  aisle: { width: Space.lg },
  footer: {
    backgroundColor: AppColors.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingHorizontal: Space.lg,
    paddingTop: Space.md,
  },
  error: { color: AppColors.danger, fontSize: 13, marginBottom: Space.sm },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Space.sm,
  },
  footerLabel: { fontSize: 12, color: AppColors.textMuted, maxWidth: 190 },
  footerTotal: { fontSize: 22, fontWeight: '800', color: AppColors.primary, marginTop: 2 },
});
