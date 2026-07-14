import { useState } from "react";
import "./Calendar.css";

function Calendar() {
  const [selectedDate, setSelectedDate] = useState("");

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Project Review Meeting",
      date: "2026-06-10",
      time: "10:00",
    },
    {
      id: 2,
      title: "Client Presentation",
      date: "2026-06-15",
      time: "14:00",
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
  });

  const addEvent = () => {
    if (
      !newEvent.title ||
      !newEvent.date ||
      !newEvent.time
    ) {
      alert("Please fill all fields");
      return;
    }

    setEvents([
      ...events,
      {
        id: Date.now(),
        ...newEvent,
      },
    ]);

    setNewEvent({
      title: "",
      date: "",
      time: "",
    });
  };

  const deleteEvent = (id) => {
    setEvents(
      events.filter(
        (event) => event.id !== id
      )
    );
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>📅 Calendar</h1>
      </div>

      {/* Add Event Form */}

      <div className="event-form">
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              title: e.target.value,
            })
          }
        />

        <input
          type="date"
          value={newEvent.date}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              date: e.target.value,
            })
          }
        />

        <input
          type="time"
          value={newEvent.time}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              time: e.target.value,
            })
          }
        />

        <button
          className="add-event-btn"
          onClick={addEvent}
        >
          Add Event
        </button>
      </div>

      {/* Summary */}

      <div className="calendar-top">
        <div className="calendar-picker">
          <h3>Select Date</h3>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
          />
        </div>

        <div className="calendar-summary">
          <div className="summary-card">
            <h3>Total Events</h3>
            <p>{events.length}</p>
          </div>

          <div className="summary-card">
            <h3>This Month</h3>
            <p>{events.length}</p>
          </div>

          <div className="summary-card">
            <h3>Upcoming</h3>
            <p>{events.length}</p>
          </div>
        </div>
      </div>

      <h2 className="events-title">
        Upcoming Events
      </h2>

      <div className="events-grid">
        {events
          .filter(
            (event) =>
              !selectedDate ||
              event.date === selectedDate
          )
          .map((event) => (
            <div
              className="event-card"
              key={event.id}
            >
              <h3>{event.title}</h3>

              <p>
                <strong>Date:</strong>{" "}
                {event.date}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {event.time}
              </p>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteEvent(event.id)
                }
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Calendar;