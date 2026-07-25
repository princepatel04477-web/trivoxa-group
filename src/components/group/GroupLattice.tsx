"use client";

import dynamic from "next/dynamic";
import { GROUP } from "@/lib/choreography";

// ssr:false keeps the WebGL scene out of the server render entirely — there is no
// canvas to hydrate, so no mismatch and no mount-gate state to manage.
const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

/**
 * The Group page's signature lattice.
 *
 * This component exists to OWN the GROUP config rather than receive it: the
 * config carries `buildStages`, a function, and functions cannot be passed as
 * props from a server component to a client one. Importing it inside the client
 * boundary keeps it off the serialization path. (HOME can be passed as a prop
 * because its config is plain data.)
 */
export default function GroupLattice() {
  return <ParticleCanvas config={GROUP} />;
}
