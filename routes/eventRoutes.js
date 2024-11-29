const express = require("express");
const controller = require("../controllers/eventController");
const { upload } = require("../middleware/fileUpload");
const Event = require("../models/event");
const User = require("../models/user");

const router = express.Router();

// Home page route with upcoming events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const upcomingEvents = events.slice(0, 3);
    res.render("index", { upcomingEvents });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events.");
  }
});

// Events page route (shows list of all events)
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Sort by date ascending (oldest first)
    const userEmail = req.session.userEmail || null;

    let user = null;

    if (userEmail) {
      // Fetch the logged-in user and populate their RSVPed events
      user = await User.findOne({ email: userEmail }).populate("rsvpedEvents");
    }

    res.render("events/events", {
      events,
      user,
      userEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events.");
  }
});

// Create Event page route
router.get("/create/event", async (req, res) => {
  res.render("create/createEvent"); // Renders createEvent.ejs
});

// Single Event Details route (view individual event)
router.get("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    const userEmail = req.session.userEmail || null;
    const isOwner = userEmail && userEmail === event.userEmail;

    let user = null;

    if (userEmail) {
      // Fetch the logged-in user and populate their RSVPed events
      user = await User.findOne({ email: userEmail }).populate("rsvpedEvents");
    }

    if (!event) {
      return res.status(404).send("Event not found");
    }

    res.render("events/eventSingle", {
      event,
      user,
      userEmail,
      isOwner,
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).send("Error fetching event details.");
  }
});

// POST route to handle event creation with file upload
router.post("/create/event", upload.single("logo"), async (req, res) => {
  try {
    if (!req.session || !req.session.userEmail) {
      return res.status(401).send("You must be logged in to create an event.");
    }
    const { title, date, location, description } = req.body;
    const logoPath = req.file ? `/images/${req.file.filename}` : "";

    const newEvent = new Event({
      title,
      date,
      location,
      description,
      imagePath: logoPath,
      userEmail: req.session.userEmail, // Store the email of the user who created the event
    });

    await newEvent.save();
    console.log("Event created successfully:", newEvent);
    res.redirect("/events");
  } catch (error) {
    console.error("Error creating event:", error.message, error.stack); // Log full error stack
    res.status(500).send(`Error creating event: ${error.message}`); // Send detailed error in response
  }
});

// Route to delete an event
router.delete("/events/:id", async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    // Check if event exists and if the user is the owner
    if (!event) {
      return res.status(404).send("Event not found");
    }

    if (event.userEmail !== req.session.userEmail) {
      return res
        .status(403)
        .send("You are not authorized to delete this event");
    }

    // Use findByIdAndDelete to remove the event
    await Event.findByIdAndDelete(eventId);

    await User.updateMany(
      { rsvpedEvents: eventId }, // Find users who have RSVPed for this event
      { $pull: { rsvpedEvents: eventId } } // Remove the eventId from their rsvpedEvents array
    );

    res.status(200).send("Event deleted successfully");
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).send("Error deleting event");
  }
});

router.post("/events/:id/rsvp", async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.session.userEmail) {
      return res.status(401).send("You must be logged in to RSVP.");
    }

    const userEmail = req.session.userEmail;
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send("Event not found.");
    }

    // Find the user by their email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Prevent the creator from RSVPing
    if (event.userEmail === userEmail) {
      return res.status(403).send("You cannot RSVP your own event.");
    }

    // Check if the user has already RSVPed the event
    const isAlreadyRsvped = user.rsvpedEvents.includes(eventId);

    if (isAlreadyRsvped) {
      // If RSVPed, remove the event from the user's RSVPed events
      user.rsvpedEvents = user.rsvpedEvents.filter((id) => id.toString() !== eventId);
      await user.save();
      return res.status(200).json({ rsvpConfirmed: false });
    } else {
      // If not RSVPed, add the event to the user's RSVPed events
      user.rsvpedEvents.push(eventId);
      await user.save();
      return res.status(200).json({ rsvpConfirmed: true });
    }
  } catch (error) {
    console.error("Error handling RSVP toggle:", error);
    res.status(500).send("An error occurred while handling RSVP.");
  }
});

router.get("/my-rsvps", async (req, res) => {
  try {
    if (!req.session.userEmail) {
      return res.status(401).send("You must be logged in to view RSVPs");
    }

    const user = await User.findOne({ email: req.session.userEmail }).populate(
      "rsvpedEvents"
    );
    res.render("events/rsvpedEvents", { events: user?.rsvpedEvents || [] });
  } catch (error) {
    console.error("Error fetching RSVPed events:", error);
    res.status(500).send("Error fetching RSVPed events");
  }
});

router.post("/edit-event", async (req, res) => {
  try {
    const { eventId, title, date, location, description } = req.body;

    // Validate required fields
    if (!eventId || !title || !date || !location || !description) {
      return res.status(400).send("Missing required fields");
    }

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, date, location, description },
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).send("Event not found");
    }

    console.log("Event updated successfully:", updatedEvent);
    res.redirect("/users/profile"); // Redirect back to the profile page
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
