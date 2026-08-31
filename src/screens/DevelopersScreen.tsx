import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loader } from '@/components/ui';
import { AppColors, Radius, Space } from '@/constants/appTheme';
import { PROJECT_TITLE, PROJECT_SUBTITLE, type Member } from '@/constants/team';
import { getDevelopers } from '@/services/api';

// Distinct avatar colours for members without a photo.
const AVATAR_COLORS = ['#0B6E4F', '#2563EB', '#B7791F', '#B4326B'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'M';
}

export function DevelopersScreen() {
  const [team, setTeam] = useState<Member[] | null>(null);

  useEffect(() => {
    getDevelopers()
      .then(setTeam)
      .catch(() => setTeam([]));
  }, []);

  if (!team) return <Loader label="Loading team…" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="people" size={30} color={AppColors.white} />
        </View>
        <Text style={styles.heroTitle}>{PROJECT_TITLE}</Text>
        <Text style={styles.heroSub}>{PROJECT_SUBTITLE}</Text>
      </View>

      <Text style={styles.section}>Developed by</Text>

      {team.map((m, i) => (
        <MemberCard key={m.id + i} member={m} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
      ))}

      <Text style={styles.footer}>Group Project · {new Date().getFullYear()}</Text>
    </ScrollView>
  );
}

function MemberCard({ member, color }: { member: Member; color: string }) {
  return (
    <Card style={styles.card}>
      {member.photoUrl ? (
        <Image source={{ uri: member.photoUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{initials(member.name)}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{member.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="id-card-outline" size={15} color={AppColors.textMuted} />
          <Text style={styles.meta}>ID: {member.id}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="mail-outline" size={15} color={AppColors.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>
            {member.email}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AppColors.bg },
  content: { padding: Space.lg, paddingBottom: Space.xxl },
  hero: {
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    borderRadius: Radius.lg,
    padding: Space.xl,
    marginBottom: Space.xl,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.md,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: AppColors.white, textAlign: 'center' },
  heroSub: { fontSize: 13, color: AppColors.primaryLight, marginTop: 4, textAlign: 'center' },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Space.md,
    marginLeft: Space.xs,
  },
  card: { flexDirection: 'row', alignItems: 'center', gap: Space.lg, marginBottom: Space.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: AppColors.white, fontSize: 22, fontWeight: '800' },
  name: { fontSize: 17, fontWeight: '800', color: AppColors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  meta: { fontSize: 14, color: AppColors.textMuted, fontWeight: '600', flex: 1 },
  footer: {
    textAlign: 'center',
    color: AppColors.textMuted,
    fontSize: 12,
    marginTop: Space.lg,
  },
});
