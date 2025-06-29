# ChronicleTree Styling Guide

This document provides a set of styling guidelines to ensure a consistent and cohesive visual identity across all mockups and the final application.

## 1. Color Palette

The color palette is designed to be warm, inviting, and professional.

| Role                  | Hex Code  | Tailwind Class          | Description                                      |
| --------------------- | --------- | ----------------------- | ------------------------------------------------ |
| **Background**        | `#F8F4F0` | `bg-app-bg`             | The main background color for all pages.         |
| **Container**         | `#FEFEFA` | `bg-app-container`      | For content containers, cards, and modals.       |
| **Primary Text**      | `#4A4A4A` | `text-app-primary`      | The primary color for body text and headings.    |
| **Secondary Text**    | `#A0AEC0` | `text-app-secondary`    | For less important text and placeholders.        |
| **Accent**            | `#A0C49D` | `bg-app-accent`         | Used for highlights and focus rings.             |
| **Primary Button**    | `#4F868E` | `bg-button-primary`     | The standard call-to-action button color.        |
| **Primary Button Hover**| `#64A3AC` | `hover:bg-button-primary-hover` | Hover state for the primary button.      |
| **Danger Button**     | `#e53e3e` | `bg-button-danger`      | For destructive actions like delete.             |
| **Danger Button Hover** | `#c53030` | `hover:bg-button-danger-hover`  | Hover state for the danger button.       |
| **Link**              | `#4F868E` | `text-link`             | The color for hyperlinks.                        |
| **Link Hover**        | `#64A3AC` | `hover:text-link-hover` | The hover state for hyperlinks.                  |

## 2. Typography

The primary font for the application is **Inter**. It is a clean, modern, and highly readable sans-serif font.

- **Font Family:** `Inter, sans-serif`
- **Weights:** 400 (Regular), 600 (Semibold), 700 (Bold)

### Headings

- **h1:** `text-3xl font-bold`
- **h2:** `text-2xl font-semibold`
- **h3:** `text-xl font-semibold`

### Body Text

- **Standard:** `text-base` (16px)
- **Small:** `text-sm` (14px)

## 3. UI Components

### Buttons

- **Padding:** `py-2 px-4`
- **Border Radius:** `rounded-md`
- **Font Weight:** `font-semibold`

### Inputs

- **Padding:** `p-2`
- **Border:** `border border-gray-300`
- **Border Radius:** `rounded-md`
- **Shadow:** `shadow-sm`
- **Focus State:** `focus:ring-app-accent focus:border-app-accent`

### Modals

- **Background:** `bg-app-container`
- **Padding:** `p-8`
- **Border Radius:** `rounded-lg`
- **Shadow:** `shadow-lg`

## 4. Spacing

A consistent spacing scale should be used throughout the application. Tailwind's default spacing scale is recommended.

- **Gaps between elements:** `space-y-4` or `space-x-4`
- **Padding within containers:** `p-4` or `p-6`
