---
permalink: /footprint/
title: "My Footprint"
author_profile: true
---

<link rel="stylesheet" href="{{ '/assets/css/footprint.css' | relative_url }}">

<p>Places I have been, and little corners of the world that stay with me.</p>

<div class="footprint" id="footprint" data-world-url="{{ '/assets/data/footprint-world.json' | relative_url }}">
  <div class="footprint__topline"><span>A WORLD OF MEMORIES</span><span>{{ site.data.footprint | size }} places visited</span></div>
  <div class="footprint__stage">
    <svg id="footprint-globe" viewBox="0 0 640 580" role="img" aria-label="Globe of visited places. Use the city list to locate a place."></svg>
    <p class="footprint__loading" id="footprint-status" role="status">Loading the globe…</p>
    <div class="footprint__selection" aria-live="polite"><span>EXPLORING</span><strong id="footprint-city">The world</strong><span id="footprint-coordinates">Choose a place below</span></div>
  </div>
  <div class="footprint__toolbar" role="group" aria-label="Globe controls">
    <span class="footprint__hint">Drag to explore · Select a golden dot</span>
    <button type="button" id="footprint-spin" aria-pressed="false" disabled>Auto-rotate</button>
    <button type="button" id="footprint-out" aria-label="Zoom out" disabled>−</button>
    <button type="button" id="footprint-in" aria-label="Zoom in" disabled>+</button>
    <button type="button" id="footprint-reset" disabled>Reset</button>
  </div>
</div>

<div class="footprint-places">
  <label for="footprint-search">Find a place</label>
  <input id="footprint-search" type="search" placeholder="Search cities and places…" autocomplete="off" aria-controls="footprint-places">
  <p id="footprint-empty" hidden>No places match your search.</p>
  <ul id="footprint-places" class="footprint-places__list">
    {% assign places = site.data.footprint | sort: 'name' %}
    {% for place in places %}
    <li><button type="button" data-lat="{{ place.lat }}" data-lon="{{ place.lon }}" aria-pressed="false">{{ place.name | escape }}</button></li>
    {% endfor %}
  </ul>
</div>
<noscript><p>The places above are my visited locations. Enable JavaScript to explore the interactive globe.</p></noscript>
<script src="{{ '/assets/js/lib/d3.v7.min.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/lib/topojson-client.v3.min.js' | relative_url }}" defer></script>
<script src="{{ '/assets/js/footprint.js' | relative_url }}" defer></script>
