import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { TaskComments } from './TaskComments';
import { colors, fonts, radii, shadows } from '../constants/theme';
import type { Task, Participant } from '../types/database';
import { strings } from '../constants/strings';
import { format } from 'date-fns';

type Props = {
  task: Task;
  assignee?: Participant | null;
  participants?: Participant[];
  myParticipantId?: string | null;
  onDone?: () => void;
  onClaim?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRemind?: () => void;
  completed?: boolean;
  showComments?: boolean;
};

function getDeadlineUrgency(deadline: string | null): 'overdue' | 'today' | 'tomorrow' | null {
  if (!deadline) return null;
  const d = new Date(deadline + 'T23:59:59');
  const now = new Date();
  const diffDays = Math.floor((d.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return null;
}

export function TaskCard({ task, assignee, participants, myParticipantId, onDone, onClaim, onEdit, onDelete, onRemind, completed, showComments }: Props) {
  const urgency = completed ? null : getDeadlineUrgency(task.deadline);
  const [commentsOpen, setCommentsOpen] = useState(true);
  if (completed) {
    return (
      <TouchableOpacity onPress={onEdit} activeOpacity={0.8} style={styles.completedContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.completedTitle}>{task.title}</Text>
          {assignee && (
            <View style={styles.completedRow}>
              <Avatar name={assignee.name} color={assignee.color} size={20} />
              <Text style={styles.completedBy}>Done by {assignee.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.completedRight}>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton} hitSlop={8}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
          <View style={styles.doneBadge}>
            <Text style={styles.doneBadgeText}>✓</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onEdit} activeOpacity={0.9} style={[styles.container, shadows.cardLight]}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          {assignee ? (
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={styles.statusText}>Assigned to {assignee.name}</Text>
            </View>
          ) : (
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: colors.tertiary }]} />
              <Text style={[styles.statusText, { color: colors.tertiary }]}>Unassigned</Text>
            </View>
          )}
          <Text style={styles.title}>{task.title}</Text>
          {task.deadline && (
            <View style={[styles.deadlineRow, urgency && styles.deadlineUrgent]}>
              <Text style={[
                styles.deadline,
                urgency === 'overdue' && { color: colors.error, fontFamily: fonts.headlineSemiBold },
                urgency === 'today' && { color: colors.error, fontFamily: fonts.headlineSemiBold },
                urgency === 'tomorrow' && { color: '#e65100', fontFamily: fonts.headlineSemiBold },
              ]}>
                {urgency === 'overdue' ? '🔴 Overdue!' : urgency === 'today' ? '🔴 Due today!' : urgency === 'tomorrow' ? '🟡 Due tomorrow' : `📅 ${format(new Date(task.deadline + 'T00:00:00'), 'MMM d, yyyy')}`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.rightCol}>
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton} hitSlop={8}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          )}
          {assignee ? (
            <View style={styles.avatarCol}>
              <Avatar name={assignee.name} color={assignee.color} size={40} />
              <Text style={styles.avatarLabel}>{assignee.name}</Text>
            </View>
          ) : (
            onClaim && (
              <TouchableOpacity onPress={onClaim} style={styles.claimButton}>
                <Text style={styles.claimText}>Claim</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.bottomRow}>
        {task.expense_amount != null && task.expense_amount > 0 && (
          <View style={styles.expenseBadge}>
            <Text style={styles.expenseText}>₹{task.expense_amount.toLocaleString('en-IN')}</Text>
          </View>
        )}
        <View style={styles.actionRow}>
          {onRemind && assignee && (
            <TouchableOpacity onPress={onRemind} style={styles.remindButton}>
              <Text style={styles.remindText}>🔔 Remind</Text>
            </TouchableOpacity>
          )}
          {onDone && (
            <Button
              title={strings.doneKarButton}
              variant="secondary"
              onPress={onDone}
              style={styles.doneButton}
              textStyle={{ fontSize: 12 }}
            />
          )}
        </View>
      </View>

      {/* Comments toggle + section */}
      {showComments && participants && (
        <>
          <TouchableOpacity
            onPress={() => setCommentsOpen(!commentsOpen)}
            style={styles.commentToggle}
          >
            <Text style={styles.commentToggleText}>
              {commentsOpen ? '▾ Hide notes' : '▸ Notes & comments'}
            </Text>
          </TouchableOpacity>
          {commentsOpen && (
            <TaskComments
              taskId={task.id}
              participants={participants}
              myParticipantId={myParticipantId ?? null}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.default,
    padding: 16,
  },
  completedContainer: {
    backgroundColor: colors.surfaceContainerLow + '80',
    borderRadius: radii.default,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 11,
    color: colors.primaryDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 16,
    color: colors.onSurface,
    lineHeight: 22,
  },
  deadlineRow: {
    marginTop: 4,
  },
  deadlineUrgent: {
    backgroundColor: colors.error + '08',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deadline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  avatarCol: {
    alignItems: 'center',
    gap: 4,
  },
  avatarLabel: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 10,
    color: colors.outline,
    textTransform: 'uppercase',
  },
  claimButton: {
    backgroundColor: colors.tertiaryContainer + '66',
    borderRadius: radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  claimText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.tertiary,
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseBadge: {
    backgroundColor: colors.secondaryContainer + '4D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  expenseText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.onSecondaryContainer,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remindButton: {
    backgroundColor: colors.primary + '12',
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 34,
    justifyContent: 'center',
  },
  remindText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
  },
  commentToggle: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  commentToggleText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.outline,
  },
  doneButton: {
    height: 34,
    paddingHorizontal: 16,
  },
  completedTitle: {
    fontFamily: fonts.headlineExtra,
    fontSize: 16,
    color: colors.onSurface,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.primary + '66',
    lineHeight: 22,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  completedBy: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  doneBadge: {
    backgroundColor: colors.secondaryContainer,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadgeText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.onSecondaryContainer,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.error,
  },
  completedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
