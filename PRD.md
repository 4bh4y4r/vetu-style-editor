# Product Requirements Document (PRD)

## 1. Product Overview
**Name:** Drip (Vetu Style Editor)

**Vision:** 
A modern, AI-powered fashion assistant and social wardrobe platform. It empowers users to digitize their closet, receive highly personalized AI styling advice based on their actual clothes, log daily outfits, and discover fashion inspiration from a vibrant community of creators.

## 2. Target Audience
- Fashion enthusiasts looking to organize their wardobe.
- People who want daily outfit inspiration based on what they already own.
- Creators who want to share their daily styles and build a following.

## 3. Core Features & Capabilities

### 3.1. AI Stylist (Core USP)
- **Context-Aware Assistance**: Chat interface where the AI suggests outfits from the user's digitized closet.
- **Style Context Setup**: Users can specify the location, occasion (e.g., Date Night, Work, Casual), event details, and comfort level.
- **Generative Visualization**: Ability to generate AI images of the suggested outfit to visualize the look before wearing it.
- **Smart Matching**: Strictly maps AI clothing suggestions to exact items in the user's closet so recommendations are actionable.

### 3.2. Digital Closet
- **Digitization**: Upload photos of clothing items, categorized by type (Tops, Bottoms, Shoes, Accessories).
- **Profile Matching**: Uses user profile data (height, skin tone, body type) to provide tailored advice.

### 3.3. Outfit Calendar & Logging
- **Visual Calendar**: A monthly grid to log outfits worn on specific days.
- **Multiple Looks**: Support for stacking and logging multiple outfits per day.
- **Privacy Controls**: Outfits can be toggled as Private (only for personal tracking) or Public (shared to the community feed).
- **Engagement Streak**: Gamified streak widget to encourage daily outfit logging.

### 3.4. Social Feed (Home)
- **Discovery**: A Pinterest-style masonry grid showing recent public outfits from the community.
- **Categorization**: Filter the feed by clothing styles/categories.
- **Interactions**: Users can Like, Save (Bookmark), Download, Report, or Share posts.
- **Creator Profiles**: Navigable public profiles displaying a creator's public outfits and boards, with the ability to follow them.

### 3.5. Inspiration Boards
- Curate and save community outfits into personalized, categorized boards (e.g., "Summer Fits", "Workwear").

### 3.6. Inbox & Notifications
- A centralized hub to track interactions such as new followers, likes on public outfits, and platform alerts.

## 4. Technical Architecture & Stack

**Frontend:**
- **Framework**: React 18, Vite, TypeScript
- **Routing**: React Router DOM (`/`, `/profile`, `/ai-stylist`, `/outfit/:id`, `/user/:username`, `/inbox`, etc.)
- **Styling**: Tailwind CSS, Shadcn UI (Radix UI primitives), Framer Motion / CSS Animations
- **Data Fetching**: TanStack React Query

**Backend & Infrastructure (Supabase):**
- **Database**: PostgreSQL (handling users, wardrobes, outfit_posts, boards)
- **Auth**: Supabase Authentication (Login, Signup, User Sessions)
- **Storage**: Supabase Storage for uploading closet items and outfit photos (`wardrobe` bucket)
- **Edge Functions**: Handling AI chat logic and generative AI image prompts (`ai-stylist`, `generate-outfit-image`)

## 5. Future Roadmap Notes
- Enhanced AI image matching (e.g., virtual try-on models).
- Real-time chat/messaging between users.
- Expanded public profile capabilities (showing detailed stats and creator wardrobes).
