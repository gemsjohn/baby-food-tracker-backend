const plotSummary = `In 2350, humans and vampires have formed an agreement to coexist and travel to a distant star system called The Float. You are assigned to accompany them on the journey, but challenges await.`

// const candidate = '';
// const pronoun = '';
// // Define the story plot and decision points
// const plot = [
//   {
//     id: 1,
//     text: `As The Commission gathers in the guildhall, the tension in the air is palpable. Humans and vampires, once bitter enemies, now sitting together to discuss their mission. The mission to The Float is crucial to the survival of both species and the future of the democratic union. As they take their seats, it becomes apparent that they must choose a leader for the journey.`,
//     goal: `Vote to select a leader for the journey.`,
//     decision: "You must elect 1 of 3 potential leaders. Choose from the options below.",
//     options: [
//       {
//         text: "Riley an Anti-Gravitational Physicist.",
//         nextId: 2
//       },
//       {
//         text: "Magnus a 1,300 year old Viking-Vampire.",
//         nextId: 3
//       },
//       {
//         text: "Rena the beloved Regent of Skyline Realm.",
//         nextId: 4
//       }
//     ]
//   },
//   {
//     id: 2,
//     text: `Riley was elected as the new Commission Leader amid thunderous applause and cheers. He's well knwon for the design and development of revolutionary anti-gravitational Planet Hopper's, a fleet of passenger ships. `,
//     goal: `Explain why you selected Riley.`,
//     decision: "Why did you choose Riley?",
//     options: null,
//     nextId: 5
//   },
//   {
//     id: 3,
//     text: `Magnus, a 1300-year-old Vampire with a mysterious past and tales of his strength, has been elected as the new Commission Leader, causing fear and intrigue among the crowd. It is unclear whether he will prioritize the humans' well-being or lead them to doom.`,
//     goal: `Explain why you selected Magnus.`,
//     decision: "Why did you choose Magnus?",
//     options: null,
//     nextId: 5
//   },
//   {
//     id: 4,
//     text: `The crowd cheers. Rena, the former Regent of Skyline Realm, has been elected as the new Commission Leader. Her past as a skilled warrior and strategic thinker has earned her the trust and admiration of her followers, who have faith in her ability to lead them on this mission.`,
//     goal: `Explain why you selected Rena.`,
//     decision: "Why did you choose Rena?",
//     options: null,
//     nextId: 5
//   },
//   {
//     id: 5,
//     text: `${candidate}, elected amidst a captivated audience of humans and vampires, advocates for unity and receives enthusiastic cheers. ${pronoun} recognizes key decisions to be made in crew, logistics, and technology.`,
//     // text: `${candidate}, elected amidst a captivated audience of humans and vampires, advocates for unity and receives enthusiastic cheers. The Leader recognizes key decisions to be made in crew, logistics, and technology.`,
//     goal: `Generate a plan to tackle these challenges: crew, logistics, and technology.`,
//     decision: `Where do you want to begin?`,
//     options: [
//       {
//         text: "Crew",
//         nextId: 6
//       },
//       {
//         text: "Logistics",
//         nextId: 7
//       },
//       {
//         text: "Technology",
//         nextId: 8
//       }
//     ]
//   },
  
//   // ...
// ];

const deliverPlot = (character_data) => {
  const plot = [
    {
      id: 1,
      text: `As The Commission gathers in the guildhall, the tension in the air is palpable. Humans and vampires, once bitter enemies, now sitting together to discuss their mission. The mission to The Float is crucial to the survival of both species and the future of the democratic union. As they take their seats, it becomes apparent that they must choose a leader for the journey.`,
      goal: `Vote to select a leader for the journey.`,
      decision: "You must elect 1 of 3 potential leaders. Choose from the options below.",
      options: [
        {
          text: "Riley an Anti-Gravitational Physicist.",
          nextId: 2
        },
        {
          text: "Magnus a 1,300 year old Viking-Vampire.",
          nextId: 3
        },
        {
          text: "Rena the beloved Regent of Skyline Realm.",
          nextId: 4
        }
      ]
    },
    {
      id: 2,
      text: `Riley was elected as the new Commission Leader amid thunderous applause and cheers. He designed the revolutionary anti-gravitational Planet Hopper's, a fleet of passenger ships, `,
      goal: `Explain why you selected Riley.`,
      decision: "Why did you choose Riley?",
      options: null,
      nextId: 5
    },
    {
      id: 3,
      text: `Magnus, a 1300-year-old Vampire with a mysterious past and tales of his strength, has been elected as the new Commission Leader, causing fear and intrigue among the crowd. It is unclear whether he will prioritize the humans' well-being or lead them to doom.`,
      goal: `Explain why you selected Magnus.`,
      decision: "Why did you choose Magnus?",
      options: null,
      nextId: 5
    },
    {
      id: 4,
      text: `The crowd cheers. Rena, the former Regent of Skyline Realm, has been elected as the new Commission Leader. Her past as a skilled warrior and strategic thinker has earned her the trust and admiration of her followers, who have faith in her ability to lead them on this mission.`,
      goal: `Explain why you selected Rena.`,
      decision: "Why did you choose Rena?",
      options: null,
      nextId: 5
    },
    {
      id: 5,
      text: `${character_data.candidate}, elected amidst a captivated audience of humans and vampires, advocates for unity and receives enthusiastic cheers. ${character_data.pronoun} recognizes key decisions to be made in crew, logistics, and technology.`,
      goal: `Generate a plan to tackle these challenges: crew, logistics, and technology.`,
      decision: `Where do you want to begin?`,
      options: [
        {
          text: "Crew",
          nextId: 6
        },
        {
          text: "Logistics",
          nextId: 7
        },
        {
          text: "Technology",
          nextId: 8
        }
      ]
    },
    
    // ...
  ];

  return plot;
}

module.exports = {plotSummary, deliverPlot};
