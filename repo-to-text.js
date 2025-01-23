const fs = require("fs");
const path = require("path");

// Configuration
const MAX_DEPTH = 3;
const EXCLUDED_DIRS = [
  "node_modules",
  "dist",
  "build",
  ".git",
  "__tests__",
  "__mocks__",
  ".github",
  ".vscode",
  ".next",
];
const EXCLUDED_FILES = [
  ".test.",
  ".spec.",
  "test.",
  "spec.",
  ".d.ts",
  "pnpm-lock.yaml",
  "export-script.js",
  "package-lock.json",
  "README.md",
];
const ALLOWED_EXTENSIONS = new Set([
  ".ts", // TypeScript
  ".tsx", // TypeScript React
  ".js", // JavaScript
  ".jsx", // JavaScript React
  ".proto", // Protocol Buffers
  ".yaml", // YAML configs
  ".yml", // YAML configs
  ".json", // JSON configs
  ".md", // Documentation
]);

// Create output directory if it doesn't exist
const outputDir = "repo-to-text";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Helper function to check if file should be included
function shouldIncludeFile(filePath) {
  if (EXCLUDED_FILES.some((exclude) => filePath.includes(exclude))) {
    return false;
  }

  const ext = path.extname(filePath);
  return ALLOWED_EXTENSIONS.has(ext);
}

// Helper function to get normalized directory path parts
function getDirectoryParts(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const parts = relativePath.split(path.sep);
  return parts.slice(0, MAX_DEPTH);
}

// Helper function to create file group key
function createGroupKey(parts) {
  return parts.join("-");
}

// Helper function to count lines in content
function countLines(content) {
  return content.split("\n").length;
}

// Process directory and group files
function processDirectory(dir, baseDir = dir, depth = 0, fileGroups = {}) {
  const files = fs.readdirSync(dir);
  const dirParts = getDirectoryParts(dir, baseDir);
  const currentGroupKey = createGroupKey(dirParts);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (!EXCLUDED_DIRS.includes(file)) {
        // If we're at max depth, don't create new groups but still process files
        processDirectory(filePath, baseDir, depth + 1, fileGroups);
      }
    } else {
      // Check if file should be included
      if (!shouldIncludeFile(filePath)) return;

      // Use the current directory's group key
      // If we're beyond max depth, files will be included in the parent's group
      const groupKey = currentGroupKey;

      // Initialize group if it doesn't exist
      if (!fileGroups[groupKey]) {
        fileGroups[groupKey] = [];
      }

      try {
        const content = fs.readFileSync(filePath, "utf8");
        fileGroups[groupKey].push({
          path: path.relative(baseDir, filePath),
          content: content,
          lineCount: countLines(content),
        });
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
      }
    }
  });

  return fileGroups;
}

// Create output content with proper headers and formatting
function createOutputContent(files) {
  // Sort files by path for consistent output
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  return sortedFiles
    .map((file) => {
      const extension = path.extname(file.path).slice(1) || "txt";
      return `### ${file.path}\n\n\`\`\`${extension}\n${file.content}\n\`\`\`\n`;
    })
    .join("\n\n");
}

// Calculate total lines in a group
function calculateGroupStats(files) {
  const totalLines = files.reduce((sum, file) => sum + file.lineCount, 0);
  const fileDetails = files
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((file) => `  ${file.path}: ${file.lineCount} lines`)
    .join("\n");
  return { totalLines, fileDetails };
}

// Generate tree structure
function generateTree(dir, prefix = "", isLast = true, baseDir = dir) {
  const files = fs.readdirSync(dir);
  let treeOutput = "";

  // Filter and sort files/directories
  const items = files
    .filter((file) => {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
      if (isDirectory) {
        return !EXCLUDED_DIRS.includes(file);
      }
      return shouldIncludeFile(filePath);
    })
    .sort();

  items.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    const isLastItem = index === items.length - 1;

    // Create the branch symbol
    const branch = isLast ? "└── " : "├── ";
    const subBranch = isLast ? "    " : "│   ";

    // Add the current file/directory to the tree
    treeOutput += prefix + branch + file + "\n";

    // If it's a directory, recursively process its contents
    if (isDirectory) {
      treeOutput += generateTree(
        filePath,
        prefix + subBranch,
        isLastItem,
        baseDir,
      );
    }
  });

  return treeOutput;
}

// Main execution
console.log("Starting repository export...");
const startTime = Date.now();

try {
  // Process the repository
  const fileGroups = processDirectory(".");

  // Write output files
  Object.entries(fileGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([group, files]) => {
      if (files.length === 0) return;

      // Calculate group statistics
      const { totalLines, fileDetails } = calculateGroupStats(files);

      // Create a descriptive title for the file content
      const content = `# ${group} Files\n\n${createOutputContent(files)}`;

      // Create sanitized filename
      const filename = `${group.toLowerCase() || "root"}.txt`;
      const outputPath = path.join(outputDir, filename);

      fs.writeFileSync(outputPath, content);
      console.log(`Created ${outputPath}:`);
      console.log(`Total: ${totalLines} lines in ${files.length} files`);
      console.log("Files:");
      console.log(fileDetails);
      console.log("---");
    });

  // Generate and write tree structure
  const treeStructure = generateTree(".");
  const treeOutputPath = path.join(outputDir, "tree-structure.txt");
  fs.writeFileSync(treeOutputPath, treeStructure);
  console.log(`Created ${treeOutputPath}`);
  console.log("---");

  const endTime = Date.now();
  console.log(
    `Repository export completed successfully in ${(endTime - startTime) / 1000}s!`,
  );
} catch (error) {
  console.error("Error during repository export:", error);
}
