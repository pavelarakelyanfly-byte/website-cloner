import playsData from "../../content/plays.json";
import peopleData from "../../content/people.json";
import siteData from "../../content/site.json";
import uiData from "../../content/ui.json";

export const plays = playsData;
export const people = peopleData;
export const siteContent = siteData;
export const ui = uiData;

export function numberedLabel(template: string, number: number): string {
  return template.replaceAll("{number}", String(number));
}
