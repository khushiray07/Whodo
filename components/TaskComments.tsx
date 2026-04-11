import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Avatar } from './ui/Avatar';
import { useComments } from '../hooks/useComments';
import { formatRelative } from '../lib/date';
import { colors, fonts, radii, spacing } from '../constants/theme';
import type { Participant } from '../types/database';

type Props = {
  taskId: string;
  participants: Participant[];
  myParticipantId: string | null;
};

export function TaskComments({ taskId, participants, myParticipantId }: Props) {
  const { comments, addComment } = useComments(taskId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const participantMap = new Map(participants.map((p) => [p.id, p]));

  const handleSend = async () => {
    if (!text.trim() || !myParticipantId) return;
    setSending(true);
    try {
      await addComment(myParticipantId, text.trim());
      setText('');
    } catch {}
    setSending(false);
  };

  return (
    <View style={styles.container}>
      {/* Comments list */}
      {comments.map((c) => {
        const author = participantMap.get(c.author_participant_id);
        return (
          <View key={c.id} style={styles.commentRow}>
            <Avatar
              name={author?.name ?? '?'}
              color={author?.color ?? colors.outline}
              size={24}
            />
            <View style={styles.commentBubble}>
              <View style={styles.commentHeader}>
                <Text style={styles.authorName}>{author?.name ?? 'Unknown'}</Text>
                <Text style={styles.timestamp}>{formatRelative(c.created_at)}</Text>
              </View>
              <Text style={styles.commentText}>{c.content}</Text>
            </View>
          </View>
        );
      })}

      {/* Input */}
      {myParticipantId && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a note..."
            placeholderTextColor={colors.outlineVariant}
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}
          >
            <Text style={styles.sendText}>↑</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    gap: 8,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  authorName: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 11,
    color: colors.primary,
  },
  timestamp: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.outline,
  },
  commentText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurface,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.onSurface,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
