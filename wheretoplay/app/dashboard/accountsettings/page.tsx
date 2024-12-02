"use client";

import { useState, useEffect } from "react";
import {
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Card,
  Title,
  Text,
  Divider,
  Group,
  Container,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { showNotification } from "@mantine/notifications";
import axios from "axios";

export default function AccountSettingsPage() {
  const [email, setEmail] = useState<string>("Loading...");
  const [mailLoading, setMailLoading] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEmail = async () => {
      const TOKEN = localStorage.getItem("accessToken");
      const RefreshToken = localStorage.getItem("refreshToken");

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/email/`,
          {
            headers: { Authorization: `Bearer ${TOKEN}` },
          }
        );
        setEmail(response.data.email);
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
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/query/email/`,
              {
                headers: {
                  Authorization: `Bearer ${refreshResponse.data.access}`,
                },
              }
            );
            setEmail(response.data.email);
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            router.push("/login");
          }
        } else {
          console.error("Failed to fetch email:", error);
        }
      }
    };

    fetchEmail();
  }, [router]);

  const emailForm = useForm({
    initialValues: { newEmail: "" },
    validate: {
      newEmail: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validate: {
      newPassword: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters long",
      confirmNewPassword: (value, values) =>
        value === values.newPassword ? null : "Passwords do not match",
    },
  });

  const handleEmailSubmit = async (values: typeof emailForm.values) => {
    const TOKEN = localStorage.getItem("accessToken");
    const RefreshToken = localStorage.getItem("refreshToken");
    setMailLoading(true);
    setMailError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/change/email/`,
        { newEmail: values.newEmail },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (response.status === 200) {
        setEmail(values.newEmail);
        emailForm.reset();
        showNotification({
          title: "Success",
          message: "Email updated successfully",
          color: "green",
        });
      }
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

          await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/change/email/`,
            { newEmail: values.newEmail },
            {
              headers: {
                Authorization: `Bearer ${refreshResponse.data.access}`,
              },
            }
          );
          setEmail(values.newEmail);
          emailForm.reset();
          showNotification({
            title: "Success",
            message: "Email updated successfully",
            color: "green",
          });
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      } else {
        setMailError("Could not update email. Please try again.");
        console.error("Email update error:", error);
      }
    } finally {
      setMailLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: typeof passwordForm.values) => {
    const TOKEN = localStorage.getItem("accessToken");
    const RefreshToken = localStorage.getItem("refreshToken");
    setPassLoading(true);
    setPassError(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/change/password/`,
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );

      if (response.status === 200) {
        passwordForm.reset();
        showNotification({
          title: "Success",
          message: "Password updated successfully",
          color: "green",
        });
      }
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

          await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/change/password/`,
            {
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
              confirmNewPassword: values.confirmNewPassword,
            },
            {
              headers: {
                Authorization: `Bearer ${refreshResponse.data.access}`,
              },
            }
          );
          passwordForm.reset();
          showNotification({
            title: "Success",
            message: "Password updated successfully",
            color: "green",
          });
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      } else {
        setPassError("Could not update password. Please try again.");
        console.error("Password update error:", error);
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title align="center" mb="lg">
        Account Settings
      </Title>
      <Stack spacing="lg">
        {/* Email Update Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="sm">
            Update Email
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            Current email: {email}
          </Text>
          <Divider mb="md" />
          <form onSubmit={emailForm.onSubmit((values) => handleEmailSubmit(values))}>
            <Stack spacing="md">
              <TextInput
                label="New Email"
                placeholder="you@example.com"
                withAsterisk
                {...emailForm.getInputProps("newEmail")}
              />
              {mailError && <Text color="red" size="sm">{mailError}</Text>}
              <Group position="right">
                <Button type="submit" loading={mailLoading}>
                  {mailLoading ? "Updating..." : "Update Email"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>

        {/* Password Update Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={3} mb="sm">
            Update Password
          </Title>
          <Divider mb="md" />
          <form onSubmit={passwordForm.onSubmit((values) => handlePasswordSubmit(values))}>
            <Stack spacing="md">
              <PasswordInput
                label="Current Password"
                placeholder="Enter your current password"
                withAsterisk
                {...passwordForm.getInputProps("currentPassword")}
              />
              <PasswordInput
                label="New Password"
                placeholder="Enter a new password"
                withAsterisk
                {...passwordForm.getInputProps("newPassword")}
              />
              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                withAsterisk
                {...passwordForm.getInputProps("confirmNewPassword")}
              />
              {passError && <Text color="red" size="sm">{passError}</Text>}
              <Group position="right">
                <Button type="submit" loading={passLoading}>
                  {passLoading ? "Updating..." : "Update Password"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
