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
import {
  IconMapPin,
  IconPencil,
  IconBook2,
  IconBriefcase2,
} from "@tabler/icons-react";
import DOMPurify from "isomorphic-dompurify";

interface JobDetailsProps {
  id: string;
  title: string;
  company: {
    name: string;
    website: string;
    logo?: string;
  };
  description: string;
  type: string;
  locations: string[];
  studyFields: string[];
  workingRights: string[];
  applicationUrl: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function JobDetails({
  //id,
  title,
  company,
  description,
  type,
  locations,
  studyFields,
  workingRights,
  applicationUrl,
  //closeDate,
  createdAt,
  //updatedAt,
}: JobDetailsProps) {
  const handleApplyClick = () => {
    window.open(applicationUrl, "_blank"); // Open link in a new tab
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" className="h-full">
      <ScrollArea
        style={(theme) => ({
          maxHeight: "500px",
          paddingLeft: theme.spacing.sm,
          paddingRight: theme.spacing.xl,
          [`@media (maxWidth: ${theme.breakpoints.sm}px)`]: {
            maxHeight: "400px",
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
          },
        })}
        type="hover"
      >
        {/* Header Section */}
        <Stack gap="sm" mb="md">
          <Group justify="space-between" align="top" mb="md">
            {/* Logo and Company Name */}
            <Group align="top" wrap="nowrap">
              <Image
                alt={company.name}
                src={company.logo}
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
                  textDecorationColor: "rgb(255, 226, 47)",
                  textUnderlineOffset: "6px",
                  textDecorationThickness: "1px",
                }}
              >
                {company.name}
              </Text>
            </Group>

            {/* Apply Now Button */}
            <Button
              variant="filled"
              color="rgb(255, 226, 47)"
              radius="md"
              onClick={handleApplyClick}
            >
              <Text c="dark">Apply Now</Text>
            </Button>
          </Group>

          {/* Job Title */}
          <Title order={2}>{title}</Title>

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
            {locations.map((location) => (
              <Badge key={location} color="dark.4" size="lg" radius="lg">
                {location}
              </Badge>
            ))}
            <Divider
              color="rgb(255, 226, 47)"
              orientation="vertical"
              style={(theme) => ({
                display: "block",
                [`@media (maxWidth: ${theme.breakpoints.sm}px)`]: {
                  display: "none",
                },
              })}
            />

            {/* Post Date */}
            <Text size="sm">Posted {formatISODate(createdAt)}</Text>
            <Divider color="rgb(255, 226, 47)" orientation="vertical" />

            {/* Job Type */}
            <Text size="sm">{type}</Text>
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
                textDecorationColor: "rgb(255, 226, 47)",
                textUnderlineOffset: "6px",
                textDecorationThickness: "1px",
              }}
            >
              Job Description
            </Title>
          </Group>
          <Box style={{
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
  }}>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(description),
              }}
            />
          </Box>
        </Stack>

        {/* Study Field Section */}
        <Stack gap="sm" mt="md" mb="md">
          <Group gap="xs">
            <IconBook2 size={20} stroke={1.5} />
            <Title
              order={4}
              style={{
                textDecoration: "underline",
                textDecorationColor: "rgb(255, 226, 47)",
                textUnderlineOffset: "6px",
                textDecorationThickness: "1px",
              }}
            >
              Study Fields
            </Title>
          </Group>
          <Group gap="xs" wrap="wrap">
            {studyFields.map((field) => (
              <Badge key={field} color="dark.4" size="lg" radius="md">
                {field}
              </Badge>
            ))}
          </Group>
        </Stack>

        {/* Working Rights Section */}
        <Stack gap="sm" mt="md" mb="md">
          <Group gap="xs">
            <IconBriefcase2 size={20} stroke={1.5} />
            <Title
              order={4}
              style={{
                textDecoration: "underline",
                textDecorationColor: "rgb(255, 226, 47)",
                textUnderlineOffset: "6px",
                textDecorationThickness: "1px",
              }}
            >
              Working Rights
            </Title>
          </Group>
          <Group gap="xs" wrap="wrap">
            {workingRights.map((rights) => (
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
