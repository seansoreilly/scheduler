"use client";

import { Share2, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Meeting } from "@/types/meeting";

// Types
interface TimeSlot {
  timeKey: string;
  attendees: string[];
}

interface GroupedTimes {
  [date: string]: TimeSlot[];
}

// Utility functions
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

const generateGuid = () => crypto.randomUUID();

const groupTimesByDate = (times: Meeting['times']): GroupedTimes => {
  return Object.entries(times).reduce((groups, [timeKey, attendees]) => {
    const [year, month, day] = timeKey.split("-");
    const date = `${year}-${month}-${day}`;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push({ timeKey, attendees });
    return groups;
  }, {} as GroupedTimes);
};

const DateTimeInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <input
    type="datetime-local"
    value={value}
    onChange={onChange}
    className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-800
      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      [&::-webkit-calendar-picker-indicator]:opacity-100 text-sm"
  />
);

const ShareButton = ({
  guid,
  showCopied,
  setShowCopied,
}: {
  guid: string;
  showCopied: boolean;
  setShowCopied: (show: boolean) => void;
}) => {
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

  return (
    <div className="relative flex justify-center">
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 
          text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-100 transition-colors w-full md:w-auto"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Copy link to share with others</span>
      </button>
      {showCopied && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 
          bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          Link copied!
        </div>
      )}
    </div>
  );
};

const TimeSlotItem = ({
  timeKey,
  attendees,
  userName,
  onToggle,
  onRemove,
}: {
  timeKey: string;
  attendees: string[];
  userName: string;
  onToggle: () => void;
  onRemove: () => void;
}) => (
  <div className="p-4 border-t border-gray-100">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg
            transition-colors"
          aria-label="Remove time slot"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <span className="font-medium text-gray-900">
          {formatTime(timeKey.split("-")[3])}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 ml-9 sm:ml-0">
        <div className="flex flex-wrap gap-2">
          {attendees.map((name) => (
            <span
              key={name}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm"
            >
              {name}
            </span>
          ))}
        </div>
        <label className="inline-flex items-center cursor-pointer min-w-[200px]">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={attendees.includes(userName)}
              onChange={onToggle}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer 
              peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
              peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 
              after:start-[2px] after:bg-white after:border-gray-300 after:border 
              after:rounded-full after:h-5 after:w-5 after:transition-all 
              peer-checked:bg-emerald-500"
            ></div>
          </div>
          <span className="ms-3 text-sm text-gray-600">
            {attendees.includes(userName) ? "I could attend" : "I can't attend"}
          </span>
        </label>
      </div>
    </div>
  </div>
);

const SimpleScheduler = () => {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState("");
  const [title, setTitle] = useState("");
  const [times, setTimes] = useState<Meeting['times']>({});
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [guid] = useState(() => {
    if (typeof window === 'undefined') {
      return searchParams.get("id") || 'placeholder-id';
    }
    return searchParams.get("id") || generateGuid();
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const response = await fetch(`/api/meeting/${guid}`);
        if (response.ok) {
          const meeting: Meeting = await response.json();
          setTitle(meeting.title);
          setTimes(meeting.times);
        }
      } catch (err) {
        console.error("Failed to load meeting:", err);
      }
    };

    if (searchParams.get("id") && isClient) {
      loadMeeting();
    }
  }, [guid, searchParams, isClient]);

  const saveMeeting = async () => {
    try {
      const meeting: Meeting = { title, times };
      const method = searchParams.get("id") ? "PUT" : "POST";
      const response = await fetch(`/api/meeting/${guid}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meeting),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to save meeting:", errorData.error, errorData.details);
      }
    } catch (err) {
      console.error("Failed to save meeting:", err);
    }
  };

  useEffect(() => {
    if (title && userName) {
      saveMeeting();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, times, userName]);

  const toggleAvailability = (timeKey: string) => {
    setTimes((currentTimes) => {
      const attendees = currentTimes[timeKey] || [];
      const isAttending = attendees.includes(userName);
      return {
        ...currentTimes,
        [timeKey]: isAttending
          ? attendees.filter((name) => name !== userName)
          : [...attendees, userName],
      };
    });
  };

  const addNewTime = () => {
    if (selectedDateTime) {
      const date = new Date(selectedDateTime);
      const timeKey = date.toISOString().slice(0, 16).replace('T', '-');
      setTimes((current) => ({
        ...current,
        [timeKey]: [userName],
      }));
      setSelectedDateTime("");
    }
  };

  const removeTime = (timeKey: string) => {
    setTimes((current) => {
      const newTimes = { ...current };
      delete newTimes[timeKey];
      return newTimes;
    });
  };

  if (!isClient) {
    return <div className="max-w-3xl mx-auto p-4 font-sans">Loading...</div>;
  }

  const groupedTimes = groupTimesByDate(times);
  const sortedDates = Object.keys(groupedTimes).sort();

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans space-y-8">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the title"
          className="p-2 w-full border-transparent hover:border-gray-200 
            focus:border-blue-500 border-2 rounded-lg transition-colors 
            text-gray-900 focus:outline-none text-2xl"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="text-gray-600 min-w-[100px]">My name is:</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="p-2 border-transparent hover:border-gray-200 
            focus:border-blue-500 border-2 rounded-lg transition-colors 
            text-gray-900 focus:outline-none w-48"
          placeholder="Enter your name"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-gray-600 mb-2">Enter date and time:</label>
            <DateTimeInput
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
            />
          </div>
          <button
            onClick={addNewTime}
            disabled={!selectedDateTime}
            className="flex items-center justify-center gap-2 px-6 bg-blue-500 
              text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-500 
              disabled:cursor-not-allowed transition-colors self-end"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Time</span>
          </button>
        </div>

        {sortedDates.map((date) => (
          <div key={date} className="border-b border-gray-100 last:border-b-0">
            <div className="bg-gray-50 p-4 font-medium text-gray-700">
              {formatDate(date)}
            </div>
            {groupedTimes[date]
              .sort((a, b) => a.timeKey.localeCompare(b.timeKey))
              .map(({ timeKey, attendees }) => (
                <TimeSlotItem
                  key={timeKey}
                  timeKey={timeKey}
                  attendees={attendees}
                  userName={userName}
                  onToggle={() => toggleAvailability(timeKey)}
                  onRemove={() => removeTime(timeKey)}
                />
              ))}
          </div>
        ))}
      </div>

      <ShareButton guid={guid} showCopied={showCopied} setShowCopied={setShowCopied} />
    </div>
  );
};

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SimpleScheduler />
    </Suspense>
  );
}