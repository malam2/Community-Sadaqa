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

**Primary**: `#2D8659` (Forest Green - represents growth, charity, trust)
**Primary Variant**: `#1F5D3D` (Darker green for pressed states)

**Background**: `#FAFAF8` (Warm off-white)
**Surface**: `#FFFFFF` (Pure white for cards)
**Surface Variant**: `#F5F5F3` (Subtle gray for secondary surfaces)

**Text Primary**: `#1A1A1A` (Near black)
**Text Secondary**: `#666666` (Medium gray)
**Text Tertiary**: `#999999` (Light gray for metadata)

**Semantic**:
- Urgent: `#D84315` (Warm red)
- Success: `#2D8659` (Same as primary)
- Anonymous Badge: `#5E35B1` (Purple for privacy indicator)

**Accent**: `#FFB74D` (Warm amber for highlights/badges)

---

## Typography

**Font Family**: 
- Display/Headers: **Nunito** (Google Font - warm, friendly, approachable)
- Body: **SF Pro** (System font for readability)

**Type Scale**:
- H1 (Screen titles): Nunito Bold, 28px
- H2 (Section headers): Nunito Bold, 22px
- H3 (Card titles): Nunito SemiBold, 18px
- Body: SF Pro Regular, 16px
- Caption (metadata): SF Pro Regular, 14px
- Small (timestamps): SF Pro Regular, 12px

---

## Visual Design

**Touchable Feedback**:
- Cards: Scale to 0.98 when pressed
- Buttons: Reduce opacity to 0.7 when pressed
- Filter chips: Scale to 1.05 and increase shadow when selected

**Floating Action Buttons**: Use subtle drop shadow:
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2

**Card Design**:
- Corner radius: 16px
- Border: None (use subtle shadow instead)
- Shadow: shadowOffset {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4

**Spacing System**: 4, 8, 12, 16, 24, 32, 48

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