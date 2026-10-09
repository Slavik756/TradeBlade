# TradeBlade

A responsive landing page for a cryptocurrency copy-trading service. The project focuses on translating a marketing layout into a working HTML/CSS interface with lightweight JavaScript interactions.

## What is implemented

- Hero section with an email form, platform statistics and company information.
- A horizontal list of example trades, with mouse-wheel scrolling and drag-to-scroll.
- Mobile navigation with open, close and close-on-link behaviour.
- Spot and futures pricing panels.
- Expandable FAQ items and anchor navigation between sections.
- Responsive layouts and a local SVG icon sprite.

The trade figures and prices are presentation content. This repository does not connect to an exchange, execute trades, process payments or provide account registration. The login buttons and email forms are interface elements without an application backend.

## Stack

HTML5, CSS3 and vanilla JavaScript. The page also loads normalization styles, fonts and some assets from external CDNs.

Swiper is listed in `package.json`, but the current scrolling, pricing and FAQ interactions are implemented in [js/core.js](js/core.js).

## Run locally

Clone the repository and serve its root directory with a static HTTP server. For example, with Node.js and npm installed:

```sh
git clone https://github.com/Slavik756/TradeBlade.git
cd TradeBlade
npx --yes http-server . -p 8080
```

Open [http://localhost:8080](http://localhost:8080). Internet access is needed for the external fonts and CDN assets.

There is no build step and no `npm run dev` script in this repository. You can also use an editor's local static-server extension.

## Project structure

```text
TradeBlade/
├── index.html       # Landing page sections and content
├── css/styles.css   # Layout, components and responsive styles
├── js/core.js       # Menu, pricing switch, FAQ and trade-list scrolling
├── img/             # Images and SVG sprite
└── package.json     # Dependency declaration
```

## Working on the page

Change the content in `index.html`, styling in `css/styles.css` and interactions in `js/core.js`. To publish the current version, serve these files from a static host; no server application is required.

The repository currently has no automated test script. When changing the interface, check the mobile menu, both pricing panels, FAQ expansion and horizontal scrolling at phone and desktop widths.

