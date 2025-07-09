import { Inngest } from "inngest";

// Create Inngest client
export const inngest = new Inngest({
  id: "quickcart-app",
  eventKey: process.env.INNGEST_EVENT_KEY, // optional
});

// Example functions
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "user/created" },
  async ({ event, step }) => {
    console.log("User created:", event.data);
    return { status: "synced" };
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-update" },
  { event: "user/updated" },
  async ({ event }) => {
    console.log("User updated:", event.data);
    return { status: "updated" };
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-delete" },
  { event: "user/deleted" },
  async ({ event }) => {
    console.log("User deleted:", event.data);
    return { status: "deleted" };
  }
);
