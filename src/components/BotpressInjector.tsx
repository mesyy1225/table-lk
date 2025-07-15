import { useEffect } from "react";

const BotpressInjector = () => {
  useEffect(() => {
    // Create and inject the main botpress script
    const script1 = document.createElement("script");
    script1.src = "https://cdn.botpress.cloud/webchat/v3.0/inject.js";
    script1.async = true;

    // Create and inject your custom configuration script
    const script2 = document.createElement("script");
    script2.src = "https://files.bpcontent.cloud/2025/07/15/05/20250715050743-Z8HV8KEO.js";
    script2.async = true;

    // Add both scripts to the document
    document.head.appendChild(script1);
    document.head.appendChild(script2);

    // Clean up function
    return () => {
      // Remove scripts when component unmounts
      if (document.head.contains(script1)) {
        document.head.removeChild(script1);
      }
      if (document.head.contains(script2)) {
        document.head.removeChild(script2);
      }
    };
  }, []);

  return null;
};

export default BotpressInjector;