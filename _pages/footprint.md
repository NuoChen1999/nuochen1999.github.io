---
permalink: /footprint/
title: "My Footprint"
author_profile: true
---

{% assign footprint_version = site.time | date: '%s' %}
<link rel="stylesheet" href="{{ '/assets/css/footprint.css' | relative_url }}?v={{ footprint_version }}">
<div class="footprint" id="footprint" data-world-url="{{ '/assets/data/footprint-world.json' | relative_url }}?v={{ footprint_version }}">
  <svg id="footprint-globe" viewBox="0 0 640 600" role="group" aria-label="Visited countries. Drag to rotate, use arrow keys to turn, plus and minus to zoom. Select a highlighted country to see cities and visit years." tabindex="0"></svg>
  <p id="footprint-status" role="status">Loading the globe…</p>
  <section class="footprint__details" id="footprint-details" aria-labelledby="footprint-country" hidden>
    <button type="button" id="footprint-close" aria-label="Close country details">×</button>
    <h2 id="footprint-country"></h2>
    <ul id="footprint-visits"></ul>
  </section>
</div>
<script id="footprint-data" type="application/json">{{ site.data.footprint | jsonify }}</script>
<noscript><p>Enable JavaScript to explore the globe.</p></noscript>
<script src="{{ '/assets/js/lib/d3.v7.min.js' | relative_url }}?v={{ footprint_version }}" defer></script>
<script src="{{ '/assets/js/lib/topojson-client.v3.min.js' | relative_url }}?v={{ footprint_version }}" defer></script>
<script src="{{ '/assets/js/footprint.js' | relative_url }}?v={{ footprint_version }}" defer></script>
