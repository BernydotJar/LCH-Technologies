# Recovered Product Requirements

Source: Google AI Studio app `8963e7a3-87ce-4ca9-938c-9490f698d4c7`.

## Core objective
Create the corporate website for LCH Technologies, positioning it as a premium B2B technology company specializing in AI, automation, enterprise software, and cloud solutions.

## Audience
CIOs, CTOs, transformation leaders, operations, innovation, and enterprise business areas.

## Functional requirements
- Single-page application, scalable to multiple pages.
- Header, Hero, Capabilities, LCH Evidence AI, Governance, Process, Why LCH, Contact, and Footer.
- Demo request form with name, last name, corporate email, company, role, interest area, optional message, and consent.
- Durable lead persistence with `createdAt`, `source: website`, and `status: new`.
- Minimum WCAG 2.1 AA accessibility target.
- No privileged secrets exposed in client code.

## Non-functional requirements
- React, TypeScript, Vite, and Tailwind CSS.
- Lightweight assets and production build optimization.
- SEO metadata and correct heading hierarchy.

## Requirement delta recorded in this session
The user has explicitly requested n8n-based lead follow-up while retaining a durable persistence layer. This delta is represented by `GH-19` and `GH-20`; it does not rewrite the recovered historical status projection.
