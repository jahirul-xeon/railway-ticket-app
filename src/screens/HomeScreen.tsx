import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList, TabsParamList } from '@/navigation/types';
import { Button, Card } from '@/components/ui';
import { StationPicker } from '@/components/StationPicker';
import { AppColors, Radius, Space, cardShadow } from '@/constants/appTheme';
import { getStations } from '@/services/api';
import type { Station } from '@/constants/seedData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatDate, toYMD } from '@/utils/format';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Home'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const toast = useToast();
  const [stations, setStations] = useState<Station[]>([]);
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo] = useState<Station | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    getStations().then(setStations).catch(() => {});
  }, []);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const onPickDate = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (_e, d) => d && setDate(d),
      });
    } else {
      setShowPicker(true);
    }
  };

  const onSearch = () => {
    if (!from || !to) {
      toast.error('Please select both stations.');
      return;
    }
    if (from.code === to.code) {
      toast.error('Origin and destination cannot be the same.');
      return;
    }
    navigation.navigate('Results', {
      fromCode: from.code,
      toCode: to.code,
      fromName: from.name,
      toName: to.name,
      date: toYMD(date),
    });
  };

  const firstName = profile?.firstName || 'traveller';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <Text style={styles.greeting}>Hi {firstName} 👋</Text>
          <Text style={styles.headline}>Where are you{'\n'}travelling today?</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        <Card style={styles.searchCard}>
          <View style={styles.pickersRow}>
            <View style={styles.pickersCol}>
              <StationPicker
                label="From"
                icon="train-outline"
                station={from}
                stations={stations}
                disabledCode={to?.code}
                onSelect={setFrom}
              />
              <StationPicker
                label="To"
                icon="location-outline"
                station={to}
                stations={stations}
                disabledCode={from?.code}
                onSelect={setTo}
              />
            </View>
            <Pressable style={styles.swapBtn} onPress={swap} hitSlop={8}>
              <Ionicons name="swap-vertical" size={20} color={AppColors.white} />
            </Pressable>
          </View>

          <Pressable style={styles.dateRow} onPress={onPickDate}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar-outline" size={18} color={AppColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Journey date</Text>
              <Text style={styles.dateValue}>{formatDate(toYMD(date))}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={AppColors.textMuted} />
          </Pressable>

          <Button
            title="Search Trains"
            icon="search"
            onPress={onSearch}
            style={{ marginTop: Space.sm }}
          />
        </Card>

        {showPicker && Platform.OS === 'ios' && (
          <View style={styles.iosPicker}>
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              minimumDate={new Date()}
              onChange={(_e, d) => d && setDate(d)}
            />
            <Button title="Done" variant="outline" onPress={() => setShowPicker(false)} />
          </View>
        )}

        <Text style={styles.sectionTitle}>Popular routes</Text>
        {POPULAR.map((r) => (
          <PopularRoute
            key={r.from + r.to}
            {...r}
            stations={stations}
            onPress={(f, t) => {
              setFrom(f);
              setTo(t);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const POPULAR = [
  { from: 111, to: 112, label: 'Dhaka → Chittagong' },
  { from: 111, to: 113, label: 'Dhaka → Sylhet' },
  { from: 111, to: 117, label: 'Dhaka → Rajshahi' },
  { from: 116, to: 117, label: 'Khulna → Rajshahi' },
];

function PopularRoute({
  from,
  to,
  label,
  stations,
  onPress,
}: {
  from: number;
  to: number;
  label: string;
  stations: Station[];
  onPress: (from: Station, to: Station) => void;
}) {
  return (
    <Pressable
      style={styles.routeCard}
      onPress={() => {
        const f = stations.find((s) => s.code === from);
        const t = stations.find((s) => s.code === to);
        if (f && t) onPress(f, t);
      }}>
      <View style={styles.routeIcon}>
        <Ionicons name="git-compare-outline" size={18} color={AppColors.primary} />
      </View>
      <Text style={styles.routeLabel}>{label}</Text>
      <Ionicons name="arrow-forward" size={16} color={AppColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  header: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: Space.xl,
    paddingBottom: Space.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  greeting: { color: AppColors.primaryLight, fontSize: 15, marginTop: Space.sm },
  headline: { color: AppColors.white, fontSize: 26, fontWeight: '800', marginTop: 4, marginBottom: Space.sm },
  body: { padding: Space.lg, paddingBottom: Space.xxl * 2 },
  searchCard: { marginTop: 0 },
  pickersRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  pickersCol: { flex: 1, gap: Space.md },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: AppColors.card,
    ...cardShadow,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    padding: Space.md,
    marginTop: Space.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateLabel: { fontSize: 12, color: AppColors.textMuted, fontWeight: '600' },
  dateValue: { fontSize: 16, color: AppColors.text, fontWeight: '600', marginTop: 2 },
  error: { color: AppColors.danger, fontSize: 13, marginTop: Space.md },
  iosPicker: {
    backgroundColor: AppColors.card,
    borderRadius: Radius.lg,
    padding: Space.md,
    marginTop: Space.lg,
    ...cardShadow,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.text,
    marginTop: Space.xl,
    marginBottom: Space.md,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    padding: Space.md,
    marginBottom: Space.md,
  },
  routeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: AppColors.text },
});
