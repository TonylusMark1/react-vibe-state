import * as RVS from 'react-vibe-state';

//

export interface Slice {
  messages: Message[];
}

//

export interface Message {
  id: string;
  text: string;
  timestamp: number;
}

//

/**
 * Messages slice - demonstration of real-time messaging between tabs.
 */
export default RVS.createSlice({
  key: 'messages',

  initial: (): Slice => ({
    messages: [],
  }),

  //
  
  actions: {
    sendMessage(text: string) {
      const newMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        timestamp: Date.now(),
      };
      this.messages.push(newMessage);
    },
    
    clearMessages() {
      this.messages = [];
    }
  }
});
