/**
 * Seed example posts for the Community Sadaqa app
 * Run with: npx tsx scripts/seed-examples.ts
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { users, posts } from "../shared/schema";
import { eq } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedExamplePosts() {
  console.log("🌱 Seeding example posts...\n");

  // First, create a sample user for the example posts
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, "examples@oneummah.local"));

  let sampleUser;
  if (existingUsers.length === 0) {
    const [newUser] = await db
      .insert(users)
      .values({
        email: "examples@oneummah.local",
        password: "not-for-login",
        displayName: "Community Examples",
        communityId: "local_ummah",
      })
      .returning();
    sampleUser = newUser;
    console.log("✅ Created sample user for examples");
  } else {
    sampleUser = existingUsers[0];
    console.log("ℹ️  Using existing sample user");
  }

  const examplePosts = [
    // REQUEST - Food (Urgent)
    {
      type: "request",
      category: "food",
      title: "Need groceries for family of 5",
      description:
        "Assalamu alaikum, our family is going through a difficult time financially. We have 3 young children and would be grateful for any help with groceries - rice, lentils, vegetables, milk, and bread would be especially helpful. May Allah reward you for your kindness. JazakAllah khair.",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: true,
      contactPreference: "in_app",
    },
    // REQUEST - Baby Supplies (Anonymous)
    {
      type: "request",
      category: "baby_supplies",
      title: "Baby clothes & diapers needed (0-12 months)",
      description:
        "We're expecting our first child soon and could really use any baby supplies you might have. Clothes (0-12 months), diapers, bottles, or a crib would be incredibly helpful. We'd be happy to pick up. JazakAllah khair for considering.",
      isAnonymous: true,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "in_app",
    },
    // REQUEST - Ride
    {
      type: "request",
      category: "ride",
      title: "Need ride to doctor's appointment Friday",
      description:
        "Assalamu alaikum, I need a ride to a medical appointment this Friday at 10am in the Pomona area. The appointment should take about an hour. I can contribute towards gas. Please reach out if you're able to help.",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "phone",
    },
    // REQUEST - Essentials (Urgent)
    {
      type: "request",
      category: "essentials",
      title: "Winter blankets for elderly parents",
      description:
        "My elderly parents just moved here and we don't have warm blankets for them. With the cold nights, this is becoming urgent. If anyone has spare blankets or warm bedding they could donate, we would be deeply grateful.",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: true,
      contactPreference: "any",
    },
    // OFFER - Food
    {
      type: "offer",
      category: "food",
      title: "Homemade biryani for a family in need",
      description:
        "Assalamu alaikum! I'm making biryani this weekend and would love to share with a family who could use a warm meal. I can make enough for 6-8 people. Halal and homemade with love. Pickup from Diamond Bar area or I can deliver locally.",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "in_app",
    },
    // OFFER - Ride
    {
      type: "offer",
      category: "ride",
      title: "Offering rides to Jummah prayer",
      description:
        "I drive to the masjid every Friday for Jummah. I have space for 3 passengers and would be happy to pick up anyone in the Diamond Bar, Chino Hills, or Walnut area. Let me know if you need a regular ride!",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "phone",
    },
    // OFFER - Consulting (Free services)
    {
      type: "offer",
      category: "consulting",
      title: "Free tax preparation help this season",
      description:
        "I'm a certified tax preparer and would like to offer free tax preparation services to community members who need assistance. I can help with simple to moderately complex returns. Available on weekends by appointment. This is my sadaqa.",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "email",
    },
    // OFFER - Baby Supplies
    {
      type: "offer",
      category: "baby_supplies",
      title: "Baby crib, stroller, and clothes (0-2 years)",
      description:
        "Alhamdulillah, our children have outgrown these items and we'd love to pass them on to another family. We have a gently used crib, stroller, and lots of clothes for ages 0-2 years (both boy and girl). All clean and in good condition. Free for anyone who needs them!",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "in_app",
    },
    // OFFER - Shelter (temporary housing)
    {
      type: "offer",
      category: "shelter",
      title: "Spare room available for sister in need",
      description:
        "We have a spare room in our home that we can offer to a sister (or sister with children) who needs temporary housing. It's a safe, family environment. Available for up to 2 months while you get back on your feet. Please reach out if you're in need.",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "in_app",
    },
    // OFFER - Other (tutoring)
    {
      type: "offer",
      category: "other",
      title: "Free math tutoring for K-8 students",
      description:
        "I'm a high school math teacher and would like to offer free tutoring for students in grades K-8 who are struggling with math. Available Saturday mornings. My goal is to help our community's children succeed academically. Let me know if your child could benefit!",
      isAnonymous: false,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "email",
    },
    // REQUEST - Consulting
    {
      type: "request",
      category: "consulting",
      title: "Looking for immigration lawyer advice",
      description:
        "Assalamu alaikum, I'm looking for someone with immigration law knowledge who could give me some guidance on my situation. Even a brief consultation or pointing me to the right resources would be helpful. JazakAllah khair.",
      isAnonymous: true,
      authorId: sampleUser.id,
      status: "open",
      urgent: false,
      contactPreference: "in_app",
    },
    // REQUEST - Shelter (Urgent)
    {
      type: "request",
      category: "shelter",
      title: "Family needs temporary housing - 2 weeks",
      description:
        "Our apartment had water damage and we need a place to stay for about 2 weeks while repairs are being done. We're a family of 4 (parents + 2 children ages 5 and 8). We're clean, quiet, and can help with household duties. This is an urgent situation.",
      isAnonymous: true,
      authorId: sampleUser.id,
      status: "open",
      urgent: true,
      contactPreference: "any",
    },
  ];

  // Insert posts with staggered creation times so they appear in order
  let insertedCount = 0;
  for (let i = 0; i < examplePosts.length; i++) {
    const post = examplePosts[i];

    // Check if a similar post already exists (by title)
    const existing = await db
      .select()
      .from(posts)
      .where(eq(posts.title, post.title));
    if (existing.length > 0) {
      console.log(`⏭️  Skipping "${post.title}" (already exists)`);
      continue;
    }

    await db.insert(posts).values({
      ...post,
      communityId: "local_ummah",
    });
    insertedCount++;
    console.log(`✅ Created: [${post.type.toUpperCase()}] ${post.title}`);
  }

  console.log(`\n🎉 Done! Created ${insertedCount} example posts.`);
  await pool.end();
}

seedExamplePosts().catch((error) => {
  console.error("Error seeding posts:", error);
  process.exit(1);
});
