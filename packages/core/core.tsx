import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { GroupsList } from '@storysdk/react';
import withGroupsData from './hocs/withGroupsData';
import '@storysdk/react/dist/bundle.css';

export class Story {
  token: string;

  groupImageWidth?: number;

  groupImageHeight?: number;

  groupTitleSize?: number;

  groupClassName?: string;

  groupsClassName?: string;

  constructor(
    token: string,
    groupImageWidth?: number,
    groupImageHeight?: number,
    groupTitleSize?: number,
    groupClassName?: string,
    groupsClassName?: string
  ) {
    this.token = token;
    this.groupImageWidth = groupImageWidth;
    this.groupImageHeight = groupImageHeight;
    this.groupTitleSize = groupTitleSize;
    this.groupClassName = groupClassName;
    this.groupsClassName = groupsClassName;

    axios.defaults.baseURL = 'https://api.diffapp.link/sdk/v1';

    if (token) {
      axios.defaults.headers.common = { Authorization: `SDK ${token}` };
    }
  }

  renderGroups(element?: Element | HTMLDivElement | null) {
    if (!this.token) {
      if (element) {
        ReactDOM.render(<p>StorySDK has not been initialized.</p>, element);
      } else {
        console.warn('StorySDK has not been initialized.');
      }

      return;
    }

    const Groups = withGroupsData(
      GroupsList,
      this.token,
      this.groupImageWidth,
      this.groupImageHeight,
      this.groupTitleSize,
      this.groupClassName,
      this.groupsClassName
    );

    if (element) {
      ReactDOM.render(<Groups />, element);
    }
  }
}
