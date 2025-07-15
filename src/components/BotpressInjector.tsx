import { useEffect } from "react";

const BotpressInjector = () => {
  useEffect(() => {
    // Only inject once
    if (document.getElementById("botpress-webchat")) return;

    // Inject CSS styles
    const style = document.createElement("style");
    style.innerHTML = `
      #webchat .bpWebchat {
        position: unset;
        width: 100%;
        height: 100%;
        max-height: 100%;
        max-width: 100%;
      }
      #webchat .bpFab {
        display: none;
      }
    `;
    document.head.appendChild(style);

    // Inject script
    const script = document.createElement("script");
    script.id = "botpress-webchat";
    script.src = "https://cdn.botpress.cloud/webchat/v3.0/inject.js";
    script.async = true;

    script.onload = () => {
      (window as any).botpress.init({
        botId: "ae58d3f8-5e51-49b9-80f5-d9ce62abec6e",
        clientId: "096cf593-52f6-4f4d-8ed5-39799374e42e",
        selector: "#webchat",
        configuration: {
          version: "v1",
          botName: "TableLK Support Agent",
          botAvatar: "https://files.bpcontent.cloud/2025/07/15/05/20250715051212-IXILKPY9.png",
          botDescription: "I can help you with your TableLK product questions, custom orders, and support requests.",
          website: { title: "Website", link: "https://www.tablelk.com" },
          email: { title: "bossfurniturelk@gmail.com", link: "bossfurniturelk@gmail.com" },
          phone: { title: "+94704613204", link: "+94704613204" },
          color: "#22c55e",
          variant: "solid",
          headerVariant: "glass",
          themeMode: "light",
          fontFamily: "inter",
          radius: 2,
          feedbackEnabled: true,
          footer: "[⚡ by Botpress](https://botpress.com/?from=webchat)",
        },
      });
    };

    document.body.appendChild(script);
  }, []);

  return <div id="webchat" style={{ display: "none" }} />;
};

export default BotpressInjector;
