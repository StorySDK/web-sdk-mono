import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Group } from '@storysdk/react';
import { nanoid } from 'nanoid';
import { DateTime } from 'luxon';
import axios from 'axios';
import { API } from '../services/API';
import { adaptGroupData } from '../utils/groupsAdapter';
import { getNavigatorLanguage } from '../utils/localization';
import { loadFontsToPage } from '../utils/fontsInclude';
import { getUniqUserId } from '../utils';
import { useGroupCache, useStoryCache } from '../hooks';

interface GroupsListProps {
  groups: Group[];
  groupImageWidth?: number;
  groupImageHeight?: number;
  groupTitleSize?: number;
  groupClassName?: string;
  groupsClassName?: string;
  groupView: 'circle' | 'square' | 'bigSquare' | 'rectangle' | string;
  isLoading?: boolean;
  isShowMockup?: boolean;
  onOpenGroup?(id: string): void;
  onCloseGroup?(id: string): void;
  onStartQuiz?(groupId: string, storyId?: string): void;
  onFinishQuiz?(groupId: string, storyId?: string): void;
  onNextStory?(groupId: string, storyId: string): void;
  onPrevStory?(groupId: string, storyId: string): void;
  onOpenStory?(groupId: string, storyId: string): void;
  onCloseStory?(groupId: string, storyId: string): void;
}

interface DurationProps {
  storyId?: string;
  groupId: string;
  startTime: number;
}

