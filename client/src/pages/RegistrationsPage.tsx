import type { ReactNode } from "react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Pagination,
  Skeleton,
} from "../components/ui";
import { RegistrationsTable } from "../features/registrations/RegistrationsTable";
import { RegistrationsToolbar } from "../features/registrations/RegistrationsToolbar";
import { useRegistrationFilters } from "../features/registrations/useRegistrationFilters";
import { formatNumber } from "../lib/format";
import { useApiData } from "../lib/useApiData";
import type { Paginated, Registration } from "../types/api";

export function RegistrationsPage() {
  const filters = useRegistrationFilters();
  const { data, error, loading, reload } = useApiData<Paginated<Registration>>(
    `/registrations?${filters.query}`,
  );

  const refreshing = loading && data !== null;

  let content: ReactNode;

  if (error && !data) {
    content = <ErrorState message="Couldn't load registrations." onRetry={reload} />;
  } else if (!data) {
    content = <Skeleton height={420} />;
  } else if (data.total === 0) {
    content = (
      <EmptyState
        title="No registrations found"
        message={
          filters.isFiltered
            ? "Nothing matches these filters. Try a different search, or use Reset filters above."
            : "Registrations will appear here once people sign up."
        }
      />
    );
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        title="This page doesn't exist"
        message={`There are only ${data.totalPages} pages of results.`}
        action={
          <Button variant="secondary" onClick={() => filters.setPage(1)}>
            Go to the first page
          </Button>
        }
      />
    );
  } else {
    content = (
      <>
        <RegistrationsTable
          items={data.items}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={filters.toggleSort}
          refreshing={refreshing}
        />
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={filters.setPage}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Registrations"
        subtitle={
          data
            ? `${formatNumber(data.total)} ${data.total === 1 ? "registration" : "registrations"}${filters.isFiltered ? " matching your filters" : ""}.`
            : "Every sign-up, with payment status."
        }
      />
      <RegistrationsToolbar />
      <Card>{content}</Card>
    </>
  );
}