# Update PWA Screenshots

## Instructions for Replacing Screenshots

To replace the PWA installation screenshots with your real TourCompanion dashboard:

### 1. Prepare Your Screenshots

You need to create two versions of your dashboard screenshot:

**Desktop Screenshot (screenshot-wide.png):**
- Size: 1280x720 pixels
- Format: PNG
- Orientation: Landscape (wide)
- Content: Your TourCompanion dashboard in desktop view

**Mobile Screenshot (screenshot-mobile.png):**
- Size: 390x844 pixels  
- Format: PNG
- Orientation: Portrait (tall)
- Content: Your TourCompanion dashboard in mobile view

### 2. Replace the Files

Replace these files in the `public/` directory:
- `public/screenshot-wide.png` - Desktop PWA installation screenshot
- `public/screenshot-mobile.png` - Mobile PWA installation screenshot

### 3. Build the Application

After replacing the files, run:
```bash
npm run build
```

### 4. Test PWA Installation

1. Open your application in a browser
2. Look for the PWA install prompt
3. Verify the screenshots show your real TourCompanion dashboard

## Current Screenshot Locations

The manifest files are already configured to use:
- `/screenshot-wide.png` for desktop installations
- `/screenshot-mobile.png` for mobile installations

## Notes

- The screenshots will be shown in PWA installation prompts
- They should represent your actual application interface
- Make sure the screenshots are clear and professional-looking
- The current placeholder screenshots show a generic blue dashboard



