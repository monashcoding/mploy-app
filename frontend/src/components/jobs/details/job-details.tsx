"use client";

import {
  Text,
  Title,
  Badge,
  Group,
  Button,
  Card,
  Stack,
  Image,
  Divider,
  ScrollArea,
  Box,
  Flex,
} from "@mantine/core";
import { IconMapPin, IconPencil, IconBriefcase2 } from "@tabler/icons-react";
import DOMPurify from "isomorphic-dompurify";
import { useFilterContext } from "@/context/filter/filter-context";
import { useEffect } from "react";

function formatISODate(isoDate: string): string {
  const date = new Date(isoDate);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html);
}

export default function JobDetails() {
  const { selectedJob, isLoading } = useFilterContext();
  if (!selectedJob || isLoading) {
    return (
      <div className="hidden lg:block">
        <div className="h-[calc(100vh-330px)] bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  const handleApplyClick = () => {
    window.open(selectedJob.application_url, "_blank"); // Open link in a new tab
  };

  return (
    <Card shadow="sm" padding="lg" radius="lg" className="h-full">
      <ScrollArea
        style={(theme) => ({
          paddingLeft: theme.spacing.md,
          paddingRight: theme.spacing.xl,
          paddingBottom: theme.spacing.md,
        })}
        type="hover"
      >
        {/* Header Section */}
        <Stack gap="sm" mb="md">
          <Group justify="space-between" align="top" mb="md">
            {/* Logo and Company Name */}
            <Group align="top" wrap="nowrap">
              <Image
                alt={selectedJob.company.name}
                src={selectedJob.company.logo}
                radius="20%"
                fit="contain"
                h={60}
                w={60}
                style={{ backgroundColor: "white" }}
              />
              <Text
                fw={500}
                mt="12px"
                style={{
                  textDecoration: "underline",
                  textDecorationColor: "var(--accent)",
                  textUnderlineOffset: "6px",
                  textDecorationThickness: "1px",
                }}
              >
                {selectedJob.company.name}
              </Text>
            </Group>

            {/* Apply Now Button */}
            <Button
              variant="filled"
              color="accent"
              radius="md"
              onClick={handleApplyClick}
            >
              <Text c="dark">Apply Now</Text>
            </Button>
          </Group>

          {/* Job Title */}
          <Title order={2}>{selectedJob.title}</Title>

          {/* Job Information section */}
          <Flex
            gap="xs"
            wrap="wrap"
            mb="sm"
            style={(theme) => ({
              flexDirection: "row",
              [`@media (maxWidth: ${theme.breakpoints.sm}px)`]: {
                flexDirection: "column",
                alignItems: "center",
              },
            })}
          >
            {/* Locations */}

            <IconMapPin size={20} stroke={1.5} />
            {selectedJob.locations?.map((location) => (
              <Badge key={location} color="dark.4" size="lg" radius="lg">
                {location}
              </Badge>
            ))}
            <Divider
              color="accent"
              orientation="vertical"
              style={(theme) => ({
                display: "block",
                [`@media (maxWidth: ${theme.breakpoints.sm}px)`]: {
                  display: "none",
                },
              })}
            />

            {/* Post Date */}
            <Text size="sm">
              Posted {formatISODate(selectedJob.created_at)}
            </Text>
            <Divider color="accent" orientation="vertical" />

            {/* Job Type */}
            <Text size="sm">{selectedJob.type}</Text>
          </Flex>
        </Stack>

        {/* Description Section */}
        <Stack gap="sm" mt="md" mb="lg">
          <Group gap="xs">
            <IconPencil size={20} stroke={1.5} />
            <Title
              order={4}
              style={{
                textDecoration: "underline",
                textDecorationColor: "var(--accent)",
                textUnderlineOffset: "6px",
                textDecorationThickness: "1px",
              }}
            >
              Job Description
            </Title>
          </Group>
          <Box
            style={{
              lineHeight: 1.6, // Adjust line height for better readability
              "& p": {
                mb: "100rem", // Add spacing between paragraphs
              },
              "& ul": {
                mb: "100rem", // Add spacing below unordered lists
                paddingLeft: "1.5rem", // Add left padding for list items
              },
              "& li": {
                marginBottom: "0.5rem", // Add spacing between list items
              },
              "& h2": {
                marginTop: "1.5rem", // Add spacing above headings
                marginBottom: "1rem", // Add spacing below headings
                fontSize: "1.5rem", // Adjust font size for headings
              },
            }}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(selectedJob.description || ""),
              }}
            />
          </Box>
        </Stack>

        {/* Working Rights Section */}
        <Stack gap="sm" mt="md" mb="md">
          <Group gap="xs">
            <IconBriefcase2 size={20} stroke={1.5} />
            <Title
              order={4}
              style={{
                textDecoration: "underline",
                textDecorationColor: "var(--accent)",
                textUnderlineOffset: "6px",
                textDecorationThickness: "1px",
              }}
            >
              Working Rights
            </Title>
          </Group>
          <Group gap="xs" wrap="wrap">
            {selectedJob.working_rights?.map((rights) => (
              <Badge key={rights} color="dark.4" size="lg" radius="md">
                {rights}
              </Badge>
            ))}
          </Group>
        </Stack>
      </ScrollArea>
    </Card>
  );
}
