import React, { createContext, useReducer } from 'react';
import Reducer, { IState, IAction } from './Reducer';

const initialState: IState = {
  messageText: '',
  messageSeverity: 'success',
};

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};

export interface IContext {
  state: IState;
  dispatch: React.Dispatch<IAction>;
}

export const Context = createContext<IContext>({
  state: initialState,
  dispatch: () => null,
});
export default Store;
