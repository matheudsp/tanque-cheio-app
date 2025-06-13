import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';

type DatePickerProps = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
};

export const DatePicker = ({
  selectedDate,
  onDateChange,
  minDate = new Date(),
  maxDate,
}: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [dates, setDates] = useState<Date[]>([]);
  
  // Generate dates for the current month view
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Create array of dates for the month
    const datesArray: Date[] = [];
    
    // Add dates from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      datesArray.push(prevDate);
    }
    
    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      datesArray.push(new Date(year, month, i));
    }
    
    // Add dates from next month to fill the last week
    const lastDayOfWeek = lastDay.getDay(); // 0 = Sunday, 6 = Saturday
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      datesArray.push(new Date(year, month + 1, i));
    }
    
    setDates(datesArray);
  }, [currentMonth]);
  
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) {
      return true;
    }
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) {
      return true;
    }
    return false;
  };
  
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };
  
  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };
  
  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      // Keep the time from the previously selected date
      const newDate = new Date(date);
      newDate.setHours(
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        selectedDate.getSeconds(),
        selectedDate.getMilliseconds()
      );
      onDateChange(newDate);
    }
  };
  
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  
  // Generate weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.monthYear}>{monthName} {year}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekdaysContainer}>
        {weekdays.map((day, index) => (
          <Text key={index} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.datesContainer}>
        {dates.map((date, index) => {
          const disabled = isDateDisabled(date) || !isCurrentMonth(date);
          const selected = isSelectedDate(date);
          const today = isToday(date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                disabled && styles.disabledDate,
                selected && styles.selectedDate,
                today && styles.todayDate,
              ]}
              onPress={() => handleDateSelect(date)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.dateText,
                  disabled && styles.disabledDateText,
                  selected && styles.selectedDateText,
                  today && styles.todayDateText,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateButton: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
  },
  disabledDate: {
    opacity: 0.3,
  },
  disabledDateText: {
    color: colors.textSecondary,
  },
  selectedDate: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  selectedDateText: {
    color: 'white',
    fontWeight: '600',
  },
  todayDate: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  todayDateText: {
    color: colors.primary,
    fontWeight: '600',
  },
});