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
} from "@mantine/core";
import axios from "axios";

interface Opportunity {
  name: string;
  customer_segment: string;
  label: string;
  participants: number;
  scoreP: number;
  scoreC: number;
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

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const TOKEN = localStorage.getItem("accessToken");
      const RefreshToken = localStorage.getItem("refreshToken");

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/owneropps/`,
          { headers: { Authorization: `Bearer ${TOKEN}` } }
        );

        const data = response.data.map((workspace: any[]) => ({
          name: workspace[0],
          code: workspace[1],
          opportunities: workspace[2] || [],
          display: false,
        }));
        setWorkspaces(data);
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401 &&
          RefreshToken
        ) {
          try {
            const refreshResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`,
              { refresh: RefreshToken }
            );

            localStorage.setItem("accessToken", refreshResponse.data.access);

            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/owneropps/`,
              { headers: { Authorization: `Bearer ${refreshResponse.data.access}` } }
            );

            const data = response.data.map((workspace: any[]) => ({
              name: workspace[0],
              code: workspace[1],
              opportunities: workspace[2] || [],
              display: false,
            }));
            setWorkspaces(data);
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } else {
          console.error("Failed to fetch workspaces:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const toggleDisplay = (index: number) => {
    setWorkspaces((prev) =>
      prev.map((workspace, i) =>
        i === index ? { ...workspace, display: !workspace.display } : workspace
      )
    );
  };

  return (
    <Container size="xl" py="xl">
      <Title align="center" mb="lg">
        My Workspaces
      </Title>
      {loading ? (
        <Loader size="lg" variant="dots" mx="auto" />
      ) : (
        <>
          {workspaces.length > 0 ? (
            <Grid gutter="lg">
              {workspaces.map((workspace, i) => (
                <Grid.Col span={12} sm={6} lg={4} key={i}>
                  <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{ height: "100%" }}
                  >
                    <Group position="apart">
                      <Text size="lg" weight={500}>
                        {workspace.name}
                      </Text>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => toggleDisplay(i)}
                      >
                        {workspace.display ? "Hide" : "Details"}
                      </Button>
                    </Group>
                    <Divider my="sm" />
                    <Anchor
                      href={`/results/${workspace.code}`}
                      size="sm"
                      underline
                    >
                      View Full Results
                    </Anchor>
                    <Collapse in={workspace.display}>
                      <Accordion>
                        {workspace.opportunities.map((opp, j) => (
                          <Accordion.Item key={j} value={opp.name}>
                            <Accordion.Control>
                              <Group position="apart">
                                <Text>{opp.name}</Text>
                                {/* No need for badge until status is stored in DB
                                <Badge
                                  color={
                                    opp.label === "Keep Open" ? "blue" : "green"
                                  }
                                >
                                  {opp.label}
                                </Badge> */}
                              </Group>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Text size="sm">Segment: {opp.customer_segment}</Text>
                              <Text size="sm">Participants: {opp.participants}</Text>
                              <Text size="sm">Potential: {opp.scoreP === 0 ? 'TBD' : `${Math.floor(opp.scoreP * 10) / 10}/5`}</Text>
                              <Text size="sm">Challenge: {opp.scoreC === 0 ? 'TBD' : `${Math.floor(opp.scoreC * 10) / 10}/5`}</Text>
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
            <Text align="center" size="sm" color="dimmed">
              You have no workspaces...
            </Text>
          )}
        </>
      )}
    </Container>
  );
}
