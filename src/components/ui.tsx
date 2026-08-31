import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors, Radius, Space, cardShadow } from '@/constants/appTheme';

// ---------- Button ----------
type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = {
    primary: { bg: AppColors.primary, fg: AppColors.white, border: AppColors.primary },
    outline: { bg: 'transparent', fg: AppColors.primary, border: AppColors.primary },
    danger: { bg: AppColors.danger, fg: AppColors.white, border: AppColors.danger },
    ghost: { bg: 'transparent', fg: AppColors.textMuted, border: 'transparent' },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.btnRow}>
          {icon && <Ionicons name={icon} size={18} color={palette.fg} />}
          <Text style={[styles.btnText, { color: palette.fg }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ---------- Text field ----------
type FieldProps = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export function Field({ label, icon, error, style, ...rest }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !!error && styles.inputRowError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={AppColors.textMuted}
            style={{ marginRight: Space.sm }}
          />
        )}
        <TextInput
          placeholderTextColor={AppColors.textMuted}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ---------- Card ----------
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// ---------- Badge ----------
export function Badge({
  text,
  color = AppColors.primary,
  bg = AppColors.primaryLight,
}: {
  text: string;
  color?: string;
  bg?: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

// ---------- Empty state ----------
export function EmptyState({
  icon = 'file-tray-outline',
  title,
  subtitle,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={54} color={AppColors.seatBooked} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.emptySub}>{subtitle}</Text>}
    </View>
  );
}

// ---------- Full-screen loader ----------
export function Loader({ label }: { label?: string }) {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={AppColors.primary} />
      {!!label && <Text style={styles.loaderText}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Space.lg,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  btnText: { fontSize: 16, fontWeight: '700' },

  fieldWrap: { marginBottom: Space.lg },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textMuted,
    marginBottom: Space.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.md,
    height: 52,
  },
  inputRowError: { borderColor: AppColors.danger },
  input: { flex: 1, fontSize: 16, color: AppColors.text, paddingVertical: 0 },
  errorText: { color: AppColors.danger, fontSize: 12, marginTop: 4 },

  card: {
    backgroundColor: AppColors.card,
    borderRadius: Radius.lg,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: AppColors.border,
    ...cardShadow,
  },

  badge: {
    paddingHorizontal: Space.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '700' },

  empty: { alignItems: 'center', justifyContent: 'center', padding: Space.xxl, gap: Space.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text, marginTop: Space.sm },
  emptySub: { fontSize: 14, color: AppColors.textMuted, textAlign: 'center' },

  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    backgroundColor: AppColors.bg,
  },
  loaderText: { color: AppColors.textMuted, fontSize: 14 },
});
