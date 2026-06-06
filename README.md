# Isanutri V5 — Enterprise Nutritional Management Platform

Isanutri V5 is a high-performance Single Page Application (SPA) designed for professional nutritionists. The platform provides comprehensive patient management, structured clinical assessments, an advanced algorithmic meal plan generator, and a secure dedicated Patient Portal for real-time diet tracking.

---

## 🏗️ Architecture & Engineering Trade-offs

During development, we prioritized production-grade practices, performance, security, and developer experience. Below are the core engineering decisions made for the project:

### 1. Frontend Runtime & Compilation
*   **React 19 & TypeScript (Strict Mode)**: Leveraged the latest React features with strict compiler checks (`"strict": true` in `tsconfig.json`). Type assertions were systematically refactored, and explicit `any` types were eliminated in favor of robust generic typing and domain-specific interfaces, ensuring compile-time safety against null or undefined pointers.
*   **Vite 6 & Asset Bundling**: Replaced heavy loaders with Vite’s extremely fast `esbuild`-powered compilation.
*   **Lazy Loading & Code Splitting**: Converted static page imports into dynamic, code-split routes using `React.lazy` and `Suspense`. This optimization reduced the initial javascript bundle size downloaded on login by **over 53%** (from **1.6 MB** to **764 KB**), significantly improving Largest Contentful Paint (LCP) and initial page load times.

### 2. Native Tailwind CSS v4 Integration (Performance vs. CDN)
*   **The Trade-off**: The legacy codebase loaded Tailwind via an online CDN script. This required downloading a ~3MB runtime parser in the client's browser, leading to layout flashing, delayed styles, and high network overhead.
*   **The Solution**: Configured Tailwind CSS v4 as a native compile-time plugin (`@tailwindcss/vite`). All utility classes are now scanned directly from the files, compiled, tree-shaken, and optimized into a static, minified production stylesheet of less than 20KB. This removes all external CDN runtime dependencies, making the site fully operational offline and speeding up page rendering.

### 3. Database Architecture & Firestore Security Model
*   **Nested Subcollection Partitioning**: Patient records, diets, and appointments are stored under hierarchical paths:
    *   `/users/{nutritionistId}/patients/{patientId}`
    *   `/users/{nutritionistId}/diets/{dietId}`
    *   `/users/{nutritionistId}/appointments/{apptId}`
*   **Server-Side Query Filtering**: Refactored data loading to run index-backed server-side queries (using Firestore `where()` clauses) instead of fetching entire collections and filtering data on the client. This approach minimizes read operations and bandwidth consumption.
*   **Declarative Security Rules (`firestore.rules`)**:
    *   Nutritionists are granted full read/write capabilities strictly inside their own `/users/{request.auth.uid}/` workspaces.
    *   Patients are authorized via `patientProfiles/{patientUid}`. Upon login, the patient is restricted to reading only their own profile, diets, and appointments, and updating specific properties of their patient document (such as adherence logging and guided self-evaluation).

### 4. Bilingual Architecture (i18n)
*   Fully integrated `i18next` and `react-i18next` for seamless dynamic translation.
*   English is configured as the primary default language, with Portuguese (Brazilian) as the alternative.
*   The chosen language is persisted in the client's `localStorage` and managed globally via a custom Segmented Control language switcher integrated into the navigation layout.

---

## 🧮 Domain Logic & Clinical Constraints Engine

The core domain service manages patient calculations and diet building according to validated medical paradigms:

### Basal Metabolic Rate (BMR) & Daily Expenditure
The engine implements the clinical **Mifflin-St Jeor Equation**:

$$\text{BMR (Male)} = (10 \times \text{weight\_kg}) + (6.25 \times \text{height\_cm}) - (5 \times \text{age}) + 5$$

$$\text{BMR (Female)} = (10 \times \text{weight\_kg}) + (6.25 \times \text{height\_cm}) - (5 \times \text{age}) - 161$$

The Total Daily Energy Expenditure (TDEE) is calculated by multiplying the BMR by the patient's physical activity factor (ranging from $1.2$ for sedentary to $1.9$ for extremely active).

### Clinical Filtering & Meal Assembly
The diet algorithm builds target meal plans while validating critical dietary safety flags:
*   **NOVA 4 Ultraprocessed Exclusion**: Hard block on any food labeled under the NOVA 4 classification (ultra-processed food items).
*   **Sodium Limit**: A strict threshold (capped at 2000mg/day) is enforced for patients with hypertensive history.
*   **Diabetes Optimization**: Carbs and sugars are monitored, and low-glycemic options are selected for diabetic patients.
*   **Allergen Checks**: Lactose-free, gluten-free, and custom clinical exclusions are filtered out at the food library query stage before meal construction.

---

## 🧪 Testing & Validation Strategy

The codebase contains a comprehensive multi-layered test suite to guarantee software stability:

1.  **Unit Tests (Vitest + jsdom)**:
    *   `src/services/__tests__/metabolicCalculations.test.ts`: Verifies Mifflin-St Jeor math, BMR/TDEE activity factors, BMI bounds, weight goals, and macronutrient targets.
    *   `src/services/__tests__/dietAlgorithmService.test.ts`: Validates meal planning logic, NOVA 4 exclusions, allergen filters, sodium ceilings, and pro-rata calorie scaling.
2.  **Component Integration Tests**:
    *   `src/components/__tests__/MealOptionTable.test.tsx`: Tests rendering of food lists, calorie calculations, warning overlays for high sodium, and interactive alternative menus.
3.  **End-to-End Tests (Playwright)**:
    *   `tests-e2e/critical-flow.spec.ts`: Automatically spins up a test server, registers a new nutritionist with a dynamic email, accesses the dashboard, navigates configuration, and toggles Dark/Light modes, verifying the document elements and classes in the actual browser DOM.

To execute the local test runner:
```bash
# Run unit and component tests
npm run test

# Run Playwright E2E tests
npm run test:e2e
```

---

## 🛠️ Local Setup & Environment Config

### Prerequisites
*   Node.js v18 or newer
*   npm v9 or newer

### Installation Steps

1.  **Clone and Navigate**:
    ```bash
    git clone <repository-url>
    cd "Isanutri V5"
    ```

2.  **Install Packages**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Copy the environment template:
    ```bash
    cp .env.example .env.local
    ```
    Open `.env.local` and fill in your Firebase credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key_here
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
    VITE_FIREBASE_PROJECT_ID=your_project_id_here
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
    VITE_FIREBASE_APP_ID=your_app_id_here
    ```

4.  **Launch Dev Server**:
    ```bash
    npm run dev
    ```
    Open the address shown in your terminal (typically `http://localhost:5173` or `http://localhost:5001`).

5.  **Lint and Format Checks**:
    Before committing any code, run quality checks:
    ```bash
    npm run lint          # Run ESLint
    npm run type-check    # Strict TypeScript check
    npx prettier --check "src/**/*.{ts,tsx,css,json,md}" "index.html" # Code formatting
    ```

---

## ⚙️ CI/CD Pipeline

A continuous integration (CI) workflow is defined in `.github/workflows/ci.yml` and is triggered on every push or Pull Request to `main`. It guarantees that no broken or unformatted code is merged by automatically executing:
1.  Code formatting validation (Prettier)
2.  Linter execution (ESLint)
3.  Compiler checks (strict TypeScript compilation)
4.  Unit/Component test runs (Vitest)
5.  E2E critical flow test runs (Playwright with headless Chromium)
