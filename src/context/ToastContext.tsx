import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors, Radius, Space, cardShadow } from '@/constants/appTheme';

type ToastType = 'success' | 'error' | 'info';
type ToastState = { id: number; type: ToastType; message: string } | null;

type ToastApi = {
  show: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | undefined>(undefined);

const CONFIG: Record<
  ToastType,
  { bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: { bg: AppColors.success, icon: 'checkmark-circle' },
  error: { bg: AppColors.danger, icon: 'alert-circle' },
  info: { bg: AppColors.primaryDark, icon: 'information-circle' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [anim]);

  const show = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      idRef.current += 1;
      setToast({ id: idRef.current, type, message });
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 6,
        speed: 14,
      }).start();
      hideTimer.current = setTimeout(dismiss, 2800);
    },
    [anim, dismiss]
  );

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      info: (m) => show(m, 'info'),
    }),
    [show]
  );

  const cfg = toast ? CONFIG[toast.type] : CONFIG.info;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.wrap,
            { top: insets.top + Space.sm },
            {
              opacity: anim,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-24, 0],
                  }),
                },
              ],
            },
          ]}>
          <Pressable
            onPress={dismiss}
            style={[styles.toast, { backgroundColor: cfg.bg }]}>
            <Ionicons name={cfg.icon} size={22} color={AppColors.white} />
            <Text style={styles.text} numberOfLines={3}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: Space.lg,
    right: Space.lg,
    zIndex: 9999,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    borderRadius: Radius.md,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    width: '100%',
    ...cardShadow,
  },
  text: { color: AppColors.white, fontSize: 14, fontWeight: '600', flex: 1 },
});
