import { useState } from 'react';
import {
  Webchat,
  WebchatProvider,
  Fab,
  getClient,
  Configuration,
} from '@botpress/webchat';

const BotpressInjector = () => {
  const clientId = "096cf593-52f6-4f4d-8ed5-39799374e42e";
  
  const configuration: Configuration = {
    color: '#000',
    // You can add more configuration options here
    // botName: "TableLK Support Agent",
    // botAvatar: "https://files.bpcontent.cloud/2025/07/15/05/20250715051212-IXILKPY9.png",
    // themeName: "prism",
    // theme: "light",
  };

  const client = getClient({
    clientId,
  });

  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <WebchatProvider client={client} configuration={configuration}>
        <Fab onClick={toggleWebchat} />
        <div
          style={{
            display: isWebchatOpen ? 'block' : 'none',
          }}
        >
          <Webchat />
        </div>
      </WebchatProvider>
    </div>
  );
};

export default BotpressInjector;