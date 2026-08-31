import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/types';
import { Button, Card } from '@/components/ui';
import { AppColors, Radius, Space, cardShadow } from '@/constants/appTheme';
import { formatBDT, formatDate } from '@/utils/format';
import { downloadTicketPdf } from '@/services/ticketPdf';
import { useToast } from '@/context/ToastContext';

type Props = NativeStackScreenProps<AppStackParamList, 'Confirmation'>;

export function ConfirmationScreen({ route, navigation }: Props) {
  const {
    bookingId,
    trainName,
    fromStation,
    toStation,
    date,
    className,
    seats,
    totalFare,
    passengerName,
  } = route.params;

  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  const onDownload = async () => {
    setDownloading(true);
    try {
      await downloadTicketPdf({
        bookingId,
        trainName,
        fromStation,
        toStation,
        travelDate: date,
        className,
        seats,
        totalFare,
        passengerName,
        status: 'Confirmed',
      });
      toast.success('Ticket ready to save or share.');
    } catch (e) {
      toast.error((e as Error)?.message ?? 'Could not create the PDF.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={54} color={AppColors.white} />
        </View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your ticket has been booked successfully.</Text>

        {/* Ticket */}
        <Card style={styles.ticket}>
          <View style={styles.ticketHead}>
            <View>
              <Text style={styles.ticketLabel}>TRAIN</Text>
              <Text style={styles.ticketTrain}>{trainName}</Text>
            </View>
            <Ionicons name="train" size={28} color={AppColors.primary} />
          </View>

          <View style={styles.route}>
            <View style={styles.routeCol}>
              <Text style={styles.routeStation}>
                {fromStation.replace(' Railway Station', '')}
              </Text>
              <Text style={styles.routeSub}>From</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={AppColors.textMuted} />
            <View style={[styles.routeCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.routeStation}>
                {toStation.replace(' Railway Station', '')}
              </Text>
              <Text style={styles.routeSub}>To</Text>
            </View>
          </View>

          <View style={styles.dashed} />

          <View style={styles.detailGrid}>
            <Detail label="Booking ID" value={`#${bookingId.slice(0, 8).toUpperCase()}`} />
            <Detail label="Date" value={formatDate(date)} />
            <Detail label="Passenger" value={passengerName} />
            <Detail label="Class" value={className} />
            <Detail label="Seats" value={seats.join(', ')} />
            <Detail label="Paid" value={formatBDT(totalFare)} highlight />
          </View>
        </Card>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={18} color={AppColors.textMuted} />
          <Text style={styles.noteText}>
            You can view this ticket any time under “My Tickets”.
          </Text>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          title="Download Ticket (PDF)"
          icon="download-outline"
          onPress={onDownload}
          loading={downloading}
        />
        <Button
          title="View My Tickets"
          variant="outline"
          icon="ticket-outline"
          onPress={() => navigation.replace('Tabs')}
          style={{ marginTop: Space.sm }}
        />
      </SafeAreaView>
    </View>
  );
}

function Detail({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  body: { padding: Space.lg, alignItems: 'center', paddingBottom: Space.xxl },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AppColors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Space.lg,
    ...cardShadow,
  },
  title: { fontSize: 24, fontWeight: '800', color: AppColors.text, marginTop: Space.lg },
  subtitle: { fontSize: 15, color: AppColors.textMuted, marginTop: 4, textAlign: 'center' },
  ticket: { width: '100%', marginTop: Space.xl, padding: Space.lg },
  ticketHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketLabel: { fontSize: 11, color: AppColors.textMuted, fontWeight: '700', letterSpacing: 1 },
  ticketTrain: { fontSize: 20, fontWeight: '800', color: AppColors.text, marginTop: 2 },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.lg,
  },
  routeCol: { flex: 1 },
  routeStation: { fontSize: 18, fontWeight: '800', color: AppColors.text },
  routeSub: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  dashed: {
    height: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: AppColors.border,
    marginVertical: Space.lg,
  },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', marginBottom: Space.lg },
  detailLabel: { fontSize: 12, color: AppColors.textMuted, fontWeight: '600' },
  detailValue: { fontSize: 15, color: AppColors.text, fontWeight: '700', marginTop: 3 },
  detailHighlight: { color: AppColors.primary, fontSize: 17 },
  note: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'center',
    marginTop: Space.lg,
    paddingHorizontal: Space.sm,
  },
  noteText: { flex: 1, fontSize: 13, color: AppColors.textMuted },
  footer: {
    backgroundColor: AppColors.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    padding: Space.lg,
  },
});
