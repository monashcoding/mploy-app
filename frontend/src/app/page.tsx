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
    <Center style={{ height: "100vh", flexDirection: "column" }}>
      <Title order={1} mb="lg">
        Discover the role you've been dreaming of
      </Title>
      <Group gap="md" align="center">
        <Button autoContrast size="lg" variant="filled" color="#FFE22F" onClick={handleGradJobsClick}>
          Search Grad Jobs
        </Button>
        <Button autoContrast size="lg" variant="filled" color="#FFE22F" onClick={handleInternJobsClick}>
          Search Intern Jobs
        </Button>
      </Group>
    </Center>
  );
}
