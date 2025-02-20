"use client";

import "@mantine/core/styles.css";
import { useEffect, useState } from "react";
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
  Loader,
} from "@mantine/core";
import { QRCodeCanvas } from "qrcode.react";
import toast, { Toaster } from "react-hot-toast";

type WorkspaceData = {
  name: string;
  url_link: string;
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

// Explicitly declare props for InviteModalPage
interface InviteModalPageProps {
  sessionPin: string;
}

export default function InviteModalPage({ sessionPin }: InviteModalPageProps) {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({ name: "", url_link: "" });
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
      toast.error(error.message || "Failed to fetch workspace data");
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
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Invite email sent successfully");
      } else {
        toast.error("Invite email could not be sent. Try refreshing the page and sending again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to send invite email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster />
      <Container size="sm" style={{ marginTop: "2rem" }}>
        <Paper withBorder shadow="sm" p="md" radius="md">
          <Stack spacing="md">
            <Text weight={700} size="xl">
              Invite Collaborators
            </Text>
            <Text size="sm" color="dimmed">
              Use this page to invite collaborators to your workspace.
            </Text>

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
            </Paper>

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
