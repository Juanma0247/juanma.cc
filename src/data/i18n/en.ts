export interface I18n {
  nav: {
    home: string
    projects: string
    scripts: string
    contact: string
    settings: string
  }
  sections: {
    tools: string
    games: string
    projects: string
    settings: string
  }
  projectsIndex: {
    featured: string
  }
  projects: {
    tm: {
      loadMachineLabel: string
      browseLibrary: string
      library: string
      importTitle: string
      importJson: string
      guideTitle: string
      guideJson: string
      alphabetLabel: string
      initState: string
      maxSteps: string
      tableViewTitle: string
      table: string
      diagramViewTitle: string
      diagram: string
      tableHint: string
      clearTitle: string
      clear: string
      exportTitle: string
      exportBtn: string
      uploadTitle: string
      uploadBtn: string
      addStateTitle: string
      removeStateTitle: string
      diagramHint: string
      execution: string
      resetTitle: string
      reset: string
      stepBackTitle: string
      stepBack: string
      step: string
      play: string
      pause: string
      speed: string
      tape: string
      statusWaiting: string
      currentState: string
      reading: string
      headPos: string
      steps: string
      shortcuts: string
      shortcutsText: string
      history: string
      historyHint: string
      histStep: string
      histState: string
      histTapeWindow: string
      jsonGuideTitle: string
      jsonStructure: string
      jsonStructureDesc: string
      jsonFieldTitleDesc: string
      jsonFieldDescDesc: string
      jsonFieldAuthorDesc: string
      jsonFieldAlphabetDesc: string
      jsonFieldStatesDesc: string
      jsonFieldInitStateDesc: string
      jsonFieldTapeDesc: string
      jsonFieldTransDesc: string
      jsonTransFormat: string
      jsonTransDesc: string
      jsonTransLegend: string
      jsonNoteHalt: string
      jsonExample: string
      aiGenerator: string
      aiDesc: string
      aiTips: string
      descLabel: string
      descPlaceholder: string
      generatePrompt: string
      copyAndPaste: string
      copy: string
      machineLibrary: string
      back: string
      closeLibrary: string
      loadMachineBtn: string
      uploadMachine: string
      titleField: string
      titlePlaceholder: string
      authorField: string
      authorPlaceholder: string
      descriptionField: string
      descriptionPlaceholder: string
      uploadSubmit: string
    }
  }
  settings: {
    title: string
    closeLabel: string
    theme: {
      title: string
      desc: string
      system: string
      light: string
      dark: string
      custom: string
      colorPrimary: string
      colorText: string
      colorBg: string
      colorMuted: string
      previewLabel: string
      previewSection: string
      previewBody: string
      previewMuted: string
      presets: {
        grayscale: string
        pastels: string
        warm: string
        vintage: string
        neon: string
      }
      cancel: string
      apply: string
      warnTextBg: string
      warnPrimaryBg: string
      warnTextPrimary: string
    }
    font: {
      title: string
      desc: string
      default: string
    }
    lang: {
      title: string
      desc: string
    }
    page: {
      title: string
      desc: string
      signIn: string
      signOut: string
      signedInAs: string
      unauthorized: string
      defaultLanding: string
      saved: string
      errorSaving: string
    }
    storageNote: string
  }
  home: {
    tagline: string
    bio: string
    quickProjects: string
    quickGames: string
    quickCodes: string
    skillsTitle: string
    skillsIntro: string
    area1Title: string
    area1Desc: string
    area2Title: string
    area2Desc: string
    area3Title: string
    area3Desc: string
    area4Title: string
    area4Desc: string
    area5Title: string
    area5Desc: string
    area6Title: string
    area6Desc: string
    builtTitle: string
    goToSite: string
    builtCard1Title: string
    builtCard1Desc: string
    builtCard2Title: string
    builtCard2Desc: string
    builtCard3Title: string
    builtCard3Desc: string
    builtCard4Title: string
    builtCard4Desc: string
    builtCard5Title: string
    builtCard5Desc: string
    builtCard6Title: string
    builtCard6Desc: string
    builtCard7Title: string
    builtCard7Desc: string
  }
  contact: {
    intro: string
  }
  notFound: {
    message: string
    goHome: string
  }
  scripts: {
    intro1: string
    intro2: string
    intro3: string
    copy: string
  }
  tools: {
    minecraft: {
      subtitle: string
      desc: string
      coordsLabel: string
      overworldToNether: string
      netherToOverworld: string
    }
    stringTool: {
      subtitle: string
      sourceString: string
      prefixWhole: string
      suffixWhole: string
      charPrefix: string
      charSuffix: string
      repeat: string
      truncate: string
      splitBy: string
      joinBy: string
      length: string
    }
  }
  games: {
    tictactoe: {
      subtitle: string
      restart: string
    }
    minesweeper: {
      subtitle: string
      height: string
      width: string
      newGame: string
      playerId: string
      load: string
      register: string
      time: string
      percentage: string
      mines: string
      score: string
      name: string
      digitCode: string
    }
    sudoku: {
      subtitle: string
    }
  }
}

