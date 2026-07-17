/** Job openings for the careers board. Neither Trivoxa content doc contains
 * job descriptions yet — seed this array with real roles as they open; the
 * careers page renders an honest "no open roles" state while it is empty. */

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: "Full-Time" | "Part-Time" | "Contract" | "Intern";
  remoteOption: "On-site" | "Hybrid" | "Remote" | "Hybrid / Remote";
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
}

export const openings: JobOpening[] = [];

export function getOpeningById(id: string): JobOpening | undefined {
  return openings.find((o) => o.id === id);
}
