import { useAuth } from "../auth/useAuth";
import { Alert, Badge, Button, Card } from "../components/ui";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Registrations and payments for the last 30 days.</p>
      </div>

      <Card title="Design system preview" description="The building blocks every page will use.">
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Saving</Button>
        </div>
        <div className={styles.row}>
          <Badge tone="success">PAID</Badge>
          <Badge tone="warning">PENDING</Badge>
          <Badge tone="danger">FAILED</Badge>
          <Badge tone="info">ADMIN</Badge>
          <Badge>VIEWER</Badge>
        </div>
        <Alert tone="info">Signed in as {user?.email}. Charts arrive in the next step.</Alert>
      </Card>
    </>
  );
}