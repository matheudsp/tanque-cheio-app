import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useTheme } from "@/providers/themeProvider";
import { useStylesWithTheme } from "@/hooks/useStylesWithTheme";
import type { ThemeState } from "@/types/theme";

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
  const styles = useStylesWithTheme(getStyles);
  const { themeState } = useTheme();

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const datesArray: Date[] = [];
    const firstDayOfWeek = firstDay.getDay();

    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevDate = new Date(year, month, 1 - i);
      datesArray.push(prevDate);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      datesArray.push(new Date(year, month, i));
    }

    const lastDayOfWeek = lastDay.getDay();
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

  const monthName = currentMonth.toLocaleString("pt-BR", { month: "long" });
  const year = currentMonth.getFullYear();
  const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color={themeState.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color={themeState.colors.text.primary} />
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
                !selected && today && styles.todayDate,
              ]}
              onPress={() => handleDateSelect(date)}
              disabled={disabled}
            >
              <Text
                style={[
                  styles.dateText,
                  disabled && styles.disabledDateText,
                  selected && styles.selectedDateText,
                  !selected && today && styles.todayDateText,
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

const getStyles = (theme: Readonly<ThemeState>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.paper,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    navButton: {
      padding: theme.spacing.sm,
    },
    monthYear: {
      fontSize: 18,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    },
    weekdaysContainer: {
      flexDirection: "row",
      marginBottom: theme.spacing.sm,
    },
    weekday: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.secondary,
    },
    datesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dateButton: {
      width: "14.28%",
      aspectRatio: 1,
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 4,
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    disabledDate: {
      opacity: 0.4,
    },
    disabledDateText: {
      color: theme.colors.text.disabled,
    },
    selectedDate: {
      backgroundColor: theme.colors.primary.main,
      borderRadius: theme.borderRadius.round,
    },
    selectedDateText: {
      color: theme.colors.primary.text,
      fontWeight: theme.typography.fontWeight.bold,
    },
    todayDate: {
      borderWidth: 1,
      borderColor: theme.colors.primary.main,
      borderRadius: theme.borderRadius.round,
    },
    todayDateText: {
      color: theme.colors.primary.main,
      fontWeight: theme.typography.fontWeight.bold,
    },
  });
