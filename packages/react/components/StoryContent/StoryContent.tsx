import React, { useMemo, useState } from 'react';
import block from 'bem-cn';
import { useWindowSize } from '@react-hook/window-size';
import { WidgetFactory } from '../../core';
import { StoryType } from '../../types';
import { StoryVideoBackground } from '../StoryVideoBackground/StoryVideoBackground';
import { renderBackgroundStyles, renderPosition } from '../../utils';
import { MOBILE_BREAKPOINT, StoryCurrentSize } from '../StoryModal/StoryModal';
import './StoryContent.scss';

const b = block('StorySdkContent');

interface StoryContentProps {
  story: StoryType;
  currentStorySize: StoryCurrentSize;
  currentPaddingSize: number;
  innerHeightGap: number;
  backgroundHeightGap: number;
  noTopShadow?: boolean;
  noTopBackgroundShadow?: boolean;
  isUnfilledBackground?: boolean;
  jsConfetti?: any;
  isLarge?: boolean;
  handleGoToStory?: (storyId: string) => void;
}

export const StoryContent: React.FC<StoryContentProps> = (props) => {
  const {
    story,
    jsConfetti,
    noTopShadow,
    noTopBackgroundShadow,
    currentStorySize,
    currentPaddingSize,
    isLarge,
    isUnfilledBackground,
    backgroundHeightGap,
    innerHeightGap,
    handleGoToStory
  } = props;

  const [isVideoLoading, setVideoLoading] = useState(false);
  const [width, height] = useWindowSize();
  const isMobile = useMemo(() => width < MOBILE_BREAKPOINT, [width]);

  return (
    <>
      <div
        className={b('background', { noTopShadow: noTopBackgroundShadow, onTop: isMobile })}
        style={{
          background: story.background.type ? renderBackgroundStyles(story.background) : '#05051D',
          height: isMobile
            ? Math.round(currentStorySize.height * (width / currentStorySize.width))
            : `calc(100% - ${backgroundHeightGap}px)`
        }}
      >
        {story.background.type === 'video' && (
          <StoryVideoBackground
            autoplay
            isFilled={!isUnfilledBackground}
            isLoading={isVideoLoading}
            src={story.background.value}
            onLoadEnd={() => {
              setVideoLoading(false);
            }}
          />
        )}
      </div>

      <div
        className={b({ large: isLarge, noTopShadow })}
        style={{
          height: isMobile
            ? Math.round(currentStorySize.height * (width / currentStorySize.width))
            : `calc(100% - ${innerHeightGap}px)`
        }}
      >
        <div
          className={b('scope', { large: isLarge })}
          style={{
            transform: isMobile
              ? `scale(${width / currentStorySize.width})`
              : `scale(${(height - currentPaddingSize - innerHeightGap) / currentStorySize.height})`
          }}
        >
          {story.storyData.map((widget: any) => (
            <div
              className={b('object')}
              id={`story-${story.id}-widget-${widget.id}`}
              key={widget.id}
              style={renderPosition(
                widget.positionByResolutions[
                  `${currentStorySize.width}x${currentStorySize.height}`
                ],
                widget.positionLimits
              )}
            >
              <WidgetFactory
                currentStorySize={currentStorySize}
                handleGoToStory={handleGoToStory}
                jsConfetti={jsConfetti}
                storyId={story.id}
                widget={widget}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
