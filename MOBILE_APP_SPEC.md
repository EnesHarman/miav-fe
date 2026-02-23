# Miav Mobile App - Product Specification & UX Flows

## 1. Project Overview
Miav is a pet health and management application that allows users to track their pets' growth, health, and vaccines. It features an "AI Vet" (Mia) which provides consultations based on user messages and image uploads.

---

## 2. Core User Actions & Flows

### 2.1. Authentication
*   **Sign Up:** User can create an account using email and password.
*   **Sign In:** User can log in with email and password.
*   **Social Auth:** Redirect flow via Google/Social OAuth.
*   **Protected Access:** All pet-related and profile features require a valid session (JWT).

### 2.2. Onboarding & Pet Management
*   **Add New Pet (3-Step Wizard):**
    1.  **Photos:** Upload up to 5 photos. The first becomes the profile picture.
    2.  **Details:** Enter name, species (Cat, Dog, Other), breed, gender, birth date, weight, chip number, and a short bio.
    3.  **Confirm:** Review all details before saving.
*   **Delete Pet:** Permanently remove a pet and all its history (requires confirmation).

### 2.3. Dashboard (Home)
*   **Personalized Greeting:** Changes based on the time of day.
*   **Pet Gallery:** View a list of all owned pets.
*   **Quick Add:** Empty slots or a "Plus" button for adding more pets.

### 2.4. Pet Detail (Health & Management)
Once a pet is selected, the user accesses a tabbed interface:

#### Tab 1: Information
*   **Summary Card:** Quick view of name, species, gender, neutered status, age (calculated from birth date), and current weight.
*   **Detailed Bio:** Read-only view of the pet's personality and notes.
*   **Physical Info:** Breed, Birth Date, Current Weight, and Chip Number.

#### Tab 2: Health & Growth
*   **Growth Records:** Add new weight entries with specific dates.
*   **Visual Tracking:** View weight trends via interactive charts.
*   **Mood & Appetite:** (Upcoming/Backend ready) Track mood scores and appetite levels.

#### Tab 3: Vaccines
*   **Vaccine History:** View a list of administered vaccines grouped by type.
*   **Next Due Date:** Smart tracking of upcoming vaccine requirements.
*   **New Record:** Add details like clinic name, date, and reaction severity (None, Mild, Severe).

#### Tab 4: Gallery
*   **Photo List:** View all images associated with the pet.
*   **Full Image View:** Click to expand or manage images.

### 2.5. AI Vet Consultation (Mia)
Available from the Pet Detail screen:
*   **Start Consultation:** Open a chat-like interface.
*   **Interactive Chat:**
    *   Send text messages asking about health, diet, or behavior.
    *   **Image Support:** Attach photos (e.g., of a symptom or food label) for the AI to analyze.
*   **AI Analysis:** The AI provides responses with:
    *   **Urgency Level:** (Low, Medium, High) to indicate if a vet visit is needed.
    *   **Confidence Score:** How certain the AI is about its advice.
*   **History:** View previous consultations for that specific pet.

### 2.6. User Profile
*   **Avatar Management:** Upload/Change personal profile picture.
*   **Personal Details:** Update first name, last name, phone number, city, and bio.
*   **Language Preference:** Switch app language (EN, TR, DE, ES, FR).

---

## 3. Screen Layout (UX Concept)

1.  **Auth Screen:** Simple, clean entry with Tab switch for Login/Register.
2.  **Dashboard Screen:** Hero section with greeting + scrollable pet cards.
3.  **Add Pet Wizard:** Linear progress indicator at the top. Simple, large inputs.
4.  **Pet Detail Screen:** 
    *   Top: Back button + AI Vet Chat button + Delete button (subtle).
    *   Header: Pet Avatar + Key Stats (Name, Age, Weight).
    *   Body: Tab switcher (Info, Growth, Vaccines, Gallery).
5.  **Chat Interface:** Full-screen overlay or sheet. Bubbles for user/AI. Image preview area above input.
6.  **Profile Screen:** Settings-style list with an avatar upload section at the top.

---

## 4. Integration Note
*   **Backend:** All contracts are defined in the Mac-BAM file. No payload definitions required in this UI spec.
*   **Platform:** This specification targets **Swift (iOS)** development using modern UI patterns.