export const en: I18n = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    scripts: 'Scripts',
    contact: 'Contact',
    settings: 'Settings',
  },
  sections: {
    tools: 'Tools',
    games: 'Games',
    projects: 'Projects',
    settings: 'Settings',
  },
  projectsIndex: {
    featured: 'Featured',
  },
  projects: {
    tm: {
      loadMachineLabel: 'Load machine',
      browseLibrary: 'Browse machine library',
      library: 'Library',
      importTitle: 'Load machine from JSON file',
      importJson: 'Import JSON',
      guideTitle: 'JSON format guide and AI prompt generator',
      guideJson: 'JSON Guide',
      alphabetLabel: 'Alphabet Σ (space-separated)',
      initState: 'Initial state',
      maxSteps: 'Max steps',
      tableViewTitle: 'Transition table',
      table: 'Table',
      diagramViewTitle: 'State diagram',
      diagram: 'Diagram',
      tableHint: 'Format: <code>symbol Direction state</code> — e.g. <code>1Rq0</code> &nbsp;·&nbsp; <code>#Lq2</code>',
      clearTitle: 'Clear all instructions',
      clear: 'Clear',
      exportTitle: 'Export machine as JSON',
      exportBtn: 'Export',
      uploadTitle: 'Upload machine to library',
      uploadBtn: 'Upload',
      addStateTitle: 'Add state',
      removeStateTitle: 'Remove last state',
      diagramHint: 'Drag the ring to connect · Click edge to edit · Double-click to add state · <kbd>Ctrl+scroll</kbd> zoom · <kbd>Ctrl+0</kbd> reset',
      execution: 'Execution',
      resetTitle: 'Reset initial configuration (R)',
      reset: 'Reset',
      stepBackTitle: 'Step back (←)',
      stepBack: 'Back',
      step: 'Step',
      play: 'Play',
      pause: 'Pause',
      speed: 'Speed',
      tape: 'Tape',
      statusWaiting: 'Waiting',
      currentState: 'Current state',
      reading: 'Reading',
      headPos: 'Head position',
      steps: 'Steps',
      shortcuts: 'Shortcuts',
      shortcutsText: '<kbd>Space</kbd> play/pause &nbsp; <kbd>→</kbd> step &nbsp; <kbd>←</kbd> back &nbsp; <kbd>R</kbd> reset',
      history: 'Configuration history',
      historyHint: 'u <em>q</em> v — tape content around head',
      histStep: 'Step',
      histState: 'State',
      histTapeWindow: 'Tape window',
      jsonGuideTitle: 'JSON Format Guide',
      jsonStructure: 'Structure',
      jsonStructureDesc: 'The JSON file must be an object with these fields:',
      jsonFieldTitleDesc: 'Short and descriptive name. E.g. <em>"Copy the Ones"</em>.',
      jsonFieldDescDesc: 'What the machine does. Shown in the library detail view.',
      jsonFieldAuthorDesc: 'Name of the creator.',
      jsonFieldAlphabetDesc: 'Input symbols separated by spaces — Σ. <strong>Never include <code>#</code></strong>: it is the implicit blank. E.g. <em>"1 0 a"</em>.',
      jsonFieldStatesDesc: 'Array of state names — K. Must follow the pattern <code>q0, q1, q2 …</code> E.g. <em>["q0","q1","q2"]</em>.',
      jsonFieldInitStateDesc: 'Initial state q₀. Must be a member of <code>states</code>.',
      jsonFieldTapeDesc: 'Initial tape content. Each character must be in Σ. Use <code>#</code> or <code>_</code> for blank cells. Can be empty.',
      jsonFieldTransDesc: 'The instruction function I. Each entry defines an instruction (see below).',
      jsonTransFormat: 'Transition format',
      jsonTransDesc: 'Each key-value pair in <code>trans</code> encodes an instruction of T:',
      jsonTransLegend: '<li><code>q<em>i</em></code> — current state</li><li><code>s</code> — symbol read (Σ ∪ {#})</li><li><code>t</code> — symbol to write (Σ ∪ {#})</li><li><code>D</code> — direction: <code>R</code> (right) or <code>L</code> (left)</li><li><code>q<em>j</em></code> — next state</li>',
      jsonNoteHalt: 'The machine <strong>halts</strong> when it reaches a state-symbol pair with no defined transition — called a <em>final combination</em>.',
      jsonExample: 'Example',
      aiGenerator: 'AI Prompt Generator',
      aiDesc: 'Describe the machine you want and this tool will build a precise prompt you can paste into any AI (ChatGPT, Claude, Gemini…). The AI will return a JSON ready to import.',
      aiTips: '<strong>Tips for a good description:</strong> specify the input alphabet, what the machine should read, what it should write, and the expected final state of the tape.',
      descLabel: 'What should the machine do?',
      descPlaceholder: 'E.g. Read a binary string and replace each 1 with 0 and each 0 with 1 (bit complement).',
      generatePrompt: 'Generate prompt',
      copyAndPaste: 'Copy and paste this into your AI:',
      copy: 'Copy',
      machineLibrary: 'Machine Library',
      back: 'Back',
      closeLibrary: 'Close library',
      loadMachineBtn: 'Load machine',
      uploadMachine: 'Upload Machine',
      titleField: 'Title',
      titlePlaceholder: 'Short and descriptive name',
      authorField: 'Author',
      authorPlaceholder: 'Your name',
      descriptionField: 'Description',
      descriptionPlaceholder: 'Describe what this machine does…',
      uploadSubmit: 'Upload',
    },
  },
  settings: {
    title: 'Settings',
    closeLabel: 'Close settings',
    theme: {
      title: 'Theme',
      desc: 'Choose how the site looks to you.',
      system: 'System',
      light: 'Light',
      dark: 'Dark',
      custom: 'Custom',
      colorPrimary: 'Primary',
      colorText: 'Text',
      colorBg: 'Background',
      colorMuted: 'Muted',
      previewLabel: 'Preview',
      previewSection: 'Section title',
      previewBody: 'Body text content.',
      previewMuted: 'Secondary info.',
      presets: {
        grayscale: 'Grayscale',
        pastels: 'Pastels',
        warm: 'Warm',
        vintage: 'Vintage',
        neon: 'Neon',
      },
      cancel: 'Cancel',
      apply: 'Apply',
      warnTextBg: 'Text may not be readable on the background',
      warnPrimaryBg: 'Primary color may be hard to see',
      warnTextPrimary: 'Text on primary buttons may be hard to read',
    },
    font: {
      title: 'Font',
      desc: 'Choose a global font for the site.',
      default: 'Default',
    },
    lang: {
      title: 'Language',
      desc: 'Switch the interface language.',
    },
    page: {
      title: 'Page Settings',
      desc: 'Customize site behavior. Requires an authorized account.',
      signIn: 'Sign in with Google',
      signOut: 'Sign out',
      signedInAs: 'Signed in as',
      unauthorized: 'This account is not authorized.',
      defaultLanding: 'Default landing page',
      saved: 'Saved!',
      errorSaving: 'Error saving',
    },
    storageNote: 'Settings are stored in your browser and persist between visits. They may be lost if you clear your browsing data or site history. If signed in, your preferences are also saved as global site defaults.',
  },
  home: {
    tagline: 'Computer Scientist · Math Enthusiast · UX/UI Designer · Full-Stack Developer · Hiker/Marathoner · Seasoned Minecraft Technician',
    bio: `Hi, I'm <strong>Juanma</strong>. I come from <a class="geo" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=1.4777072123416435,-77.01902130581522" data-map="https://maps.google.com/maps?q=1.4777072123416435,-77.01902130581522&z=13&output=embed"><svg class="geo-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span class="geo-name">Las Mesas, Nariño</span><span class="geo-pop"></span></a> and now live in <a class="geo" target="_blank" rel="noopener" href="https://maps.app.goo.gl/YkSYszNc6iNqPaTS6" data-map="https://maps.google.com/maps?q=5.068173,-75.517339&z=13&output=embed"><svg class="geo-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span class="geo-name">Manizales, Caldas</span><span class="geo-pop"></span></a>, where I study. I'm a <a class="geo geo--plain" target="_blank" rel="noopener" href="https://betowa.sena.edu.co/oferta/analisis-y-desarrollo-de-software?search=Analisis+y+dise%C3%B1o+de&programId=136456&modality=V&level=6"><span class="geo-name">SENA</span></a> graduate in Information Systems Analysis and Design, and I'm now studying <a class="geo geo--plain" target="_blank" rel="noopener" href="https://fcen.unal.edu.co/index.php?id=509">Computer Science</a> at <a class="geo" target="_blank" rel="noopener" href="https://www.google.com/maps/place/Universidad+Nacional+de+Colombia+Sede+Manizales+-+Campus+La+Nubia/@5.0290382,-75.4724777,281m/data=!3m1!1e3!4m6!3m5!1s0x8e4765af7f225e41:0x668b66fb520b8cd3!8m2!3d5.0290643!4d-75.4728384!16s%2Fg%2F1tfgf8vx?entry=ttu" data-map="https://maps.google.com/maps?q=5.0290643,-75.4728384&z=16&output=embed"><svg class="geo-pin" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg><span class="geo-name">UNAL Manizales</span><span class="geo-pop"></span></a>. I've spent six years in software development, and lately I've been broadening my knowledge with computer science — I love staying on the cutting edge. My way of working applies the scientific method to software engineering: really understand the problem, acquire the right knowledge and tools, design correct, reproducible and lasting solutions, then ship them, improving with constant feedback. Here you'll find a personal repository that gathers and sums up part of my work.`,
    quickProjects: 'Projects',
    quickGames: 'Games',
    quickCodes: 'Codes',
    skillsTitle: 'Areas & skills',
    skillsIntro: "I'm a computer scientist and full-stack developer. Rather than a wall of logos and percentages, these are the branches I actually work in and the tools I reach for in each.",
    area1Title: 'Computer Science',
    area1Desc: "The core of everything I do. I think in algorithms, data structures and complexity, and I'm fascinated by the theory of computation (automata and Turing machines), logic and the discrete math behind it all — a lifelong math lover.",
    area2Title: 'Full-stack web development',
    area2Desc: 'I build complete sites and apps, front to back. On the front, React, Next.js and Astro alongside HTML, CSS and JavaScript/TypeScript; on the server, Node.js, Express and FastAPI. Styling with Tailwind and motion with GSAP.',
    area3Title: 'Languages & software',
    area3Desc: 'I move across paradigms and languages: Java and Kotlin for robust apps, TypeScript for type-safe code end to end, and Python as a Swiss-army knife for scripting, automation and quick prototypes. I version everything with Git.',
    area4Title: 'Data, math & machine learning',
    area4Desc: 'I love probability and statistics, data analysis and machine learning: I model, experiment and visualize results, and handle data with PostgreSQL, MySQL, Supabase and Firestore.',
    area5Title: 'Design, UX/UI & multimedia',
    area5Desc: 'I also come from the visual world: graphic design and UX/UI with Illustrator, Photoshop, Adobe XD and InDesign; video editing with Premiere, 3D with Blender, streaming and capture with OBS, and technical writing with LaTeX.',
    area6Title: 'Cloud, deployment & AI',
    area6Desc: "I take apps to production: containers with Docker, continuous deployment on Firebase App Hosting, media on Cloudinary and managed databases with Supabase. And when it adds value, I wire in AI models like OpenAI's.",
    builtTitle: "Projects I've been part of",
    goToSite: 'Go to site',
    builtCard1Title: 'Icfes para disciplinados',
    builtCard1Desc: 'A platform to share study material for the Colombian Saber 11 exam. Access with document: <strong>0123456789</strong> / password: <strong>ABCD</strong>',
    builtCard2Title: 'Catálogo boutique Arcur',
    builtCard2Desc: 'Product catalog for Colombian clothing brand Arcur, with a hidden admin CRUD system.',
    builtCard3Title: 'UNISMP',
    builtCard3Desc: 'Web app for a Minecraft SMP community: player profiles, content and social features. A team project built with React, Supabase and Firebase.',
    builtCard4Title: 'Número Pi',
    builtCard4Desc: "A site that displays thousands of digits of π — a small mathematical experiment to explore and search within pi's endless decimal expansion.",
    builtCard5Title: 'El Cóndor',
    builtCard5Desc: 'Platform for a Colombian real estate company selling land lots in Tolima, with projects, financing options and customer support. A collaborative build.',
    builtCard6Title: 'FCEN — UNAL',
    builtCard6Desc: 'Redesign and ongoing maintenance of the website of the Faculty of Exact and Natural Sciences (Universidad Nacional de Colombia, Manizales).',
    builtCard7Title: 'Droguerías Prevensur',
    builtCard7Desc: 'Online pharmacy from Pasto, Colombia: medicines, personal care and health products with home delivery.',
  },
  contact: {
    intro: "Let's talk! Pick whichever channel feels right and send me a message — I'd love to hear from you.",
  },
  notFound: {
    message: 'Page not found :/',
    goHome: 'Go home',
  },
  scripts: {
    intro1: 'If you want, you can access my small Python repository with:',
    intro2: 'To install the file directly you can use:',
    intro3: 'Some algorithms:',
    copy: 'Copy',
  },
  tools: {
    minecraft: {
      subtitle: 'Minecraft Coordinates',
      desc: 'Convert between Overworld and Nether coordinates (× 8 / ÷ 8).',
      coordsLabel: 'Coordinates (space-separated)',
      overworldToNether: 'Overworld → Nether (× 8)',
      netherToOverworld: 'Nether → Overworld (÷ 8)',
    },
    stringTool: {
      subtitle: 'String Tool',
      sourceString: 'Source string',
      prefixWhole: 'Prefix (whole string)',
      suffixWhole: 'Suffix (whole string)',
      charPrefix: 'Char prefix',
      charSuffix: 'Char suffix',
      repeat: 'Repeat ×',
      truncate: 'Truncate ÷',
      splitBy: 'Split by',
      joinBy: 'Join by',
      length: 'Length:',
    },
  },
  games: {
    tictactoe: {
      subtitle: 'Tic-Tac-Toe',
      restart: 'Restart',
    },
    minesweeper: {
      subtitle: 'Minesweeper',
      height: 'Height',
      width: 'Width',
      newGame: 'New Game',
      playerId: 'Player ID',
      load: 'Load',
      register: 'Register',
      time: 'Time: 00s',
      percentage: 'Percentage: 0%',
      mines: 'Mines: 0',
      score: 'Score: 0',
      name: 'Name',
      digitCode: '4-digit code',
    },
    sudoku: {
      subtitle: 'Sudoku',
    },
  },
}
