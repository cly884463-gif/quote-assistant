# Quote Miniprogram Prototype Design

## Goal

Build a first-version WeChat Mini Program frontend prototype for daily product quotations. It uses local mock product data to simulate products parsed from an xlsx price sheet.

## Scope

- Home page with a refined interior decoration background.
- Product cards generated from local mock data.
- A create-quote entry in the top-right area.
- Quote creation page with search, product cards, quantity input, spec selection, and add-to-quote behavior.
- Quote summary page styled after the provided spreadsheet screenshot.
- Editable logistics method, delivery method, and tax rate.
- Automatic amount, tax, and total calculations.

## Out Of Scope

- Real backend.
- Real xlsx upload and parsing.
- User accounts, permissions, cloud database, and order submission.

## Data Model

Each product has:

- `id`
- `model`
- `category`
- `name`
- `specs`
- `workTimes`
- `coverage`
- `unit`
- `dealerPrice`
- `costPerSquare`
- `remark`

Each quote item stores:

- product fields copied at add time
- selected `spec`
- numeric `quantity`

## Architecture

The prototype is a native WeChat Mini Program structure. Shared product data and quote calculation helpers live under `utils`. Pages are split into `home`, `quote`, and `summary`.

## UX

The first screen should feel suitable for a decoration/material business: polished interior background, readable overlay, concise product cards, and a direct create-quote action. The quote summary uses a compact table-like layout close to the supplied xlsx screenshot.

## Validation

Open the folder in WeChat Developer Tools as a Mini Program project. Verify that home loads, search filters products, items can be added, and the summary recalculates when quantity/tax/logistics/delivery changes.
