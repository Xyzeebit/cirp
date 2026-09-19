Community Issues Report Platform a platform that allows residents to report local community problems (such as bad roads, potholes, broken streetlights, flooding, waste disposal, water shortages, power grid instability, Gender-Based Violence (GBV), Prepaid Electricity Metering Shortages, Child Labor & Vulnerable Youths, Kidnappings and Banditry, Insurgency & Militancy, Oil Spills and Pollution, security concerns or others if not listed).


# Key Features & Requirements

### 1. User & Authentication Features
- User registration and login system.
- User profile dashboard displaying "My Reports", "Saved Issues", and account info.
- Anonymous user

### 2. Issue Reporting Workflow
- *Form Fields:* Issue title, category dropdown, detailed description, location address, photo upload, date reported, and optional contact info.
- *Location Selector:* 
  - Allow users to enter an address manually in a text field.
  - Integrate an interactive location picker (Google Maps API or Leaflet.js fallback) to let users pin or automatically detect lat/long coordinates.
- *Photo Upload:* Support image attachment/snapshot uploading with each report submission.

### 3. Tracking & Status System
- Issues must support status tracking stages: Submitted, Under Review,  Rejected(if resolved).
- Status updates must reflect immediately on issue detail views and user dashboards.

### 4. Feed & Public Integration
- *Homepage Live Feed:* Newly submitted or uploaded issues must automatically display on the homepage feed dynamically upon page refresh or post creation.
- *Filtering & Search:* Allow users to filter issues on the platform by status (e.g., All, Nearby, Trending, Resolved) or category.

---

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
