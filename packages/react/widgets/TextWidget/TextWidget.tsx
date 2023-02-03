import React from 'react';
import { block, renderBackgroundStyles, renderTextBackgroundStyles } from '@utils';
import { TextWidgetParamsType, WidgetComponent } from '@types';
import './TextWidget.scss';

const b = block('TextWidget');

type PropsType = {
  params: any;
};

export const TextWidget: WidgetComponent<{ params: TextWidgetParamsType }> = (props: PropsType) => {
  const { params } = props;

  return (
    <div className={b()}>
      <div
        className={b('container', { gradient: params.color.type === 'gradient' })}
        style={{
          opacity: params.widgetOpacity / 100,
          fontStyle: params.fontParams.style,
          fontWeight: params.fontParams.weight,
          fontFamily: params.fontFamily,
          fontSize: `${params.fontSize}px`,
          textAlign: params.align,
          ...renderTextBackgroundStyles({ color: params.color })
        }}
      >
        <span className={b('span')}>{params.text}</span>
      </div>

      {params.withFill ? (
        <div
          className={b('background')}
          style={{
            background: renderBackgroundStyles(params.backgroundColor)
          }}
        />
      ) : null}
    </div>
  );
};
