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
} from "@mantine/core";
import { useRouter } from 'next/navigation';
import axios from "axios";
import dynamic from "next/dynamic";

// Interfaces
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
  code: string;
  opportunities: Opportunity[];
  display: boolean;
}

// Dynamic Import for InviteModalPage
const InviteModalPage = dynamic(
  () => import("../../invite/[sessionPin]/inviteModalPage"),
  {
    ssr: false,
    loading: () => <Loader />,
  }
);

// Dynamic Import for EditProjectForm
const EditProjectForm = dynamic(
  () => import("../../edit/EditProjectForm"),
  {
    ssr: false,
    loading: () => <Loader />,
  }
);

export default function OpportunitiesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inviteModal, setInviteModal] = useState<{ open: boolean; sessionPin?: string }>({ open: false });
  const [editModal, setEditModal] = useState<{ open: boolean; project?: Opportunity }>({ open: false });

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

  // Extract sessionPin from Results URL
  const extractSessionPin = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const openInviteModal = (sessionPin: string) => {
    setInviteModal({ open: true, sessionPin });
  };

  const openEditModal = (project: Opportunity) => {
    setEditModal({ open: true, project });
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
                      <Text size="lg" weight={500}>
                        {workspace.name}
                      </Text>
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
                        {workspace.opportunities.map((opp, j) => {
                          const resultURL = `/results/${workspace.code}`;
                          const sessionPin = extractSessionPin(resultURL);
                          return (
                            <Accordion.Item key={j} value={opp.name}>
                              <Accordion.Control>
                                <Group position="apart">
                                  <Text>{opp.name}</Text>
                                  <Badge color={opp.label === "Keep Open" ? "blue" : "green"}>
                                    {opp.label}
                                  </Badge>
                                </Group>
                              </Accordion.Control>
                              <Accordion.Panel>
                                <Text size="sm">Segment: {opp.customer_segment}</Text>
                                <Text size="sm">Participants: {opp.participants}</Text>
                                <Text size="sm">Potential: {opp.scoreP}/5</Text>
                                <Text size="sm">Challenge: {opp.scoreC}/5</Text>
                                <Group mt="sm">
                                  <Button
                                    size="xs"
                                    color="blue"
                                    onClick={() => openInviteModal(sessionPin)}
                                  >
                                    Invite
                                  </Button>
                                  <Button size="xs" color="yellow" onClick={() => openEditModal(opp)}>
                                    Edit
                                  </Button>
                                </Group>
                              </Accordion.Panel>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>
                    </Collapse>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Text align="center" size="sm" color="dimmed">
              You have no workspaces...
            </Text>
          )}
        </>
      )}

      {/* Invite Modal - Loads InviteModalPage with correct sessionPin */}
      <Modal
        opened={inviteModal.open}
        onClose={() => setInviteModal({ open: false })}
        title="Invite Users"
        size="md"
        centered
      >
        {inviteModal.sessionPin ? (
          <InviteModalPage key={inviteModal.sessionPin} sessionPin={inviteModal.sessionPin} />
        ) : (
          <Loader />
        )}
      </Modal>

      {/* Edit Modal - Loads EditProjectForm with opportunity_id */}
      <Modal
        opened={editModal.open}
        onClose={() => setEditModal({ open: false })}
        title="Edit Project"
        size="lg"
        centered
      >
        {editModal.project ? (
          <EditProjectForm
            opportunity_id={editModal.project.opportunity_id}
            onClose={() => setEditModal({ open: false })}
          />
        ) : (
          <Loader />
        )}
      </Modal>
    </Container>
  );
}
