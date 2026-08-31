import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Badge, Card, EmptyState, Loader } from '@/components/ui';
import { AppColors, Radius, Space } from '@/constants/appTheme';
import { cancelBooking, getMyBookings, type Booking } from '@/services/api';
import { downloadTicketPdf } from '@/services/ticketPdf';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatBDT, formatDate, formatDateTime } from '@/utils/format';

export function MyBookingsScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setBookings(await getMyBookings(user.uid));
    } catch {
      setBookings([]);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onCancel = (b: Booking) => {
    Alert.alert(
      'Cancel booking?',
      `Cancel your ${b.trainName} ticket (${b.seats.join(', ')})? This frees the seats.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(b);
              await load();
              toast.success('Booking cancelled. Seats released.');
            } catch (e) {
              toast.error((e as Error)?.message ?? 'Could not cancel.');
            }
          },
        },
      ]
    );
  };

  if (!bookings) return <Loader label="Loading your tickets…" />;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <Text style={styles.headerSub}>
          {bookings.length} booking{bookings.length === 1 ? '' : 's'}
        </Text>
      </SafeAreaView>

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.bookingId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AppColors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title="No tickets yet"
            subtitle="Search for a train and book your first journey."
          />
        }
        renderItem={({ item }) => <TicketCard booking={item} onCancel={onCancel} />}
      />
    </View>
  );
}

function TicketCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel: (b: Booking) => void;
}) {
  const cancelled = booking.status === 'Cancelled';
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadTicketPdf({
        bookingId: booking.bookingId,
        trainName: booking.trainName,
        trainCode: booking.trainCode,
        fromStation: booking.fromStation,
        toStation: booking.toStation,
        startTime: booking.startTime,
        endTime: booking.endTime,
        travelDate: booking.travelDate,
        className: booking.className,
        classType: booking.classType,
        seats: booking.seats,
        passengerName: booking.passengerName,
        passengerAge: booking.passengerAge,
        gender: booking.genderName,
        paymentMethod: booking.paymentMethodName,
        totalFare: booking.totalFare,
        status: booking.status,
        bookedAtMs: booking.bookingTimeMs,
      });
      toast.success('Ticket ready to save or share.');
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Could not create the PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card style={[styles.card, cancelled && styles.cardCancelled]}>
      <View style={styles.cardHead}>
        <View style={styles.trainIcon}>
          <Ionicons name="train" size={20} color={AppColors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.trainName}>{booking.trainName}</Text>
          <Text style={styles.trainSub}>
            {booking.startTime} · {booking.className}
          </Text>
        </View>
        <Badge
          text={booking.status}
          color={cancelled ? AppColors.danger : AppColors.success}
          bg={cancelled ? '#FDECEC' : '#E4F4EA'}
        />
      </View>

      <View style={styles.route}>
        <View style={styles.routeCol}>
          <Text style={styles.routeStation} numberOfLines={1}>
            {booking.fromStation.replace(' Railway Station', '')}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={AppColors.textMuted} />
        <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.routeStation} numberOfLines={1}>
            {booking.toStation.replace(' Railway Station', '')}
          </Text>
        </View>
      </View>

      <View style={styles.metaGrid}>
        <Meta icon="calendar-outline" label="Date" value={formatDate(booking.travelDate)} />
        <Meta icon="grid-outline" label="Seats" value={booking.seats.join(', ')} />
        <Meta icon="person-outline" label="Passenger" value={booking.passengerName} />
        <Meta icon="cash-outline" label="Paid" value={formatBDT(booking.totalFare)} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.bookedAt}>Booked {formatDateTime(booking.bookingTimeMs)}</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={onDownload}
            style={styles.actionBtn}
            hitSlop={8}
            disabled={downloading}>
            {downloading ? (
              <ActivityIndicator size="small" color={AppColors.primary} />
            ) : (
              <Ionicons name="download-outline" size={16} color={AppColors.primary} />
            )}
            <Text style={styles.downloadText}>PDF</Text>
          </Pressable>
          {!cancelled && (
            <Pressable onPress={() => onCancel(booking)} style={styles.actionBtn} hitSlop={8}>
              <Ionicons name="close-circle-outline" size={16} color={AppColors.danger} />
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Card>
  );
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={15} color={AppColors.textMuted} />
      <View>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  header: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: Space.lg,
    paddingBottom: Space.lg,
    paddingTop: Space.sm,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: AppColors.white },
  headerSub: { fontSize: 13, color: AppColors.primaryLight, marginTop: 2 },
  list: { padding: Space.lg, gap: Space.lg, flexGrow: 1 },
  card: { padding: Space.lg },
  cardCancelled: { opacity: 0.7 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  trainIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainName: { fontSize: 16, fontWeight: '800', color: AppColors.text },
  trainSub: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    marginTop: Space.lg,
    backgroundColor: AppColors.bg,
    borderRadius: Radius.md,
    padding: Space.md,
  },
  routeCol: { flex: 1 },
  routeStation: { fontSize: 15, fontWeight: '700', color: AppColors.text },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Space.md },
  meta: { width: '50%', flexDirection: 'row', gap: 6, marginTop: Space.md, alignItems: 'flex-start' },
  metaLabel: { fontSize: 11, color: AppColors.textMuted, fontWeight: '600' },
  metaValue: { fontSize: 14, color: AppColors.text, fontWeight: '700', marginTop: 1 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.lg,
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  bookedAt: { fontSize: 12, color: AppColors.textMuted, flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Space.lg },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  downloadText: { color: AppColors.primary, fontSize: 13, fontWeight: '700' },
  cancelText: { color: AppColors.danger, fontSize: 13, fontWeight: '700' },
});
