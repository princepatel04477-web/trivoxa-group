import React from "react";
import { Composition } from "remotion";
import { FPS } from "./lib/palette";
import { GlobalPresenceFilm, GLOBAL_PRESENCE_DURATION } from "./films/GlobalPresence";
import { ProductExportsFilm, PRODUCT_EXPORTS_DURATION } from "./films/ProductExports";
import { GroupFilm, GROUP_DURATION } from "./films/Group";
import { ServiceDigitalFilm, SERVICE_DIGITAL_DURATION } from "./films/ServiceDigital";
import { ContactFilm, CONTACT_DURATION } from "./films/Contact";
import { InsightsFilm, INSIGHTS_DURATION } from "./films/Insights";
import { CareersFilm, CAREERS_DURATION } from "./films/Careers";
import { AboutFilm, ABOUT_DURATION } from "./films/About";
import { FooterDriftFilm, FOOTER_DRIFT_DURATION } from "./films/FooterDrift";

const W = 1920;
const H = 1080;

const FILMS = [
  { id: "global-presence", component: GlobalPresenceFilm, duration: GLOBAL_PRESENCE_DURATION },
  { id: "product-exports", component: ProductExportsFilm, duration: PRODUCT_EXPORTS_DURATION },
  { id: "group", component: GroupFilm, duration: GROUP_DURATION },
  { id: "service-digital", component: ServiceDigitalFilm, duration: SERVICE_DIGITAL_DURATION },
  { id: "contact", component: ContactFilm, duration: CONTACT_DURATION },
  { id: "insights", component: InsightsFilm, duration: INSIGHTS_DURATION },
  { id: "careers", component: CareersFilm, duration: CAREERS_DURATION },
  { id: "about", component: AboutFilm, duration: ABOUT_DURATION },
  { id: "footer-drift", component: FooterDriftFilm, duration: FOOTER_DRIFT_DURATION },
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {FILMS.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={f.component}
        durationInFrames={f.duration}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
  </>
);
