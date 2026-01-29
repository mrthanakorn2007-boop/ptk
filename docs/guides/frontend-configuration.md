# Configuration & White-Labeling

This project is designed to be white-labeled for different schools. The configuration is centralized in `src/data/school-config.json` and CSS variables in `src/app/globals.css`.

## School Data (`src/data/school-config.json`)

This JSON file contains all the static data specific to the school.

```json
{
  "name": {
    "th": "โรงเรียน...",       // Full Thai Name
    "en": "...",              // Full English Name
    "short": {
      "th": "...",            // Short Thai Name (Abbreviation)
      "en": "..."             // Short English Name (Abbreviation)
    }
  },
  "description": { ... },     // Meta description for SEO
  "address": { ... },         // Address displayed in footers/contact
  "images": {
    "logo": "/logo.svg",      // Main application logo (public/ folder)
    "cardLogo": "/logo.png"   // Alternative logo for cards/IDs
  },
  "links": { ... },           // Social media and website links
  "contact": { ... }          // Phone and email
}
```

### How to Change School Branding
1.  **Update Data:** Modify the values in `src/data/school-config.json`.
2.  **Update Assets:** Replace the logo files in `public/` (e.g., `logo.svg`) or point `images.logo` to new filenames.

## Theming & Colors (`src/app/globals.css`)

The application uses **Tailwind CSS v4** with CSS variables for branding colors. This allows for easy theme switching without changing class names in components.

### Core Variables

| Variable | Description | Usage Example |
| :--- | :--- | :--- |
| `--brand-primary` | The main brand color (e.g., Pink/Red for PTK) | Buttons, Highlights |
| `--brand-secondary` | Secondary accent color (e.g., Blue) | Gradients, Accents |
| `--brand-primary-gradient` | A gradient derived from the primary color | Main Headers, Call-to-Actions |
| `--brand-secondary-gradient` | A gradient derived from the secondary color | Secondary Buttons |

### Changing the Theme
1. Open `src/app/globals.css`.
2. Locate the `@theme inline` block or the `:root` variables.
3. Update the Hex/RGB values for the brand variables.

```css
@layer base {
  :root {
    /* Example: Changing to a Green Theme */
    --brand-primary: #10b981;
    --brand-secondary: #3b82f6;
    /* ... update gradients accordingly ... */
  }
}
```

## Environment Variables

The application requires specific environment variables to function correctly. Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The anonymous public key for Supabase. |
| `NEXT_PUBLIC_API_URL` | The URL of the custom backend (e.g., `http://localhost:4001`). |
