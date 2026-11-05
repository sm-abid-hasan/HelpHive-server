import { ObjectId } from "mongodb";
import { eventsCollection, joinsCollection } from "../config/db.js";
import { EVENT_TYPES } from "../constants.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { startOfTodayUTC, validateEventBody } from "../utils/validateEvent.js";

const isValidId = (id) => /^[a-f\d]{24}$/i.test(String(id));
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const search = String(req.query.search ?? "").trim();
  const type = String(req.query.type ?? "").trim();
  const limit = parseInt(req.query.limit, 10);

  const query = { eventDate: { $gte: startOfTodayUTC() } };

  if (EVENT_TYPES.includes(type)) query.eventType = type;
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [{ title: regex }, { location: regex }];
  }

  const events = await eventsCollection();
  let cursor = events.find(query).sort({ eventDate: 1, createdAt: -1 });
  if (limit > 0) cursor = cursor.limit(Math.min(limit, 50));

  res.json(await cursor.toArray());
});


export const getMyEvents = asyncHandler(async (req, res) => {
  const events = await eventsCollection();
  const myEvents = await events.find({ creatorEmail: req.user.email }).sort({ eventDate: 1 }).toArray();
  res.json(myEvents);
});


export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid event id." });

  const events = await eventsCollection();
  const event = await events.findOne({ _id: new ObjectId(id) });
  if (!event) return res.status(404).json({ message: "Event not found." });

  res.json(event);
});


export const createEvent = asyncHandler(async (req, res) => {
  const { errors, data } = validateEventBody(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  const newEvent = {
    ...data,
    creatorEmail: req.user.email, 
    creatorName: req.user.name,
    creatorPhoto: req.user.image,
    participantsCount: 0,
    createdAt: new Date(),
  };

  const events = await eventsCollection();
  const result = await events.insertOne(newEvent);

  res.status(201).json({ message: "Event created successfully.", eventId: result.insertedId });
});


export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid event id." });

  const events = await eventsCollection();
  const event = await events.findOne({ _id: new ObjectId(id) });
  if (!event) return res.status(404).json({ message: "Event not found." });

  if (event.creatorEmail !== req.user.email) {
    return res.status(403).json({ message: "You can only update your own events." });
  }

  const { errors, data } = validateEventBody(req.body);
  if (errors.length) return res.status(400).json({ message: errors[0], errors });

  await events.updateOne({ _id: event._id }, { $set: { ...data, updatedAt: new Date() } });
  res.json({ message: "Event updated successfully." });
});


export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ message: "Invalid event id." });

  const events = await eventsCollection();
  const event = await events.findOne({ _id: new ObjectId(id) });
  if (!event) return res.status(404).json({ message: "Event not found...." });

  if (event.creatorEmail !== req.user.email) {
    return res.status(403).json({ message: "You can only delete your own events." });
  }

  await events.deleteOne({ _id: event._id });


  const joins = await joinsCollection();
  await joins.deleteMany({ eventId: event._id });

  res.json({ message: "Event deleted successfully..." });
});
