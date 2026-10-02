import { Button, SelectField } from "../../components/ui";
import { useApiData } from "../../lib/useApiData";
import type { EventOption } from "../../types/api";
import styles from "./FilterBar.module.css";
import { RANGE_OPTIONS, useDashboardFilters } from "./useDashboardFilters";

export function FilterBar() {
  const { days, eventId, isFiltered, setRange, setEvent, reset } = useDashboardFilters();
  const events = useApiData<EventOption[]>("/analytics/events");

  return (
    <div className={styles.bar}>
      <SelectField
        label="Date range"
        value={String(days)}
        onChange={(e) => setRange(e.target.value)}
        className={styles.control}
      >
        {RANGE_OPTIONS.map((option) => (
          <option key={option.days} value={option.days}>
            {option.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Event"
        value={eventId === null ? "" : String(eventId)}
        onChange={(e) => setEvent(e.target.value)}
        disabled={events.loading && !events.data}
        className={styles.control}
      >
        <option value="">All events</option>
        {events.data?.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </SelectField>

      {isFiltered && (
        <Button variant="ghost" onClick={reset}>
          Reset filters
        </Button>
      )}
    </div>
  );
}