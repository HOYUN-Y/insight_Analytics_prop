/* Compact inline line-icon set for the Planning Workbench drafts.
   window.Ic(name, size) -> JSX <svg>. Stroke = currentColor. */
(function () {
  const P = {
    // rail / module icons
    planning: 'M3 5h18M3 12h12M3 19h8',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    api: 'M4 7h6M4 12h10M4 17h6M16 5l4 4-4 4M20 9h-6',
    data: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
    clean: 'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
    analysis: 'M4 19V5M4 19h16M8 15l3-4 3 2 4-6',
    chart: 'M5 21V9M12 21V3M19 21v-7',
    map: 'M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15',
    report: 'M7 3h7l5 5v13H7zM14 3v5h5',
    search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    // ui
    save: 'M5 3h11l3 3v15H5zM8 3v6h8M8 15h8',
    import: 'M12 3v12M8 11l4 4 4-4M5 21h14',
    export: 'M12 15V3M8 7l4-4 4 4M5 21h14',
    sliders: 'M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M18 18h2M14 4v4M8 10v4M16 16v4',
    sun: 'M12 7a5 5 0 100 10 5 5 0 000-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    plus: 'M12 5v14M5 12h14',
    check: 'M20 6 9 17l-5-5',
    target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 11.5a.5.5 0 100 1 .5.5 0 000-1z',
    flag: 'M5 21V4M5 4c3-2 6 2 9 0s5 0 5 0v9c-2 1-3 1-5 0s-6-2-9 0',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10c.7.7 1 1.4 1 2h6c0-.6.3-1.3 1-2a6 6 0 00-4-10z',
    link: 'M9 15l6-6M10 6l1-1a4 4 0 016 6l-1 1M14 18l-1 1a4 4 0 01-6-6l1-1',
    node: 'M12 8a3 3 0 100-6 3 3 0 000 6zM5 22a3 3 0 100-6 3 3 0 000 6zM19 22a3 3 0 100-6 3 3 0 000 6zM12 8v4M12 12l-5 4M12 12l5 4',
    doc: 'M7 3h7l5 5v13H7zM9 12h8M9 16h8M9 8h3',
    drag: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    pin: 'M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z',
    swot: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    layers: 'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 18l9 5 9-5',
    table: 'M3 5h18v14H3zM3 10h18M9 5v14',
    folder: 'M3 6h6l2 2h10v11H3z',
    chevron: 'M9 6l6 6-6 6',
    chevd: 'M6 9l6 6 6-6',
    dollar: 'M12 2v20M16 6H9.5a3 3 0 000 6h5a3 3 0 010 6H7',
    users: 'M16 19v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 9a3 3 0 100-6 3 3 0 000 6zM22 19v-2a4 4 0 00-3-3.9M16 3.1A4 4 0 0116 11',
    train: 'M8 3h8a3 3 0 013 3v8a3 3 0 01-3 3H8a3 3 0 01-3-3V6a3 3 0 013-3zM5 17l-2 4M19 17l2 4M9 17v4M15 17v4M5 11h14M9 7h.01M15 7h.01',
  };
  function Ic(name, size) {
    const d = P[name] || P.node;
    return React.createElement('svg', {
      width: size || 18, height: size || 18, viewBox: '0 0 24 24',
      fill: 'none', stroke: 'currentColor', strokeWidth: 1.7,
      strokeLinecap: 'round', strokeLinejoin: 'round',
    }, d.split('M').filter(Boolean).map((seg, i) =>
      React.createElement('path', { key: i, d: 'M' + seg })));
  }
  window.Ic = Ic;
})();
