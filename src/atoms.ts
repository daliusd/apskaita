import { atom } from 'recoil';

type Severity = 'error' | 'success' | 'info';

export const messageTextState = atom({
  key: 'messageText',
  default: '',
});

export const messageSeverityState = atom({
  key: 'messageSeverity',
  default: 'success' as Severity,
});
