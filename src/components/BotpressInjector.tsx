import { useEffect } from "react";
import { policyConfig } from "@/lib/policyConfig";

// Botpress webchat (v3). Bot and client IDs are the ones from the hosted Botpress config;
// the configuration is defined here so the contact details come from policyConfig
// (the hosted config file had an outdated phone number).
const BOT_ID = "ae58d3f8-5e51-49b9-80f5-d9ce62abec6e";
const CLIENT_ID = "096cf593-52f6-4f4d-8ed5-39799374e42e";
const INJECT_SRC = "https://cdn.botpress.cloud/webchat/v3.0/inject.js";
const SCRIPT_ID = "bp-webchat-inject";
const STYLE_ID = "bp-webchat-compact";

// Keep the launcher compact on small screens so it covers less of the page.
const COMPACT_CSS = `
@media (max-width: 767px) {
  iframe.bpFab { width: 3.25rem !important; height: 3.25rem !important; bottom: 1rem !important; right: 1rem !important; }
}`;

type BotpressApi = {
  initialized?: boolean;
  init: (opts: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    botpress?: BotpressApi;
  }
}

let initStarted = false;

const whenBodyReady = (cb: () => void) => {
  if (document.body) cb();
  else document.addEventListener("DOMContentLoaded", cb, { once: true });
};

const loadInjectScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.botpress) return resolve();
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = INJECT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Botpress inject script failed to load")), { once: true });
  });

const initWebchat = () => {
  const bp = window.botpress;
  if (!bp || bp.initialized) return;
  bp.init({
    botId: BOT_ID,
    clientId: CLIENT_ID,
    selector: "body",
    configuration: {
      version: "v1",
      botName: "TableLK AI",
      botAvatar: "https://files.bpcontent.cloud/2025/07/15/05/20250715051212-IXILKPY9.png",
      botDescription: "I can help you with your TableLK product questions, custom orders, and support requests.",
      website: { title: policyConfig.website.replace(/^https?:\/\//, ""), link: policyConfig.website },
      email: { title: policyConfig.email, link: `mailto:${policyConfig.email}` },
      phone: { title: policyConfig.phone, link: policyConfig.phoneHref },
      termsOfService: { title: "Terms & Conditions", link: `${policyConfig.website}/terms-and-conditions` },
      privacyPolicy: { title: "Privacy Policy", link: `${policyConfig.website}/privacy-policy` },
      color: "#22c55e",
      variant: "solid",
      headerVariant: "glass",
      themeMode: "light",
      fontFamily: "inter",
      radius: 4,
      feedbackEnabled: true,
      footer: "[⚡ by Botpress](https://botpress.com/?from=webchat)",
    },
  });
};

const BotpressInjector = () => {
  useEffect(() => {
    // Guard against double init (React StrictMode runs effects twice in dev).
    if (initStarted) return;
    initStarted = true;

    whenBodyReady(() => {
      if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = COMPACT_CSS;
        document.head.appendChild(style);
      }
      loadInjectScript()
        .then(initWebchat)
        .catch((err) => {
          initStarted = false;
          console.warn(err);
        });
    });
    // The webchat lives for the whole session, so there is nothing to clean up.
  }, []);

  return null;
};

export default BotpressInjector;
