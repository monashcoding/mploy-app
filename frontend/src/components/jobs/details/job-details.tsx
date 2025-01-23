"use client";

import {
  Text,
  Title,
  Badge,
  Group,
  Button,
  Card,
  Stack,
  Avatar,
  Divider,
  ScrollArea,
} from "@mantine/core";
import {
  IconMapPin,
  IconPencil,
  IconBook2,
  IconBriefcase2,
} from "@tabler/icons-react";

interface JobDetailsProps {
  title: string;
  company: string;
  jobType: string;
  locations: string[];
  description: string;
  studyFields: string[];
  workingRights: string[];
  posted: string;
  applicationURL: string;
  logo?: string;
}

export default function JobDetails({
  title,
  company,
  jobType,
  locations,
  description,
  studyFields,
  workingRights,
  posted,
  applicationURL,
  logo,
}: JobDetailsProps) {
  const handleApplyClick = () => {
    window.open(applicationURL, "_blank"); // Open link in a new tab
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" className="h-full">
      <ScrollArea
        style={{
          maxHeight: "500px",
          paddingLeft: "16px",
          paddingRight: "24px",
        }}
        type="hover"
      >
        {/* Header Section */}
        <Stack gap="sm" mb="md">
          <Group justify="space-between" align="center" mb="md">
            {/* Logo and Company Name */}
            <Group align="top">
              <Avatar src={logo} size="lg" radius="md"/>
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
                {company}
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
          <Group gap="xs" wrap="wrap" mb="sm">
              {/* Locations */}
              
                <IconMapPin size={20} stroke={1.5} />
                {locations.map((location) => (
                  <Badge autoContrast key={location} color="dark.4" size="lg">
                    {location}
                  </Badge>
                ))}
            <Divider color="rgb(255, 226, 47)" orientation="vertical" />

            {/* Post Date */}
            <Text size="sm">Posted {posted}</Text>
            <Divider color="rgb(255, 226, 47)" orientation="vertical" />

            {/* Job Type */}
            <Text size="sm">{jobType}</Text>
          </Group>
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
          <Text size="sm">{description}</Text>
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
              <Badge autoContrast key={field} color="dark.4" size="lg">
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
              <Badge autoContrast key={rights} color="dark.4" size="lg">
                {rights}
              </Badge>
            ))}
          </Group>
        </Stack>
      </ScrollArea>
    </Card>
  );
}
