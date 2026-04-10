import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TaskCard } from '../../../components/TaskCard';
import { SmartTaskInput } from '../../../components/SmartTaskInput';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Avatar } from '../../../components/ui/Avatar';
import { useTasks } from '../../../hooks/useTasks';
import { useParticipants } from '../../../hooks/useParticipants';
import { usePlan } from '../../../hooks/usePlan';
import { useAuth } from '../../../hooks/useAuth';
import { colors, fonts, spacing, shadows } from '../../../constants/theme';
import { strings } from '../../../constants/strings';
import { ParticipantModal } from '../../../components/ParticipantModal';
import { showAlert, showConfirm } from '../../../lib/alert';
import type { ParsedTask } from '../../../lib/smart-parse';
import type { Participant } from '../../../types/database';

export default function TasksTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan } = usePlan(id);
  const { session } = useAuth();
  const { tasks, pending, done, loading, fetchTasks, claimTask, completeTask, deleteTask } = useTasks(id);
  const { participants, getMyParticipant, removeParticipant, fetchParticipants } = useParticipants(id);
  const [myParticipant, setMyParticipant] = useState<any>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const isOwner = plan?.created_by === session?.user?.id;

  useEffect(() => {
    getMyParticipant().then(setMyParticipant);
  }, [getMyParticipant]);

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  const handleClaim = async (taskId: string) => {
    if (!myParticipant) {
      showAlert('Not a participant', 'Join this plan first.');
      return;
    }
    try {
      await claimTask(taskId, myParticipant.id);
    } catch {
      showAlert('Already claimed!');
    }
  };

  const handleDone = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch {
      showAlert(strings.genericError);
    }
  };

  const handleDelete = (taskId: string, title: string) => {
    showConfirm(
      'Delete Task',
      `Are you sure you want to delete "${title}"?`,
      async () => {
        try {
          await deleteTask(taskId);
          fetchTasks();
        } catch {
          showAlert(strings.genericError);
        }
      },
      'Delete',
    );
  };

  const { createTask } = useTasks(id);

  const handleSmartAdd = async (parsed: ParsedTask) => {
    if (!myParticipant) {
      showAlert('Not a participant', 'Join this plan first.');
      return;
    }
    await createTask(
      myParticipant.id,
      parsed.title,
      parsed.assigneeId ?? undefined,
      parsed.deadline ?? undefined,
      parsed.amount && parsed.amount > 0 ? parsed.amount : undefined,
      parsed.amount && parsed.amount > 0 ? (parsed.assigneeId ?? myParticipant.id) : undefined,
    );
    fetchTasks();
  };

  const handleRemoveParticipant = (participantId: string, name: string) => {
    showConfirm(
      'Remove Participant',
      `Remove ${name} from this plan?`,
      async () => {
        try {
          await removeParticipant(participantId);
          fetchParticipants();
        } catch {
          showAlert(strings.genericError);
        }
      },
      'Remove',
    );
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor={colors.primary} />}
    >
      {/* Stats Bento */}
      <View style={styles.bento}>
        <View style={styles.bentoCard}>
          <Text style={styles.bentoLabel}>How much is left?</Text>
          <Text style={styles.bentoNumber}>{pending.length}</Text>
          <Text style={styles.bentoSub}>Pending Tasks</Text>
        </View>
        <View style={[styles.bentoCard, styles.bentoCardAccent]}>
          <View style={styles.avatarRow}>
            {participants.slice(0, 3).map((p) => (
              <View key={p.id} style={[styles.miniAvatar, { backgroundColor: p.color + '33' }]}>
                <Text style={{ color: p.color, fontFamily: fonts.headlineSemiBold, fontSize: 10 }}>
                  {p.name[0]}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.bentoAccentText}>
            {participants.length} {participants.length === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </View>

      {/* Smart Task Input */}
      <SmartTaskInput participants={participants} onSubmit={handleSmartAdd} />

      {/* Pending Tasks */}
      {pending.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{strings.abhiKeKaam}</Text>
            <Badge text={strings.urgent} variant="tertiary" />
          </View>
          <View style={styles.taskList}>
            {pending.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={task.assigned_to ? participantMap.get(task.assigned_to) : null}
                onDone={() => handleDone(task.id)}
                onClaim={() => handleClaim(task.id)}
                onEdit={() => router.push({ pathname: '/create-task', params: { planId: id, taskId: task.id } })}
                onDelete={() => handleDelete(task.id, task.title)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Done Tasks */}
      {done.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.doneTitle}>{strings.hoGayeKaam} ✓</Text>
          <View style={styles.taskList}>
            {done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={task.assigned_to ? participantMap.get(task.assigned_to) : null}
                completed
                onEdit={() => router.push({ pathname: '/create-task', params: { planId: id, taskId: task.id } })}
                onDelete={() => handleDelete(task.id, task.title)}
              />
            ))}
          </View>
        </View>
      )}

      {pending.length === 0 && done.length === 0 && !loading && (
        <EmptyState title={strings.emptyTasksHint} subtitle={strings.emptyTasksSubHint} />
      )}

      {/* People Section */}
      {participants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People</Text>
          <View style={styles.peopleList}>
            {participants.map((p) => (
              <TouchableOpacity key={p.id} style={styles.personRow} onPress={() => setSelectedParticipant(p)} activeOpacity={0.7}>
                <Avatar name={p.name} color={p.color} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.personName}>{p.name}</Text>
                  <Text style={styles.personSub}>
                    {p.user_id ? 'Joined via app' : 'Added by organizer'}
                  </Text>
                </View>
                <Text style={styles.viewProfile}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Participant Profile Modal */}
    <ParticipantModal
      participant={selectedParticipant}
      tasks={tasks}
      participants={participants}
      isOwner={isOwner}
      currentUserId={session?.user?.id}
      onClose={() => setSelectedParticipant(null)}
      onRemove={handleRemoveParticipant}
    />

    {/* FAB */}
    <TouchableOpacity
      style={styles.fab}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/create-task', params: { planId: id } })}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        style={styles.fabGradient}
      >
        <Text style={styles.fabIcon}>+</Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  bento: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    aspectRatio: 1,
  },
  bentoCardAccent: {
    backgroundColor: colors.primary + '08',
    borderWidth: 1,
    borderColor: colors.primary + '1A',
  },
  bentoLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  bentoNumber: {
    fontFamily: fonts.headlineExtra,
    fontSize: 48,
    color: colors.primary,
  },
  bentoSub: {
    fontFamily: fonts.headlineExtra,
    fontSize: 16,
    color: colors.onSurface,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: -8,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    marginLeft: -4,
  },
  bentoAccentText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    color: colors.onSurface,
  },
  doneTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 18,
    color: colors.onSurfaceVariant + '99',
    marginBottom: 12,
  },
  taskList: {
    gap: 12,
  },
  peopleList: {
    gap: 10,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
  },
  personName: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  personSub: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  viewProfile: {
    fontSize: 16,
    color: colors.outlineVariant,
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: colors.error + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  removeText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.error,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    ...shadows.fab,
    borderRadius: 32,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
  },
});
