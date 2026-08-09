export const profile = {
  name: "Prabal Kalia",
  handle: "starkizard",
  title: "SDE II at Zeta",
  tagline:
    "Clearing networks, matching logic, and rule engines — systems that stay correct under load.",
  stackPlaque: "Java · Spring Boot · Microservices · Kafka · AWS",
  location: "India",
  email: "mail2prabalkalia@gmail.com",
  phone: "+91 8130580250",
  links: {
    linkedin: "https://linkedin.com/in/prabal-kalia",
    github: "https://github.com/starkizard",
    codeforces: "https://codeforces.com/profile/starkizard",
    devpost: "https://devpost.com/starkizard",
  },
  about: [
    "Software engineer shipping payment clearing and transaction systems at scale. Currently SDE II on Zeta's Athens team — clearing networks, matching logic, and rule engines that have to be correct under load.",
    "Before Zeta I spent time at Media.net on contextual advertising: access control, keyword recommendation, CLIP fine-tuning, and making Jenkins go from painful to boringly fast.",
    "IIIT Kottayam CSE (CGPA 9.33). Competitive programming, hackathons, and building things for fun keep me sharp — online as starkizard.",
  ],
  education: [
    {
      school: "Indian Institute of Information Technology, Kottayam",
      degree: "B.Tech, Computer Science and Engineering",
      detail: "CGPA 9.33 / 10",
      period: "Aug 2018 – May 2022",
    },
    {
      school: "Ryan International School, Vasant Kunj, New Delhi",
      degree: "Class 12 — PCM + Computer Science",
      detail: "91.6%",
      period: "Apr 2015 – May 2018",
    },
    {
      school: "Ryan International School, Vasant Kunj, New Delhi",
      degree: "Class 10",
      detail: "CGPA 10 / 10",
      period: "– May 2018",
    },
  ],
  experience: [
    {
      company: "Zeta",
      role: "SDE II",
      period: "Jan 2025 – Present",
      highlights: [
        "End-to-end testing on Athens; found critical bugs and shipped improvements.",
        "Improved matching logic — cut query time from 30+ minutes to ~1.5 minutes.",
        "Delivered clearing features for 3 new transaction types.",
        "Spearheaded onboarding the NYCE network into existing clearing.",
        "Introduced a Drools rule engine and externalized clearance rules.",
        "Awarded Outstanding for 2024–2025.",
      ],
    },
    {
      company: "Zeta",
      role: "SDE I",
      period: "Jun 2024 – Dec 2024",
      highlights: [
        "Athens team: DMS transactions and clearing at scale.",
        "Helped scale the clearing model toward ~30× transactions per day.",
        "Built async Spring Boot + Camunda backends for clearing file state machines.",
        "Queried distributed S3 data with AWS Athena.",
        "Bugfixes and enhancements impacting ~8.3% of retried transactions.",
      ],
    },
    {
      company: "Media.net",
      role: "Intern → SDE I",
      period: "Jan 2022 – May 2024",
      highlights: [
        "Auto-Optimization team for the contextual advertising platform.",
        "Account Management tool in Spring Boot — automated formerly manual workflows.",
        "Common Access Control Agent in Spring Boot — one gate across tools.",
        "Boosted PIR Perform keyword recommendation coverage by ~20% (Python).",
        "Cut a Jenkins build from ~16 minutes to ~9 seconds via Dockerfile work (~100×).",
        "Article Service APIs (Java Servlets) for AI + manual articles on provider pages.",
        "Fine-tuned CLIP for image–text contextual similarity (~96% accuracy).",
        "Async Python scripts for load, clean, and cluster datasets.",
      ],
    },
    {
      company: "IBM Bangalore",
      role: "DevOps Intern",
      period: "Jul 2021 – Dec 2021",
      highlights: [
        "Testing, development, and automation for IBM Cloud Pak for Network Automation.",
        "Python test framework for APIs, Kafka messages, and shell commands on OpenShift — ~5× faster testing.",
      ],
    },
  ],
  skills: {
    languages: ["Python", "C++", "Java", "JavaScript", "SQL", "Bash"],
    backend: [
      "Spring Boot",
      "Microservices",
      "Flask",
      "Java Servlets",
      "Camunda",
      "Kafka",
      "RabbitMQ",
    ],
    infra: ["Docker", "Kubernetes", "Git", "Jenkins", "AWS Athena", "S3", "OpenShift"],
    other: ["Data Structures", "Algorithms", "Data Science", "Drools", "CLIP / ML fine-tuning"],
  },
  projects: [
    {
      name: "BetaZero Chess Engine",
      description:
        "C++ engine with Alpha-Beta (PVS). Engine credit: 2500+ Lichess.",
      href: "https://github.com/starkizard",
      tags: ["C++", "Search", "Chess"],
    },
    {
      name: "Lichess Visualizer",
      description:
        "Visualize and analyze Lichess games via API, python-chess, and BetaZero.",
      href: "https://github.com/starkizard/lichess-Visualizer",
      tags: ["Python", "Chess", "Data"],
    },
    {
      name: "Karaoke Generator",
      description:
        "Generates karaoke and backing tracks from MP3s using source separation (Spleeter).",
      href: "https://github.com/starkizard/Karaoke-Generator",
      tags: ["Python", "Audio", "ML"],
    },
    {
      name: "CrudeCode",
      description:
        "Browse solutions to problems from popular competitive programming platforms.",
      href: "https://github.com/starkizard/CrudeCode",
      tags: ["CP", "Web"],
    },
  ],
  achievements: [
    {
      title: "World Rank 2",
      detail: "MLH Local Hack Day",
      when: "Apr 2021",
    },
    {
      title: "Outstanding Award",
      detail: "Zeta, 2024–2025",
      when: "2025",
    },
    {
      title: "AIR 47",
      detail: "Reply Code Challenge",
      when: "Mar 2021",
    },
    {
      title: "AIR 146",
      detail: "Google Hash Code",
      when: "Feb 2021",
    },
    {
      title: "Top 0.03% · AIR 149",
      detail: "Codathon '21, MANIT Bhopal",
      when: "Jan 2021",
    },
    {
      title: "World Rank 3",
      detail: "HackerEarth January Code Challenge",
      when: "2020",
    },
    {
      title: "5 CSES world records",
      detail: "Fastest codes and code-golf",
      when: "—",
    },
    {
      title: "Codechef IIITK Chapter President",
      detail: "Leadership",
      when: "Nov 2020",
    },
    {
      title: "Winner",
      detail: "Reverse Coding & Circuits — Dhruva '19, IIIT Kottayam",
      when: "Oct 2019",
    },
    {
      title: "AIR 56",
      detail: "CodeWars, IIIT Kota (onsite finals qualifier)",
      when: "Apr 2019",
    },
  ],
  interests: [
    {
      id: "pokemon",
      name: "Pokémon",
      blurb: "Mega Charizard Y + Mega Rayquaza in the neon. Silhouette challenge ready.",
      href: "/starkizard/play/pokemon",
      cta: "Guess the Pokémon →",
    },
    {
      id: "linkin-park",
      name: "Linkin Park",
      blurb: "Hybrid Theory through whatever era is blasting today.",
      href: "/starkizard/play/linkin-park",
      cta: "Guess the song →",
    },
    {
      id: "tt",
      name: "Table Tennis",
      blurb: "Spin, timing, and the satisfactions of a clean counter-hit.",
      href: "/starkizard/play/tt",
      cta: "Play vs bot →",
    },
    {
      id: "f1",
      name: "Max Verstappen",
      blurb: "Orange Army. Telemetry, late braking, and race craft.",
      href: "/starkizard/play/race",
      cta: "Race Red Bull Ring →",
    },
    {
      id: "friendslop",
      name: "Friendslop games",
      blurb: "Multiplayer party games (Codenames-class). Marked WIP — coming later.",
      href: "/starkizard/play/friendslop",
      cta: "WIP →",
      wip: true,
    },
    {
      id: "casino",
      name: "Casino",
      blurb: "Session buy-in, blackjack, and European roulette — Zard chips only.",
      href: "/starkizard/casino",
      cta: "Enter Casino →",
    },
  ],
} as const;
