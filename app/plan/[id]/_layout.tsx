import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Slot, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlan } from '../../../hooks/usePlan';
import { supabase } from '../../../lib/supabase';
import { WebContainer } from '../../../components/WebContainer';
import { colors, fonts, spacing, radii } from '../../../constants/theme';
import { showAlert, showConfirm } from '../../../lib/alert';
import type { PlanStatus } from '../../../types/database';

const TABS = [
  { key: 'index', label: 'Tasks' },
  { key: 'expenses', label: 'Expenses' },
  { key: 'settle', label: 'Settle Up' },
] as const;

export default function PlanLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan, updatePlan } = usePlan(id);
  const [activeTab, setActiveTab] = useState<string>('index');

  const handleDeletePlan = () => {
    showConfirm(
      'Delete Plan?',
      'This will permanently delete this plan, all tasks, expenses, and participants. This cannot be undone.',
      async () => {
        try {
          await supabase.from('activity_log').delete().eq('plan_id', id);
          await supabase.from('tasks').delete().eq('plan_id', id);
          await supabase.from('participants').delete().eq('plan_id', id);
          await supabase.from('notifications').delete().eq('plan_id', id);
          const { error } = await supabase.from('plans').delete().eq('id', id);
          if (error) throw error;
          router.replace('/(tabs)');
        } catch {
          showAlert('Could not delete plan');
        }
      },
      'Delete',
    );
  };

  const handleStatusMenu = () => {
    const options: { text: string; status: PlanStatus }[] = [];
    if (plan?.status !== 'completed') {
      options.push({ text: 'Mark as Completed', status: 'completed' });
    }
    if (plan?.status !== 'archived') {
      options.push({ text: 'Archive Plan', status: 'archived' });
    }
    if (plan?.status !== 'active') {
      options.push({ text: 'Reactivate Plan', status: 'active' });
    }

    if (Platform.OS === 'web') {
      const choices = [
        ...options.map((opt) => opt.text),
        'Delete Plan',
        'Cancel',
      ];
      const choice = window.prompt(
        `Plan Options\nCurrent status: ${plan?.status ?? 'active'}\n\n${choices.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nEnter a number:`,
      );
      const index = choice ? parseInt(choice, 10) - 1 : -1;
      if (index >= 0 && index < options.length) {
        updatePlan({ status: options[index].status }).catch(() => {
          showAlert('Something went wrong!');
        });
      } else if (index === options.length) {
        handleDeletePlan();
      }
    } else {
      Alert.alert(
        'Plan Options',
        `Current status: ${plan?.status ?? 'active'}`,
        [
          ...options.map((opt) => ({
            text: opt.text,
            onPress: async () => {
              try {
                await updatePlan({ status: opt.status });
              } catch {
                showAlert('Something went wrong!');
              }
            },
          })),
          {
            text: 'Delete Plan',
            style: 'destructive' as const,
            onPress: handleDeletePlan,
          },
          { text: 'Cancel', style: 'cancel' as const },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
     <WebContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLabelRow}>
            <Text style={styles.headerLabel}>
              {plan?.status === 'completed' ? 'Completed' : plan?.status === 'archived' ? 'Archived' : 'Active Plan'}
            </Text>
            {plan?.status === 'completed' && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>Done</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{plan?.title ?? 'Loading...'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleStatusMenu} style={styles.menuButton}>
            <Text style={styles.menuIcon}>...</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => plan && router.push(`/share/${plan.id}`)}
            style={styles.shareButton}
          >
            <Text style={styles.shareIcon}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              setActiveTab(tab.key);
              if (tab.key === 'index') {
                router.replace(`/plan/${id}`);
              } else {
                router.replace(`/plan/${id}/${tab.key}`);
              }
            }}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Slot />
     </WebContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 20,
    color: colors.primary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  completedBadge: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  completedBadgeText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 10,
    color: colors.onSecondaryContainer,
  },
  headerTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 24,
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: fonts.headlineExtra,
    marginTop: -6,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
    color: colors.primary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.full,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: colors.onPrimary,
  },
});
