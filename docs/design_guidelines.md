# IOK Sadaqa - Design Guidelines

## Brand Identity

**Purpose**: A mosque-centered mutual aid platform connecting community members in need with those who can help. Sadaqa (charity) made simple, trustworthy, and dignified.

**Aesthetic Direction**: **Warm Minimalism** - Clean, approachable, and trustworthy. The design should feel like a caring neighbor, not a cold tech platform. Think soft edges, breathing room, and warmth without sacrificing clarity.

**Memorable Element**: The act of giving and receiving is sacred. Every interaction should feel human and respectful. The app uses **gentle green accents** (representing growth and generosity) against calming neutrals, with **anonymous posting handled with exceptional care** (clear privacy indicators, thoughtful iconography).

---

## Navigation Architecture

**Root Navigation**: Tab Bar (3 tabs)
- **Feed** (Home icon) - Browse community requests and offers
- **Create** (Plus icon, center position) - Create new request or offer
- **Profile** (Person icon) - User settings and posts

**Screen Hierarchy**:
- Feed Stack: Feed → Post Detail (modal)
- Create Stack: Create Post → Preview → Success
- Profile Stack: Profile → My Posts → Edit Post, Settings, Guidelines

---

## Screen-by-Screen Specifications

### 1. Feed Screen
**Purpose**: Browse and respond to community needs

**Layout**:
- Header: Transparent, custom title "IOK Diamond Bar" in header font, right button: filter icon
- Content: Scrollable list with horizontal filter chips above
- Safe area: Top = headerHeight + 16, Bottom = tabBarHeight + 16

**Components**:
- Horizontal ScrollView of filter chips: All, Requests, Offers, Urgent, Food, Baby Supplies, Rides, Essentials, Other
- Post cards (each card shows: type badge, category, title, time ago, urgent indicator if applicable, anonymous badge if applicable)
- Empty state: "No posts yet" with illustration
- Floating elements: None

**Filter Chips**: Pill-shaped, 12px vertical padding, 20px horizontal padding, rounded corners (24px), animated selection with scale effect

### 2. Post Detail (Modal)
**Purpose**: View full post details and offer help

**Layout**:
- Header: Standard modal with close button (X), title = post category
- Content: Scrollable view
- Safe area: Top = 16, Bottom = insets.bottom + 80 (for button)

**Components**:
- Type badge (Request/Offer) at top
- Title (large, bold)
- Urgent indicator if applicable
- Anonymous badge if applicable (shield icon + "Posted anonymously")
- Description text
- Contact preference
- Timestamp and status (Open/Fulfilled)
- Primary action button at bottom: "Offer Help" or "I Can Help" (fixed at bottom with safe area)
- Report button (flag icon, subtle, top-right)

### 3. Create Post Screen
**Purpose**: Create new request or offer

**Layout**:
- Header: Standard with Cancel (left), "New Post" title, Next (right, disabled until form valid)
- Content: Scrollable form
- Safe area: Top = 16, Bottom = insets.bottom + 16

**Components** (in order):
1. Segmented control: Request | Offer
2. Category picker (dropdown style)
3. Title text field
4. Description text area (multi-line)
5. Urgent toggle with explanation text
6. Anonymous toggle with privacy explanation: "Your name will be hidden from the community"
7. Contact preference dropdown
8. Disclaimer text with checkbox

**Form Validation**: Next button becomes enabled only when title, description, category selected, and disclaimer checked

### 4. Preview Screen
**Purpose**: Review post before publishing

**Layout**:
- Header: Standard with Back (left), "Preview" title, Publish (right)
- Content: Scrollable
- Safe area: Top = 16, Bottom = insets.bottom + 16

**Components**:
- Preview card exactly as it will appear in feed
- Edit button (pencil icon)
- Publish button (primary, full-width at bottom)

### 5. Profile Screen
**Purpose**: Manage account and view own posts

**Layout**:
- Header: Standard with title "Profile", Settings icon (right)
- Content: Scrollable
- Safe area: Top = 16, Bottom = tabBarHeight + 16

