
import "dotenv/config";
import { connectDB } from "../config/db.js";

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

const samples = [
  { title: "Winter Clothes Distribution", eventType: "Donation", location: "Mirpur 10, Dhaka", thumbnail: img("1593113598332-cd288d649433"), description: "Join us to hand over warm jackets, sweaters and socks to families who need them most this winter. Volunteers will help with sorting and distribution." },
  { title: "Blanket Distribution for the Needy", eventType: "Donation", location: "Mohammadpur, Dhaka", thumbnail: img("1559027615-cd4628902d4a"), description: "We are visiting neighbourhoods in Mohammadpur to give blankets to people sleeping outdoors. Bring a friend and help us keep someone warm tonight." },
  { title: "Riverside Cleanup Drive", eventType: "Cleanup", location: "Buriganga Riverside, Dhaka", thumbnail: img("1532629345422-7515f3d16bb6"), description: "A morning cleanup along the riverside. Gloves and bags are provided. Let us remove plastic waste together and give the river some breathing space." },
  { title: "Plant 500 Trees", eventType: "Plantation", location: "Rajshahi University Campus", thumbnail: img("1618477461853-cf6ed80faba5"), description: "Help us plant five hundred saplings around the campus. Our team will teach you how to plant and care for each tree so that it survives." },
  { title: "Free Health Checkup Camp", eventType: "Health Camp", location: "Shahid Minar Field, Khulna", thumbnail: img("1469571486292-0ba58a3f068b"), description: "Doctors will offer free blood pressure, sugar and eye checkups for the community. Volunteers are needed for registration and guiding visitors." },
  { title: "Food Packs for Street Families", eventType: "Food Distribution", location: "Kamalapur, Dhaka", thumbnail: img("1488521787991-ed7bbaae773c"), description: "We will pack and deliver hot meals to street families. Help us cook, pack and distribute food with respect and care." },
  { title: "Weekend School for Street Children", eventType: "Education", location: "Chattogram Railway Station", thumbnail: img("1542601906990-b4d3fb778b09"), description: "Spend a weekend teaching basic reading, writing and maths to children who cannot attend regular school. No teaching experience required." },
];

const db = await connectDB();
const events = db.collection("events");

await events.deleteMany({ creatorEmail: "team@helphive.org" });

const docs = samples.map((sample, index) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 3 + index * 4); 
  const eventDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  return {
    ...sample,
    eventDate,
    creatorEmail: "team@helphive.org",
    creatorName: "HelpHive Team",
    creatorPhoto: "",
    participantsCount: 0,
    createdAt: new Date(),
  };
});

await events.insertMany(docs);
console.log(`Inserted ${docs.length} sample events.`);
process.exit(0);
