# Logo Setup Instructions

## How to Add Your PNG Logo

1. **Upload your PNG file to GitHub:**
   - Go to your GitHub repo: `https://github.com/froumes/austinxyz.lol`
   - Navigate to the `public` folder
   - Click "Add file" → "Upload files"
   - Upload your PNG file (the one **WITHOUT background**)
   - Name it `logo.png` (or update the filename in `components/logo.tsx` if you use a different name)

2. **The logo will automatically be available at:**
   - `/logo.png` (accessible from anywhere in your app)

## Current Setup

The logo component is already set up in:
- `components/logo.tsx` - Contains `Logo` and `LogoSimple` components
- Currently using `LogoSimple` in the header (simpler, no Next.js Image optimization needed)

## Usage Examples

```tsx
import { LogoSimple } from "@/components/logo"

// Basic usage
<LogoSimple size={32} alt="Your Logo" />

// With custom styling
<LogoSimple 
  size={48}
  className="hover:scale-110 transition-transform"
  style={{ opacity: 0.9 }}
/>
```

## Where the Logo is Currently Used

- Header navigation (next to "austinxyz.lol" text)
- You can add it anywhere else by importing and using the component

## Next Steps

1. Upload `logo.png` to the `public` folder on GitHub
2. The logo will automatically appear in the header
3. If you named it something else, update the filename in `components/logo.tsx` (line 48)

