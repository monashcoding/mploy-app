import { Text, Title, Badge, Group, Button, Card, Stack, Avatar, Divider }  from "@mantine/core";
import {IconMapPin} from '@tabler/icons-react';

interface JobDetailsProps {
  title: string;
  company: string;
  type: string;
  locations: string[];
  description: string;
  studyFields: string[];
  workingRights: string[];
  posted: string;
  logo?: string; 
}

export default function JobDetails({
  title,
  company,
  type,
  locations,
  description,
  studyFields,
  posted,
  logo,
  workingRights,
}: JobDetailsProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full">
      {/* Header Section */}
      <Stack gap="sm" mb="md">
        <Group justify="space-between" align="center" mb="md">
          {/* Logo and Company Name */}
          <Group align="center">
            <Avatar src={logo} size="lg" radius="md" />
            <Text fw={500}>{company}</Text>
          </Group>

          {/* Apply Now Button */}
          <Button variant="filled" color="rgb(255, 226, 47)" radius="md">
            <Text c="dark">Apply Now</Text>
          </Button>
        </Group>
        
        <Title order={2}>
          {title}
        </Title>
        <Group>
          <IconMapPin
            size={20}
            stroke={1.5}
          />
          <Group gap="xs" wrap="wrap">
            {locations.map((location) => (
              <Badge autoContrast key={location} color="dark.4" size="lg">
                {location}
              </Badge>
            ))}
          </Group>
          <Divider color="rgb(255, 226, 47)" orientation="vertical"/>
          <Text size="sm">
            Posted {posted}
          </Text>
          <Divider color="rgb(255, 226, 47)" orientation="vertical"/>
          <Text size="sm">
            {type}
          </Text>
        </Group>
        
      </Stack>


      {/* Description Section */}
      <Stack gap="sm" mt="md" mb="lg">
        <Title order={4}>Job Description</Title>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </Stack>


      {/* Study Field Section */}
      <Stack gap="sm" mt="md" mb="md">
        <Title order={4}>Study Fields</Title>
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
        <Title order={4}>Working Rights</Title>
        <Group gap="xs" wrap="wrap">
          {workingRights.map((rights) => (
            <Badge autoContrast key={rights} color="dark.4" size="lg">
              {rights}
            </Badge>
          ))}
        </Group>
      </Stack>
      
    </Card>
  );
}
