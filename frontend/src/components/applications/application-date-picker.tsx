"use client";

import { useMemo, useState } from "react";
import { Popover } from "@mantine/core";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const monthFormatter = new Intl.DateTimeFormat("en-AU", {
  month: "long",
  year: "numeric",
});

const displayFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatApplicationDateValue(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthDays(viewDate: Date) {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
  const start = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1 - mondayOffset,
  );

  return Array.from(
    { length: 42 },
    (_, index) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

type ApplicationDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

export default function ApplicationDatePicker({
  value,
  onChange,
  ariaLabel = "Choose application date",
}: ApplicationDatePickerProps) {
  const selectedDate = useMemo(() => parseInputDate(value), [value]);
  const [opened, setOpened] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate);

  const days = useMemo(() => buildMonthDays(viewDate), [viewDate]);
  const today = useMemo(() => new Date(), []);

  function shiftMonth(delta: number) {
    setViewDate(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  }

  function chooseDate(date: Date) {
    onChange(formatApplicationDateValue(date));
    setOpened(false);
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      shadow="md"
      withinPortal={false}
    >
      <Popover.Target>
        <button
          type="button"
          className="apps-date-picker-trigger"
          data-expanded={opened ? "true" : undefined}
          aria-label={ariaLabel}
          onClick={() => {
            if (!opened) setViewDate(selectedDate);
            setOpened((value) => !value);
          }}
        >
          <IconCalendar size={14} aria-hidden />
          <span>{displayFormatter.format(selectedDate)}</span>
        </button>
      </Popover.Target>
      <Popover.Dropdown className="apps-date-picker-popover">
        <div className="apps-date-picker-head">
          <button
            type="button"
            className="apps-date-picker-nav"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
          >
            <IconChevronLeft size={15} aria-hidden />
          </button>
          <div className="apps-date-picker-month">
            {monthFormatter.format(viewDate)}
          </div>
          <button
            type="button"
            className="apps-date-picker-nav"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
          >
            <IconChevronRight size={15} aria-hidden />
          </button>
        </div>

        <div className="apps-date-picker-weekdays">
          {WEEKDAYS.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>

        <div className="apps-date-picker-grid">
          {days.map((day) => {
            const isCurrentMonth = day.getMonth() === viewDate.getMonth();
            const isSelected = isSameDate(day, selectedDate);
            const isToday = isSameDate(day, today);

            return (
              <button
                key={formatApplicationDateValue(day)}
                type="button"
                className={
                  "apps-date-picker-day" +
                  (isCurrentMonth ? "" : " is-outside") +
                  (isToday ? " is-today" : "") +
                  (isSelected ? " is-selected" : "")
                }
                aria-label={`Select ${displayFormatter.format(day)}`}
                aria-pressed={isSelected}
                onClick={() => chooseDate(day)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
