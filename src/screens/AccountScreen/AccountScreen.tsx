import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useResetAccount } from '@/hooks/useOrders';
import { type BugLevel, bugLevels, useSessionStore } from '@/store/session';
import { styles } from './styles';

const bugLevelOptions = bugLevels.map((level) => ({ value: level, label: level }));

const { major, minor, patch } = Platform.constants.reactNativeVersion;
const reactNativeVersion = `${major}.${minor}.${patch}`;

export function AccountScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { candidateId, bugLevel, setCandidateId, setBugLevel } = useSessionStore();
  const [draft, setDraft] = useState(candidateId);
  const reset = useResetAccount();

  const trimmed = draft.trim();
  const canSave = trimmed.length > 0 && trimmed !== candidateId;

  const changeBugLevel = (level: BugLevel) => {
    setBugLevel(level);
    // Every cached response came from another bug level: refetch everything.
    void queryClient.invalidateQueries();
  };

  return (
    <Screen testID="account-screen">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="title">{t('account.title')}</Text>

        <Card>
          <TextField
            label={t('account.candidateId')}
            value={draft}
            onChangeText={setDraft}
            autoCapitalize="none"
            autoCorrect={false}
            hint={t('account.candidateIdHint')}
            error={trimmed.length === 0 ? t('account.candidateIdRequired') : undefined}
            testID="account-candidate-id"
          />
          <Button
            label={t('common.save')}
            onPress={() => setCandidateId(trimmed)}
            disabled={!canSave}
            variant="secondary"
            testID="account-save"
          />
        </Card>

        {__DEV__ ? (
          <View style={styles.section}>
            <Text variant="heading">{t('account.devTools')}</Text>
            <Card>
              <Text variant="label">{t('account.bugLevel')}</Text>
              <SegmentedControl
                options={bugLevelOptions}
                value={bugLevel}
                onChange={changeBugLevel}
                testID="account-bug-level"
              />
            </Card>
            <Card>
              <Text variant="caption">{t('account.resetHint')}</Text>
              {reset.isError ? <ErrorState error={reset.error} /> : null}
              {reset.isSuccess ? (
                <Text variant="captionStrong" color="gain">
                  {t('account.resetDone')}
                </Text>
              ) : null}
              <Button
                label={t('account.reset')}
                onPress={() => reset.mutate()}
                loading={reset.isPending}
                variant="secondary"
                testID="account-reset"
              />
            </Card>
          </View>
        ) : null}

        <Text variant="caption" style={styles.about}>
          {t('account.about', { version: reactNativeVersion })}
        </Text>
      </ScrollView>
    </Screen>
  );
}
