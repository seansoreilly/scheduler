import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
  Switch,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Meeting } from '../types/meeting';

const Scheduler = () => {
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [title, setTitle] = useState('Click to set title');
  const [times, setTimes] = useState<{ [key: string]: string[] }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTimeInput, setNewTimeInput] = useState(new Date());
  const [guid] = useState(() => crypto.randomUUID());

  // ... keep similar state management logic ...

  const handleShare = async () => {
    try {
      const shareUrl = `yourapp://meeting/${guid}`;
      await Share.share({
        message: `Join my meeting: ${shareUrl}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share meeting link');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="What's the meeting about?"
        />
        <View style={styles.nameContainer}>
          <Text>My name is:</Text>
          {isEditingName ? (
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              placeholder="Enter your name"
            />
          ) : (
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <Text style={styles.nameButton}>
                {userName || 'Click to set name'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color="white" />
        <Text style={styles.shareButtonText}>Share Meeting</Text>
      </TouchableOpacity>

      {/* Time Slots */}
      {sortedDates.map(date => (
        <View key={date} style={styles.dateSection}>
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </View>

          {groupedTimes[date].map(({ timeKey, attendees }) => (
            <View key={timeKey} style={styles.timeSlot}>
              <View style={styles.timeInfo}>
                <TouchableOpacity
                  onPress={() => removeTime(timeKey)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
                <Text style={styles.timeText}>
                  {formatTime(timeKey.split('-')[3])}
                </Text>
              </View>

              <View style={styles.attendeeSection}>
                <ScrollView horizontal style={styles.attendeeList}>
                  {attendees.map(name => (
                    <View key={name} style={styles.attendeeTag}>
                      <Text style={styles.attendeeText}>{name}</Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.toggleContainer}>
                  <Switch
                    value={attendees.includes(userName)}
                    onValueChange={() => toggleAvailability(timeKey)}
                    trackColor={{ false: '#ff6b6b', true: '#4ade80' }}
                  />
                  <Text style={styles.toggleText}>
                    {attendees.includes(userName) ? "Could attend" : "Can't attend"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* Add Time Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Time</Text>
      </TouchableOpacity>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={newTimeInput}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setNewTimeInput(date);
              setShowTimePicker(true);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={newTimeInput}
          mode="time"
          onChange={(event, date) => {
            setShowTimePicker(false);
            if (date) {
              addNewTime(date);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 4,
  },
  nameButton: {
    color: '#3b82f6',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  shareButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  dateSection: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  dateHeader: {
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  dateText: {
    fontWeight: '500',
  },
  timeSlot: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
    padding: 8,
  },
  timeText: {
    fontWeight: '500',
  },
  attendeeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  attendeeList: {
    flexGrow: 0,
  },
  attendeeTag: {
    backgroundColor: '#dcfce7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  attendeeText: {
    color: '#15803d',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    margin: 16,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
  },
});

export default Scheduler; 