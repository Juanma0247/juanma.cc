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
    accessibility: string
    space: string
  }
  projectsIndex: {
    featured: string
  }
  tags: Record<string, string>
  cardTitles: Record<string, string>
  // Dynamic text rendered by the interactive project/tool JS (public/js/lib).
  // Keyed by project; values may be strings or string arrays.
  pd: Record<string, Record<string, string | string[]>>
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
      previewNavHome: string
      previewNavAbout: string
      previewNavProjects: string
      previewBtn: string
      previewLink: string
      presetsLabel: string
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
    account: {
      title: string
      desc: string
      prompt: string
      infoLabel: string
      signIn: string
      signOut: string
      saved: string
    }
    web: {
      active: string
    }
    reset: string
    resetHint: string
    storageNote: string
  }
  space: {
    title: string
    intro: string
    web: {
      title: string
      desc: string
      theme: string
      font: string
      lang: string
      none: string
      apply: string
      remove: string
      active: string
    }
    kiosk: {
      title: string
      desc: string
      destination: string
      activate: string
      release: string
      active: string
    }
  }
  kiosk: {
    restricted: string
    remaining: string
    gotIt: string
  }
  home: {
    tagline: string
    accessibility: string
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
    saveContact: string
  }
  a11y: {
    mainNav: string
    toggleMenu: string
    close: string
    previous: string
    next: string
    imageGallery: string
    goHome: string
    goBack: string
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
      vsPc: string
      draw: string
      oWins: string
      xWins: string
      title: string
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
      saveGame: string
      statTime: string
      statPercentage: string
      statMines: string
      statScore: string
      kaboom: string
      boardClear: string
      msgEnterName: string
      msgCode4: string
      msgUserExists: string
      msgSavedId: string
      msgUserNotFound: string
      msgNoSavedGame: string
      msgGameSaved: string
      encouragements: string[]
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
    accessibility: 'Accessibility',
    space: 'Space',
  },
  projectsIndex: {
    featured: 'Featured',
  },
  tags: {
    automatatheory: 'Automata Theory',
    computability: 'Computability',
    formallanguages: 'Formal Languages',
    enumeration: 'Enumeration',
    nonlinear: 'Nonlinear',
    dynamicalsystems: 'Dynamical Systems',
    phaseplane: 'Phase Plane',
    linearalgebra: 'Linear Algebra',
    matrices: 'Matrices',
    algorithms: 'Algorithms',
    datastructures: 'Data Structures',
    fractals: 'Fractals',
    geometry: 'Geometry',
    visualization: 'Visualization',
    statistics: 'Statistics',
    probability: 'Probability',
    distribution: 'Distribution',
    algebra: 'Algebra',
    polynomials: 'Polynomials',
    arithmetic: 'Arithmetic',
    numbertheory: 'Number Theory',
    audio: 'Audio',
    webapi: 'Web API',
    settheory: 'Set Theory',
    inequalities: 'Inequalities',
    realanalysis: 'Real Analysis',
    convexity: 'Convexity',
    cardinality: 'Cardinality',
    bijection: 'Bijection',
    topology: 'Topology',
    logic: 'Logic',
    discretemath: 'Discrete Math',
    cryptography: 'Cryptography',
    strategy: 'Strategy',
    boardgame: 'Board Game',
    '2players': '2 Players',
    puzzle: 'Puzzle',
    online: 'Online',
    numbers: 'Numbers',
    minecraft: 'Minecraft',
    coordinates: 'Coordinates',
    gaming: 'Gaming',
    strings: 'Strings',
    text: 'Text',
    utility: 'Utility',
    android: 'Android',
    automation: 'Automation',
    networking: 'Networking',
  },
  cardTitles: {
    autowifiunal: 'Auto WiFi UNAL',
    'nonlinear-systems': 'Nonlinear Systems',
    'linear-systems': 'Linear Systems',
    'turing-machine': 'Turing Machine',
    'recursive-concat': 'Recursive Concat.',
    'sigma-star-enum': 'Enum of Σ*',
    'regular-expressions': 'Regular Expr.',
    'cross-matrix': 'Cross Matrix',
    sorting: 'Sorting',
    fanctal: 'Fanctal',
    bernoulli: 'Bernoulli',
    'distribution-functions': 'Distributions',
    ruffini: 'Ruffini',
    fractions: 'Fractions',
    voice: 'Voice',
    'cantor-pairing': 'Cantor Pairing',
    sets: 'Sets',
    'hill-cipher': 'Hill Cipher',
    'tic-tac-toe': 'Tic-Tac-Toe',
    minesweeper: 'Minesweeper',
    sudoku: 'Sudoku',
    'minecraft-coords': 'Minecraft Coords',
    'string-tool': 'String Tool',
  },
  pd: {
    autowifiunal: {
      qLabel: 'What does this do?',
      copy: 'Copy',
      copied: 'Copied!',
      close: 'Close',
      introLead: 'Every time you join the <b>EstudiantesUN</b> network, the university portal asks you to accept its terms, and sometimes to sign in, before it lets you online. This guide automates that step on Android: the phone joins the network by itself and, about 30 seconds later, you have internet without opening anything.',
      chipAndroid: 'Android 7 or newer',
      chipTime: 'About 20 minutes, once',
      chipCost: 'Free',
      chipOpen: 'Open source',
      introTrust: 'Every line of code is on this page, explained. Nothing is hidden, nothing is sent to third-party servers, and you can read it all before installing. The only thing that changes from one person to the next is the UNAL username and password.',
      desktopTitle: 'Open this guide on your phone',
      desktopText: 'The whole setup happens on the Android phone. Scan this code with its camera so the downloads land straight on it.',
      iosTitle: 'This guide is for Android only',
      iosText: 'iPhone does not allow Termux or scripts that run in the background, so on iOS the portal still has to be accepted by hand in the browser.',
      phoneTitle: 'Your phone',
      phoneIntro: 'Choose your phone so the steps show the right menus.',
      brandLabel: 'Brand',
      brandSamsung: 'Samsung',
      brandXiaomi: 'Xiaomi · Redmi · POCO',
      brandStock: 'Pixel · Motorola · Nokia',
      brandHuawei: 'Huawei · Honor',
      brandOppo: 'OPPO · realme · OnePlus',
      brandOther: 'Other brand',
      versionLabel: 'Android version',
      version10: 'Android 10 or newer',
      version8: 'Android 8 or 9',
      version7: 'Android 7',
      version6: 'Android 6 or older',
      tipVersion: 'Open <b>Settings → About phone</b> (on some phones inside <b>Software information</b>) and look for <b>Android version</b>.',
      detected: 'Detected on this device: {device}. Change it if it is not right.',
      unsupported: 'Termux needs Android 7 or newer, so this automation cannot run on this phone. You can still accept the portal by hand in the browser.',
      settingsSearch: '<b>Can\'t find a menu?</b> Names change a little by brand and Android version. Open Settings, tap the search icon and type the word in bold from the step.',
      progressLabel: 'Progress',
      progressCount: '{done} of {total} steps',
      progressReset: 'Start over',
      progressNote: 'Saved only in this browser.',
      moreLabel: 'Reference',
      navStep1: 'Network',
      navStep2: 'Apps',
      navStep3: 'Permissions',
      navStep4: 'Termux',
      navStep5: 'Macro',
      navStep6: 'Test',
      flowTitle: 'How it works',
      flowIntro: 'Five links in a chain, all inside your phone. Tap any <b>?</b> to see exactly what each one does.',
      flowAndroidText: 'Joins EstudiantesUN by itself',
      flowMacroText: 'Notices the connection',
      flowTaskerText: 'Passes the order to Termux',
      flowTermuxText: 'Runs the script',
      flowPortalTitle: 'UNAL portal',
      flowPortalText: 'Lets you online',
      flowTime: 'About 30 seconds from connecting to browsing.',
      tipFlowAndroid: 'The phone rejoins EstudiantesUN on its own because you save the network with automatic reconnection turned on (step 1). You do not need to open any app.',
      tipFlowMacro: '<b>MacroDroid</b> is an automation app: "if this happens, do that". Here it does one thing: when the phone connects to EstudiantesUN, it asks Termux:Tasker to run <code>unal.sh</code>. It needs location (Android only tells apps the Wi-Fi name with that permission) and permission to run commands in Termux. Nothing else.',
      tipFlowTasker: '<b>Termux:Tasker</b> is an official Termux add-on. It is the bridge that lets another app ask Termux to run a script. It only runs scripts stored in <code>~/.termux/tasker/</code>, and only for apps you have granted "Run commands in Termux environment".',
      tipFlowTermux: '<b>Termux</b> is an open-source Linux command line for Android. <code>unal.sh</code> loads your credentials and starts <code>unal_wifi_login.py</code>, a Python program that finds the portal, accepts the terms, signs in if asked, checks that there is internet and writes every step to <code>~/unal_wifi.log</code>. It has no root access: it works inside its own private folder.',
      tipFlowPortal: 'The university\'s captive portal (FortiGate, at <code>porta.unal.edu.co:1003</code>). The script sends <code>answer=1</code>, exactly what the "Yes, I agree" button sends, and your username and password only if the portal asks for them, and only to <code>unal.edu.co</code> addresses.',
      markDone: 'Mark this step as done',
      allDone: '<b>All set.</b> Next time you arrive on campus, the phone gets through the portal by itself.',
      s1Title: 'Join EstudiantesUN',
      s1Meta: 'Once, on campus · 2 min',
      s1Open: 'Open the Wi-Fi settings and tap <b>EstudiantesUN</b>:',
      s1PathSamsung: '<b>Settings → Connections → Wi-Fi</b>',
      s1PathStock: '<b>Settings → Network &amp; internet → Internet</b> (on Android 11 or older, <b>Wi-Fi</b>)',
      s1PathWifi: '<b>Settings → Wi-Fi</b>',
      s1PathOther: '<b>Settings → Wi-Fi</b> (the exact path varies by brand)',
      s1Password: 'Type the network password:',
      tipPassword: 'This is the network\'s public password, the same for every student. It only lets you join the Wi-Fi; your personal UNAL account is what the portal may ask for afterwards.',
      s1Auto: 'Turn on automatic reconnection for this network:',
      s1AutoSamsung: 'Tap the gear ⚙ next to EstudiantesUN and turn on <b>Auto reconnect</b>.',
      s1AutoStock: 'Tap EstudiantesUN, then the gear ⚙, and turn on <b>Auto-connect</b>.',
      s1AutoOther: 'Open the saved network\'s details and turn on the automatic option. Depending on the phone it is called <b>Auto reconnect</b>, <b>Auto-connect</b> or <b>Connect automatically</b>.',
      tipAuto: 'Without this, the phone does not rejoin the network by itself, so the macro never fires.',
      s1Switch: 'Recommended: stop the phone from leaving the network while the portal is still pending.',
      s1SwitchSamsung: '<b>Settings → Connections → Wi-Fi → ⋮ → Intelligent Wi-Fi</b>: turn off <b>Switch to mobile data</b> and <b>Switch to better Wi-Fi networks</b>.',
      s1SwitchXiaomi: 'If your phone has a <b>Wi-Fi assistant</b> (in the Wi-Fi settings), turn off its switch to mobile data.',
      s1SwitchHuawei: 'Turn off <b>Wi-Fi+</b> (in the Wi-Fi settings), which hops between Wi-Fi and mobile data.',
      s1SwitchOther: 'If your phone has an option that moves to mobile data when the Wi-Fi has no internet (often called <b>automatic switch to mobile data</b> or <b>Wi-Fi assistant</b>), turn it off.',
      tipSwitch: 'Until the portal lets you through, EstudiantesUN has no internet. With these options on, the phone may drop the network, or hop to another university network, while the script is still working.',
      s2Title: 'Install the three apps',
      s2Meta: 'About 5 min',
      s2Rule: '<b>One source for Termux and Termux:Tasker.</b> Get both from F-Droid (recommended) or both from GitHub, never one from each.',
      tipRule: 'Termux and its add-ons must be signed with the same key. If Termux comes from one source and Termux:Tasker from another, Android does not let them work together and the add-on fails.',
      s2PlayWarn: '<b>Already have Termux from the Play Store?</b> Uninstall it first. It cannot be combined with Termux:Tasker from F-Droid.',
      appTermuxRole: 'Linux command line that runs the scripts.',
      appTaskerRole: 'Bridge that lets MacroDroid start a Termux script.',
      appMacroRole: 'Notices the connection and fires the script.',
      btnApk: 'Download APK',
      btnFdroid: 'F-Droid page',
      btnPlay: 'Open in Google Play',
      btnSite: 'Official site',
      tipTermux: '<b>What it is:</b> an open-source (GPLv3) Linux environment for Android. <b>What it does here:</b> runs <code>unal.sh</code> and the Python program. <b>How it touches your phone:</b> it works inside its own private folder (<code>/data/data/com.termux</code>); it only uses the internet and, if you allow it with <code>termux-setup-storage</code>, the shared storage (Downloads). It has no administrator (root) access.',
      tipTasker: '<b>What it is:</b> an official Termux add-on. <b>What it does here:</b> it is the bridge that lets MacroDroid ask Termux to run a script. <b>How it touches your phone:</b> it only runs scripts stored in <code>~/.termux/tasker/</code>, and only for apps you grant "Run commands in Termux environment".',
      tipMacro: '<b>What it is:</b> an automation app ("if this happens, do that") by ArloSoft, published on Google Play. <b>What it does here:</b> it notices that you joined EstudiantesUN and fires the script. <b>How it touches your phone:</b> this macro only needs location (to read the Wi-Fi name) and permission to run commands in Termux. The free version allows up to 5 macros and shows ads; this project uses one.',
      tipApk: 'The direct APK is a specific version: the stable one F-Droid suggests. If a newer one comes out, the F-Droid page links to it. Installing through the F-Droid client also notifies you about updates.',
      s2Do1: 'From your phone, download <b>Termux</b> and <b>Termux:Tasker</b> with the buttons above.',
      s2Do2v8: 'Open each downloaded APK. Android will ask you to allow <b>Install unknown apps</b> for your browser: allow it, go back and install.',
      s2Do2v7: 'Turn on <b>Unknown sources</b> (usually in <b>Settings → Security</b> or <b>Lock screen and security</b>), then open each downloaded APK and install it.',
      tipUnknown: 'While this permission is on, any APK you download could be installed (on Android 8 or newer, with that browser; on Android 7, from any app). That is why you only download from the official links above and turn it off again right after.',
      s2Do3: 'If <b>Play Protect</b> or your brand\'s own protection warns that the app is unknown, choose <b>Install anyway</b> (or the equivalent option).',
      s2Do3Samsung: 'If <b>Auto Blocker</b> is on, turn it off for a moment: <b>Settings → Security and privacy → Auto Blocker</b>.',
      s2Do3Xiaomi: 'If a security scan appears, let it finish and choose to install anyway.',
      tipPlayProtect: 'Play Protect and each brand\'s security scanner warn about any app that does not come from their store; it is not a sign of malware. F-Droid builds Termux from its public source code on its own servers, signs it and publishes the build log.',
      s2Do4v8: 'Turn <b>Install unknown apps</b> back off for your browser.',
      s2Do4v7: 'Turn <b>Unknown sources</b> back off.',
      s2Do5: '<b>Open Termux once</b> and wait until "Installing bootstrap packages…" finishes.',
      tipBootstrap: 'The first launch unpacks Termux\'s base system (bash, the package manager and so on). Without it, Termux:Tasker has nothing to run the scripts with.',
      s2Do6: 'Install <b>MacroDroid</b> from Google Play, open it and finish the welcome screens. No need to pay for Pro.',
      s2Huawei: '<b>Huawei or Honor without Google services:</b> MacroDroid is distributed through Google Play, so check that you can install it before you start.',
      s2FdroidClient: 'Prefer automatic update notices? Install the <a href="https://f-droid.org/" target="_blank" rel="noopener">F-Droid client</a> and get both apps from there.',
      whyTitle: 'Why not install Termux from the Play Store?',
      whyP1: '<b>History.</b> Google Play started requiring apps to target recent Android versions. Since Android 10, those versions forbid an app from running programs downloaded into its own folder, which is exactly how Termux runs its packages (Python, bash…). So the Play version froze and is considered obsolete.',
      whyP2: '<b>The current Play version (since 2024)</b> is not maintained by the main Termux team. It is a separate branch that works around the restriction, only runs on Android 11 or newer, has features and security fixes reverted and dropped part of the functions for external apps. The Termux team itself says it is installed "at your own risk".',
      whyP3: '<b>Sources cannot be mixed.</b> Termux and its add-ons must share the same signature, so Termux:Tasker from F-Droid does not work with Termux from Play.',
      safeTitle: 'Why are F-Droid and GitHub safe?',
      safeP1: 'They are the official sources the Termux project lists on its own page.',
      safeP2: 'Termux is open source (GPLv3): anyone can read its code on GitHub.',
      safeP3: 'F-Droid builds the app from that public code on its own servers, signs it and publishes the build log, so the APK you download comes from code anyone can audit.',
      safeP4: 'F-Droid reports no "anti-features" (trackers, ads or proprietary dependencies) for Termux.',
      safeP5: 'The packages you install inside Termux (<code>pkg install …</code>) come from Termux\'s repositories, and the package manager checks their signatures first.',
      s3Title: 'Permissions and battery',
      s3Meta: 'About 3 min',
      s3Run: 'Allow MacroDroid to run commands in Termux: open <b>Settings → Apps → MacroDroid → Permissions</b> and allow <b>Run commands in Termux environment</b>. It is usually at the end of the list, under <b>Additional permissions</b> or <b>Other permissions</b> depending on the brand.',
      s3RunNote: 'MacroDroid may also ask for it by itself when you add the Termux action.',
      tipRun: 'This is the only door between MacroDroid and Termux. Termux:Tasker checks this permission before running anything and only runs scripts from <code>~/.termux/tasker/</code>. Give it to MacroDroid only; the riskier <code>allow-external-apps</code> option stays off.',
      s3Loc10: 'Location for MacroDroid: <b>Settings → Apps → MacroDroid → Permissions → Location → Allow all the time</b>.',
      s3Loc8: 'Location for MacroDroid: <b>Settings → Apps → MacroDroid → Permissions → Location → Allow</b>.',
      s3LocOn: 'Keep the phone\'s <b>location turned on</b>.',
      tipLoc: 'Android only tells apps the name of the Wi-Fi network if they have location permission and location is turned on. This macro does not use where you are; it only needs to read "EstudiantesUN".',
      s3Battery: 'Remove battery limits for <b>MacroDroid</b>, <b>Termux</b> and <b>Termux:Tasker</b>:',
      s3BatSamsung: '<b>Settings → Apps → [app] → Battery → Unrestricted</b>. Also open <b>Settings → Battery → Background usage limits</b> and make sure none of the three is in the sleeping or deep sleeping lists.',
      s3BatXiaomi: '<b>Settings → Apps → Manage apps → [app] → Battery saver → No restrictions</b>, and turn on <b>Autostart</b> on the same screen.',
      s3BatStock: '<b>Settings → Apps → [app] → App battery usage → Unrestricted</b>. On Android 11 or older: <b>Battery optimization → All apps → [app] → Don\'t optimize</b>.',
      s3BatHuawei: '<b>Settings → Battery → App launch → [app]</b>: turn off <b>Manage automatically</b> and turn on auto-launch, secondary launch and run in background.',
      s3BatOppo: '<b>Settings → Apps → App management → [app] → Battery usage</b>: allow background activity and auto launch.',
      s3BatOther: '<b>Settings → Apps → [app] → Battery</b> and choose <b>Unrestricted</b> (or <b>Don\'t optimize</b>).',
      s3BatLink: 'Detailed guide for your brand on dontkillmyapp.com',
      tipBattery: 'To save battery, Android closes apps in the background. If it closes MacroDroid, the macro does not fire; if it limits Termux, the script can be cut off halfway.',
      s4Title: 'Install the scripts in Termux',
      s4Meta: '5 to 10 min',
      tabInstaller: 'Installer',
      tabRecommended: 'Recommended',
      tabCurl: 'No browser',
      tabManual: 'Manual',
      s4aDownload: 'Download the three files to your phone. They land in <b>Downloads</b>:',
      s4aSeeCode: 'Read the code first',
      s4aStorage: 'Open <b>Termux</b> and give it access to storage (first time only):',
      tipStorage: '<code>termux-setup-storage</code> asks Android for the storage permission and creates <code>~/storage</code>, with shortcuts such as <code>~/storage/downloads</code> (your Downloads folder). It only reaches shared storage, never other apps\' data.',
      s4aStorageNote: 'Accept the permission. If it asks <code>Do you want to continue? (y/n)</code>, type <code>y</code> and press Enter.',
      s4aRun: 'Run the installer:',
      tipRunInstaller: '<code>bash</code> is the command interpreter, <code>~</code> is your Termux home folder and <code>~/storage/downloads/instalar.sh</code> is the installer in Downloads. Together: "run the installer". It only uses the three files you downloaded.',
      s4aStages: 'It does the rest on its own, in six stages:',
      stage1: 'Updates Termux\'s packages. <b>The first time it can take several minutes.</b>',
      tipStage1: '<code>pkg update</code> fetches the list of available packages and <code>apt-get upgrade</code> updates the installed ones; Termux recommends it before installing anything new. The <code>Dpkg::Options</code> flags answer the "replace this configuration file?" questions on their own, keeping yours.',
      stage2: 'Installs Python.',
      tipStage2: 'Python 3 is the language the portal program is written in; it comes with <code>pip</code>, its library manager. Python was chosen because the portal has to be read (finding the form fields in its HTML), traffic has to be forced through the Wi-Fi and the certificate verified, which is clearer and more reliable in Python than in bash.',
      stage3: 'Installs the <code>requests</code> library.',
      tipStage3: '<code>requests</code> is a very common Python library for web requests: opening pages, following redirects, sending forms and handling cookies. If <code>pip</code> refuses with "externally-managed-environment", the installer retries with <code>--break-system-packages</code>, which inside Termux only affects Termux, not Android.',
      stage4: 'Copies <code>unal_wifi_login.py</code> to Termux\'s home folder and <code>unal.sh</code> to <code>~/.termux/tasker/</code>.',
      tipStage4: '<code>~/.termux/tasker/</code> is the only folder Termux:Tasker runs scripts from. The installer gives it and the launcher permissions <code>700</code>: only Termux can read, change or run them.',
      stage5: '<b>Asks for your UNAL username and password.</b> Username <b>without</b> <code>@unal.edu.co</code> (for example <code>jperez</code>); if you add the domain, the installer removes it. The password does not show while you type; that is normal.',
      tipStage5: 'They are saved to <code>~/.unal_credenciales</code>, inside Termux\'s private folder, with permissions <code>600</code> (only Termux can read it). They never end up in Downloads or inside the scripts.',
      stage6: 'Checks that everything is in place.',
      s4aEnd: 'It should finish with:',
      s4aRenamed: '<b>Did the browser rename a file</b> (for example <code>unal-1.sh</code> or <code>unal (1).sh</code>)? No problem: the installer always picks the most recent one.',
      s4bIntro: 'Skip the browser downloads and the storage permission: Termux fetches the three files from this site into a folder of its own.',
      s4bFetch: 'Open <b>Termux</b>, paste this and press Enter:',
      tipCurl: '<code>mkdir -p</code> creates the folder <code>~/autowifiunal</code> and <code>cd</code> enters it. <code>curl</code> downloads each file: <code>-f</code> stops on server errors, <code>-L</code> follows redirects and <code>-O</code> keeps the original name. <code>sha256sum</code> then prints the fingerprint of each file.',
      s4bCompare: 'Compare the three fingerprints with the ones in <a href="#p21Files">The files</a>.',
      s4bRun: 'Run the installer from that folder:',
      s4bStages: 'It goes through the same six stages as in the first tab, including the question for your username and password.',
      s4bNoCurl: '<b>"curl: command not found"?</b> Run <code>pkg upgrade</code> (press Enter if it asks about configuration files), then <code>pkg install curl</code>, and try again.',
      s4cIntro: 'Exactly what <code>instalar.sh</code> does, one command at a time. It needs the three files in Downloads and <code>termux-setup-storage</code> already done (first tab, points 1 and 2).',
      mUpdate: 'Downloads the updated list of packages. <code>-y</code> answers "yes" to confirmations.',
      mUpgrade: 'Updates the installed packages and keeps your configuration files without asking. By hand you can also use <code>pkg upgrade</code> and press Enter at each question.',
      mPython: 'Installs Python 3 and its library manager, <code>pip</code>.',
      mRequests: 'Installs <code>requests</code> from PyPI, Python\'s official repository. If it answers "externally-managed-environment", use <code>pip install --break-system-packages requests</code>.',
      mCopyPy: '<code>cp SOURCE DESTINATION</code> copies a file: here, the Python program from Downloads to Termux\'s private home folder.',
      mMkdir: 'Creates the folder Termux:Tasker runs scripts from. <code>-p</code> creates any intermediate folder and does not fail if it already exists.',
      mChmodDir: '<code>700</code> means "only the owner (Termux) can read, write and enter". Termux:Tasker requires it.',
      mCopySh: 'Copies the launcher to the Termux:Tasker folder and makes it executable, for the owner only.',
      mNano: 'Creates the credentials file in <code>nano</code>, a terminal text editor. Write these two lines with your data between single quotes, username without <code>@unal.edu.co</code>. Save with <b>Ctrl+O</b> and Enter, exit with <b>Ctrl+X</b> (CTRL is on Termux\'s extra keys row).',
      mChmodCred: '<code>600</code> means "only the owner can read and write; nobody can run it". It protects your credentials.',
      mQuote: '<b>Password with a single quote (\')?</b> Use the installer instead: it writes the file in the right format automatically.',
      credUser: 'your_username',
      credPass: 'your_password',
      s5Title: 'Create the macro in MacroDroid',
      s5Meta: 'About 3 min',
      s5Add: 'Open MacroDroid → <b>Add Macro</b> and name it <b>Auto WiFi UNAL</b>.',
      s5Trigger: '<b>Trigger</b> (what starts it): tap <b>+</b> in Triggers → <b>Connectivity</b> → <b>Wifi State Change</b> → <b>Connected to network</b> and pick <b>EstudiantesUN</b> (or type the exact name, capitals included).',
      tipTrigger: 'It fires every time the phone joins that network, whether you connected by hand or it did so automatically.',
      s5Action: '<b>Action</b> (what it does): tap <b>+</b> in Actions, search <b>Termux</b> with the magnifier and fill it in like this:',
      fExec: 'Executable',
      fArgs: 'Arguments',
      fDir: 'Working directory',
      fStdin: 'Stdin',
      fTerminal: 'Execute in a terminal session',
      fWait: 'Wait for result',
      fEmpty: 'Empty',
      fOn: 'On',
      fOff: 'Off',
      tipExec: 'Just the name, with no path: Termux:Tasker looks for it in <code>~/.termux/tasker/</code>.',
      tipTerminal: 'Off, so it runs in the background without opening Termux.',
      tipWait: 'On, so MacroDroid\'s log shows whether it finished.',
      s5Constraints: '<b>Constraints:</b> none.',
      tipConstraints: 'With no constraints, the macro runs every time the trigger happens.',
      s5Save: 'Save the macro ✓ and check that it is <b>enabled</b>.',
      s5Log: 'In MacroDroid\'s <b>System log</b> (☰ → System log) you will see something like:',
      macroLogTrigger: 'Connected to network (EstudiantesUN)',
      s5NoAction: 'Don\'t see the Termux action?',
      s5NoActionText: 'Update MacroDroid from Google Play and search again. Also check that Termux:Tasker is installed and that you opened Termux once.',
      s5Tasker: 'Using Tasker instead of MacroDroid?',
      s5TaskerText: 'Create a profile <b>State → Net → Wifi Connected</b> with SSID <b>EstudiantesUN</b>. For its task add <b>Plugin → Termux:Tasker</b>, open its configuration and write <code>unal.sh</code> as the executable, without a terminal session. Grant Tasker the "Run commands in Termux environment" permission (step 3, point 1).',
      s6Title: 'Test it',
      s6Meta: 'At home, then on campus',
      s6HomeTitle: 'At home',
      s6HomeText: 'Check that the installation is right. Run this in Termux:',
      tipHomeRun: 'It runs by hand the same file MacroDroid runs. At home it is harmless: it sees there is already internet and stops.',
      s6Expect: 'Expected answer:',
      s6CampusTitle: 'On campus',
      s6Campus1: 'Connect to EstudiantesUN, or let the phone do it, and <b>do not open the portal</b>.',
      s6Campus2: 'Wait about <b>30 seconds</b> and try browsing.',
      s6Campus3: 'To see what happened, open Termux and run:',
      tipCat: '<code>cat</code> prints a whole file; <code>~/unal_wifi.log</code> is the log of every connection. It never stores your password.',
      s6Success: 'If everything went well:',
      s6LoginLine: 'If the portal also asks for your account, an extra line appears: <code>Paso 2: enviando usuario y contraseña.</code>',
      s6LogLang: 'The script writes its messages in Spanish, as you will see them in Termux.',
      s6Fail: 'Not working? Look up the message from your log in <a href="#p21Trouble">Troubleshooting</a>.',
      filesTitle: 'The files',
      filesIntro: 'The same code that runs on your phone, without comments. Download it, read it here block by block, or check its SHA-256 fingerprint.',
      fileInstaller: 'Prepares Termux: installs what is needed, copies the scripts and saves your credentials. Used once.',
      fileLauncher: 'What MacroDroid runs. Loads your credentials and starts the Python program.',
      fileProgram: 'The program that finds the portal and gets you through it.',
      fileWhere: 'Ends up in',
      fileWhereInstaller: 'Downloads, where it runs from',
      viewCode: 'View code',
      download: 'Download',
      downloadAll: 'Download all three',
      downloadAllNote: 'Your browser may ask for permission to download several files.',
      hashOk: 'Fingerprint checked in your browser',
      hashBad: 'The fingerprint does not match',
      hashCheck: 'Check them in Termux:',
      tipHash: '<code>sha256sum</code> computes a "fingerprint" of each file. If a single character changes, the fingerprint changes completely, so it must match the one shown here. This page also checks it in your browser.',
      viewerCode: 'Code',
      viewerExplained: 'Explained',
      viewerLine: 'Line',
      viewerLines: 'Lines',
      loadError: 'The file could not be loaded. Try downloading it instead.',
      pyShebang: 'Shebang: tells the system to run this file with Python 3.',
      pyImports: 'Standard modules (HTML text, environment variables, regular expressions, sockets, arguments, time and URLs) plus <code>requests</code>, the only external library, and the parts of <code>urllib3</code> it uses under the hood.',
      pyWarnings: 'Silences the warning printed when HTTPS is used without verifying the certificate. That only happens if the portal\'s certificate cannot be verified (see <code>portal_peticion</code>).',
      pyConfig: 'Settings. Username and password come from <code>unal.sh</code> as environment variables. <code>UNAL_IFACE</code> (Wi-Fi interface, <code>wlan0</code>), <code>UNAL_DOMINIO</code> (the only domain data is sent to) and <code>UNAL_TLS_ESTRICTO</code> can be changed without touching the code. It also sets the two test addresses, 10 attempts 3 seconds apart, the log path and the <code>--debug</code> flag.',
      pyLog: 'Writes each message with date and time, on screen and at the end of <code>~/unal_wifi.log</code>. If the file cannot be written, it carries on.',
      pyStop: '<code>Detener</code> ("stop") is the error used for problems that retrying will not fix (a rejected password, a foreign portal…), so the script stops right away.',
      pyAdapter: 'Forces every connection out through the Wi-Fi. While the network has no internet, Android sends apps\' traffic through mobile data; without this the script would see internet (over data) and never find the portal. <code>SO_BINDTODEVICE</code> is a standard Linux option that ties a socket to a network interface.',
      pySession: 'Creates the HTTP session, which keeps cookies between requests. It first tries to tie it to <code>wlan0</code>; if Android does not allow it, it falls back to the default network and leaves a hint in the log: turn off mobile data.',
      pyInternet: 'Asks <code>generate_204</code>, the same address Android uses: an empty 204 answer means real internet. Any other answer, or a network error, means there is none.',
      pyAllowed: 'Security check: true only if the address belongs to <code>unal.edu.co</code> or one of its subdomains.',
      pyRequest: 'Talks to the portal verifying its HTTPS certificate, like a browser. If it cannot verify it, it logs a warning and repeats without verifying, unless <code>UNAL_TLS_ESTRICTO=1</code>, in which case it stops.',
      pyFind: 'Finds the portal: asks for <code>generate_204</code> and <code>neverssl.com</code> without following redirects. If it is sent to a <code>…/fgtauth?…</code> address (FortiGate authentication), by header or by JavaScript inside the page, that is the portal.',
      pyForm: 'Reads the real form of the page instead of guessing it: every <code>&lt;input name=… value=…&gt;</code> and the address it is sent to (<code>action</code>). That way it keeps working if the portal changes minor details.',
      pyDebug: 'With <code>--debug</code>, saves the HTML of each portal page to <code>~/unal_portal_1.html</code>, <code>_2</code>… to diagnose changes.',
      pyPass: 'Goes through up to three portal pages, and every form must point to <code>unal.edu.co</code>. On the terms page it sends <code>answer=1</code> ("Yes, I agree"); on the login page it fills in your username and password. If the portal shows the password field again, it was rejected, and the script stops so it does not lock your account with repeated attempts. At the end it waits 2 seconds and checks for internet.',
      pyMain: 'Entry point: picks the session and makes up to 10 attempts, 3 seconds apart. Each attempt looks for the portal: with no portal and internet, it is done; with a portal, it goes through it. A <code>Detener</code> error stops everything; a network error (no IP address yet…) only means trying again.',
      pyEntry: 'Runs <code>main()</code> only when the file is executed directly, and returns its exit code: 0 means connected, 1 means it failed.',
      shShebang: 'Shebang: runs the file with Termux\'s own bash.',
      shCred: 'Path of the private credentials file. If it exists, it is loaded, which defines <code>UNAL_USER</code> and <code>UNAL_PASS</code> (and any extra option you add there).',
      shExport: 'Passes them to the Python program as environment variables.',
      shSleep: 'Waits 4 seconds so Android can give the Wi-Fi an IP address.',
      shRun: 'Runs the Python program. <code>"$@"</code> forwards arguments such as <code>--debug</code>, and <code>2&gt;&gt;</code> appends any unexpected Python error to the same log.',
      inShebang: 'Shebang: runs the file with Termux\'s bash.',
      inSetE: 'If any command fails, the installer stops right there instead of carrying on half-done.',
      inOrigin: 'The folder the installer is in (Downloads, or <code>~/autowifiunal</code>).',
      inFind: 'Finds the other two files. <code>ls -t</code> sorts newest first and <code>head -n 1</code> takes the first one, so it works even if the browser renamed them (<code>unal-1.sh</code>, <code>unal (1).sh</code>).',
      inMissing: 'If either file is missing, it says so and ends with an error.',
      inStage1: '[1/6] Updates the package list and the installed packages, answering the configuration-file questions by keeping yours.',
      inStage2: '[2/6] Installs Python 3, pip included.',
      inStage3: '[3/6] Installs <code>requests</code>; if pip refuses with "externally-managed-environment", it retries with <code>--break-system-packages</code> (inside Termux it only affects Termux).',
      inStage4: '[4/6] Copies the Python program to the home folder and the launcher to <code>~/.termux/tasker/</code>, with permissions <code>700</code>.',
      inStage5: '[5/6] Asks for your username (removing <code>@unal.edu.co</code> if you typed it) and your password without showing it (<code>-s</code>). <code>umask 077</code> makes new files private, <code>%q</code> protects special characters in the password and <code>chmod 600</code> leaves the file readable only by Termux.',
      inStage6: '[6/6] Checks that <code>requests</code> loads, that the program has no syntax errors and that the launcher is in place.',
      inEnd: 'Final message: what to put in MacroDroid and how to read the log.',
      troubleTitle: 'Troubleshooting',
      troubleIntro: 'The first step is always to read the log:',
      troubleSearch: 'Search the message you see…',
      troubleEmpty: 'Nothing matches. Try a shorter word from the message.',
      grpInstall: 'Installation',
      grpMacro: 'MacroDroid',
      grpLog: 'The log',
      cause: 'Cause',
      fix: 'Fix',
      trMixTitle: '"App not installed" / "Package appears to be invalid" / INSTALL_FAILED_SHARED_USER_INCOMPATIBLE',
      trMixCause: 'Termux and Termux:Tasker come from different sources (for example, one from Play and the other from F-Droid).',
      trMixFix: 'Uninstall <b>both</b> and install them again from F-Droid.',
      trBlockedTitle: 'Android blocks the APK installation',
      trBlockedCause: 'The permission to install unknown apps is missing, or a protection on the phone stops apps that do not come from its store (Play Protect or your brand\'s own, such as Samsung\'s Auto Blocker or Xiaomi\'s security scan).',
      trBlockedFix: 'Grant the permission to your browser (on Android 7, <b>Unknown sources</b>) and, if needed, pause that protection for a moment; install, then set everything back as it was.',
      trStatTitle: 'cp: cannot stat \'…/storage/downloads/…\': No such file or directory',
      trStatCause: 'The file is not downloaded yet, the browser saved it under another name (for example <code>unal_wifi_login-1.py</code> or <code>unal_wifi_login (1).py</code>), or it saved it to another folder, such as the SD card.',
      trStatFix: 'Check the names with this command; the installer already handles renamed files on its own. If the files do not show up, move them to <b>Downloads</b> with the file manager, or use the "No browser" tab of step 4.',
      trPermTitle: 'Permission denied when entering ~/storage',
      trPermCause: 'Termux has no storage permission.',
      trPermFix: 'Run this and accept. If you denied it before, turn it on in <b>Settings → Apps → Termux → Permissions</b>: it is called <b>Storage</b> or, on recent versions, <b>Files and media</b>.',
      trMirrorTitle: 'pkg update fails with repository or "mirror" errors',
      trMirrorCause: 'The chosen mirror server is not responding.',
      trMirrorFix: 'Run this, choose another mirror (for example the "All mirrors" group) and try again.',
      trManagedTitle: 'error: externally-managed-environment while installing requests',
      trManagedCause: 'Recent pip versions protect the system\'s Python.',
      trManagedFix: 'Install it with this flag. The installer already tries it automatically; in Termux it only affects Termux, not Android.',
      trModuleTitle: 'ModuleNotFoundError: No module named \'requests\' / python: command not found',
      trModuleCause: 'Python or requests did not get installed.',
      trModuleFix: 'Install them again:',
      trCurlTitle: 'curl: command not found / CANNOT LINK EXECUTABLE',
      trCurlCause: 'Termux\'s packages are out of date, which is common right after installing it.',
      trCurlFix: 'Update everything (press Enter if it asks about configuration files) and install curl:',
      trCrlfTitle: '$\'\\r\': command not found / syntax error near unexpected token',
      trCrlfCause: 'The script went through a Windows computer and picked up Windows line endings.',
      trCrlfFix: 'Download it again directly on the phone, from this page or with the "No browser" tab of step 4.',
      trNoFireTitle: 'The macro does not fire (nothing in MacroDroid\'s log)',
      trNoFireCause: 'Android is not telling MacroDroid the network name, or MacroDroid is not running.',
      trNoFireFix: 'Check that the macro is <b>enabled</b>; that location is on and MacroDroid has location permission (<b>Allow all the time</b> on Android 10 or newer); that the trigger name is exactly <code>EstudiantesUN</code>; that MacroDroid has no battery restrictions; and, on the free version, that you do not have more than 5 macros enabled.',
      trNoLogTitle: 'The macro fires, but nothing new appears in ~/unal_wifi.log',
      trNoLogCause: 'Most likely the "Run commands in Termux environment" permission is missing, or <code>unal.sh</code> is not in <code>~/.termux/tasker/</code>.',
      trNoLogFix: 'Check the permission (step 3) and run this command: <code>unal.sh</code> must appear with permissions <code>-rwx------</code>. Open Termux at least once after installing it, and in MacroDroid write only <code>unal.sh</code>, with no path.',
      trPluginTitle: 'MacroDroid shows a "Termux:Tasker" or "plugin not found" error',
      trPluginCause: 'Termux:Tasker is missing, or it comes from a different source than Termux.',
      trPluginFix: 'Install Termux:Tasker from the <b>same source</b> as Termux and restart the phone.',
      trWlanTitle: 'No se pudo forzar wlan0 (…)',
      trWlanCause: 'The phone does not allow tying connections to the interface, or the Wi-Fi interface has another name.',
      trWlanFix: 'Quick fix: turn off mobile data when you arrive on campus. Advanced: find the Wi-Fi interface name (it usually starts with <code>wlan</code>) and add it to <code>~/.unal_credenciales</code> as <code>export UNAL_IFACE=name</code>.',
      trAlreadyTitle: 'Ya hay internet; no hay nada que hacer. (but you have no internet)',
      trAlreadyCause: 'The traffic went out through mobile data.',
      trAlreadyFix: 'Check that <code>Tráfico forzado por wlan0.</code> appears just before. If it does not, look at the error above it.',
      trNoRespTitle: 'Intento N: la red aún no responde (in every attempt)',
      trNoRespCause: 'The phone did not have an IP address yet, or the signal is very weak.',
      trNoRespFix: 'Move closer to an access point, then disconnect and reconnect the Wi-Fi so the macro fires again.',
      trRejectedTitle: 'Se detiene: el portal rechazó el usuario o la contraseña',
      trRejectedCause: 'The portal did not accept the saved credentials.',
      trRejectedFix: 'Fix them with this command. Username <b>without</b> <code>@unal.edu.co</code> (<code>jperez</code>, not <code>jperez@unal.edu.co</code>); also check capitals and extra spaces in the password. Save with Ctrl+O and Enter, exit with Ctrl+X.',
      trNoCredTitle: 'Se detiene: el portal pide usuario y contraseña pero no están configurados',
      trNoCredCause: 'The file <code>~/.unal_credenciales</code> does not exist or is empty.',
      trNoCredFix: 'Run the installer again, or create the file by hand (step 4, "Manual" tab).',
      trForeignTitle: 'Se detiene: el portal no pertenece a unal.edu.co / el formulario apunta fuera de unal.edu.co',
      trForeignCause: 'The network sent you to a page that is not the university\'s. It may be a fake network with the same name, or the UNAL changed its portal.',
      trForeignFix: '<b>Do not send any data.</b> If you are sure you are on the real network, run this and check which address it redirects to.',
      trCertTitle: 'Aviso: no se pudo verificar el certificado del portal',
      trCertCause: 'The program could not confirm that the portal is genuine and went on anyway; many captive portals use certificates that cannot be validated.',
      trCertFix: 'If it appears on the real network, leave it as it is: the <code>unal.edu.co</code> check is still active. See <a href="#p21Privacy">Security and privacy</a>.',
      trStrictTitle: 'Se detiene: certificado del portal no verificable y UNAL_TLS_ESTRICTO=1',
      trStrictCause: 'Strict mode is on and the certificate could not be verified: it may be a fake network, or the portal changed its certificate.',
      trStrictFix: 'Do not send data. If you are sure the network is real and the warning keeps appearing, remove the <code>export UNAL_TLS_ESTRICTO=1</code> line from <code>~/.unal_credenciales</code>.',
      trSentTitle: 'Se envió el formulario pero aún no hay internet. (again and again)',
      trSentCause: 'The portal probably changed its fields.',
      trSentFix: 'Run this. The pages are saved to <code>~/unal_portal_1.html</code>, <code>~/unal_portal_2.html</code>…; review them or share them, <b>without your credentials</b>, to adjust the script.',
      trFailedTitle: 'No se logró conectar. (with no other clear error)',
      trFailedCause: 'Weak signal, or the network itself is failing.',
      trFailedFix: 'Disconnect and reconnect the Wi-Fi and check the log again. Try opening the portal by hand once in the browser: if it fails that way too, the problem is the network, not the script.',
      privacyTitle: 'Security and privacy',
      privacyIntro: 'What could go wrong, and how this guide prevents it.',
      riskWhy: 'Why it exists',
      riskHow: 'How it is reduced',
      rkApkTitle: 'Installing APKs outside the Play Store',
      rkApkWhy: 'Android asks you to allow installing unknown apps (on Android 8 or newer, for the browser; on Android 7, for the whole phone); while it is on, any downloaded APK could be installed.',
      rkApkHow: 'Download only from the official links in step 2 and turn the permission off when you are done.',
      rkTermuxTitle: 'Termux can run any command',
      rkTermuxWhy: 'It is a Linux terminal: it runs whatever you type.',
      rkTermuxHow: 'Only run the commands in this guide; each one is explained in its <b>?</b>. Do not paste commands from sources you do not know.',
      rkExternalTitle: 'Other apps could run scripts in Termux',
      rkExternalWhy: 'Termux:Tasker lets apps with "Run commands in Termux environment" start scripts.',
      rkExternalHow: 'Only MacroDroid gets that permission, and <code>allow-external-apps</code> stays off, so only the scripts in <code>~/.termux/tasker/</code> can run.',
      rkMacroTitle: 'MacroDroid is very powerful',
      rkMacroWhy: 'Depending on the macros you create, it can ask for broad permissions (accessibility, notifications…).',
      rkMacroHow: 'This macro only needs <b>location</b> and <b>running commands in Termux</b>. Do not grant permissions this guide does not ask for.',
      rkCredTitle: 'Your UNAL credentials stay on the phone',
      rkCredWhy: 'The portal sometimes asks for them, and automating it means saving them.',
      rkCredHow: 'They live in <code>~/.unal_credenciales</code>, inside Termux\'s private folder, with permissions <code>600</code>. No other app can read it on a phone without root, and they never end up in Downloads or in the scripts.',
      rkFakeTitle: 'A fake network with the same name',
      rkFakeWhy: 'The EstudiantesUN password is public, so anyone could set up a network with the same name.',
      rkFakeHow: 'The script only sends data to <code>unal.edu.co</code> addresses, verifies the portal\'s HTTPS certificate and warns in the log if it cannot. You can also turn on strict mode (below).',
      storedTitle: 'What is stored on the phone',
      colFile: 'File',
      colContent: 'Contents',
      colWho: 'Who can read it',
      stCred: 'Your UNAL username and password',
      stCredWho: 'Only Termux (permissions <code>600</code>, the app\'s private folder)',
      stLauncher: 'The launcher (no credentials)',
      stProgram: 'The program (no credentials)',
      stLog: 'Date, time and steps of each connection. <b>It never stores your password.</b>',
      stDebug: 'Only with <code>--debug</code>: the portal\'s HTML',
      whoTermux: 'Only Termux',
      storedNote: '<code>~</code> is Termux\'s private folder (<code>/data/data/com.termux/files/home</code>). Other apps cannot read it on a phone without root.',
      connTitle: 'Where it connects',
      colAddress: 'Address',
      colWhat: 'What for',
      colData: 'Data sent',
      cn204: 'Checking for internet. Android uses the same address for that.',
      cnNeverssl: 'A simple unencrypted page the portal intercepts to redirect you.',
      cnPortal: 'The university portal.',
      cnNone: 'None (empty request).',
      cnPortalData: 'The acceptance of the terms (<code>answer=1</code>) and, only if the portal asks, your username and password.',
      connNote: 'No analytics, telemetry or servers of my own. Your credentials are <b>only</b> sent to addresses ending in <code>unal.edu.co</code>.',
      tlsTitle: 'Strict certificate mode',
      tlsText: 'The program first connects to the portal <b>verifying its HTTPS certificate</b>, like a browser. If it cannot, it leaves an <code>Aviso</code> in the log and goes on without verifying, because many captive portals use certificates that cannot be validated.',
      tlsOn: 'If on campus your log does <b>not</b> show that warning, the certificate is valid and you can turn on strict mode, so the program refuses to go on if one day it cannot verify it (on a fake network, for example):',
      tipTls: '<code>echo</code> prints the line and <code>&gt;&gt;</code> appends it to the end of <code>~/.unal_credenciales</code> without touching the rest. <code>unal.sh</code> loads that file every time, so it takes effect on the next connection.',
      tlsOff: 'If the warning <b>does</b> appear on the real network, keep the normal mode: the <code>unal.edu.co</code> check is still active.',
      tlsAdvice: '<b>General advice:</b> since the EstudiantesUN password is public, do not reuse your UNAL password on other services. That way, even if it ever leaked, the damage would stay limited.',
      cmdsTitle: 'Useful commands',
      cmdsIntro: 'For Termux, once everything is installed.',
      cmdLog: 'Shows the whole log of every connection.',
      cmdTail: 'Only the last 20 lines (<code>-n 20</code>), handy when the log is long.',
      cmdRun: 'Runs by hand the same file MacroDroid runs, to test it.',
      cmdDebug: 'The same, but it also saves each portal page to <code>~/unal_portal_N.html</code> to diagnose changes.',
      cmdNano: 'Opens your credentials to fix them. Save with Ctrl+O and Enter, exit with Ctrl+X.',
      cmdLs: 'Checks that <code>unal.sh</code> is where it should be (<code>-l</code> shows permissions, size and date).',
      cmdGrep: 'Lists Downloads filtered to "unal", to see what names your downloads got.',
      advTitle: 'Advanced options',
      advIntro: 'Add them as <code>export NAME=value</code> lines in <code>~/.unal_credenciales</code>:',
      colVar: 'Variable',
      colDefault: 'Default',
      colUse: 'What for',
      advByInstaller: '(set by the installer)',
      advEmpty: '(empty)',
      advUser: 'UNAL username (without <code>@unal.edu.co</code>) and password.',
      advIface: 'Name of the Wi-Fi interface. Only change it if the log says it could not force <code>wlan0</code>.',
      advDomain: 'The only domain the program sends data to.',
      advTls: 'If it is <code>1</code>, the program refuses to go on when it cannot verify the portal\'s HTTPS certificate.',
      uninstallTitle: 'Uninstall everything',
      uninstallIntro: 'In Termux:',
      tipRm: '<code>rm</code> deletes files and <code>-f</code> avoids errors if one does not exist. It removes the launcher, the program, your credentials, the log and the diagnostic files.',
      uninstallCurl: 'If you used the "No browser" tab, also remove its folder:',
      uninstall1: 'Delete the <b>Auto WiFi UNAL</b> macro in MacroDroid.',
      uninstall2: 'If you no longer need them, uninstall MacroDroid, Termux:Tasker and Termux from <b>Settings → Apps</b>. Uninstalling Termux also erases everything inside it.',
      uninstall3: 'Delete <code>instalar.sh</code>, <code>unal.sh</code> and <code>unal_wifi_login.py</code> from Downloads.',
      sourcesTitle: 'Sources',
      srcTermux: 'Termux: official repository and installation instructions',
      srcPlay: 'Termux: announcement about the Google Play versions',
      srcFdroid: 'Termux on F-Droid',
      srcTasker: 'Termux:Tasker: official repository',
      srcTaskerFdroid: 'Termux:Tasker on F-Droid',
      srcMacro: 'MacroDroid on Google Play',
      srcDkma: 'Don\'t kill my app: battery settings by brand',
      footer: 'Tested on the EstudiantesUN network in October 2026 (with a Samsung Galaxy); the steps work on any Android 7 or newer, and menu names change by brand. Not an official tool of the Universidad Nacional de Colombia.',
    },
    nonlinearSystems: {
      introLead: 'A nonlinear system \\(\\dot x = f(x, y)\\), \\(\\dot y = g(x, y)\\) can almost never be solved with a formula, and chapter 6 of Strogatz\'s <em>Nonlinear Dynamics and Chaos</em> answers it with a picture instead. Write the two equations below: the page finds every equilibrium in the window, linearizes the flow around each one with the Jacobian, classifies it with the trace and determinant of chapter 5, draws the stable and unstable manifolds that organize the portrait, and says how much of that verdict survives the nonlinear terms.',
      canvasHint: 'Click a fixed point to inspect it, click anywhere else to draw the trajectory through that point · drag to pan · scroll to zoom.',
      systemTitle: 'The system',
      systemHint: 'Write x and y freely: products such as x(3 - x), powers, sin, cos, exp, ln and sqrt are all accepted. Any other letter becomes a parameter with its own slider.',
      paramsTitle: 'Parameters',
      presetTitle: 'Examples from the chapter',
      displayTitle: 'What to draw',
      optParticles: 'Animated flow',
      optStreams: 'Trajectories',
      optNullclines: 'Nullclines',
      optManifolds: 'Manifolds',
      optBasins: 'Basins of attraction',
      optEnergy: 'Conserved quantity',
      optIndex: 'Index probe',
      optField: 'Vector field',
      optGrid: 'Grid',
      viewTitle: 'View',
      speedLabel: 'Speed',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      resetView: 'Reset view',
      clearOrbits: 'Clear drawn trajectories',
      fullscreenBtn: 'Full screen',
      fsTitle: 'Phase portrait',
      exitView: 'Exit view',
      legendTitle: 'Reading the picture',
      legendIn: 'Stable manifold of a saddle, and the eigendirections along which the flow comes in.',
      legendOut: 'Unstable manifold, and the eigendirections along which the flow leaves.',
      legendNullX: 'The nullcline \\(f = 0\\), where the motion is purely vertical.',
      legendNullY: 'The nullcline \\(g = 0\\), where the motion is purely horizontal.',
      legendStable: 'Solid dot: a Liapunov stable fixed point.',
      legendUnstable: 'Open dot: an unstable fixed point, the convention used throughout the book.',
      globalTitle: 'Structure of the system',
      globalIntro: 'Three questions about the system as a whole, rather than about one fixed point. The first two are exactly the tests that rescue a borderline center, and the third is the bookkeeping of index theory.',
      diagramTitle: 'Where the linearization falls',
      diagramIntro: 'The Jacobian of the selected fixed point is an ordinary 2×2 matrix, so it lands somewhere on the classification diagram of chapter 5, with the determinant \\(\\Delta\\) and the trace \\(\\tau\\) as axes. Everything inside an open region is robust: the nonlinear terms cannot change it. Everything sitting on one of the curves is borderline, and the marker lands there exactly when linearization stops being enough.',
      diagramCaption: 'Saddles, nodes and spirals fill open regions and survive a small perturbation; centers, stars, degenerate nodes and non-isolated fixed points live on the curves and do not.',
      stepsTitle: 'From the equations to the verdict',
      stepsIntro: 'The chain below is recomputed for the selected fixed point every time you touch an equation, a parameter or the view.',
      theoryTitle: 'The theory behind it',
      th1Title: '6.1 · Phase portraits',
      th1Text: 'The system attaches the velocity \\((\\dot x, \\dot y) = (f, g)\\) to every point of the plane, and a trajectory is a curve that follows those velocities. The phase portrait is the whole family of them at once, and what one wants from it is qualitative: where the fixed points are, what the flow does around them, and whether there are closed orbits. The nullclines \\(f = 0\\) and \\(g = 0\\) are the natural first sketch, because the fixed points are exactly where they cross.',
      th2Title: '6.2 · Existence and uniqueness',
      th2Text: 'If \\(f\\) and \\(g\\) have continuous partial derivatives, every initial condition has exactly one solution. The consequence is geometric and stronger than it looks: trajectories can never cross. Two of them meeting at a point would give that point two futures. In the plane this traps the flow so completely that a trajectory confined to a bounded region with no fixed point in it has nowhere to go but onto a closed orbit, which is where the Poincaré–Bendixson theorem of the next chapter begins.',
      th3Title: '6.3 · Linearization',
      th3Text: 'Put \\(x = x^* + u\\), \\(y = y^* + v\\) with \\(u\\) and \\(v\\) small. Taylor\'s theorem gives \\(\\dot u = f_x u + f_y v + O(u^2, uv, v^2)\\) and likewise for \\(\\dot v\\), so dropping the quadratic terms leaves the linear system \\(\\dot{\\mathbf u} = A\\mathbf u\\) with \\(A\\) the Jacobian evaluated at the fixed point. The classification of chapter 5 then applies unchanged, one matrix per fixed point.',
      th4Title: '6.3 · When it can be trusted',
      th4Text: 'A fixed point is hyperbolic when both eigenvalues have nonzero real part, and for those the Hartman–Grobman theorem says the nonlinear portrait near the point is a continuous deformation of the linear one: saddles stay saddles, nodes stay nodes, spirals stay spirals. Hyperbolic fixed points are structurally stable, so the answer survives small changes to the equations. The borderline cases are the rest: centers, stars, degenerate nodes and non-isolated fixed points, where arbitrarily small nonlinear terms can change the answer.',
      th5Title: '6.4 · Manifolds and basins',
      th5Text: 'A saddle has two special trajectories through it. The unstable manifold is the pair of curves leaving along the eigendirection with \\(\\lambda \\gt 0\\), and the stable manifold the pair arriving along the one with \\(\\lambda \\lt 0\\). In the rabbits-versus-sheep model of this section the stable manifold of the saddle is the border between the two basins of attraction, so which species wins depends on which side of that curve the initial numbers fall: the principle of competitive exclusion, drawn as a picture.',
      th6Title: '6.5 · Conservative systems',
      th6Text: 'A conserved quantity is a nonconstant function \\(E(x, y)\\) with \\(dE/dt = 0\\) on every trajectory, so the trajectories are the level curves of \\(E\\). A conservative system cannot have an attracting fixed point, since a whole neighbourhood would have to share one value of \\(E\\). Better still, if a fixed point of a conservative system is a local minimum or maximum of \\(E\\), and the linearization calls it a center, then it really is a center. The level curve through a saddle is its separatrix, and a loop that leaves a saddle and returns to the same one is a homoclinic orbit.',
      th7Title: '6.6 · Reversible systems',
      th7Text: 'Mechanical systems without friction do not care about the direction of time: sending \\(t \\to -t\\) and \\(y \\to -y\\) leaves \\(\\ddot x = F(x)\\) unchanged. Any system with that symmetry is called reversible, and its portrait is mirror-symmetric about the \\(x\\) axis. That alone forces a predicted center to be a true center, since the reflected image of an inward spiral would have to be an outward one. It is a weaker hypothesis than conservation and catches systems that no conserved quantity would.',
      th8Title: '6.7 · The pendulum',
      th8Text: 'The pendulum \\(\\ddot\\theta + \\sin\\theta = 0\\) becomes \\(\\dot x = y\\), \\(\\dot y = -\\sin x\\), which is both conservative, with energy \\(E = \\tfrac12 y^2 - \\cos x\\), and reversible. Its centers at \\(x = 2k\\pi\\) are the hanging rest state and are genuine nonlinear centers; the saddles at \\(x = (2k+1)\\pi\\) are the inverted position. The separatrices joining consecutive saddles divide the librating swings from the whirling ones. Because \\(\\theta\\) and \\(\\theta + 2\\pi\\) are the same position, the true phase space is a cylinder, and adding damping turns every center into a stable spiral.',
      th9Title: '6.8 · Index theory',
      th9Text: 'Walk once counterclockwise around a closed curve \\(C\\) that passes through no fixed point and count the net number of turns the vector field makes: that integer is the index \\(I_C\\). It cannot change as \\(C\\) is deformed without crossing a fixed point, so it is a property of the fixed points enclosed, and it adds: the index of a curve is the sum of theirs. Saddles have index \\(-1\\), while nodes, spirals and centers all have \\(+1\\). The payoff is a negative result of real power: every closed orbit must enclose fixed points whose indices add up to \\(+1\\), so no closed orbit can surround a single saddle, or a region with no fixed point at all.',
      source: 'Following Steven H. Strogatz, <em>Nonlinear Dynamics and Chaos</em>, third edition, chapter 6: Phase Plane.',

      errorInvalid: 'Could not read the equations',
      presetPick: 'Choose an example…',
      preset_example611: 'Section 6.1: nullclines and one saddle',
      preset_example631: 'Section 6.3: linearizing three fixed points',
      preset_example632: 'Section 6.3: a center that is not one (slide a)',
      preset_rabbits: 'Section 6.4: rabbits versus sheep',
      preset_doubleWell: 'Section 6.5: the double-well oscillator',
      preset_homoclinic: 'Section 6.5: a homoclinic orbit',
      preset_reversible: 'Section 6.6: a reversible system',
      preset_pendulum: 'Section 6.7: the pendulum',
      preset_dampedPendulum: 'Section 6.7: the damped pendulum',
      preset_dipole: 'Section 6.8: the dipole, of index +2',
      preset_lotka: 'Lotka–Volterra: predator and prey',

      nullclineX: 'ẋ = 0',
      nullclineY: 'ẏ = 0',
      noFixedPoints: 'No fixed points in this window',
      noFixedPointsNote: 'Pan or zoom out to look for them elsewhere.',
      summaryOne: '{n} fixed point in this window',
      summaryMany: '{n} fixed points in this window',
      verdict_robust: 'robust',
      verdict_typeOnly: 'borderline type',
      verdict_marginal: 'borderline',
      verdict_degenerate: 'no linear part',
      kindHigherOrder: 'Higher-order fixed point',

      stepSystem: 'Step 1 · The system',
      noteSystem: 'The pair \\((f, g)\\) is a vector field on the plane: it attaches a velocity to every point, and a trajectory is whatever curve follows those velocities.',
      stepFixedPoints: 'Step 2 · Nullclines and fixed points',
      noteFixedPoints: 'The curve \\(f = 0\\) carries purely vertical motion and \\(g = 0\\) purely horizontal motion; where the two nullclines cross, the velocity vanishes and the point is fixed.',
      stepJacobian: 'Step 3 · The Jacobian',
      noteJacobian: 'Write \\(x = x^* + u\\), \\(y = y^* + v\\) with \\(u, v\\) small. Taylor expanding \\(f\\) and \\(g\\) and dropping the quadratic terms leaves \\(\\dot{\\mathbf u} = A\\mathbf u\\): the linearized system.',
      stepEvaluate: 'Step 4 · Evaluate at the fixed point',
      noteEvaluate: 'Every fixed point gets its own matrix, so one system can mix saddles, nodes and spirals in the same picture.',
      stepEigen: 'Step 5 · Trace, determinant and eigenvalues',
      noteEigen: 'The discriminant is \\({disc} {sign} 0\\), so {case}.',
      stepEigenvectors: 'Step 5b · Eigendirections',
      noteEigenvectors: 'Near the fixed point the flow looks like the linear system: trajectories leave or arrive tangent to the slow eigendirection, the one with the smaller \\(|\\lambda|\\).',
      noteSaddleManifolds: 'At a saddle the two eigendirections are only the tangents at the point. Following the flow away from them draws the full stable and unstable manifolds, the curves that organize the whole portrait.',
      noteComplex: 'Complex eigenvalues mean rotation: there is no straight-line direction, and the trajectories wind around the fixed point with period \\(T = 2\\pi/\\omega\\) while their amplitude follows \\(e^{\\alpha t}\\).',
      noteDegenerateEigen: 'The linearization is degenerate here, so it has no pair of independent eigendirections to offer.',
      stepValidity: 'Step 6 · What the linearization guarantees',
      validRobust: 'The eigenvalues have nonzero real parts, so the fixed point is hyperbolic. By the Hartman–Grobman theorem the nonlinear portrait near it is a smooth deformation of the linear one: the verdict stands exactly as read, {kind}, and small changes to the equations cannot overturn it.',
      validTypeOnly: 'The eigenvalues are real and equal, which is a borderline case. Both have the same nonzero sign, so the stability is still decided, but the nonlinear terms may turn the verdict as read, {kind}, into an ordinary node or a spiral.',
      validMarginal: 'The linearization predicts this: {kind}. That is a borderline case, since the eigenvalues have zero real part, so arbitrarily small nonlinear terms could turn it into a slow spiral. Linearization alone cannot decide.',
      validZeroJacobian: 'Every entry of the Jacobian vanishes here, so the linearized system is \\(\\dot{\\mathbf u} = \\mathbf 0\\) and says nothing whatever about the flow. Only the nonlinear terms decide, and the index still measures them: no simple fixed point can have one other than \\(\\pm 1\\).',
      validConservative: 'The system is conservative, though, and a conserved quantity cannot decrease along a trajectory the way a spiral needs it to. By the theorem of section 6.5 this really is a nonlinear center.',
      validReversible: 'The system is reversible, though, and the symmetry maps the outward half of a would-be spiral onto the inward half. By the theorem of section 6.6 this really is a nonlinear center.',
      validUndecided: 'Neither of the two tests of this chapter applies here: the system is neither conservative nor reversible, so the question has to be settled by hand.',
      stepIndex: 'Step 7 · Index of the fixed point',
      indexNote_saddle: 'Walking once counterclockwise around a saddle, the vector field turns once the other way: every saddle has index \\(-1\\).',
      indexNote_plusOne: 'The field turns once with the curve, so the index is \\(+1\\). Nodes, spirals and centers all share this value, which is why the index sees stability but not type.',
      indexNote_other: 'The index counts how many net turns the field makes around the curve; a value other than \\(\\pm 1\\) marks a higher-order fixed point such as the dipole.',

      globalConservative: 'Conserved quantity',
      globalConservativeYes: 'The divergence vanishes, so the flow preserves area and there is a conserved quantity \\(E\\) with \\(f = \\partial E/\\partial y\\) and \\(g = -\\partial E/\\partial x\\). Switch on the level curves to see it: every trajectory rides along one of them, and no fixed point can attract.',
      globalConservativeNo: 'The divergence is not identically zero, so the flow does not preserve area and this test finds no conserved quantity.',
      globalReversible: 'Reversibility',
      globalReversibleYes: 'The system is unchanged when time and one coordinate are both reversed, so the portrait is symmetric about that axis and a predicted center is a true nonlinear center.',
      globalReversibleNo: 'Neither of the two reversing symmetries of section 6.6 leaves the system unchanged.',
      globalIndex: 'Index',
      globalIndexNote: 'The indices of the fixed points inside the window add up to {sum}, and the index measured directly on the border of the window is {border}. Any closed orbit must enclose fixed points whose indices add up to \\(+1\\).',
      symX: '\\((y, t) \\to (-y, -t)\\)',
      symY: '\\((x, t) \\to (-x, -t)\\)',
      yes: 'Yes',
      no: 'No',
    },
    linearSystems: {
      introLead: 'A two-dimensional linear system \\(\\dot{\\mathbf x} = A\\mathbf x\\) turns a 2×2 matrix into a flow on the plane. Everything about that flow is decided by two numbers, the trace and the determinant of \\(A\\): they fix the characteristic polynomial, the eigenvalues, and with them the eigenvectors along which the motion runs in a straight line. Type a matrix below and watch the portrait rearrange itself in real time, from saddle to node to spiral to center, following the classification of chapter 5 of Strogatz\'s <em>Nonlinear Dynamics and Chaos</em>.',
      canvasHint: 'Click anywhere to draw the trajectory through that point · drag to pan · scroll to zoom.',
      matrixTitle: 'Matrix A',
      matrixHint: 'Fractions (-1/8), decimals with either separator (-0.8 or -0,8), pi and e, powers, and functions such as sqrt or sin are all accepted.',
      paramsTitle: 'Parameters',
      paramsHint: 'Any letter typed into the matrix becomes a parameter with its own slider. The names pi and e are reserved for the constants.',
      presetTitle: 'Examples from the chapter',
      displayTitle: 'What to draw',
      optParticles: 'Animated flow',
      optStreams: 'Trajectories',
      optField: 'Vector field',
      optEigen: 'Eigendirections',
      optNullclines: 'Nullclines',
      optGrid: 'Grid',
      viewTitle: 'View',
      speedLabel: 'Speed',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      resetView: 'Reset view',
      clearOrbits: 'Clear drawn trajectories',
      fullscreenBtn: 'Full screen',
      fsTitle: 'Phase portrait',
      exitView: 'Exit view',
      legendTitle: 'Reading the picture',
      legendIn: 'Eigendirection with \\(\\lambda \\lt 0\\): the flow runs inward along it and the eigensolution decays.',
      legendOut: 'Eigendirection with \\(\\lambda \\gt 0\\): the flow runs outward and the eigensolution grows.',
      legendThird: 'Trajectories you click, nullclines, and any line made entirely of fixed points.',
      legendStable: 'Solid dot: a Liapunov stable fixed point.',
      legendUnstable: 'Open dot: an unstable fixed point. This is the convention used throughout the book.',
      diagramTitle: 'Classification diagram',
      diagramIntro: 'The type and stability of every fixed point fit on a single picture whose axes are the determinant \\(\\Delta\\) and the trace \\(\\tau\\). Saddles fill the half plane \\(\\Delta \\lt 0\\). For \\(\\Delta \\gt 0\\) the parabola \\(\\tau^2 - 4\\Delta = 0\\) separates nodes from spirals, and the sign of \\(\\tau\\) decides whether they attract or repel. The borderline cases live on the curves: centers on the positive \\(\\Delta\\) axis, stars and degenerate nodes on the parabola, and non-isolated fixed points on the \\(\\tau\\) axis.',
      diagramCaption: 'The marker shows where the matrix you typed falls. Saddles, nodes and spirals occupy whole regions, so they survive a small change in the matrix; everything else sits on a curve and does not.',
      stepsTitle: 'From the matrix to the portrait',
      stepsIntro: 'Every number drawn above comes from the following chain, recomputed each time you touch a parameter.',
      theoryTitle: 'The theory behind it',
      th1Title: 'The phase plane',
      th1Text: 'The system assigns the vector \\((\\dot x, \\dot y)\\) to every point \\((x, y)\\), which is a vector field on the plane. Picture a fluid flowing with that local velocity: drop a phase point anywhere and watch where the current carries it. Since \\(\\dot{\\mathbf x} = \\mathbf 0\\) exactly when \\(\\mathbf x = \\mathbf 0\\), the origin is a fixed point for every matrix, and the whole question is how the flow behaves around it.',
      th2Title: 'Straight-line solutions',
      th2Text: 'Look for trajectories of the special form \\(\\mathbf x(t) = e^{\\lambda t}\\mathbf v\\), which move along a fixed line through the origin with simple exponential growth or decay. Substituting into \\(\\dot{\\mathbf x} = A\\mathbf x\\) and cancelling \\(e^{\\lambda t}\\) leaves \\(A\\mathbf v = \\lambda\\mathbf v\\), so these eigensolutions exist exactly when \\(\\mathbf v\\) is an eigenvector of \\(A\\).',
      th3Title: 'Only two numbers matter',
      th3Text: 'Expanding \\(\\det(A - \\lambda I) = 0\\) gives \\(\\lambda^2 - \\tau\\lambda + \\Delta = 0\\) with \\(\\tau = \\operatorname{tr}(A)\\) and \\(\\Delta = \\det(A)\\), so \\(\\lambda_{1,2} = \\tfrac12\\left(\\tau \\pm \\sqrt{\\tau^2 - 4\\Delta}\\right)\\). The eigenvalues, and therefore the entire shape of the portrait, depend on nothing but the trace and the determinant.',
      th4Title: 'The general solution',
      th4Text: 'When the eigenvalues are distinct, the eigenvectors are linearly independent and span the plane, so any initial condition splits as \\(\\mathbf x_0 = c_1\\mathbf v_1 + c_2\\mathbf v_2\\) and the solution is \\(\\mathbf x(t) = c_1e^{\\lambda_1 t}\\mathbf v_1 + c_2e^{\\lambda_2 t}\\mathbf v_2\\). It solves the equation, it matches the initial condition, and by the existence and uniqueness theorem it is the only one that does.',
      th5Title: 'Saddles and nodes',
      th5Text: 'If \\(\\Delta \\lt 0\\) the eigenvalues are real with opposite signs and the origin is a saddle point: the eigenvector with \\(\\lambda \\gt 0\\) spans the unstable manifold, the one with \\(\\lambda \\lt 0\\) the stable manifold, and a typical trajectory approaches the unstable manifold as \\(t \\to \\infty\\). If both eigenvalues share a sign the point is a node, and trajectories leave the origin tangent to the slow eigendirection, the one with the smaller \\(|\\lambda|\\).',
      th6Title: 'Spirals and centers',
      th6Text: 'Complex eigenvalues \\(\\lambda = \\alpha \\pm i\\omega\\) appear when \\(\\tau^2 - 4\\Delta \\lt 0\\). Euler\'s formula turns the exponentials into \\(e^{\\alpha t}\\cos\\omega t\\) and \\(e^{\\alpha t}\\sin\\omega t\\), so the trajectories rotate with period \\(T = 2\\pi/\\omega\\) while their amplitude follows \\(e^{\\alpha t}\\). A negative \\(\\alpha\\) gives a stable spiral, a positive one an unstable spiral, and \\(\\alpha = 0\\) a center surrounded by closed orbits, the situation of the undamped harmonic oscillator.',
      th7Title: 'Repeated eigenvalues',
      th7Text: 'When \\(\\lambda_1 = \\lambda_2\\) there are two possibilities. If two independent eigenvectors survive, then \\(A\\) simply stretches every vector by the same factor, so \\(A = \\lambda I\\), every direction is an eigendirection and the point is a star node. If only one eigendirection remains, the point is a degenerate node: it is what you get by scissoring the two eigendirections of an ordinary node together, and it sits exactly on the borderline between a node and a spiral.',
      th8Title: 'The language of stability',
      th8Text: 'A fixed point is attracting when every nearby trajectory reaches it as \\(t \\to \\infty\\), and Liapunov stable when every nearby trajectory stays nearby for all time. Neither implies the other: a center is Liapunov stable but not attracting, which is called neutrally stable, while the flow \\(\\dot\\theta = 1 - \\cos\\theta\\) on the circle is attracting but not Liapunov stable. A point that is both is called stable, or asymptotically stable.',
      source: 'Following Steven H. Strogatz, <em>Nonlinear Dynamics and Chaos</em>, third edition, chapter 5: Linear Systems.',

      errorInvalid: 'Could not read the matrix',
      errorNotNumeric: 'The entries do not evaluate to numbers.',
      presetPick: 'Choose an example…',
      preset_example521: 'Example 5.2.1: saddle point',
      preset_harmonic: 'Harmonic oscillator: center',
      preset_damped: 'Damped oscillator: stable spiral',
      preset_uncoupled: 'Example 5.1.2: sweep the parameter a',
      preset_star: 'Star node',
      preset_degenerate: 'Degenerate node',
      preset_example526: 'Example 5.2.6: saddle point',
      preset_example527: 'Example 5.2.7: unstable node',
      preset_romeo: 'Romeo and Juliet (section 5.3)',
      preset_cautious: 'Example 5.3.1: two cautious lovers',
      preset_fixedLine: 'A whole line of fixed points',
      preset_rotation: 'Slowly decaying rotation',

      kind_saddle: 'Saddle point',
      kind_stableNode: 'Stable node',
      kind_unstableNode: 'Unstable node',
      kind_stableSpiral: 'Stable spiral',
      kind_unstableSpiral: 'Unstable spiral',
      kind_center: 'Center',
      kind_stableStar: 'Stable star node',
      kind_unstableStar: 'Unstable star node',
      kind_stableDegenerate: 'Stable degenerate node',
      kind_unstableDegenerate: 'Unstable degenerate node',
      kind_lineOfFixedPoints: 'Line of fixed points',
      kind_planeOfFixedPoints: 'Plane of fixed points',

      stability_stable: 'stable',
      stability_neutral: 'neutrally stable',
      stability_unstable: 'unstable',
      stabilityLong_stable: 'It is both attracting and Liapunov stable, so it is called stable, or asymptotically stable.',
      stabilityLong_neutral: 'It is Liapunov stable but not attracting: nearby trajectories stay nearby forever without ever reaching it, which is what neutrally stable means.',
      stabilityLong_unstable: 'It is neither attracting nor Liapunov stable, so it is unstable.',

      reason_saddle: 'Since \\(\\Delta = {det} \\lt 0\\), the eigenvalues are real with opposite signs and the origin is a {kind}. The eigendirection with the positive eigenvalue spans its unstable manifold and the one with the negative eigenvalue its stable manifold; a typical trajectory approaches the unstable manifold as \\(t \\to \\infty\\) and the stable manifold as \\(t \\to -\\infty\\).',
      reason_stableNode: 'With \\(\\Delta = {det} \\gt 0\\) and \\(\\tau^2 - 4\\Delta = {disc} \\gt 0\\) the eigenvalues are real and share a sign, and \\(\\tau = {tau} \\lt 0\\) makes both of them negative: the origin is a {kind}. Trajectories come in tangent to the slow eigendirection, the one with the smaller \\(|\\lambda|\\), and become parallel to the fast one in backwards time.',
      reason_unstableNode: 'With \\(\\Delta = {det} \\gt 0\\) and \\(\\tau^2 - 4\\Delta = {disc} \\gt 0\\) the eigenvalues are real and share a sign, and \\(\\tau = {tau} \\gt 0\\) makes both of them positive: the origin is a {kind}. It is the stable node with every arrow reversed, so trajectories leave tangent to the slow eigendirection.',
      reason_stableSpiral: 'Because \\(\\tau^2 - 4\\Delta = {disc} \\lt 0\\) the eigenvalues are a complex pair \\(\\alpha \\pm i\\omega\\), and \\(\\alpha = \\tau/2 \\lt 0\\): the oscillations decay and the origin is a {kind}. There is no straight-line trajectory, since no real eigenvector exists.',
      reason_unstableSpiral: 'Because \\(\\tau^2 - 4\\Delta = {disc} \\lt 0\\) the eigenvalues are a complex pair \\(\\alpha \\pm i\\omega\\), and \\(\\alpha = \\tau/2 \\gt 0\\): the oscillations grow and the origin is an {kind}.',
      reason_center: 'The eigenvalues are purely imaginary, since \\(\\tau = 0\\) and \\(\\Delta = {det} \\gt 0\\). Every solution is periodic with the same period \\(T = 2\\pi/\\omega\\), so the origin is a {kind} surrounded by closed orbits. Centers are borderline cases, but the most important ones: they turn up in every frictionless mechanical system.',
      reason_stableStar: 'The eigenvalues are equal and \\(A\\) is a multiple of the identity, so every vector is an eigenvector and every trajectory is a straight line through the origin: a {kind}.',
      reason_unstableStar: 'The eigenvalues are equal and \\(A\\) is a multiple of the identity, so every vector is an eigenvector and every trajectory is a straight line through the origin: an {kind}.',
      reason_stableDegenerate: 'The eigenvalues are equal, \\(\\tau^2 - 4\\Delta = 0\\), but only one eigendirection survives, so the origin is a {kind}. It lies exactly on the parabola that separates nodes from spirals: the trajectories try to wind around and never quite manage it.',
      reason_unstableDegenerate: 'The eigenvalues are equal, \\(\\tau^2 - 4\\Delta = 0\\), but only one eigendirection survives, so the origin is an {kind}. It lies exactly on the parabola that separates nodes from spirals: the trajectories try to wind around and never quite manage it.',
      reason_lineOfFixedPoints: 'With \\(\\Delta = 0\\) one eigenvalue vanishes, so the origin is not an isolated fixed point: its null eigendirection is an entire {kind}, and every trajectory runs along a parallel straight line towards or away from it.',
      reason_planeOfFixedPoints: 'Here \\(A = 0\\), so \\(\\dot{\\mathbf x} = \\mathbf 0\\) everywhere and the whole plane is a {kind}. Nothing moves.',

      rotationCcw: 'counterclockwise rotation',
      rotationCw: 'clockwise rotation',
      shearNote: 'shear flow',
      fixedPointsLine: 'fixed points',

      eigenvalues: 'Eigenvalues',
      realPart: 'Growth rate',
      frequency: 'Frequency and period',
      eigenspace: 'Eigenspace',
      generalizedVector: 'Generalized vector',
      role_slow: 'Slow eigendirection',
      role_fast: 'Fast eigendirection',
      role_stableManifold: 'Stable manifold',
      role_unstableManifold: 'Unstable manifold',
      role_eigendirection: 'Eigendirection',
      role_fixedLine: 'Line of fixed points',

      stepSystem: 'Step 1 · The system',
      stepTraceDet: 'Step 2 · Trace and determinant',
      stepCharEq: 'Step 3 · Characteristic equation',
      stepEigenvalues: 'Step 4 · Eigenvalues',
      stepEigenvectors: 'Step 5 · Eigenvectors',
      stepGeneralSolution: 'Step 6 · General solution',
      stepClassification: 'Step 7 · Classification',

      noteSystem: 'Because \\(\\dot{\\mathbf x} = \\mathbf 0\\) when \\(\\mathbf x = \\mathbf 0\\), the origin is a fixed point for every choice of \\(A\\).',
      noteTraceDet: 'The eigenvalues depend on nothing but these two numbers.',
      noteDiscriminant: 'The discriminant is \\(\\tau^2 - 4\\Delta = {disc} {sign} 0\\), so {case}.',
      noteEigenvectors: 'Each eigenvector spans a straight-line trajectory \\(\\mathbf x(t) = e^{\\lambda t}\\mathbf v\\): the motion stays on that line forever, growing if \\(\\lambda \\gt 0\\) and decaying if \\(\\lambda \\lt 0\\).',
      noteComplexEigen: 'With complex eigenvalues there is no real straight-line solution: Euler\'s formula turns \\(e^{(\\alpha \\pm i\\omega)t}\\) into \\(e^{\\alpha t}\\cos\\omega t\\) and \\(e^{\\alpha t}\\sin\\omega t\\), so the trajectories rotate while their amplitude follows \\(e^{\\alpha t}\\).',
      noteStar: 'Multiplication by \\(A\\) just stretches every vector by the same factor, so every direction is an eigendirection and all trajectories are straight lines through the origin: a star node.',
      noteDegenerate: 'The eigenspace is only one-dimensional, so a generalized eigenvector \\(\\mathbf w\\) is needed. The fixed point is a degenerate node, sitting exactly on the borderline between a node and a spiral.',
      noteNoEigenvectors: 'With \\(\\Delta = 0\\) one eigenvalue vanishes, and its eigendirection is a whole line of fixed points rather than a single trajectory.',
      noteGeneralSolution: 'Any initial condition \\(\\mathbf x_0\\) fixes \\(c_1\\) and \\(c_2\\); by the existence and uniqueness theorem this is the only solution.',

      case_realDistinct: 'the eigenvalues are real and distinct',
      case_complex: 'the eigenvalues form a complex conjugate pair',
      case_realRepeated: 'the eigenvalues are real and equal',

      regionSaddle: 'saddle points',
      regionUnstableNode: 'unstable nodes',
      regionUnstableSpiral: 'unstable spirals',
      regionCenter: 'centers',
      regionStableSpiral: 'stable spirals',
      regionStableNode: 'stable nodes',
    },
    regex: {
      title: 'Regular Expressions',
      exprLabel: 'Regular Expression',
      resultLabel: 'Result:',
      alphabetFor: 'Alphabet for',
      customAlphabet: 'Custom alphabet:',
      writeExpr: 'Write a regular expression.',
      parseError: 'Error parsing the expression.',
      exprStructure: 'Expression structure:',
      generatedStrings: 'Generated strings:',
    },
    sets: {
      title: 'Sets',
      setA: 'Set A',
      setB: 'Set B',
      optRndmNum: '\\text{Rndm Num}',
      optRndmNumSet: '\\text{\\{Rndm Num\\}}',
      optRndmAlpha: '\\text{Rndm Alpha}',
      optRndmAlphaSet: '\\text{\\{Rndm Alpha\\}}',
      optVenn: '\\text{Venn Diagram}',
    },
    recursiveConcat: {
      title: 'Recursive Concatenation',
      sub: 'See how <b>α · β</b> is built one character at a time, peeling <b>β</b> down to the base case.',
      labelAlpha: 'String α (prefix)',
      labelBeta: 'String β (to concatenate)',
      keyPrefix: 'α · prefix',
      keyRemaining: 'γ · remaining',
      keyLast: 'last character',
      auto: 'Auto',
      pause: 'Pause',
      hintKeys: 'Move with the buttons, the ← → arrow keys, or the numbered steps.',
      prevStep: 'Previous step',
      nextStep: 'Next step',
      goToStep: 'Go to step',
      finalResult: 'Final result',
      baseCase: 'Base case',
      recursiveStep: 'Recursive step',
      resultLabel: 'result',
      descBase: 'Base case: β = λ, so α·β = α',
      descBaseReached: "γ = λ → base case reached: α·λ = α, then '{a}' is appended",
      descRecursive: "β = γ·'{a}' → recursive step: α·β = α·(γ{a}) = (α·γ){a}",
      descFull: 'Full concatenation: α·β = "{r}"',
      hintEnter: 'Enter α and β to see the recursive breakdown.',
      errOnlyLetters: 'Only letters and digits are allowed.',
    },
    sigmaStar: {
      title: 'Enumeration of Σ*',
      alphabetLabel: 'Alphabet Σ (symbols separated by spaces)',
      hintDefineAlphabet: 'Define the alphabet Σ first.',
      hintEmptyAlphabet: 'The alphabet cannot be empty.',
      hintEnterN: 'a natural number n',
      hintEnterAlpha: 'a string α',
      enterWord: 'Enter',
      hintNonNeg: 'Enter a non-negative integer.',
      labelNumberN: 'Number n ∈ ℕ',
      labelStringAlpha: 'String α ∈ Σ*',
      enterToSeeNum: 'a number',
      enterToSeeStr: 'a string',
      enterToSeeSuffix: 'to see the process.',
      optN2S: 'ℕ → Σ*  (number to string)',
      optS2N: 'Σ* → ℕ  (string to number)',
      queryLabel: 'Number n ∈ ℕ',
      hBlock: 'Block',
      hRange: 'Index range',
      hFirst: 'First strings',
      sizeOne: '1 string',
      sizeMany: 'strings',
      lblResult: 'Result',
      lblInput: 'Input',
      lblError: 'Error',
      caseSigma1: 'Case |Σ| = 1',
      detailRepeated: 'The string is the only symbol repeated {n} times.',
      step1FindK: 'Step 1 — find k(n)',
      step2PosBlock: 'Step 2 — position within block',
      step3EmptyString: 'Step 3 — empty string',
      detailEmptyLambda: 'The only string of length 0 is the empty string λ',
      step3Convert: 'Step 3 — convert p={p} to base {q} with {k} digit{s}',
      step4ApplySigma: 'Step 4 — apply σ',
      symbolNotInSigma: 'Symbol "{ch}" does not belong to alphabet Σ',
      caseSingle: 'With a single symbol, the index is simply the length.',
      step1Length: 'Step 1 — length k',
      detailStringLength: 'The string has length {k}',
      step2EmptyString: 'Step 2 — empty string',
      detailEmptyIdx0: 'The empty string always has index 0',
      blocksOfSigma: 'Blocks of Σ*',
      step2BlockStart: 'Step 2 — block start s(k)',
      detailBlockStart: 'The block of strings of length {k} starts at index {sk}',
      step3LexPos: 'Step 3 — lexicographic position p(α)',
      step4FinalIdx: 'Step 4 — final index',
    },
    crossMatrix: {
      introText: 'This renders a cost matrix as a 3D terrain and finds the cheapest path across it: starting at the row you pick, moving one column at a time, free to step to the row above or below at each step. The highlighted path is the minimum-cost route, found with dynamic programming. Drag to rotate, scroll to zoom.',
      startLabel: 'Start:',
      startHint: 'Row the path starts from, on the left edge of the grid.',
      generate: 'Generate',
      presetFunctions: 'Preset functions',
      totalCost: 'Total cost:',
      errRangeFormat: 'Each range needs a lower bound smaller than its upper bound',
      errNoFunction: 'You must enter a function',
      errGenerating: 'Error generating matrix:',
      presetTurbulent: 'Turbulent',
      presetWaves: 'Waves',
      presetMountain: 'Mountain',
      presetRipples: 'Ripples',
      presetValley: 'Valley',
      presetSpiral: 'Spiral',
      presetParaboloid: 'Paraboloid',
      presetSaddle: 'Saddle',
      presetUndulating: 'Undulating',
      presetInclinedPlane: 'Inclined Plane',
      presetChess: 'Chess',
      presetSteps: 'Steps',
      presetMountainLc: 'mountain',
      presetMountainsRandom: 'Mountains with random peaks',
    },
    bernoulli: {
      lead: 'Bernoulli\'s inequality, \\((1+x)^n \\ge 1+nx\\), is one of the workhorses of elementary analysis, but it is classically stated only for a base of the form \\(1+x\\) and only for \\(x \\ge -1\\). This page explores a generalization that moves two things at once: it puts a translation parameter \\(y \\ge 1\\) into the base and lets the exponent \\(z \\ge 1\\) be any real number, which widens the domain of \\(x\\) from \\([-1,\\infty)\\) to \\([-y,\\infty)\\). Move the parameters below and watch the curve, its linear lower bound, and the gap between them.',
      viewInequality: 'Inequality',
      viewProof: 'Proof',
      legendCurve: 'Curve \\((y+x)^z\\)',
      legendBound: 'Bound \\(y+xz\\)',
      legendGap: 'Gap',
      legendBad: 'Where it fails',
      legendAux: 'Auxiliary \\(f(t)=t^z-tz\\)',
      legendMin: 'Minimum \\(1-z\\)',
      legendYBound: 'Lower bound \\(y(1-z)\\)',
      legendMargin: 'Margin above the minimum',
      paramsTitle: 'Parameters',
      hintY: 'Translation of the base. The theorem needs \\(y \\ge 1\\).',
      hintZ: 'Real exponent. The theorem needs \\(z \\ge 1\\).',
      hintX: 'Point where both sides are compared.',
      hypOk: 'Hypotheses hold: the inequality is guaranteed.',
      hypFail: 'Hypotheses violated: the theorem needs y ≥ 1 and z ≥ 1, so the inequality may fail.',
      gapLabel: 'difference',
      verdictHolds: 'Difference ≥ 0: the inequality holds here.',
      verdictFails: 'Difference < 0: the inequality fails here.',
      presetGeneral: 'General',
      presetClassic: 'Classic',
      presetCounter: 'Counterexample',
      theoryTitle: 'The result',
      theoremTitle: 'Theorem (Bernoulli with translation and real exponent)',
      theoremText: 'For all \\(y, x, z \\in \\mathbb{R}\\) with \\(z \\ge 1\\), \\(y \\ge 1\\) and \\(x \\ge -y\\):',
      theoremEquality: 'Equality holds if and only if \\(x = 0\\) or \\(z = 1\\).',
      proofTitle: 'Proof',
      proofSetup: 'Put \\(t = x + y\\). The hypothesis \\(x \\ge -y\\) gives \\(t \\ge 0\\), and the statement becomes \\(t^z \\ge tz + y(1-z)\\), so it suffices to prove that \\(f(t) := t^z - tz \\ge y(1-z)\\).',
      step1Title: 'Step 1: the global minimum of \\(f\\)',
      step1Text: 'Differentiating, \\(f\'(t) = z(t^{z-1}-1)\\) and \\(f\'\'(t) = z(z-1)t^{z-2}\\). Since \\(z \\ge 1\\) and \\(t > 0\\), we get \\(f\'\' \\ge 0\\), so \\(f\\) is convex on \\((0,\\infty)\\). Its only critical point there is \\(t = 1\\), which convexity turns into a global minimum: \\(f(t) \\ge f(1) = 1-z\\). The bound extends to \\(t = 0\\) by continuity, since \\(f(0) = 0 \\ge 1-z\\).',
      step2Title: 'Step 2: comparison with \\(y(1-z)\\)',
      step2Text: 'Because \\(z \\ge 1\\) we have \\(1-z \\le 0\\), and because \\(y \\ge 1\\), multiplying by \\(y\\) only makes it smaller: \\(y(1-z) \\le 1-z\\). Chaining both steps gives \\(y(1-z) \\le 1-z \\le f(t)\\), which is exactly what was needed.',
      step3Title: 'The equality case',
      step3Text: 'Equality requires both steps to be tight at once. Step 1 is tight only at \\(t = 1\\), that is \\(x = 1-y\\); step 2 only when \\(y = 1\\) or \\(z = 1\\). If \\(z = 1\\) the statement collapses to the identity \\(y+x \\ge y+x\\). If \\(z > 1\\), the two conditions together force \\(y = 1\\) and hence \\(x = 0\\). So equality holds exactly when \\(x = 0\\) or \\(z = 1\\).',
      corollaryTitle: 'Corollary',
      corollaryText: 'Setting \\(y = 1\\) recovers the standard real-exponent form \\((1+x)^r \\ge 1+rx\\) for \\(r \\ge 1\\) and \\(x \\ge -1\\); restricting further to a natural exponent gives the classical inequality. Press <em>Classic</em> above to land on that case.',
      remarkTitle: 'Why \\(y \\ge 1\\) cannot be dropped',
      remarkText: 'If \\(0 < y < 1\\) and \\(z > 1\\), the comparison in step 2 reverses and the conclusion can fail. Take \\(y = \\tfrac{1}{2}\\), \\(z = 2\\), \\(x = 0\\): the left side is \\(\\tfrac{1}{4}\\) while the right side is \\(\\tfrac{1}{2}\\). Press <em>Counterexample</em> above and the failing region shows up in red.',
      compareTitle: 'Against earlier generalizations',
      compareIntro: 'Classical extensions to a real exponent keep the restriction \\(x \\ge -1\\). Tying the lower end of the domain to the translation parameter is what widens it to \\(x \\ge -y\\).',
      colResult: 'Result',
      colHyp: 'Hypotheses',
      colIneq: 'Inequality',
      row_classic: 'Classical Bernoulli',
      row_realExp: 'Standard real exponent',
      row_weierstrass: 'Weierstrass-Bernoulli',
      row_refined: 'Refined version',
      row_thisWork: 'This generalization',
      appsTitle: 'Where it is useful',
      app_analysis_title: 'Real analysis',
      app_analysis_text: 'Lower bounds for shifted power functions \\(t \\mapsto (y+t)^z\\), where \\(y\\) acts as a regularizer keeping the base positive across the whole domain.',
      app_probability_title: 'Probability',
      app_probability_text: 'Taking expectations gives \\(\\mathbb{E}[(y+X)^z] \\ge y + \\mu z\\) for a random variable with \\(X \\ge -y\\), a lower bound on the moments of shifted variables.',
      app_convex_title: 'Convex optimization',
      app_convex_text: 'The statement says the line \\(y+xz\\) is a global lower bound of \\((y+x)^z\\), a supporting-hyperplane property that first-order methods rely on.',
      app_finance_title: 'Compound interest',
      app_finance_text: 'Classically the inequality expresses that compound interest beats simple interest; here \\(y\\) reads as a variable initial capital or a scale factor.',
      paperTitle: 'Full write-up',
      paperText: 'The complete article, with the formal proof, the comparison against the literature and every figure, is available as a PDF.',
      paperView: 'Read the PDF',
      paperDownload: 'Download',
    },
    sorting: {
      size: 'Size',
      delay: 'Delay',
      controls: 'Controls',
      hidePanel: 'Hide controls',
      showPanel: 'Show controls',
      chartLabel: 'Sorting animation',
      legendIdle: 'Value',
      legendActive: 'Comparing',
      legendMark: 'Pivot / marker',
      muteSound: 'Mute sound',
      unmuteSound: 'Turn on sound',
      scale: 'Scale',
      scaleMajor: 'Major',
      scaleMinor: 'Minor',
    },
    fanctal: {
      downloadSvg: 'Download SVG',
      areaCalc: 'Area calculation A(r, n, a)',
      depth: '\\(\\text{\\textbf{Depth}}\\)',
      generalFormula: 'General formula:',
      step1: 'Step 1: Substitute values n = {n}, a = {a}',
      step2: 'Step 2: Calculate',
      step3: 'Step 3: Calculate the bracket term',
      step4: 'Step 4: Calculate the final fraction',
      step5: 'Step 5: Calculate the total product',
      totalArea: 'Total area:',
      introLead: 'A fanctal is a family of self-similar circular fractals, built by dividing a disk into equal angular sectors and inscribing, in some of them, a smaller tangent disk that repeats the same construction inside itself, indefinitely. Varying how many sectors there are and how many are recursed traces out an entire family of shapes — from sparse, spidery patterns to dense, almost space-filling ones — all sharing the same self-similar logic. Explore that family below, or read the summary and download a Python implementation further down the page.',
      paramsTitle: 'Parameters',
      hintN: 'Number of angular sectors',
      hintA: 'Sectors selected to recurse',
      hintDepth: 'Explicit depth 1–7 (empty = automatic cutoff)',
      aboutBtn: 'About the fanctal',
      aboutTitle: 'About the fanctal',
      aboutConstruction: 'The original fanctal divides a disk of radius \\(R\\) into \\(6\\) congruent sectors and inscribes, in \\(3\\) alternating sectors, a tangent child disk; the construction repeats indefinitely inside each child.',
      resultAreaLabel: 'Main result',
      resultAreaText: 'The shaded area equals \\(\\pi R^2/4\\) — proved by two independent methods. The perimeter added at each generation is invariant, \\(\\pi R + 6R\\), but the sum over all generations diverges.',
      generalizationLabel: 'Generalization',
      generalizationText: "The construction generalizes to a parametric family \\(f(r,n,a)\\): \\(n\\) angular sectors, of which \\(a\\) (preferably alternated) are selected to recurse, with scale ratio \\(k(n) = \\dfrac{\\sin(\\pi/n)}{1+\\sin(\\pi/n)}\\). Its closed-form area is \\(A(r,n,a) = \\pi r^2 \\cdot \\dfrac{a\\left(\\frac{1}{n} - k^2\\right)}{1 - ak^2}\\), valid for every admissible \\((n,a)\\); setting \\(n=6\\), \\(a=3\\) recovers exactly \\(\\pi R^2/4\\).",
      dimensionLabel: 'Fractal dimension',
      dimensionText: "The family's self-similar attractor has Hausdorff dimension \\(\\dim_H(K) = \\dfrac{\\log a}{-\\log k}\\), which equals exactly \\(1\\) when \\(ak=1\\) — the same condition connected to the invariant perimeter of the original fanctal.",
      paperMeta: 'Yasser Díaz Arcila, Juan Manuel Díaz Gómez, and Elizabeth Solórzano Tovar.',
      paperStatus: 'A version restructured for peer review is in preparation for submission to Eco Matemático (Universidad Francisco de Paula Santander).',
      downloadPdf: 'Download PDF',
      licenseNote: 'It will be published under a CC BY 4.0 license.',
      codeTitle: 'Reproduce it yourself',
      codeIntro: 'This script (available in Python and in R) implements the same recursive construction described above and, in addition, reproduces the three independent methods the article uses to verify the area (by generations, by self-similarity, and by Monte Carlo), so you can regenerate every figure and every number in Table I independently.',
      codeShow: 'Show code',
      codeHide: 'Hide code',
      codeCopy: 'Copy',
      codeCopied: 'Copied!',
      codeDownload: 'Download',
      codeLangLabel: 'Script language',
      resultsTitle: 'Expected output',
      resultsIntro: 'The numerical verification reproduces the six (n, a) pairs from Table I of the article. Methods 1 and 2 are deterministic and match the figures shown exactly; Method 3 (Monte Carlo, N = 10⁶ points) is random and is only expected to match within its standard error.',
      resultsColM1: 'Method 1',
      resultsColM2: 'Method 2',
      resultsNote: "R's Monte Carlo uses a different random number generator from Python's fixed-seed PCG64, so it will not reproduce the same digits: it should only fall within statistical error, with |z| below 2, of the exact value.",
      animateBtn: 'Animation',
      animTitle: 'Animation',
      animExit: 'Exit view',
      animStart: 'Start',
      animStop: 'Stop',
      animHint: 'It runs through every valid pair (n, a) with 2 ≤ n ≤ 20 and 1 ≤ a ≤ n − 1, speeding up as n grows. Changing any parameter stops it and draws the values you typed.',
    },
    hillCipher: {
      alphabet: 'Alphabet',
      keyText: 'Key text',
      textToProcess: 'Text to encrypt or decrypt',
      encryptedText: 'Encrypted text',
      decryptedText: 'Decrypted text',
      introduction: 'Introduction',
      instructions: 'Instructions',
      process: 'Process',
      introDesc: 'The Hill cipher is a cryptographic method developed by mathematician Lester S. Hill in 1929. It is based on linear algebra and uses matrices to transform blocks of plaintext into ciphertext.',
      instrDesc: '1. Define your alphabet in the first field.<br />2. Enter a key text (at least 4 characters). The matrix size is derived from the square root of its length.<br />3. Enter the text you want to encrypt or decrypt.<br />4. The results appear automatically.',
      charTable: 'Character table',
      cipherMatrix: 'Cipher matrix (MC)',
      messageMatrices: 'Message matrices',
      mcMatrices: 'MC × Matrices',
      mcInverse: 'MC inverse',
      mcInvMatrices: 'MC⁻¹ × Matrices',
      detZero: 'Determinant = 0',
      noInverse: 'No modular inverse',
    },
    cantorPairing: {
      generate: 'Generate',
      presentation: 'Presentation',
      p1: "\\(f\\) represents Cantor's pairing function for a \\(\\mathbb{Q^{+}}\\) of the form \\(\\frac{p}{q}\\)",
      p3: 'Substituting \\(p\\) and \\(q\\) into \\(f\\) we get',
      para1: 'The pairing sequence starts at point \\((0,0)\\) and traverses all points on the Cartesian plane in a zigzag pattern until reaching the indicated coordinate.',
      para2: 'Note that to handle any value \\(p \\in \\mathbb{Z}\\), another function should be applied that maps to \\(2p\\) if \\(p\\geq 0\\), otherwise to \\(-2p - 1\\). This is applied to \\(p\\) since it can take the sign of the fraction.',
      para3: 'In set theory, this sequence is used to prove that \\(\\mathbb{Q}\\) has the same cardinality as \\(\\mathbb{N}\\).',
      resultLine: 'Therefore, the position for point {x} and {y} will be <a style="color: red">{n}.</a>',
    },
    voice: {
      audioName: 'Audio name',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      uploadAudio: 'Upload Audio',
      savedAudio: 'Saved audio',
      play: 'Play',
      errListing: 'Error listing audios:',
      micDenied: 'Microphone denied:',
      error: 'Error:',
    },
    ruffini: {
      coefficients: 'Coefficients',
      polynomial: 'Polynomial:',
      process: 'Process:',
      result: 'Result:',
    },
    distributions: {
      introLead: 'A probability distribution describes how likely each possible value of a random quantity is. Pick one below to graph it with adjustable parameters, or scroll down for the theory, history, and a practical use case behind each one.',
      paramsTitle: 'Parameters',
      evalLabel: 'Evaluate at',
      theoryLabel: 'Theory',
      historyLabel: 'History',
      useCaseLabel: 'Practical use',
      referenceTitle: 'Distribution reference',
      jumpBtn: 'Try it in the grapher ↑',

      nameNormal: 'Normal',
      normalTheory: 'Models continuous quantities that arise as the sum of many small, independent effects: the Central Limit Theorem. Its bell shape comes from a negative quadratic in the exponent, symmetric and peaked at the mean μ; the spread σ stretches or compresses it while the area underneath always stays 1.',
      normalHistory: "First derived by Abraham de Moivre in 1733 as an approximation to the binomial distribution, decades before Gauss. Gauss used it in 1809 to justify least-squares fitting of astronomical data, and the name stuck to him anyway: a classic case of Stigler's Law of eponymy.",
      normalUseCase: 'Manufacturing control charts (Six Sigma): a machined part’s dimension is assumed normal around a target, and limits at μ±3σ flag defective units.',

      nameStudentt: "Student's t",
      studenttTheory: "Models the standardized sample mean when the population's standard deviation is unknown and estimated from a small sample. Because that estimate itself fluctuates, the tails are heavier than the normal's; as the degrees of freedom ν grow, the extra uncertainty shrinks and the curve converges to the standard normal.",
      studenttHistory: 'Derived in 1908 by William Sealy Gosset, a chemist at the Guinness brewery in Dublin, to draw sound conclusions from the small samples typical of brewery experiments. Guinness barred staff from publishing under their own name, so he signed the paper "Student"; Fisher later put the formula on rigorous footing in terms of degrees of freedom (1925).',
      studenttUseCase: 'The two-sample t-test: comparing the mean of a small clinical trial (say, 10 patients) against a baseline when the population variance is unknown.',

      nameChisquare: 'Chi-squared',
      chisquareTheory: 'Models the sum of k independent squared standard-normal variables, so it lives only on the positive numbers and is right-skewed. Small k gives a sharp peak near zero; as k grows the sum trends toward normal by the Central Limit Theorem, and the curve becomes more symmetric around its mean k.',
      chisquareHistory: 'Independently derived in 1876 by geodesist Friedrich Robert Helmert while studying measurement-error variance, then rediscovered and named by Karl Pearson in 1900 for his goodness-of-fit test, unaware of Helmert’s earlier work. English-language sources only credited Helmert’s priority decades later, by Pearson himself in 1931.',
      chisquareUseCase: "Pearson's goodness-of-fit test: checking whether a die is fair, or whether disease incidence is independent of blood type in a contingency table.",

      nameF: 'F (Snedecor)',
      fTheory: 'Models the ratio of two independent variance estimates, each a chi-squared variable divided by its own degrees of freedom, so it lives on the positive numbers and is right-skewed. d₁ shapes how peaked the curve is; d₂ mainly controls how heavy its right tail is.',
      fHistory: 'Ronald Fisher gave the mathematical form around 1922–1924, working with a transformed statistic rather than the ratio itself. George Snedecor tabulated the distribution directly as a ratio in his 1934 textbook and named it "F" in Fisher\'s honor. The two never worked on it jointly; a decade separates their contributions.',
      fUseCase: 'One-way ANOVA: comparing mean crop yields across several fertilizer treatments through the ratio of between-group to within-group variance.',

      nameBinomial: 'Binomial',
      binomialTheory: 'Counts the number of successes in n independent trials that each succeed with probability p: the sum of n Bernoulli(p) trials. Larger n spreads and smooths the distribution toward a normal shape; p controls its skew, symmetric at p=0.5 and lopsided as p approaches 0 or 1.',
      binomialHistory: "Jacob Bernoulli derived the binomial probabilities and proved an early law of large numbers for them in Ars Conjectandi, published posthumously in 1713, the same book behind the Bernoulli distribution below. Abraham de Moivre had related results shortly before, in 1711, though Bernoulli's treatment is the one credited with formulating the distribution.",
      binomialUseCase: 'Quality control: counting how many of 100 inspected units from a production batch are defective, when each unit independently fails with the same fixed probability.',

      nameBernoulli: 'Bernoulli',
      bernoulliTheory: 'The simplest possible distribution: a single trial with two outcomes, weight p on success (1) and 1−p on failure (0). With only two points in its support there’s no separate "spread" parameter; p alone fixes the whole shape.',
      bernoulliHistory: 'Named after Jacob Bernoulli (1655–1705), whose treatment of single- and repeated-trial probabilities in Ars Conjectandi (1713, published by his nephew after his death) is the distribution’s origin, the same source behind the Binomial above.',
      bernoulliUseCase: 'A/B testing: whether a single visitor who lands on a page clicks the call-to-action button or not.',

      namePoisson: 'Poisson',
      poissonTheory: 'Counts rare, independent events occurring at a constant average rate λ over a fixed interval of time, area, or volume: the limit of the Binomial as n→∞ and p→0 with np held fixed at λ. The same number λ sets both the center and the spread, its defining trait (mean equals variance).',
      poissonHistory: 'Published by Siméon Denis Poisson in 1837, applied to modeling wrongful-conviction rates in criminal and civil judgments. Abraham de Moivre had anticipated similar results as early as 1711, but the distribution kept Poisson’s name; its best-known early application came later, in Ladislaus Bortkiewicz’s 1898 study of Prussian cavalry deaths by horse-kick.',
      poissonUseCase: 'Call-center staffing: modeling how many calls arrive in a given hour when they occur independently at a roughly constant average rate.',

      nameExponential: 'Exponential',
      exponentialTheory: "Models the waiting time until the next event in a Poisson process: events happening continuously and independently at a constant rate λ. It's memoryless (having already waited doesn't change the odds of waiting longer), and that single property forces the exponential-decay shape; larger λ compresses the wait toward zero.",
      exponentialHistory: 'It falls directly out of the Poisson-process framework built up across the 19th century and formalized within 20th-century probability theory. Unlike Normal or Poisson, no single person is credited with discovering it as a named distribution.',
      exponentialUseCase: 'Reliability engineering: modeling the time to failure of a component with a constant hazard rate, such as a memoryless electronic part.',

      nameUniform: 'Uniform',
      uniformTheory: 'Models a quantity known only to lie somewhere in [a,b], with every equal-length subinterval equally likely: the natural assumption when nothing favors one point over another. The flat density 1/(b−a) is exactly the height needed to keep the area under the curve equal to 1.',
      uniformHistory: 'Not tied to a single historical figure: its origins are inconclusive; equiprobability reasoning goes back to 16th-century dice problems (Gerolamo Cardano), but its formalization as a continuous distribution is a byproduct of 20th-century measure-theoretic probability.',
      uniformUseCase: 'The base primitive of software random-number generators (e.g. Python’s random.random()), later transformed via inverse-CDF sampling to generate values from other distributions.',

      nameGamma: 'Gamma',
      gammaTheory: 'Generalizes the Exponential: it is the distribution of the sum of k independent exponential waiting times (integer k is the special case called Erlang). Small k gives a sharply decaying curve (k=1 is exactly the exponential) while larger k shifts the peak away from zero; the scale θ stretches the x-axis without changing that shape.',
      gammaHistory: 'The Gamma function itself, which the distribution is built on, comes from Leonhard Euler\'s 1729 letters to Christian Goldbach, extending the factorial to non-integer arguments; pure 18th-century analysis, not statistics. The Gamma distribution as a statistical object arrived about 165 years later, when Karl Pearson included it (his "Type III" curve) in his 1895 system of skew frequency curves.',
      gammaUseCase: 'Actuarial science: modeling the total size of insurance claims in a period: always positive, and typically right-skewed.',

      nameBeta: 'Beta',
      betaTheory: 'Models a quantity confined to (0,1): naturally, a probability or proportion. Its two parameters act like pseudo-counts of prior successes (α) and failures (β): raising α pulls mass toward 1, raising β pulls it toward 0, and raising both together tightens the curve around their shared mean.',
      betaHistory: 'Like the Gamma, its function comes from Euler\'s 18th-century work (linked to the Gamma function by B(α,β)=Γ(α)Γ(β)/Γ(α+β)) with the "beta" name introduced later by Jacques Binet in 1839. As a distribution it appears implicitly in Thomas Bayes\'s 1763 essay on inverse probability, and was formally added to Pearson\'s skew-curve system (as "Type I") in the same 1895 paper as the Gamma.',
      betaUseCase: "Bayesian A/B testing: representing belief about a website's true conversion rate after observing some conversions and non-conversions.",
    },
    scripts: {
      tablasMultiplicar: 'Multiplication tables',
      trianguloNumerico: 'Numeric triangle',
      maxSubarray: 'Maximum contiguous subarray sum',
      gravityThread: 'Thread under gravity blocks',
      chess3d: 'Three-dimensional chess',
      buildBuilding: 'Build a building',
      swordSmite: 'Smite 255 sword',
      swordSharpness: 'Sharpness 255 sword',
    },
    tm: {
      statusIdle: 'Waiting',
      statusRunning: 'Running…',
      statusHalted: 'Halted',
      statusLoop: '∞ Loop / step limit',
      reads: 'reads',
      writes: 'writes',
      moves: 'moves',
      dirRight: 'Right →',
      dirLeft: '← Left',
      goesTo: 'goes to',
      invokes: 'invokes',
      resumesAt: ', resumes at',
      noResume: ' (no resume)',
      finalCombHalts: 'final combination, the machine halts',
      stepUndone: '← step undone',
      tapeLabel: 'Tape',
      stepBackAvail: 'Step back (←) — {n} step{s} available',
      stepBackNone: 'Step back (←) — no steps to undo',
      invalidFile: 'Invalid file. Expected a Turing Machine JSON.',
      theoryTableTitle: 'Instructions & Final Combinations',
      theoryTableHtml: `
<h4>Turing Machine</h4>
<div class="tm-def">
  A <em>Turing machine</em> T over Σ is a triple
  <em>T = (K, q₀, I)</em> where K is a finite set of states,
  q₀ ∈ K is the initial state, and I is a partial function
  <em>I : K × (Σ ∪ {#}) → (Σ ∪ {#}) × {R, L} × K</em>.
</div>
<h4>Instruction</h4>
<div class="tm-def">
  An <em>instruction</em> is a quintuple
  <em>(qᵢ, s, t, D, qⱼ)</em> such that:<br>
  · qᵢ, qⱼ ∈ K &nbsp;(states)<br>
  · s, t ∈ Σ ∪ {#} &nbsp;(symbols)<br>
  · D ∈ {R, L} &nbsp;(direction)<br>
  · I(qᵢ, s) = (t, D, qⱼ)
</div>
<h4>Final combination</h4>
<div class="tm-def">
  A pair <em>(qᵢ, s)</em> is a <em>final combination</em>
  if it does not appear at the start of any instruction.
  The machine <em>halts</em> when it reads s in state qᵢ.
</div>
<p class="tm-ref">De Castro Korgi §6.1 · slides §1–5</p>`,
      theoryExecutionTitle: 'Instantaneous Configuration & Step',
      theoryExecutionHtml: `
<h4>Instantaneous configuration</h4>
<div class="tm-def">
  Expression <em>a₁…aᵢ₋₁ q aᵢ…aₙ</em>: the control unit
  is in state <em>q</em> scanning symbol <em>aᵢ</em>.
  Cells outside the range hold the blank #.
</div>
<h4>Computational step ⊢</h4>
<div class="tm-def">
  If <em>I(q, s) = (p, b, R)</em>:&nbsp; <em>…qsa… ⊢ …bpa…</em><br>
  If <em>I(q, s) = (p, b, L)</em>:&nbsp; <em>…cqs… ⊢ …pcb…</em>
</div>
<h4>Accepted language</h4>
<div class="tm-def">
  <em>L(M) = &#123; w ∈ Σ* : q₀w ⊢* w₁pw₂, p ∈ F &#125;</em><br>
  The machine accepts w if it halts in a final state.
</div>
<h4>Infinite loop</h4>
<div class="tm-def">
  If the same configuration repeats, the machine never halts.
  The simulator detects this automatically.
</div>
<p class="tm-ref">De Castro Korgi §6.1 · slides §6–16</p>`,
      theoryDiagramTitle: 'State Diagram',
      theoryDiagramHtml: `
<h4>Transition diagram</h4>
<div class="tm-def">
  The diagram is a <em>labeled digraph</em>:<br>
  · Nodes = states q ∈ K<br>
  · Arrows = instructions labeled <em>s|tD</em><br>
  &nbsp;&nbsp;(read s, write t, move D)
</div>
<h4>Conventions</h4>
<div class="tm-def">
  · Initial state: incoming arrow ►<br>
  · Active state: highlighted in real time<br>
  · Self-loop: circular arrow on the same cell<br>
  · Opposite arcs: curves on opposite sides
</div>
<p class="tm-ref">De Castro Korgi §6.1 · slides §6</p>`,
      theoryHistoryTitle: 'Configuration History & Accepted Language',
      theoryHistoryHtml: `
<h4>Configuration history</h4>
<div class="tm-def">
  Each row shows the instantaneous configuration <em>u q v</em>
  at that step. The highlighted cell is the head position.
</div>
<h4>Recursively enumerable (RE)</h4>
<div class="tm-def">
  A language L is <em>RE</em> if there is a TM M such that L(M) = L.
  L is <em>recursive</em> if, in addition, M halts on every input.
</div>
<h4>Loops and undecidability</h4>
<div class="tm-def">
  If the same configuration repeats, the TM never halts.
  The <em>halting problem</em> (does M halt on input w?)
  is <em>undecidable</em> — no general algorithm exists.
</div>
<p class="tm-ref">De Castro Korgi §7.5–§7.6</p>`,
      exCountOnes: 'Count ones — book example (slides §2)',
      exParity: 'Parity checker — q0=even, q1=odd (halts at end)',
      exUnaryAdd: 'Unary addition  111+11=11111  (slides §22)',
      exAddOneDecimal: 'Add 1 in decimal  2397→2398  (slides §31)',
      exBinaryIncrement: 'Binary increment  1011→1100',
      exSwapBits: 'Swap 0↔1 (complement bits)',
      exBusyBeaver2: 'Busy Beaver 2 — writes 4 ones in 6 steps',
      exBusyBeaver3: 'Busy Beaver 3 — writes 6 ones in 21 steps',
      exBlank: '— Blank machine (start from scratch) —',
      loading: 'Loading…',
      emptyLibrary: 'No machines in the library yet. Be the first to upload one!',
      by: 'by',
      unknown: 'Unknown',
      idForCalls: 'ID for calls:',
      copy: 'Copy',
      copied: '✓ Copied',
      uploading: 'Uploading…',
      upload: 'Upload',
      errUploading: 'Error uploading:',
      uploadSuccess: 'Machine uploaded successfully!',
      valTitle: 'The title is required.',
      valDesc: 'The description is required.',
      valAuthor: 'The author is required.',
      valAlphMin: 'The alphabet Σ must have at least one symbol.',
      valSymSingle: 'The symbol "{s}" must be a single character.',
      valAlphDup: 'The alphabet Σ has duplicate symbols.',
      valStatesMin: 'The set of states K must have at least one state.',
      valStatesDup: 'The set of states K has duplicate entries.',
      valInitState: 'The initial state "{s}" does not belong to K = {K}.',
      valTapeInvalid: 'The tape contains symbols outside Σ ∪ {#}: {syms}',
      valIMin: 'I must have at least one instruction (the transition function cannot be empty).',
      valTransMalformed: 'Malformed transition key: "{key}" — expected "state,symbol".',
      valTransState: 'Transition "{key}": state "{s}" ∉ K.',
      valTransSym: 'Transition "{key}": symbol "{s}" ∉ Σ ∪ {#}.',
      valInstrWrite: 'Instruction "{key}": writes "{s}" ∉ Σ ∪ {#}.',
      valInstrFormat: 'Instruction "{key}" → "{val}": invalid format. Expected ⟨symbol⟩⟨R|L⟩⟨state⟩ (e.g. 1Rq0, #Lq2) or a sub-machine call (e.g. 1R@copy-unary:q2).',
      valInstrNext: 'Instruction "{key}": next state "{s}" ∉ K.',
    },
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
    title: 'Accessibility',
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
      previewNavHome: 'Home',
      previewNavAbout: 'About',
      previewNavProjects: 'Projects',
      previewBtn: 'Button',
      previewLink: 'Link',
      presetsLabel: 'Presets',
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
    account: {
      title: 'Save your preferences',
      desc: 'Sign in with Google to keep your settings on your account, even if you clear your browsing history.',
      prompt: 'Sign in to save your settings to your account',
      infoLabel: 'More info',
      signIn: 'Sign in with Google',
      signOut: 'Sign out',
      saved: 'Your preferences are saved to your account.',
    },
    web: {
      active: 'The site is applying global settings.',
    },
    reset: 'Reset to default',
    resetHint: "Restores system defaults and stops applying the site's global settings.",
    storageNote: 'Settings are stored in your browser and persist between visits. They may be lost if you clear your browsing data or site history. Sign in to keep them on your account.',
  },
  space: {
    title: 'Space',
    intro: 'Your personal area — private data and tools. Requires an authorized account.',
    web: {
      title: 'Web variables (live)',
      desc: 'Applied in real time to everyone on the site for 4 hours.',
      theme: 'Theme',
      font: 'Font',
      lang: 'Language',
      none: '— No change',
      apply: 'Apply to the web',
      remove: 'Remove',
      active: 'Applying to everyone',
    },
    kiosk: {
      title: 'Restrict to a page',
      desc: 'Sends every visitor to one page and blocks navigation for 1 hour. You (authorized) are exempt.',
      destination: 'Destination page',
      activate: 'Restrict now',
      release: 'Release',
      active: 'Restriction active',
    },
  },
  kiosk: {
    restricted: 'The site turned on a temporary restriction, so for now you stay on this page.',
    remaining: 'Time remaining',
    gotIt: 'Got it',
  },
  home: {
    tagline: 'Computer Scientist · Math Enthusiast · UX/UI Designer · Full-Stack Developer · Hiker/Marathoner · Seasoned Minecraft Technician',
    accessibility: 'Accessibility',
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
    saveContact: 'Save contact',
  },
  a11y: {
    mainNav: 'Main navigation',
    toggleMenu: 'Toggle menu',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    imageGallery: 'Image gallery',
    goHome: 'Go home',
    goBack: 'Go back',
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
      vsPc: 'vs PC',
      draw: 'Draw!',
      oWins: 'O wins!',
      xWins: 'X wins!',
      title: 'Tic-Tac-Toe',
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
      saveGame: 'SAVE GAME',
      statTime: 'Time',
      statPercentage: 'Percentage',
      statMines: 'Mines',
      statScore: 'Score',
      kaboom: '¡Ka-Boom!',
      boardClear: 'Board clear!',
      msgEnterName: 'Please enter a name',
      msgCode4: 'Code must be exactly 4 digits',
      msgUserExists: 'User already exists',
      msgSavedId: 'Save your player ID:',
      msgUserNotFound: 'User not found',
      msgNoSavedGame: 'Player has no saved game',
      msgGameSaved: 'Game saved successfully',
      encouragements: [
        'You can do it, ', 'Go for victory, ', 'Believe in yourself, ',
        'Make history today, ', "It's your day, ", 'Have fun, ',
        'Make it count, ', 'Play with passion, ', 'Make it incredible, ',
        'Stay focused, ', 'Play for fun, ', "You'll surprise us, ",
        "You're unstoppable, ", "You're pure energy, ", 'Never give up, ',
        'Make it epic, ', "You'll achieve it, ", 'Break records, ',
        'Keep moving forward, ', 'Success awaits you, ',
      ],
    },
    sudoku: {
      subtitle: 'Sudoku',
    },
  },
}
