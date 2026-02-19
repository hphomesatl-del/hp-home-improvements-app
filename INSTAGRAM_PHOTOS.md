# Adding Instagram Photos to Portfolio

## Quick Setup

**Folder Location:**
```
/Users/greghutzell/.openclaw/workspace/hp-home-improvements-app/frontend/public/sample-photos/
```

This folder is already created. You can now download photos from Instagram and place them here.

---

## How to Download Photos from Instagram

### Step 1: Find #hphomeimprovements Posts
1. Go to [Instagram.com](https://instagram.com)
2. Search for `#hphomeimprovements`
3. Click on any post to see the full image

### Step 2: Save the Image
**On Mac:**
1. Right-click the image
2. Select "Save Image As..."
3. Name it something descriptive: `kitchen-before-1.jpg`, `kitchen-after-1.jpg`, etc.
4. Save location: `/Users/greghutzell/.openclaw/workspace/hp-home-improvements-app/frontend/public/sample-photos/`

**Naming Convention (recommended):**
```
kitchen-before-1.jpg
kitchen-before-2.jpg
kitchen-after-1.jpg
kitchen-after-2.jpg
bathroom-before-1.jpg
bathroom-after-1.jpg
kitchen-demo.jpg
kitchen-framing.jpg
kitchen-finished.jpg
```

### Step 3: Refresh the App
Once you've added photos, refresh your browser at:
```
http://localhost:3000/portfolio
```

The photos will automatically appear in the gallery!

---

## Photo Gallery Features

✅ **Grid Layout** — Automatically arranged in responsive grid
✅ **Hover Captions** — Shows on hover with photo description
✅ **Click to Enlarge** — Click any photo to view full-size in modal
✅ **Before/After** — Organize by phase (before, after, etc.)

---

## Example: Update Portfolio Page with Captions

After adding photos, you can update `frontend/src/pages/Portfolio.js` to add captions:

```javascript
const photoList = [
  { id: 1, src: '/sample-photos/kitchen-before-1.jpg', caption: 'Kitchen Before - Demo Phase', alt: 'Before photo' },
  { id: 2, src: '/sample-photos/kitchen-after-1.jpg', caption: 'Kitchen After - Completed', alt: 'After photo' },
  { id: 3, src: '/sample-photos/kitchen-finished.jpg', caption: 'Kitchen Final - Move-In Ready', alt: 'Finished kitchen' },
];
```

---

## Tips

- **Best Image Size:** 500-1500px wide (compressed JPGs are faster)
- **Quantity:** Start with 10-15 photos showing different projects/phases
- **Variety:** Mix before/during/after shots
- **Naming:** Use descriptive names for easy organization

---

## See It Live

Your portfolio page is at: **http://localhost:3000/portfolio**

Once you add photos, they'll appear automatically!

---

## Automate Later (Optional)

When ready, we can build a script to:
- Automatically fetch from Instagram API
- Download images in bulk
- Resize and optimize
- Generate captions from Instagram posts

Just let me know!
