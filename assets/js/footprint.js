/* Local globe; visit years are transcribed from the original Google My Maps notes. */
(() => {
  'use strict';
  const root = document.getElementById('footprint');
  if (!root) return;
  const status = document.getElementById('footprint-status');
  const details = document.getElementById('footprint-details');
  const heading = document.getElementById('footprint-country');
  const visits = document.getElementById('footprint-visits');
  const close = document.getElementById('footprint-close');
  async function init() {
    if (!window.d3 || !window.topojson) throw new Error('Globe libraries unavailable');
    const places = JSON.parse(document.getElementById('footprint-data').textContent);
    const response = await fetch(root.dataset.worldUrl);
    if (!response.ok) throw new Error('World outline unavailable');
    const world = await response.json();
    const d3 = window.d3;
    const groups = d3.group(places, p => p.countryId);
    // Match atlas polygons to the country grouping used by the travel data.
    const groupId = feature => String(feature.id).padStart(3, '0') === '158' ? '156' : String(feature.id).padStart(3, '0');
    const svg = d3.select('#footprint-globe');
    const projection = d3.geoOrthographic().translate([320, 300]).scale(260).rotate([-15, -25, 0]).clipAngle(90);
    const path = d3.geoPath(projection);
    svg.append('path').datum({ type: 'Sphere' }).attr('class', 'fp-ocean');
    svg.append('path').datum(d3.geoGraticule10()).attr('class', 'fp-grid');
    const countries = svg.append('g').selectAll('path').data(window.topojson.feature(world, world.objects.countries).features).join('path')
      .attr('class', f => `fp-country${groups.has(groupId(f)) ? ' is-visited' : ''}`)
      .attr('role', f => groups.has(groupId(f)) ? 'button' : null)
      .attr('aria-label', f => groups.has(groupId(f)) ? `Show visits in ${groups.get(groupId(f))[0].country}` : null);
    countries.append('title').text(f => groups.has(groupId(f)) ? groups.get(groupId(f))[0].country : f.properties.name);
    const markers = svg.append('g').selectAll('circle').data(places).join('circle').attr('class', 'fp-marker').attr('r', 2.5);
    markers.append('title').text(p => `${p.name} · ${p.years}`);
    let selected = null;
    let returnFocus = null;
    function visible(p) { return d3.geoDistance([p.lon, p.lat], projection.invert([320, 300])) < Math.PI / 2 - .015; }
    function draw() {
      svg.selectAll('path').attr('d', path);
      countries.attr('tabindex', f => groups.has(groupId(f)) && path.area(f) > 1 ? 0 : -1)
        .attr('aria-pressed', f => groups.has(groupId(f)) ? String(groupId(f) === selected) : null)
        .classed('is-selected', f => groupId(f) === selected);
      markers.attr('cx', p => projection([p.lon, p.lat])[0]).attr('cy', p => projection([p.lon, p.lat])[1]).attr('display', p => visible(p) ? null : 'none');
    }
    function showCountry(id, trigger) {
      if (!groups.has(id)) return;
      selected = id; returnFocus = trigger;
      heading.textContent = groups.get(id)[0].country;
      visits.replaceChildren();
      [...groups.get(id)].sort((a, b) => a.years.localeCompare(b.years) || a.name.localeCompare(b.name)).forEach(place => {
        const row = document.createElement('li');
        const name = document.createElement('span'); name.textContent = place.name;
        const year = document.createElement('time'); year.textContent = place.years; year.dateTime = place.years;
        row.append(name, year); visits.append(row);
      });
      details.hidden = false; draw(); close.focus({ preventScroll: true });
    }
    function hideDetails() {
      details.hidden = true; selected = null; draw();
      (returnFocus || svg.node()).focus({ preventScroll: true });
    }
    close.addEventListener('click', hideDetails);
    countries.on('click', (event, feature) => { if (groups.has(groupId(feature))) { event.stopPropagation(); showCountry(groupId(feature), event.currentTarget); } })
      .on('keydown', (event, feature) => {
        if (groups.has(groupId(feature)) && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.stopPropagation(); showCountry(groupId(feature), event.currentTarget); }
      });
    markers.on('click', (event, place) => { event.stopPropagation(); showCountry(place.countryId, svg.node()); });
    svg.call(d3.drag().on('drag', event => {
      const r = projection.rotate(); const speed = 65 / projection.scale();
      projection.rotate([r[0] + event.dx * speed, Math.max(-85, Math.min(85, r[1] - event.dy * speed)), 0]); draw();
    }));
    svg.on('wheel', event => { event.preventDefault(); projection.scale(Math.max(200, Math.min(580, projection.scale() * Math.exp(-event.deltaY * .001)))); draw(); }, { passive: false });
    svg.on('keydown', event => {
      const r = projection.rotate();
      if (event.key === 'ArrowLeft') r[0] -= 12;
      else if (event.key === 'ArrowRight') r[0] += 12;
      else if (event.key === 'ArrowUp') r[1] = Math.min(85, r[1] + 12);
      else if (event.key === 'ArrowDown') r[1] = Math.max(-85, r[1] - 12);
      else if (event.key === '+' || event.key === '=') projection.scale(Math.min(580, projection.scale() * 1.15));
      else if (event.key === '-') projection.scale(Math.max(200, projection.scale() / 1.15));
      else return;
      event.preventDefault(); projection.rotate(r); draw();
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && !details.hidden) { event.stopPropagation(); hideDetails(); } });
    status.hidden = true; draw();
  }
  init().catch(error => { status.textContent = 'The globe could not load. Please refresh to try again.'; console.error('Footprint:', error); });
})();
