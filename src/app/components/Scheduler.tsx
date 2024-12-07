'use client';

import { Share2, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

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

const SimpleScheduler = () => {
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(true);
  const [title, setTitle] = useState("Team Meeting");
  const [times, setTimes] = useState({
    "2024-12-10-14:00": ["Alice", "Bob"],
    "2024-12-10-15:00": ["Alice"],
    "2024-12-11-14:00": ["Bob"],
    "2024-12-11-16:00": ["Alice", "Bob"]
  });
  const [newTimeInput, setNewTimeInput] = useState({ date: '', time: '' });
  const [guid] = useState(() => searchParams.get('id') || generateGuid());
  const [showCopied, setShowCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?id=${guid}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Group and sort times by date
  const groupedTimes = Object.entries(times).reduce((groups, [timeKey, attendees]) => {
    const [date] = timeKey.split('-');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push({ timeKey, attendees });
    return groups;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedTimes).sort();

  const toggleAvailability = (timeKey) => {
    setTimes(currentTimes => {
      const attendees = currentTimes[timeKey] || [];
      const isAttending = attendees.includes(userName);
      
      return {
        ...currentTimes,
        [timeKey]: isAttending 
          ? attendees.filter(name => name !== userName)
          : [...attendees, userName]
      };
    });
  };

  const addNewTime = () => {
    if (newTimeInput.date && newTimeInput.time) {
      const timeKey = `${newTimeInput.date}-${newTimeInput.time}`;
      setTimes(current => ({
        ...current,
        [timeKey]: []
      }));
      setNewTimeInput({ date: '', time: '' });
    }
  };

  const removeTime = (timeKey) => {
    setTimes(current => {
      const newTimes = { ...current };
      delete newTimes[timeKey];
      return newTimes;
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric'
    });
  };

  if (showNamePrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Enter your name</h2>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Your name"
          />
          <button
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => userName.trim() && setShowNamePrompt(false)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

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
          <span>Attending as: {userName}</span>
          <button 
            onClick={() => setShowNamePrompt(true)}
            className="text-blue-500 text-sm"
          >
            (change name)
          </button>
        </div>
      </div>

      {/* Share Button */}
      <div className="relative mb-6">
        <button 
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share Link
        </button>
        {showCopied && (
          <div className="absolute top-full mt-2 left-0 bg-gray-800 text-white px-3 py-1 rounded text-sm">
            Link copied!
          </div>
        )}
      </div>

      {/* Time Slots Grid - Grouped by Date */}
      <div className="bg-white rounded-lg shadow">
        {sortedDates.map(date => (
          <div key={date} className="border-b last:border-b-0">
            {/* Date Header */}
            <div className="bg-gray-50 p-4 font-medium">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            
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
                        {formatTime(timeKey.split('-')[3])}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        {attendees.map(name => (
                          <span 
                            key={name}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attendees.includes(userName)}
                          onChange={() => toggleAvailability(timeKey)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>I can attend</span>
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
              onChange={(e) => setNewTimeInput(prev => ({ ...prev, date: e.target.value }))}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="time"
              value={newTimeInput.time}
              onChange={(e) => setNewTimeInput(prev => ({ ...prev, time: e.target.value }))}
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
