import type { LayoutSettings } from './settings';

export interface InitialState {
  settings?: Partial<LayoutSettings>;
  currentUser?: API.User;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.User | undefined>;
}

declare module '@@/plugin-initialState/exports' {
  export const useModel: {
    (namespace: 'initialState'): {
      initialState: InitialState;
      loading: boolean;
      error: Error | undefined;
      refresh: () => void;
      setInitialState: (initialState: InitialState) => void;
    };
  };
}
