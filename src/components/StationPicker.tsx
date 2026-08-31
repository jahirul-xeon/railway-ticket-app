import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, Radius, Space } from '@/constants/appTheme';
import type { Station } from '@/constants/seedData';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  station: Station | null;
  stations: Station[];
  disabledCode?: number; // prevent picking same as the other end
  onSelect: (s: Station) => void;
};

export function StationPicker({
  label,
  icon,
  station,
  stations,
  disabledCode,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stations.filter(
      (s) => s.code !== disabledCode && (!q || s.name.toLowerCase().includes(q))
    );
  }, [search, stations, disabledCode]);

  return (
    <>
      <Pressable style={styles.selector} onPress={() => setOpen(true)}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color={AppColors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.selLabel}>{label}</Text>
          <Text style={[styles.selValue, !station && styles.placeholder]} numberOfLines={1}>
            {station ? station.name : 'Select station'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={AppColors.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={26} color={AppColors.text} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={AppColors.textMuted} />
            <TextInput
              placeholder="Search stations"
              placeholderTextColor={AppColors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              autoFocus
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(s) => String(s.code)}
            contentContainerStyle={{ padding: Space.lg }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                  setSearch('');
                }}>
                <View style={styles.rowIcon}>
                  <Ionicons name="location" size={18} color={AppColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{item.name}</Text>
                  <Text style={styles.rowZone}>{item.zone}</Text>
                </View>
                {station?.code === item.code && (
                  <Ionicons name="checkmark-circle" size={20} color={AppColors.primary} />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No stations found.</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    padding: Space.md,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selLabel: { fontSize: 12, color: AppColors.textMuted, fontWeight: '600' },
  selValue: { fontSize: 16, color: AppColors.text, fontWeight: '600', marginTop: 2 },
  placeholder: { color: AppColors.textMuted, fontWeight: '400' },

  modal: { flex: 1, backgroundColor: AppColors.bg },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Space.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: AppColors.text },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    height: 48,
    marginHorizontal: Space.lg,
  },
  searchInput: { flex: 1, fontSize: 16, color: AppColors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    paddingVertical: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: { fontSize: 15, fontWeight: '600', color: AppColors.text },
  rowZone: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: AppColors.textMuted, marginTop: Space.xl },
});
