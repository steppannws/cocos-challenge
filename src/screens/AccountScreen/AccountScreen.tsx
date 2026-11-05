import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Switch, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorState } from '@/components/ErrorState';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useResetAccount } from '@/hooks/useOrders';
import { useTabBarSpace } from '@/navigation/FloatingTabBar';
import { type BugLevel, bugLevels, useSessionStore } from '@/store/session';
import { useTheme } from '@/theme';
import { styles } from './styles';

const bugLevelOptions = bugLevels.map((level) => ({ value: level, label: level }));

const { major, minor, patch } = Platform.constants.reactNativeVersion;
const reactNativeVersion = `${major}.${minor}.${patch}`;

export function AccountScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { candidateId, bugLevel, setCandidateId, setBugLevel, setThemePreference } =
    useSessionStore();
  const { scheme, colors } = useTheme();
  const tabBarSpace = useTabBarSpace();
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
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarSpace }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="title">{t('account.title')}</Text>

        <Card>
          <Text variant="label">{t('account.appearance')}</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text variant="bodyStrong">{t('account.darkMode')}</Text>
              <Text variant="caption">{t('account.darkModeHint')}</Text>
            </View>
            <Switch
              value={scheme === 'dark'}
              // An explicit choice: from now on the app ignores the system appearance.
              onValueChange={(dark) => setThemePreference(dark ? 'dark' : 'light')}
              trackColor={{ false: colors.surfaceStrong, true: colors.primary }}
              thumbColor={colors.card}
              ios_backgroundColor={colors.surfaceStrong}
              accessibilityRole="switch"
              accessibilityLabel={t('account.darkMode')}
              testID="account-dark-mode"
            />
          </View>
        </Card>

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
