import { EVENT_TYPES } from "../constants.js";


export function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateEventBody(body = {}) {
  const errors = [];

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const eventType = String(body.eventType ?? "").trim();
  const thumbnail = String(body.thumbnail ?? "").trim();
  const location = String(body.location ?? "").trim();
  const dateText = String(body.eventDate ?? "").trim();

  if (title.length < 5) errors.push("Title must be at least 5 characters long.");
  if (description.length < 20) errors.push("Description must be at least 20 characters long.");
  if (!EVENT_TYPES.includes(eventType)) errors.push("Please choose a valid event type.");
  if (!isValidUrl(thumbnail)) errors.push("Thumbnail must be a valid image URL (http or https).");
  if (location.length < 3) errors.push("Please enter the event location.");

  const eventDate = new Date(dateText);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || Number.isNaN(eventDate.getTime())) {
    errors.push("Please choose a valid event date.");
  } else if (eventDate < startOfTodayUTC()) {
    errors.push("Event date cannot be in the past.");
  }

  return { errors, data: { title, description, eventType, thumbnail, location, eventDate } };
}
