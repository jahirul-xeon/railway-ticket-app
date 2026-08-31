import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/types';
import { Badge, Card, EmptyState, Loader } from '@/components/ui';
import { AppColors, Radius, Space } from '@/constants/appTheme';
import { searchTrains } from '@/services/api';
import type { Train, TrainClass } from '@/constants/seedData';
import { formatBDT, formatDate } from '@/utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'Results'>;

export function ResultsScreen({ route, navigation }: Props) {
  const { fromCode, toCode, fromName, toName, date } = route.params;
  const [trains, setTrains] = useState<Train[] | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    searchTrains(fromCode, toCode)
      .then((t) => {
        setTrains(t);
        if (t.length) setExpanded(t[0].code);
      })
      .catch(() => setTrains([]));
  }, [fromCode, toCode]);

  if (!trains) return <Loader label="Finding trains…" />;

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryRoute}>
          <Text style={styles.summaryStation} numberOfLines={1}>
            {fromName.replace(' Railway Station', '')}
          </Text>
          <Ionicons name="arrow-forward" size={16} color={AppColors.white} />
          <Text style={styles.summaryStation} numberOfLines={1}>
            {toName.replace(' Railway Station', '')}
          </Text>
        </View>
        <Text style={styles.summaryDate}>{formatDate(date)}</Text>
      </View>

      <FlatList
        data={trains}
        keyExtractor={(t) => String(t.code)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="train-outline"
            title="No direct trains"
            subtitle="No trains run on this exact route. Try swapping the stations."
          />
        }
        renderItem={({ item }) => {
          const open = expanded === item.code;
          return (
            <Card style={styles.trainCard}>
              <Pressable
                style={styles.trainHead}
                onPress={() => setExpanded(open ? null : item.code)}>
                <View style={styles.trainIcon}>
                  <Ionicons name="train" size={22} color={AppColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trainName}>{item.name}</Text>
                  <Text style={styles.trainCode}>Train #{item.code}</Text>
                </View>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={AppColors.textMuted}
                />
              </Pressable>

              <View style={styles.timeRow}>
                <View style={styles.timeCol}>
                  <Text style={styles.time}>{item.startTime}</Text>
                  <Text style={styles.timeStation} numberOfLines={1}>
                    {item.fromStation.replace(' Railway Station', '')}
                  </Text>
                </View>
                <View style={styles.timeLine}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                  <Ionicons name="train-outline" size={14} color={AppColors.textMuted} />
                  <View style={styles.line} />
                  <View style={[styles.dot, { backgroundColor: AppColors.accent }]} />
                </View>
                <View style={[styles.timeCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.time}>{item.endTime}</Text>
                  <Text style={styles.timeStation} numberOfLines={1}>
                    {item.toStation.replace(' Railway Station', '')}
                  </Text>
                </View>
              </View>

              {open && (
                <View style={styles.classes}>
                  <Text style={styles.classesTitle}>Select a class</Text>
                  {item.classes.map((c) => (
                    <ClassRow
                      key={c.carriageId}
                      cls={c}
                      onPress={() =>
                        navigation.navigate('Seats', { train: item, carriage: c, date })
                      }
                    />
                  ))}
                </View>
              )}
            </Card>
          );
        }}
      />
    </View>
  );
}

function ClassRow({ cls, onPress }: { cls: TrainClass; onPress: () => void }) {
  return (
    <Pressable style={styles.classRow} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.className}>{cls.name}</Text>
        <Badge text={cls.className} />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.classFare}>{formatBDT(cls.fare)}</Text>
        <View style={styles.selectPill}>
          <Text style={styles.selectPillText}>Select</Text>
          <Ionicons name="arrow-forward" size={13} color={AppColors.white} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  summary: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryRoute: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, flex: 1 },
  summaryStation: { color: AppColors.white, fontSize: 15, fontWeight: '700', maxWidth: 120 },
  summaryDate: { color: AppColors.primaryLight, fontSize: 13, fontWeight: '600' },
  list: { padding: Space.lg, gap: Space.lg },
  trainCard: { padding: Space.lg },
  trainHead: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  trainIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainName: { fontSize: 17, fontWeight: '800', color: AppColors.text },
  trainCode: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Space.lg,
    gap: Space.md,
  },
  timeCol: { width: 90 },
  time: { fontSize: 16, fontWeight: '800', color: AppColors.text },
  timeStation: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  timeLine: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: AppColors.primary },
  line: { flex: 1, height: 2, backgroundColor: AppColors.border },
  classes: {
    marginTop: Space.lg,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: Space.md,
  },
  classesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textMuted,
    marginBottom: Space.sm,
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    gap: Space.md,
  },
  className: { fontSize: 15, fontWeight: '700', color: AppColors.text, marginBottom: 6 },
  classFare: { fontSize: 16, fontWeight: '800', color: AppColors.primary },
  selectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: AppColors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 5,
    marginTop: 6,
  },
  selectPillText: { color: AppColors.white, fontSize: 12, fontWeight: '700' },
});
