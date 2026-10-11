const paths={
 home:'M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9',
 path:'M6 4v16M6 5h11M6 12h8M6 19h11M17 3v4M14 10v4M17 17v4',
 practice:'M5 3h14v18H5zM8 8h8M8 12h5M8 16h7',
 code:'m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16',
 review:'M4 8a8 8 0 1 1-1 7M4 3v5h5M12 8v5l3 2',
 clock:'M12 8v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18',
 company:'M3 21h18M5 21V5h9v16M14 10h5v11M8 8h3M8 12h3M8 16h3',
 book:'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3zM12 6v15',
 chip:'M6 6h12v12H6zM9 9h6v6H9zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
 check:'m5 12 4 4L19 6',
 search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
 menu:'M4 6h16M4 12h16M4 18h16',
 close:'m5 5 14 14M19 5 5 19',
 help:'M9 8a3 3 0 1 1 5 2c-1 1-2 1-2 3M12 17v1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20'
};
export const icon=name=>`<svg viewBox="0 0 24 24" class="ui-icon" aria-hidden="true"><path d="${paths[name]||paths.chip}"/></svg>`;
