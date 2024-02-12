import '@storysdk/react/dist/bundle.css';
export declare class Story {
    token: string;
    options?: {
        groupImageWidth?: number;
        groupImageHeight?: number;
        groupTitleSize?: number;
        groupClassName?: string;
        groupsClassName?: string;
        storyWidth?: number;
        storyHeight?: number;
        isShowMockup?: boolean;
        isStatusBarActive?: boolean;
        autoplay?: boolean;
        groupId?: string;
        startStoryId?: string;
        forbidClose?: boolean;
        devMode?: 'staging' | 'development';
    };
    constructor(token: string, options?: {
        groupImageWidth?: number;
        groupImageHeight?: number;
        groupTitleSize?: number;
        groupClassName?: string;
        groupsClassName?: string;
        storyWidth?: number;
        storyHeight?: number;
        isShowMockup?: boolean;
        isStatusBarActive?: boolean;
        autoplay?: boolean;
        groupId?: string;
        startStoryId?: string;
        forbidClose?: boolean;
        devMode?: 'staging' | 'development';
    });
    renderGroups(element?: Element | HTMLDivElement | null): void;
}
export declare const init: () => void;