**Components**:
- User avatar (circular, 80px)
- Display name
- Community badge: "IOK Diamond Bar" (non-editable in MVP)
- Section: My Posts (shows user's posts with status)
- Section: Community Guidelines (navigates to guidelines screen)
- Section: Privacy & Legal (navigates to privacy screen)
- Logout button (subtle, at bottom)

### 6. Report Modal (Bottom Sheet)
**Purpose**: Report inappropriate content

**Layout**: Bottom sheet with rounded top corners
**Components**:
- Title: "Report this post"
- Radio buttons: Scam, Illegal, Harassment, Other
- Text field for details (if Other selected)
- Cancel and Submit buttons

---

## Color Palette

**Inspired by**: Uber's clean contrast, LinkedIn's professional clarity, PayPal's trustworthy feel.

**Primary**: `#0D7A4F` (Forest Green - represents growth, charity, trust)
**Primary Variant**: `#0A5C3B` (Darker green for pressed states)
**Primary Light**: `#E6F4ED` (Subtle green tint for backgrounds)

**Background**: `#FFFFFF` (Pure white - Uber style)
**Surface**: `#FFFFFF` (Pure white for cards)
**Surface Variant**: `#F7F7F7` (Subtle gray for secondary surfaces - LinkedIn style)

**Text Primary**: `#000000` (Pure black - high contrast like Uber)
**Text Secondary**: `#545454` (Darker gray for better readability)
**Text Tertiary**: `#767676` (Accessible gray - 4.5:1 contrast ratio)

**Semantic**:
- Urgent: `#C41E3A` (Deeper red - more serious/trustworthy)
- Success: `#0D7A4F` (Same as primary)
- Anonymous Badge: `#5B2D90` (Deeper purple for distinction)

**Accent**: `#B86E00` (Warmer amber - better contrast)

---

## Typography

**Design Philosophy**: 
- Headlines: Bold and impactful like Uber (extra bold weights, tight letter-spacing)
- Body: Clear and professional like LinkedIn (generous line-height for readability)
- CTAs: Trust-inspiring like PayPal (semibold for clear actions)

**Font Family**: 
- All text: **System fonts** (-apple-system, SF Pro on iOS, Roboto on Android)
- This ensures native feel and optimal performance

**Type Scale**:
- H1 (Screen titles): 32px, Weight 800, Line-height 40px, Letter-spacing -0.5
- H2 (Section headers): 26px, Weight 700, Line-height 34px, Letter-spacing -0.3
- H3 (Card titles): 20px, Weight 600, Line-height 28px, Letter-spacing -0.2
- H4 (Subtitles): 17px, Weight 600, Line-height 24px
- Body: 16px, Weight 400, Line-height 26px, Letter-spacing 0.1
- Small: 14px, Weight 400, Line-height 22px
- Caption (metadata): 12px, Weight 500, Line-height 18px
- Label (uppercase): 13px, Weight 600, Letter-spacing 0.4

---

## Visual Design

**Touchable Feedback**:
- Cards: Scale to 0.98 when pressed
- Buttons: Reduce opacity to 0.7 when pressed
- Filter chips: Scale to 1.05 and increase shadow when selected

**Floating Action Buttons**: Use refined drop shadow:
- shadowOffset: {width: 0, height: 6}
- shadowOpacity: 0.15
- shadowRadius: 12
- elevation: 6

**Card Design**:
- Corner radius: 14px (slightly tighter for modern feel)
- Border: None (use subtle shadow instead)
- Shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8
- elevation: 2

**Border Radius Scale**: 6, 10, 14, 20, 28, 36, 44 (refined for sharper, modern feel)

**Spacing System**: 4, 8, 12, 16, 20, 24, 32, 40, 48

---

## Assets to Generate

**Required**:
1. **icon.png** - App icon with green crescent/helping hands motif
   - WHERE USED: Device home screen

2. **splash-icon.png** - Simple logo for launch screen
   - WHERE USED: App launch

3. **empty-feed.png** - Gentle illustration of connected hands or community circle
   - WHERE USED: Feed screen when no posts exist

4. **anonymous-indicator.png** - Shield icon with subtle privacy motif
   - WHERE USED: Post cards and detail view for anonymous posts

5. **success-checkmark.png** - Checkmark with subtle celebration
   - WHERE USED: Post creation success screen

**Recommended**:
6. **avatar-default-1.png** through **avatar-default-3.png** - Diverse, respectful avatar options with geometric patterns
   - WHERE USED: Profile screen, user hasn't uploaded photo

7. **guidelines-header.png** - Illustration of community values
   - WHERE USED: Community Guidelines screen

**Style for all assets**: Warm, minimal, culturally respectful. Use green and amber accent colors. Avoid overly corporate or tech-y aesthetics.