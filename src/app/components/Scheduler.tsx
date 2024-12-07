"use client";

import { Share2, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Meeting } from "@/types/meeting";

// Wrap the `SimpleScheduler` component with a Suspense boundary
export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SimpleScheduler />
    </Suspense>
  );
}

const generateGuid = () => {
  return crypto.randomUUID();
};

interface ErrorResponse {
  error: string;
  details: string;
}

const SimpleScheduler = () => {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [title, setTitle] = useState("Click to set title");
  const [times, setTimes] = useState<{ [key: string]: string[] }>({});
  const [newTimeInput, setNewTimeInput] = useState({ date: "", time: "" });
  const [guid] = useState(() => searchParams.get("id") || generateGuid());
  const [showCopied, setShowCopied] = useState(false);

  // Add useEffect to load meeting data
  useEffect(() => {
    const loadMeeting = async () => {
      try {
        console.log("Loading meeting:", guid);
        const response = await fetch(`/api/meeting/${guid}`);
        if (response.ok) {
          const meeting: Meeting = await response.json();
          console.log("Loaded meeting:", meeting);
          setTitle(meeting.title);
          setTimes(meeting.times);
        } else {
          const errorData = (await response.json()) as ErrorResponse;
          console.error(
            "Failed to load meeting:",
            errorData.error,
            errorData.details
          );
        }
      } catch (err) {
        console.error(
          "Failed to load meeting:",
          err instanceof Error ? err.message : "Unknown error"
        );
      }
    };

    // Only load if there's an ID in the URL
    const meetingId = searchParams.get("id");
    if (meetingId) {
      loadMeeting();
    }
  }, [guid, searchParams]);

  // Add function to save meeting data
  const saveMeeting = async () => {
    try {
      const meeting: Meeting = {
        title,
        times,
      };

      // If no ID in URL, it's a new meeting - use POST
      // If there is an ID, it's an existing meeting - use PUT
      const method = searchParams.get("id") ? "PUT" : "POST";
      const response = await fetch(`/api/meeting/${guid}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meeting),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        console.error(
          "Failed to save meeting:",
          errorData.error,
          errorData.details
        );
      }
    } catch (err) {
      console.error(
        "Failed to save meeting:",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };

  // Modify toggleAvailability to save after state update
  const toggleAvailability = async (timeKey: string) => {
    setTimes((currentTimes) => {
      const attendees = currentTimes[timeKey] || [];
      const isAttending = attendees.includes(userName);

      const newTimes = {
        ...currentTimes,
        [timeKey]: isAttending
          ? attendees.filter((name) => name !== userName)
          : [...attendees, userName],
      };

      // Save in a separate useEffect instead
      return newTimes;
    });
  };

  // Modify addNewTime to automatically add the current user
  const addNewTime = async () => {
    if (newTimeInput.date && newTimeInput.time) {
      // Convert the date to YYYY-MM-DD format
      const [year, month, day] = newTimeInput.date.split("-");
      const timeKey = `${year}-${month}-${day}-${newTimeInput.time}`;
      setTimes((current) => {
        const newTimes = {
          ...current,
          [timeKey]: [userName], // Add the current user as an attendee
        };
        return newTimes;
      });
      setNewTimeInput({ date: "", time: "" });
    }
  };

  // Modify removeTime to save after state update
  const removeTime = async (timeKey: string) => {
    setTimes((current) => {
      const newTimes = { ...current };
      delete newTimes[timeKey];
      return newTimes;
    });
  };

  // Add effect to save whenever times or title changes
  useEffect(() => {
    if (title && userName) {
      // Only save if user has entered their name
      saveMeeting();
    }
  }, [title, times, userName]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?id=${guid}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Group and sort times by date
  const groupedTimes = Object.entries(times).reduce(
    (groups, [timeKey, attendees]) => {
      // Split timeKey into its components (YYYY-MM-DD-HH:mm)
      const [year, month, day] = timeKey.split("-"); // Remove unused 'time' variable
      // Reconstruct the date in ISO format (YYYY-MM-DD)
      const date = `${year}-${month}-${day}`;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push({ timeKey, attendees });
      return groups;
    },
    {}
  );

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedTimes).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's the meeting about?"
          className="text-2xl font-bold p-2 w-full border-transparent hover:border-gray-300 focus:border-blue-500 border-2 rounded-lg"
        />
        <div className="flex justify-between items-center text-gray-600 mt-2">
          <div className="flex items-center gap-2">
            <span>My name is:</span>
            {isEditingName ? (
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingName(false);
                  }
                }}
                autoFocus
                className="border rounded px-2 py-1 text-sm"
                placeholder="Enter your name"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="hover:bg-gray-100 px-2 py-1 rounded"
              >
                {userName || "Click to set name"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Button */}
      <div className="relative mb-6">
        <button
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Copy link to share with others
        </button>
        {showCopied && (
          <div className="absolute top-full mt-2 left-0 bg-gray-800 text-white px-3 py-1 rounded text-sm">
            Link copied!
          </div>
        )}
      </div>

      {/* Time Slots Grid - Grouped by Date */}
      <div className="bg-white rounded-lg shadow">
        {sortedDates.map((date) => (
          <div key={date} className="border-b last:border-b-0">
            {/* Date Header */}
            <div className="bg-gray-50 p-4 font-medium">{formatDate(date)}</div>

            {/* Times for this date */}
            {groupedTimes[date]
              .sort((a, b) => a.timeKey.localeCompare(b.timeKey))
              .map(({ timeKey, attendees }) => (
                <div key={timeKey} className="p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => removeTime(timeKey)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="font-medium">
                        {formatTime(timeKey.split("-")[3])}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {attendees.map((name) => (
                          <span
                            key={name}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={attendees.includes(userName)}
                            onChange={() => toggleAvailability(timeKey)}
                          />
                          <div className="w-11 h-6 bg-red-400 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </div>
                        <span className="ms-3 text-sm font-medium text-gray-900">
                          {attendees.includes(userName) ? "Could attend" : "Can't attend"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}

        {/* Add Time Slot */}
        <div className="p-4 border-t">
          <div className="flex gap-4">
            <input
              type="date"
              value={newTimeInput.date}
              onChange={(e) =>
                setNewTimeInput((prev) => ({ ...prev, date: e.target.value }))
              }
              className="flex-1 p-2 border rounded"
            />
            <input
              type="time"
              value={newTimeInput.time}
              onChange={(e) =>
                setNewTimeInput((prev) => ({ ...prev, time: e.target.value }))
              }
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={addNewTime}
              disabled={!newTimeInput.date || !newTimeInput.time}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              <Plus className="w-4 h-4" />
              Add Time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
