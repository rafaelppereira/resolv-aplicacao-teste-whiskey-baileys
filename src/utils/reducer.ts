/* eslint-disable @typescript-eslint/no-explicit-any */
const reducer: any = (state: any[], action: { type: string; payload: any; }) => {
  if (action.type === "LOAD_CONNECTIONS") {
    const connections = action.payload;

    return [...connections];
  }

  if (action.type === "UPDATE_CONNECTIONS") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s: { id: any; }) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex] = whatsApp;
      return [...state];
    } else {
      return [whatsApp, ...state];
    }
  }

  if (action.type === "UPDATE_SESSION") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s: { id: any; }) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex].status = whatsApp.status;
      state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
      state[whatsAppIndex].qrcode = whatsApp.qrcode;
      state[whatsAppIndex].retries = whatsApp.retries;
      return [...state];
    } else {
      return [...state];
    }
  }

  if (action.type === "DELETE_CONNECTIONS") {
    const whatsAppId = action.payload;

    const whatsAppIndex = state.findIndex((s: { id: any; }) => s.id === whatsAppId);
    if (whatsAppIndex !== -1) {
      state.splice(whatsAppIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

export { reducer }