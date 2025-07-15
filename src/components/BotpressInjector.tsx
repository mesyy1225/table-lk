import { useEffect } from "react";

const BotpressInjector = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.botpress.cloud/webchat/v3.0/inject.js";
    script.async = true;

    const configScript = document.createElement("script");
    configScript.innerHTML = `
      window.botpressWebChat.init({
        botId: "ae58d3f8-5e51-49b9-80f5-d9ce62abec6e",
        clientId: "096cf593-52f6-4f4d-8ed5-39799374e42e",
        selector: "#webchat",
        botName: "TableLK Support Agent",
        botAvatar: "https://files.bpcontent.cloud/2025/07/15/05/20250715051212-IXILKPY9.png",
        themeName: "prism",
        theme: "light",
        useSessionStorage: true,
        enableConversationDeletion: true,
        enableReset: true
      });

      window.botpressWebChat.on("webchat:ready", () => {
        console.log("✅ Botpress Webchat Ready");
      });
    `;

    document.body.appendChild(script);
    document.body.appendChild(configScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(configScript);
    };
  }, []);

  return null;
};

export default BotpressInjector;