const withGroupsData =
  (
    GroupsList: React.FC<GroupsListProps>,
    groupImageWidth?: number,
    groupImageHeight?: number,
    groupTitleSize?: number,
    groupClassName?: string,
    groupsClassName?: string
  ) =>
  () => {
    const [data, setData] = useState<any[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [groupView, setGroupView] = useState('circle');
    const [isShowMockup, setIsShowMockup] = useState(false);
    const [appLocale, setAppLocale] = useState(null);
    const [groupsWithStories, setGroupsWithStories] = useState([]);
    const [loadStatus, setLoadStatus] = useState('pending');
    const uniqUserId = useMemo(() => getUniqUserId() || nanoid(), []);
    const [getGroupCache, setGroupCache] = useGroupCache(uniqUserId);
    const [getStoryCache, setStoryCache] = useStoryCache(uniqUserId);

    const [groupDuration, setGroupDuration] = useState<DurationProps>({
      groupId: '',
      startTime: 0
    });

    const [storyDuration, setStoryDuration] = useState<DurationProps>({
      storyId: '',
      groupId: '',
      startTime: 0
    });

    const language = useMemo(() => {
      if (appLocale) {
        return getNavigatorLanguage(appLocale);
      }

      return 'en';
    }, [appLocale]);

    useEffect(() => {
      if (language) {
        axios.defaults.headers.common['Accept-Language'] = language;
      }
    }, [language]);

    const handleOpenGroup = useCallback(
      (groupId: string) => {
        setGroupDuration(() => ({
          groupId,
          startTime: DateTime.now().toSeconds()
        }));

        return API.statistics.group.onOpen({ groupId, uniqUserId, language });
      },
      [uniqUserId, language]
    );

    const handleStartQuiz = useCallback(
      (groupId: string, storyId?: string) => {
        const time = DateTime.now().toISO();

        return API.statistics.quiz.onQuizStart({ groupId, storyId, uniqUserId, time, language });
      },
      [uniqUserId, language]
    );

    const handleFinishQuiz = useCallback(
      (groupId: string, storyId?: string) => {
        if (!storyId) {
          const groupCache = getGroupCache(groupId);

          if (groupCache?.isFinished) {
            return undefined;
          }

          setGroupCache(groupId, {
            isFinished: true
          });
        } else {
          const storyCache = getStoryCache(storyId);

          if (storyCache?.isFinished) {
            return undefined;
          }

          setStoryCache(storyId, {
            isFinished: true
          });
        }

        const time = DateTime.now().toISO();

        return API.statistics.quiz.onQuizFinish({ groupId, storyId, uniqUserId, time, language });
      },
      [uniqUserId, language]
    );

    const handleCloseGroup = useCallback(
      (groupId: string) => {
        const duration = DateTime.now().toSeconds() - groupDuration.startTime;

        API.statistics.group.sendDuration({
          groupId: groupDuration.groupId,
          uniqUserId,
          seconds: duration,
          language
        });

        return API.statistics.group.onClose({ groupId, uniqUserId, language });
      },
      [groupDuration, uniqUserId, language]
    );

    const handleOpenStory = useCallback(
      (groupId: string, storyId: string) => {
        const currentGroup = data?.find((group) => group.id === groupId);
        const currentStory = currentGroup?.stories?.find((story: any) => story.id === storyId);

        const isResultStory =
          currentGroup?.settings?.scoreResultLayersGroupId ===
          currentStory?.layerData?.layersGroupId;

        if (isResultStory) {
          handleFinishQuiz(groupId);
        }

        setStoryDuration(() => ({
          groupId,
          storyId,
          startTime: DateTime.now().toSeconds()
        }));

        API.statistics.story.onOpen({ groupId, storyId, uniqUserId, language });
      },

      [data, uniqUserId, language, handleFinishQuiz]
    );

    const handleCloseStory = useCallback(
      (groupId: string, storyId: string) => {
        if (storyDuration.storyId === storyId && storyDuration.groupId === groupId) {
          const duration = DateTime.now().toSeconds() - storyDuration.startTime;

          API.statistics.story.sendDuration({
            storyId: storyDuration.storyId,
            groupId: storyDuration.groupId,
            uniqUserId,
            seconds: duration,
            language
          });

          if (duration > 1) {
            API.statistics.story.sendImpression({
              storyId: storyDuration.storyId,
              groupId: storyDuration.groupId,
              uniqUserId,
              seconds: duration,
              language
            });
          }
        }
        API.statistics.story.onClose({ groupId, storyId, uniqUserId, language });
      },
      [storyDuration, uniqUserId, language]
    );

    const handleNextStory = useCallback(
      (groupId: string, storyId: string) =>
        API.statistics.story.onNext({ groupId, storyId, uniqUserId, language }),
      [uniqUserId, language]
    );

    const handlePrevStory = useCallback(
      (groupId: string, storyId: string) =>
        API.statistics.story.onPrev({ groupId, storyId, uniqUserId, language }),
      [uniqUserId, language]
    );

    useEffect(() => {
      setLoadStatus('loading');

      API.app.getApp().then((appData) => {
        if (!appData.data.error) {
          const app = appData.data.data;

          if (app) {
            const appGroupView = app.settings?.groupView?.web
              ? app.settings.groupView.web
              : 'circle';

            const isShowMockupApp = app.settings?.isShowMockup ?? false;

            if (app.settings.fonts?.length) {
              loadFontsToPage(app.settings.fonts);
            }

            setAppLocale(app.localization);
            setGroupView(appGroupView);
            setIsShowMockup(isShowMockupApp);

            API.groups.getList().then((groupsData) => {
              if (!groupsData.data.error) {
                const groupsFetchedData = groupsData.data.data
                  .filter((item: any) => {
                    const isActive = item.active && item.type;

                    if (item.type === 'onboarding') {
                      return isActive && item.settings?.addToStories;
                    }

                    return isActive;
                  })
                  .map((item: any) => ({
                    id: item.id,
                    app_id: item.app_id,
                    title: item.title,
                    image_url: item.image_url,
                    settings: item.settings,
                    type: item.type
                  }))
                  .sort((a: any, b: any) => (a.type > b.type ? -1 : 1));

                setGroups(groupsFetchedData);
                setGroupsWithStories(groupsFetchedData);
                setLoadStatus('pending');
              }
            });
          }
        }
      });
    }, []);

    useEffect(() => {
      if (groups.length) {
        setLoadStatus('loading');
        groups.forEach((groupItem: any, groupIndex: number) => {
          API.stories
            .getList({
              groupId: groupItem.id
            })
            .then((storiesData) => {
              if (!storiesData.data.error) {
                const stories = storiesData.data.data.filter(
                  (storyItem: any) =>
                    storyItem.story_data.status === 'active' &&
                    DateTime.fromISO(storyItem.story_data.start_time).toSeconds() <
                      DateTime.now().toSeconds() &&
                    (storyItem.story_data.end_time
                      ? DateTime.fromISO(storyItem.story_data.end_time).toSeconds() >
                        DateTime.now().toSeconds()
                      : true)
                );

                // @ts-ignore
                setGroupsWithStories((prevState) =>
                  prevState.map((item: any) => {
                    if (item.id === groupItem.id) {
                      return { ...item, stories };
                    }

                    return item;
                  })
                );

                if (groupIndex === groups.length - 1) {
                  setLoadStatus('loaded');
                }
              }
            });
        });
      }
    }, [groups]);

    useEffect(() => {
      if (loadStatus === 'loaded' && groupsWithStories.length) {
        const adaptedData = adaptGroupData(groupsWithStories, uniqUserId, language);

        setData(adaptedData);
      }
    }, [loadStatus, groupsWithStories, uniqUserId, language]);

    return (
      <GroupsList
        groupClassName={groupClassName}
        groupImageHeight={groupImageHeight}
        groupImageWidth={groupImageWidth}
        groupTitleSize={groupTitleSize}
        groupView={groupView}
        groups={data}
        groupsClassName={groupsClassName}
        isLoading={loadStatus === 'loading'}
        isShowMockup={isShowMockup}
        onCloseGroup={handleCloseGroup}
        onCloseStory={handleCloseStory}
        onFinishQuiz={handleFinishQuiz}
        onNextStory={handleNextStory}
        onOpenGroup={handleOpenGroup}
        onOpenStory={handleOpenStory}
        onPrevStory={handlePrevStory}
        onStartQuiz={handleStartQuiz}
      />
    );
  };

export default withGroupsData;
