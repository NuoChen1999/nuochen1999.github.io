/* Local D3 orthographic globe. Place coordinates live in _data/footprint.json. */
(() => {
  'use strict';
  const root = document.getElementById('footprint');
  if (!root) return;
  const buttons = [...document.querySelectorAll('#footprint-places button')];
  const places = buttons.map(button => ({ name: button.textContent.trim(), lat: +button.dataset.lat, lon: +button.dataset.lon, button }));
  const search = document.getElementById('footprint-search');
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    places.forEach(place => { place.button.parentElement.hidden = !place.name.toLocaleLowerCase().includes(query); });
    document.getElementById('footprint-empty').hidden = places.some(place => !place.button.parentElement.hidden);
  });
  const status = document.getElementById('footprint-status');
  const city = document.getElementById('footprint-city');
  const coordinates = document.getElementById('footprint-coordinates');
  function describe(place) {
    city.textContent = place.name;
    coordinates.textContent = `${Math.abs(place.lat).toFixed(2)}° ${place.lat >= 0 ? 'N' : 'S'} · ${Math.abs(place.lon).toFixed(2)}° ${place.lon >= 0 ? 'E' : 'W'}`;
    places.forEach(p => p.button.setAttribute('aria-pressed', String(p === place)));
  }
  // The searchable, server-rendered list remains usable if the map cannot load.
  let focusPlace = describe;
  places.forEach(place => place.button.addEventListener('click', () => focusPlace(place)));
  async function init() {
    if (!window.d3 || !window.topojson) throw new Error('Globe libraries unavailable');
    const response = await fetch(root.dataset.worldUrl);
    if (!response.ok) throw new Error('World outline unavailable');
    const world = await response.json();
    const d3 = window.d3;
    const svg = d3.select('#footprint-globe');
    const projection = d3.geoOrthographic().translate([320, 270]).scale(225).rotate([35, -25, 0]).clipAngle(90);
    const path = d3.geoPath(projection);
    const defs = svg.append('defs');
    const ocean = defs.append('radialGradient').attr('id', 'fp-ocean').attr('cx', '32%').attr('cy', '25%').attr('r', '80%');
    ocean.append('stop').attr('offset', '0%').attr('stop-color', '#28576b');
    ocean.append('stop').attr('offset', '100%').attr('stop-color', '#0a1c2d');
    const shade = defs.append('radialGradient').attr('id', 'fp-shade').attr('cx', '35%').attr('cy', '30%').attr('r', '70%');
    shade.append('stop').attr('offset', '50%').attr('stop-color', '#000').attr('stop-opacity', 0);
    shade.append('stop').attr('offset', '100%').attr('stop-color', '#020b18').attr('stop-opacity', .5);
    const sphere = { type: 'Sphere' };
    const globe = svg.append('g');
    globe.append('path').datum(sphere).attr('fill', 'url(#fp-ocean)').attr('stroke', '#75adbf').attr('stroke-opacity', .55);
    globe.append('path').datum(d3.geoGraticule10()).attr('fill', 'none').attr('stroke', '#91bdce').attr('stroke-opacity', .13).attr('stroke-width', .6);
    globe.append('path').datum(topojson.feature(world, world.objects.countries)).attr('fill', '#447580').attr('stroke', '#a4c9ce').attr('stroke-opacity', .4).attr('stroke-width', .5);
    globe.append('path').datum(sphere).attr('fill', 'url(#fp-shade)').attr('pointer-events', 'none');
    const markers = svg.append('g').selectAll('circle').data(places).join('circle').attr('class', 'fp-marker').attr('r', 4).attr('fill', '#f5c780').attr('stroke', '#102634').attr('stroke-width', 1.2);
    markers.append('title').text(p => p.name);
    let selected = null;
    const ring = svg.append('circle').attr('r', 9).attr('fill', 'none').attr('stroke', '#ffe1aa').attr('stroke-width', 1.5).attr('pointer-events', 'none');
    function visible(place) { return d3.geoDistance([place.lon, place.lat], projection.invert([320, 270])) < Math.PI / 2 - .015; }
    function draw() {
      globe.selectAll('path').attr('d', path);
      markers.attr('cx', p => projection([p.lon, p.lat])[0]).attr('cy', p => projection([p.lon, p.lat])[1]).attr('display', p => visible(p) ? null : 'none').attr('r', p => p === selected ? 5.5 : 4);
      ring.attr('display', selected && visible(selected) ? null : 'none');
      if (selected) { const xy = projection([selected.lon, selected.lat]); ring.attr('cx', xy[0]).attr('cy', xy[1]); }
    }
    const spin = document.getElementById('footprint-spin');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer = null;
    function stop() { if (timer) timer.stop(); timer = null; spin.setAttribute('aria-pressed', 'false'); spin.textContent = 'Auto-rotate'; }
    function start() {
      stop(); svg.interrupt();
      spin.setAttribute('aria-pressed', 'true'); spin.textContent = 'Pause rotation';
      let previous = 0;
      timer = d3.timer(elapsed => { const delta = Math.min(elapsed - previous, 50); previous = elapsed; if (document.hidden || !inView) return; const r = projection.rotate(); projection.rotate([r[0] + delta * .004, r[1], 0]); draw(); });
    }
    let inView = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { inView = entries[0].isIntersecting; }).observe(root);
    spin.addEventListener('click', () => timer ? stop() : start());
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stop(); });
    focusPlace = place => {
      stop(); svg.interrupt(); selected = place; describe(place);
      const from = projection.rotate();
      const target = [-place.lon, -place.lat, 0];
      target[0] = from[0] + ((target[0] - from[0] + 540) % 360 + 360) % 360 - 180;
      if (reducedMotion.matches) { projection.rotate(target); draw(); return; }
      const interpolate = d3.interpolateArray(from, target);
      svg.transition().duration(850).ease(d3.easeCubicInOut).tween('turn', () => t => { projection.rotate(interpolate(t)); draw(); });
    };
    markers.on('click', (event, place) => { event.stopPropagation(); focusPlace(place); });
    svg.call(d3.drag().on('start', () => { stop(); svg.interrupt(); }).on('drag', event => {
      const r = projection.rotate(); const speed = 65 / projection.scale();
      projection.rotate([r[0] + event.dx * speed, Math.max(-85, Math.min(85, r[1] - event.dy * speed)), 0]); draw();
    }));
    function zoom(factor) { stop(); svg.interrupt(); projection.scale(Math.max(170, Math.min(650, projection.scale() * factor))); draw(); }
    document.getElementById('footprint-in').addEventListener('click', () => zoom(1.2));
    document.getElementById('footprint-out').addEventListener('click', () => zoom(1 / 1.2));
    // Explicit buttons keep ordinary page scrolling usable on touchscreens and trackpads.
    document.getElementById('footprint-reset').addEventListener('click', () => {
      stop(); svg.interrupt(); selected = null; projection.rotate([35, -25, 0]).scale(225);
      city.textContent = 'The world'; coordinates.textContent = 'Choose a place below';
      places.forEach(p => p.button.setAttribute('aria-pressed', 'false')); draw();
    });
    root.querySelectorAll('button').forEach(button => { button.disabled = false; });
    status.hidden = true; draw();
    if (!reducedMotion.matches) start();
    window.addEventListener('pagehide', stop);
  }
  init().catch(error => { status.textContent = 'The globe could not load. You can still browse all places below.'; console.error('Footprint:', error); });
})();
