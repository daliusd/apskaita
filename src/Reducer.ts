type Severity = 'error' | 'success' | 'info';

interface IActionSetMessage {
  type: 'SET_MESSAGE';
  text: string;
  severity: Severity;
}

interface IActionHideMessage {
  type: 'HIDE_MESSAGE';
}

export type IAction = IActionSetMessage | IActionHideMessage;

export interface IState {
  messageText: string;
  messageSeverity: Severity;
}

const Reducer = (state: IState, action: IAction) => {
  switch (action.type) {
    case 'SET_MESSAGE':
      return {
        ...state,
        messageText: action.text,
        messageSeverity: action.severity,
      };
    case 'HIDE_MESSAGE':
      return {
        ...state,
        messageText: '',
      };
    default:
      return state;
  }
};

export default Reducer;
