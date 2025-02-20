"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Group,
  Textarea,
  Title,
  Paper,
  Image,
  Text,
  rem,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import axios from "axios";

interface EditProjectProps {
    opportunity_id: number;
    onClose: () => void;
  }
  

const EditProjectForm: React.FC<EditProjectProps> = ({ opportunity_id, onClose }) => {
  const [project, setProject] = useState({
    name: "",
    customer_segment: "",
    description: "",
    media: null as string | null,
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/opportunity/?id=${opportunity_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          

        setProject({
          name: response.data.name,
          customer_segment: response.data.customer_segment,
          description: response.data.description,
          media: response.data.media || null,
        });
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProject();
  }, [opportunity_id]);

  const handleMediaUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "where_to_play_preset");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dfijf9w4l/image/upload",
        formData
      );
      const mediaUrl = response.data.secure_url;
      setProject((prev) => ({ ...prev, media: mediaUrl }));
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/edit_opportunity/`,
        {
          opportunity_id,
          name: project.name,
          customer_segment: project.customer_segment,
          description: project.description,
          media: project.media,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          } 
        }
      );

      alert("Project updated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  return (
    <Container size="sm">
      <Title style={{ textAlign: "center" }} mt="xl">
        Edit Project
      </Title>
      <Paper withBorder shadow="md" p="md" radius="md" mt="lg">
        <div style={{ marginBottom: "1rem" }}>
          <Textarea
            label="Project Name"
            placeholder="Enter the name of the project"
            value={project.name}
            autosize
            minRows={2}
            onChange={(e) => setProject((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <Textarea
            label="Customer Segment"
            placeholder="Enter the customer segment"
            value={project.customer_segment}
            autosize
            minRows={2}
            onChange={(e) => setProject((prev) => ({ ...prev, customer_segment: e.target.value }))}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <Textarea
            label="Description"
            placeholder="Enter the description"
            value={project.description}
            autosize
            minRows={3}
            onChange={(e) => setProject((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        {/* Dropzone for Image Upload */}
        <Dropzone
          onDrop={(files) => handleMediaUpload(files[0])}
          onReject={(files) => console.log("rejected files", files)}
          maxSize={5 * 1024 ** 2}
          accept={IMAGE_MIME_TYPE}
        >
          <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
            <Dropzone.Accept>
              <IconUpload
                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto
                style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
                stroke={1.5}
              />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag image here or click to select a file
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                File should not exceed 5MB
              </Text>
            </div>
          </Group>
        </Dropzone>

        {project.media && (
          <div style={{ marginTop: "1rem" }}>
            <Image src={project.media} alt={`Uploaded media for project`} radius="md" />
          </div>
        )}
      </Paper>

      {/* Save Button */}
      <Group justify="flex-end" mt="xl">
        <Button onClick={handleSaveChanges} color="green">
          Save Changes
        </Button>
      </Group>
    </Container>
  );
};

export default EditProjectForm;
