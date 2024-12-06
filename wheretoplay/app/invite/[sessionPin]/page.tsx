"use client";

import "@mantine/core/styles.css";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Container,
  TextInput,
  Button,
  Paper,
  Group,
  Select,
  Accordion,
  Text,
  Space,
  Stack,
} from "@mantine/core";
import { QRCodeCanvas } from "qrcode.react";
import { showNotification } from "@mantine/notifications";

type WorkspaceData = {
  name: string;
  url_link: string;
  workspace_id: number;
};

const expirationOptions = [
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "1d", label: "1 day" },
  { value: "7d", label: "7 days" },
  { value: "no_expiration", label: "No expiration" },
];

export default function InvitePage() {
  const pathname = usePathname();
  const sessionPin = pathname.split("/").pop(); // Extract sessionPin from the URL path
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({ name: "", url_link: "", workspace_id: -1 });
  const [email, setEmail] = useState("");
  const [expiration, setExpiration] = useState<string>("no_expiration");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();
  }, [sessionPin]);

  const fetchWorkspaceData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Unauthorized: No access token found.");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/workspace_by_code/?code=${sessionPin}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized: Please log in again.");
        }
        throw new Error("Failed to fetch workspace data");
      }

      const data = await response.json();
      setWorkspaceData(data);
    } catch (error: any) {
      console.error("Error:", error);
      showNotification({
        title: 'error',
        message: error.message || 'Failed to fetch workspace data',
        color: 'red',
      })
    }
  };

  const handleRefreshSessionCode = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh_session_code/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ session_pin: sessionPin }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Update the workspaceData with the new URL link
        setWorkspaceData((prev) => ({ ...prev, url_link: data.new_url_link }));
        showNotification({
          title: 'Success',
          message: 'Session code refreshed successfully',
          color: 'green',
        });
      } else {
        showNotification({
          title: 'Error',
          message: data.error || 'Could not refresh session code',
          color: 'red',
        });
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification({
        title: 'Error',
        message: 'An error occurred while refreshing the session code.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/send_invite_email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          session_pin: sessionPin,
          expiration,
          workspace_id: workspaceData.workspace_id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification({
          title: 'Sucess',
          message: 'Invite email sent successfully',
          color: 'green',
        });
      } else {
        showNotification({
          title: 'Error',
          message: data.error,
          color: 'red',
        }); 
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification({
        title: 'Error',
        message: 'Failed to send invite email',
        color: 'red',
      }); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Container size="sm" style={{ marginTop: "2rem" }}>
        <Paper withBorder shadow="sm" p="md" radius="md">
          <Stack spacing="md">
            <Text weight={700} size="xl">
              Invite Collaborators
            </Text>
            <Text size="sm" color="dimmed">
              Use this page to invite collaborators to your workspace.
            </Text>

            {/* Workspace Details */}
            <Paper withBorder shadow="xs" p="md" radius="md">
              <Text weight={600}>Workspace: {workspaceData.name || "N/A"}</Text>
              <Space h="xs" />
              <Text>Invite Link:</Text>
              <a href={workspaceData.url_link || "#"}>{workspaceData.url_link || "N/A"}</a>
              {workspaceData.url_link && (
                <div style={{ marginTop: "1rem" }}>
                  <Text>Scan the QR code to join:</Text>
                  <QRCodeCanvas value={workspaceData.url_link} />
                </div>
              )}
              <Button
                onClick={handleRefreshSessionCode}
                fullWidth
                variant="gradient"
                gradient={{ from: "orange", to: "red", deg: 60 }}
                style={{ marginTop: "1rem" }}
                loading={loading}
              >
                Refresh Session Code
              </Button>
            </Paper>

            {/* Email Invitation */}
            <Accordion>
              <Accordion.Item value="email-invite">
                <Accordion.Control>Send Invite via Email</Accordion.Control>
                <Accordion.Panel>
                  <TextInput
                    label="Email Address"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                  />
                  <Select
                    label="Expiration Time"
                    placeholder="Select expiration time"
                    data={expirationOptions}
                    value={expiration}
                    onChange={(value) => setExpiration(value || "no_expiration")}
                    style={{ marginTop: "1rem" }}
                  />
                  <Button
                    onClick={handleSendEmail}
                    fullWidth
                    variant="gradient"
                    gradient={{ from: "teal", to: "blue", deg: 60 }}
                    style={{ marginTop: "1rem" }}
                    loading={loading}
                  >
                    Send Invite
                  </Button>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
