### Naming & File Structuring Conventions
- Everything uses kebab-case `product-card.ts` unless theres an agreed standard e.g. `useCustomHook` for hook
- Group related components in feature directories (e.g. `components/layout/search/filter/` contains all components used for search filtering
- Most UI components are 50-150 lines of code. Keep pages thin, move complex logic to components
- Use layouts for shared UI across routes

## State Management & Data Passing Patterns
- Begin with simple props passing - max 2 levels of components
- When stateful logic needs to be reused, move it to custom hooks.
- When props drilling becomes cumbersome or state needs to be widely available, use Context. (e.g. the global fliter state of jobs should be context)
- Pre-fetch the data in the next job page
- Load the essential data first and display the page, while other job listings and details are being loaded.
- Implement parallel data fetching when possible


## Next / React Features
- Intercepting Routes: Use intercepting routes for modal-like experiences.
- Lazy Loading: use when we can defer the loading of heavy components
- Error Boundaries: define error.tsx files to catch errors to prevent the entire site from breaking
- Add <Suspense/> boundaries for loading state
- Use useMemo for expensive calculations (e.g. filtered results)
- Use useRef to maintain filter input values

## Mantine Usage Guidelines

### Core Principles
- Use Mantine components only when they provide significant value beyond basic HTML/CSS
- Prefer simple HTML/CSS for basic layout and text elements
- Consider bundle size and complexity impact
