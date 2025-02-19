"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  Button,
  Badge,
  Collapse,
  Group,
  Anchor,
  Accordion,
  Divider,
  Loader,
  Title,
  Modal,
  TextInput,
  Textarea,
} from "@mantine/core";
import axios from "axios";
import dynamic from "next/dynamic";

interface Opportunity {
  name: string;
  customer_segment: string;
  label: string;
  participants: number;
  scoreP: number;
  scoreC: number;
  opportunity_id: number;
}

interface Workspace {
  name: string;
  code: number;
  opportunities: Opportunity[];
  display: boolean;
}

export default function OpportunitiesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inviteModal, setInviteModal] = useState<{ open: boolean; workspaceId?: number }>({ open: false });
  const [editModal, setEditModal] = useState<{ open: boolean; project?: Opportunity }>({ open: false });
  const [editData, setEditData] = useState<{ name: string; customer_segment: string }>({ name: "", customer_segment: "" });

  // Dynamically import the invite page when needed
  const InvitePage = dynamic(() => import("../../invite/[sessionPin]/page"), { ssr: false });

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const TOKEN = localStorage.getItem("accessToken");

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/query/owneropps/`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        const data = response.data.map((workspace: any[]) => ({
          name: workspace[0],
          code: workspace[1],
          opportunities: workspace[2] || [],
          display: false,
        }));
        setWorkspaces(data);
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const toggleDisplay = (index: number) => {
    setWorkspaces((prev) =>
      prev.map((workspace, i) => (i === index ? { ...workspace, display: !workspace.display } : workspace))
    );
  };

  const openInviteModal = (workspaceId: number) => {
    setInviteModal({ open: true, workspaceId });
  };

  const openEditModal = (project: Opportunity) => {
    setEditData({ name: project.name, customer_segment: project.customer_segment });
    setEditModal({ open: true, project });
  };

  const handleEditSubmit = async () => {
    if (!editModal.project) return;

    const TOKEN = localStorage.getItem("accessToken");
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/edit_project/`,
        {
          opportunity_id: editModal.project.opportunity_id,
          name: editData.name,
          customer_segment: editData.customer_segment,
        },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      alert("Project updated successfully!");
      setEditModal({ open: false });
      window.location.reload();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title align="center" mb="lg">My Workspaces</Title>
      {loading ? (
        <Loader size="lg" variant="dots" mx="auto" />
      ) : (
        <>
          {workspaces.length > 0 ? (
            <Grid gutter="lg">
              {workspaces.map((workspace, i) => (
                <Grid.Col span={12} sm={6} lg={4} key={i}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: "100%" }}>
                    <Group position="apart">
                      <Text size="lg" weight={500}>{workspace.name}</Text>
                      <Button size="xs" variant="outline" onClick={() => toggleDisplay(i)}>
                        {workspace.display ? "Hide" : "Details"}
                      </Button>
                    </Group>
                    <Divider my="sm" />
                    <Anchor href={`/results/${workspace.code}`} size="sm" underline>
                      View Full Results
                    </Anchor>
                    <Collapse in={workspace.display}>
                      <Accordion>
                        {workspace.opportunities.map((opp, j) => (
                          <Accordion.Item key={j} value={opp.name}>
                            <Accordion.Control>
                              <Group position="apart">
                                <Text>{opp.name}</Text>
                                <Badge color={opp.label === "Keep Open" ? "blue" : "green"}>{opp.label}</Badge>
                              </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Text size="sm">Segment: {opp.customer_segment}</Text>
                              <Text size="sm">Participants: {opp.participants}</Text>
                              <Text size="sm">Potential: {opp.scoreP}/5</Text>
                              <Text size="sm">Challenge: {opp.scoreC}/5</Text>
                              <Group mt="sm">
                                <Button size="xs" color="blue" onClick={() => openInviteModal(workspace.code)}>
                                  Invite
                                </Button>
                                <Button size="xs" color="yellow" onClick={() => openEditModal(opp)}>
                                  Edit
                                </Button>
                              </Group>
                            </Accordion.Panel>
                          </Accordion.Item>
                        ))}
                      </Accordion>
                    </Collapse>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Text align="center" size="sm" color="dimmed">You have no workspaces...</Text>
          )}
        </>
      )}

      {/* Invite Modal - Loads Invite Page */}
      <Modal
        opened={inviteModal.open}
        onClose={() => setInviteModal({ open: false })}
        title="Invite Users"
        size="md"
        centered
      >
        {inviteModal.workspaceId && <InvitePage />}
      </Modal>

      {/* Edit Modal */}
      <Modal opened={editModal.open} onClose={() => setEditModal({ open: false })} title="Edit Project">
        <TextInput
          label="Project Name"
          value={editData.name}
          onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Textarea
          label="Customer Segment"
          value={editData.customer_segment}
          onChange={(e) => setEditData((prev) => ({ ...prev, customer_segment: e.target.value }))}
        />
        <Button fullWidth mt="md" color="green" onClick={handleEditSubmit}>Save Changes</Button>
      </Modal>
    </Container>
  );
}
