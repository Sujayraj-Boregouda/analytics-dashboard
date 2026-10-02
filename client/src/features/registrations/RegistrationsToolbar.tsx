import { useState } from "react";
import { Button, SelectField, TextField } from "../../components/ui";
import { useApiData } from "../../lib/useApiData";
import { useDebouncedCallback } from "../../lib/useDebouncedCallback";
import type { EventOption } from "../../types/api";
import styles from "./RegistrationsToolbar.module.css";
import { useRegistrationFilters } from "./useRegistrationFilters";

export function RegistrationsToolbar() {
  const { search, status, eventId, isFiltered, setSearch, setStatus, setEvent, reset } =
    useRegistrationFilters();
  const events = useApiData<EventOption[]>("/analytics/events");

  // What's typed in the box right now (updates on every keystroke)
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedCallback(setSearch, 300);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    debouncedSearch.run(value);
  }

  function handleReset() {
    debouncedSearch.cancel();
    setSearchInput("");
    reset();
  }

  return (
    <div className={styles.toolbar}>
      <TextField
        label="Search"
        type="search"
        placeholder="Name or email"
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        className={styles.search}
      />

      <SelectField
        label="Status"
        value={status ?? ""}
        onChange={(e) => setStatus(e.target.value)}
        className={styles.control}
      >
        <option value="">All statuses</option>
        <option value="PAID">Paid</option>
        <option value="PENDING">Pending</option>
        <option value="FAILED">Failed</option>
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
        <Button variant="ghost" onClick={handleReset}>
          Reset filters
        </Button>
      )}
    </div>
  );
}