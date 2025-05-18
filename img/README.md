# Cat Images for FocusPaws

This directory contains images used in the FocusPaws productivity app. The following images are needed:

1. `cat-working.png` - Cat during focus mode (working)
2. `cat-resting.png` - Cat during break mode (resting)
3. `cat-waiting.png` - Cat during paused timer (waiting)
4. `cat-idle.png` - Cat at idle state
5. `cat-celebration.png` - Cat celebrating task completion
6. `cat-no.png` - Cat blocking distracting website

If these images are missing, the app will use fallback SVG icons, but for the best experience, add proper cat-themed images.

## Missing Images? 

Create default cat images with any image editor or AI image generator with the following specifications:
- Size: 200px x 200px
- Format: PNG with transparency
- Style: Cartoon or illustrated cats that match each state

You can also copy focus_paws.png and pawshield.png as temporary replacements for any missing images.

## Required Images

For proper functionality, please create or obtain the following images and save them in this directory:

1. **pawshield.png** - Logo showing a cat paw with a shield design
2. **cat-working.png** - Cat focusing on work (with glasses or typing)
3. **cat-resting.png** - Cat taking a break (sleeping or stretching)
4. **cat-waiting.png** - Cat in waiting pose (looking at clock)
5. **cat-idle.png** - Cat in neutral position
6. **cat-celebration.png** - Cat celebrating (party hat, confetti)
7. **cat-no.png** - Cat blocking access (paw up like "stop")
8. **cat-tabby.png** - A tabby cat character
9. **cat-siamese.png** - A siamese cat character
10. **cat-calico.png** - A calico cat character

## Image Sources

Here are some options for obtaining these images:

### Option 1: Create Your Own

Use any drawing software to create custom cat images. Simple cartoon-style drawings work well.

### Option 2: Use Existing Images

Find free cat images from stock photo sites, making sure they have appropriate licenses:
- [Unsplash](https://unsplash.com/s/photos/cat)
- [Pixabay](https://pixabay.com/images/search/cat/)
- [Pexels](https://www.pexels.com/search/cat/)

### Option 3: AI Generation

Use AI image generation tools to create custom cat images:
- DALL-E
- Midjourney
- Stable Diffusion

## Temporary Solution

If you want to test the app without creating all images first, you can use this simple placeholder cat icon:

```
data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23ff6b6b' d='M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z'%3E%3C/path%3E%3C/svg%3E
```

You can use this as the src for any image in the HTML temporarily:

```html
<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23ff6b6b' d='M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z'%3E%3C/path%3E%3C/svg%3E" alt="Cat">
``` 