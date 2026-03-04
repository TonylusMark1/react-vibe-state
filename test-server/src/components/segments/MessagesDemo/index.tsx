import * as React from 'react';

import GlobalState from '@/src/global-state';

import styles from './index.module.css';

//

/**
 * Demonstration of real-time messaging between tabs.
 */
export const MessagesDemo = React.memo(function MessagesDemo() {
  const snap = GlobalState.useSnapshot("messages");

  const [messageText, setMessageText] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  //

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  
  React.useEffect(() => {
    scrollToBottom();
  }, [snap.state.messages.length]);
  
  //
  
  const handleSendMessage = () => {
    if (messageText.trim()) {
      GlobalState.actions.messages.sendMessage(messageText);
      setMessageText('');
    }
  };

  //
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Message Log</h2>
      
      <div className={styles.messagesContainer}>
        {snap.state.messages.length === 0 ? (
          <div className={styles.emptyMessage}>
            No messages yet. Send a message or open another tab to test sync!
          </div>
        ) : (
          snap.state.messages.map((msg) => (
            <div key={msg.id} className={styles.messageItem}>
              <div className={styles.messageTime}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              <div className={styles.messageText}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type a message..."
          className={styles.input}
        />
        <button
          onClick={handleSendMessage}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
      
      <button
        onClick={() => GlobalState.actions.messages.clearMessages()}
        className={styles.clearButton}
      >
        Clear All Messages
      </button>
    </div>
  );
});
