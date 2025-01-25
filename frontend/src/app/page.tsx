"use client";

import { Button, Stack, Title, Center, Group } from "@mantine/core";

export default function Page() {
  const handleGradJobsClick = () => {
    // Navigate to the grad jobs page or perform a search action
    console.log("Search Grad Jobs");
  };

  const handleInternJobsClick = () => {
    // Navigate to the intern jobs page or perform a search action
    console.log("Search Intern Jobs");
  };
  return (
    <Center style={{ height: "100vh", flexDirection: "column"}}>
      <Title order={1} mb="xl">
        Discover your Dream Job
      </Title>
      <Group gap="xl" align="center">
        <Button mt="xl" autoContrast size="lg" variant="filled" color="#FFE22F" radius="lg" onClick={handleGradJobsClick}>
          Search Grad Jobs →
        </Button>
        <Button mt="xl" autoContrast size="lg" variant="filled" color="#FFE22F" radius="lg" onClick={handleInternJobsClick}>
          Search Internips →
        </Button>
      </Group>
    </Center>
  );
}
