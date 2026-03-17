import type { Subject } from '@/types';

// ─────────────────────────────────────────────
//  CLASS 6 – SUBJECTS & CHAPTERS (CBSE/NCERT)
// ─────────────────────────────────────────────
export const class6Subjects: Subject[] = [
  // ── SCIENCE ────────────────────────────────
  {
    id: 'science-6',
    name: 'Science',
    description: 'CBSE/NCERT Science for Class 6',
    icon: '🔬',
    color: 'bg-green-500',
    grade: 6,
    chapters: [
      {
        id: 'sci-6-ch1',
        subjectId: 'science-6',
        name: 'Food: Where Does It Come From',
        description: 'Explore where the food we eat comes from.',
        order: 1,
        content: `## Chapter 1: Food – Where Does It Come From\n\n### Topic 1: Sources of Food\nFood is essential for all living beings because it provides energy, helps in growth and protects from diseases. We get food mainly from two sources: plants and animals. Plants provide us fruits, vegetables, cereals, pulses, oils and spices. Animals give us milk, eggs, meat and honey. Different people eat different types of food depending on region and culture.\n\n**Key Points:**\n- Food is needed for energy, growth and protection\n- Main sources: Plants and Animals\n- Plants give cereals, fruits, vegetables\n- Animals give milk, eggs, meat\n\n---\n\n### Topic 2: Plant Parts as Food\nDifferent parts of plants are eaten as food. For example, roots (carrot, beetroot), stems (potato), leaves (spinach), fruits (tomato), seeds (wheat, rice). Plants are the primary source of food because even animals depend on plants directly or indirectly.\n\n**Key Points:**\n- Roots, stems, leaves, fruits, seeds are eaten\n- Plants are primary source of food\n- Different plant parts give different nutrients\n\n---\n\n### Topic 3: Food Habits of Animals\nAnimals are classified based on their food habits. Herbivores eat plants (cow, goat), carnivores eat other animals (lion, tiger), and omnivores eat both plants and animals (humans, bears). Different animals require different types of food.\n\n**Key Points:**\n- Herbivores eat plants\n- Carnivores eat animals\n- Omnivores eat both\n\n---\n\n### Practice Questions\n1. **Why do we need food?**\n   *Answer: For energy, growth and protection from diseases*\n2. **Name two animal food products?**\n   *Answer: Milk and eggs*\n3. **Name two roots we eat?**\n   *Answer: Carrot and beetroot*\n4. **Define herbivore?**\n   *Answer: Animals that eat only plants*\n`,
        mcqs: [
          { id: 'sci-6-ch1-q1', question: 'Main sources of food are?', options: ['Plants', 'Animals', 'Both', 'Water'], correctAnswer: 2, explanation: 'Food comes from both plants and animals.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q2', question: 'Milk comes from?', options: ['Plants', 'Animals', 'Soil', 'Air'], correctAnswer: 1, explanation: 'Milk is an animal product.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q3', question: 'Which is plant food?', options: ['Egg', 'Meat', 'Rice', 'Fish'], correctAnswer: 2, explanation: 'Rice is a grain obtained from plants.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q4', question: 'Which part of plant is potato?', options: ['Root', 'Stem', 'Leaf', 'Fruit'], correctAnswer: 1, explanation: 'Potato is a modified underground stem.', difficulty: 'medium' },
          { id: 'sci-6-ch1-q5', question: 'Spinach is which part?', options: ['Leaf', 'Root', 'Stem', 'Seed'], correctAnswer: 0, explanation: 'We eat the leaves of the spinach plant.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q6', question: 'Wheat is?', options: ['Fruit', 'Seed', 'Root', 'Leaf'], correctAnswer: 1, explanation: 'Wheat grains are seeds of the plant.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q7', question: 'Cow is?', options: ['Carnivore', 'Herbivore', 'Omnivore', 'None'], correctAnswer: 1, explanation: 'Cows eat only plants and grass.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q8', question: 'Lion eats?', options: ['Plants', 'Animals', 'Both', 'None'], correctAnswer: 1, explanation: 'Lions are carnivores and eat other animals.', difficulty: 'easy' },
          { id: 'sci-6-ch1-q9', question: 'Human is?', options: ['Herbivore', 'Carnivore', 'Omnivore', 'None'], correctAnswer: 2, explanation: 'Humans eat both plants and animal products.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch2',
        subjectId: 'science-6',
        name: 'Components of Food',
        description: 'Learn about nutrients, balanced diet and deficiency diseases.',
        order: 2,
        content: `## Chapter 2: Components of Food\n\n### Topic 1: Nutrients\nNutrients are the important substances present in food that help our body grow, get energy and stay healthy. The main nutrients are carbohydrates, proteins, fats, vitamins and minerals.\n\n**Key Points:**\n- Nutrients are essential for body\n- Main nutrients: carbs, protein, fats, vitamins, minerals\n\n---\n\n### Topic 2: Types of Nutrients\nCarbohydrates and fats give energy. Proteins help in growth and repair. Vitamins and minerals protect us from diseases. A balanced diet contains all nutrients in proper amounts.\n\n**Key Points:**\n- Carbs = energy\n- Proteins = growth\n- Vitamins = protection\n\n---\n\n### Topic 3: Balanced Diet\nA balanced diet is one that contains all nutrients in correct proportion. Lack of nutrients causes deficiency diseases like night blindness and weakness.\n\n**Key Points:**\n- Balanced diet is important\n- Prevents diseases\n- Includes all nutrients\n`,
        mcqs: [
          { id: 'sci-6-ch2-q1', question: 'Which is a nutrient?', options: ['Carbohydrate', 'Stone', 'Plastic', 'Air'], correctAnswer: 0, explanation: 'Carbohydrates are one of the main nutrients needed by our body.', difficulty: 'easy' },
          { id: 'sci-6-ch2-q2', question: 'Nutrients help in?', options: ['Growth', 'Energy', 'Health', 'All'], correctAnswer: 3, explanation: 'Nutrients provide energy, help in growth, and maintain overall health.', difficulty: 'easy' },
          { id: 'sci-6-ch2-q3', question: 'Which gives energy?', options: ['Protein', 'Vitamin', 'Carbohydrate', 'Mineral'], correctAnswer: 2, explanation: 'Carbohydrates and fats are energy-giving nutrients.', difficulty: 'easy' },
          { id: 'sci-6-ch2-q4', question: 'Protein helps in?', options: ['Energy', 'Growth', 'Digestion', 'None'], correctAnswer: 1, explanation: 'Proteins are body-building nutrients that help in growth and repair.', difficulty: 'easy' },
          { id: 'sci-6-ch2-q5', question: 'Balanced diet contains?', options: ['Only carbs', 'Only protein', 'All nutrients', 'None'], correctAnswer: 2, explanation: 'A balanced diet provides all necessary nutrients in the right proportions.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch3',
        subjectId: 'science-6',
        name: 'Fibre to Fabric',
        description: 'Learn about fibres, yarn, fabric, and processes like spinning and weaving.',
        order: 3,
        content: `## Chapter 3: Fibre to Fabric\n\n### Topic 1: Fibre and Fabric\nFibres are thin thread-like structures that are used to make yarn. Yarn is then woven or knitted to make fabric (cloth). Fibres can be natural (cotton, wool) or synthetic.\n\n**Key Points:**\n- Fibres → Yarn → Fabric\n- Natural fibres: cotton, wool\n- Fabric is cloth material\n\n---\n\n### Topic 2: Spinning and Weaving\nSpinning is the process of making yarn from fibres. Weaving is the process of making fabric from yarn using looms.\n\n**Key Points:**\n- Spinning makes yarn\n- Weaving makes fabric\n- Looms are used for weaving\n\n---\n\n### Practice Questions\n1. **What is fibre?**\n   *Answer: Thin thread-like structure*\n`,
        mcqs: [
          { id: 'sci-6-ch3-q1', question: 'Fabric is made from?', options: ['Fibres', 'Yarn', 'Plastic', 'Water'], correctAnswer: 1, explanation: 'Fabric is made by weaving or knitting yarn.', difficulty: 'easy' },
          { id: 'sci-6-ch3-q2', question: 'Cotton is?', options: ['Synthetic', 'Natural', 'Metal', 'Liquid'], correctAnswer: 1, explanation: 'Cotton is a natural fibre obtained from plants.', difficulty: 'easy' },
          { id: 'sci-6-ch3-q3', question: 'Spinning means?', options: ['Making cloth', 'Making yarn', 'Cutting cloth', 'None'], correctAnswer: 1, explanation: 'Spinning is the process of twisting fibres together to make yarn.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch4',
        subjectId: 'science-6',
        name: 'Sorting Materials into Groups',
        description: 'Classifying materials based on properties like hardness, solubility and transparency.',
        order: 4,
        content: `## Chapter 4: Sorting Materials into Groups\n\n### Topic 1: Materials Around Us\nObjects are made from different materials like wood, metal, plastic, glass. Materials are grouped based on their properties like hardness, solubility and transparency.\n\n**Key Points:**\n- Objects made of materials\n- Grouping based on properties\n- Examples: metal, wood, plastic\n`,
        mcqs: [
          { id: 'sci-6-ch4-q1', question: 'Glass is?', options: ['Opaque', 'Transparent', 'Hard', 'Soft'], correctAnswer: 1, explanation: 'Glass allows light to pass through, so it is transparent.', difficulty: 'easy' },
          { id: 'sci-6-ch4-q2', question: 'Wood is?', options: ['Metal', 'Material', 'Gas', 'Liquid'], correctAnswer: 1, explanation: 'Wood is a solid material used for making various objects.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch5',
        subjectId: 'science-6',
        name: 'Separation of Substances',
        description: 'Methods for separating components of mixtures like handpicking, winnowing, and filtration.',
        order: 5,
        content: `## Chapter 5: Separation of Substances\n\n### Topic 1: Methods of Separation\nWe separate substances to remove unwanted materials or to get useful components. Methods include handpicking, winnowing, sieving, filtration.\n\n**Key Points:**\n- Handpicking\n- Winnowing\n- Filtration\n\n---\n\n### Practice Questions\n1. **Name some methods used to separate substances?**\n   *Answer: Handpicking, winnowing, sieving, and filtration.*\n`,
        mcqs: [
          { id: 'sci-6-ch5-q1', question: 'Winnowing is used for?', options: ['Water', 'Grains', 'Milk', 'Air'], correctAnswer: 1, explanation: 'Winnowing is used to separate heavier and lighter components of a mixture by wind or by blowing air, commonly used for grains.', difficulty: 'easy' },
          { id: 'sci-6-ch5-q2', question: 'Filtration removes?', options: ['Solid from liquid', 'Gas', 'Light', 'Heat'], correctAnswer: 0, explanation: 'Filtration is a process used to separate solids from liquids using a filter medium.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch6',
        subjectId: 'science-6',
        name: 'Changes Around Us',
        description: 'Learn about reversible and irreversible changes.',
        order: 6,
        content: `## Chapter 6: Changes Around Us\n\n### Topic 1: Types of Changes\nChanges can be reversible or irreversible. Reversible changes can be undone (melting), while irreversible cannot be reversed (burning).\n\n**Key Points:**\n- Reversible change: Can be undone (e.g., melting of ice)\n- Irreversible change: Cannot be undone (e.g., burning of paper)\n`,
        mcqs: [
          { id: 'sci-6-ch6-q1', question: 'Melting ice is?', options: ['Reversible', 'Irreversible', 'None', 'Both'], correctAnswer: 0, explanation: 'Ice can be melted into water, and water can be frozen back into ice.', difficulty: 'easy' },
          { id: 'sci-6-ch6-q2', question: 'Burning paper is?', options: ['Reversible', 'Irreversible', 'Both', 'None'], correctAnswer: 1, explanation: 'Once paper is burnt, it turns into ash and cannot be turned back into paper.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch7',
        subjectId: 'science-6',
        name: 'Getting to Know Plants',
        description: 'Study of different parts of plants like roots, stems, and leaves.',
        order: 7,
        content: `## Chapter 7: Getting to Know Plants\n\n### Topic 1: Parts of Plants\nPlants have roots, stem, leaves, flowers. Roots absorb water, leaves make food (photosynthesis).\n\n**Key Points:**\n- Roots absorb water and minerals from the soil\n- Leaves make food by photosynthesis\n- Stem supports the plant and conducts water\n`,
        mcqs: [
          { id: 'sci-6-ch7-q1', question: 'Leaves make food by?', options: ['Respiration', 'Photosynthesis', 'Digestion', 'Breathing'], correctAnswer: 1, explanation: 'Photosynthesis is the process by which green plants prepare their food.', difficulty: 'easy' },
          { id: 'sci-6-ch7-q2', question: 'Roots absorb?', options: ['Air', 'Water', 'Light', 'Heat'], correctAnswer: 1, explanation: 'Roots stay underground and absorb water and nutrients for the plant.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch8',
        subjectId: 'science-6',
        name: 'Body Movements',
        description: 'Learn about joints and how muscles and bones help in movement.',
        order: 8,
        content: `## Chapter 8: Body Movements\n\n### Topic 1: Joints and Movement\nMovement in body happens due to muscles and bones. Joints like hinge joint, ball and socket joint help in movement.\n\n**Key Points:**\n- Bones support the body and protect internal organs\n- Muscles help in movement by contracting and relaxing\n- Different joints allow different types of movements\n`,
        mcqs: [
          { id: 'sci-6-ch8-q1', question: 'Elbow joint is?', options: ['Hinge', 'Ball', 'Fixed', 'None'], correctAnswer: 0, explanation: 'The hinge joint allows movement in only one direction, like the hinge of a door.', difficulty: 'easy' },
          { id: 'sci-6-ch8-q2', question: 'Shoulder joint is?', options: ['Ball and socket', 'Hinge', 'Fixed', 'None'], correctAnswer: 0, explanation: 'The ball and socket joint allows movement in all directions.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch9',
        subjectId: 'science-6',
        name: 'Living Organisms and Their Surroundings',
        description: 'Characteristics of living things and their habitats.',
        order: 9,
        content: `## Chapter 9: Living Organisms and Their Surroundings\n\n### Topic 1: Characteristics of Living Things\nLiving things grow, breathe, reproduce and respond to environment.\n\n**Key Points:**\n- Growth: All living things grow over time\n- Respiration: Process of taking in oxygen and giving out CO2\n- Reproduction: Process of producing more of their own kind\n`,
        mcqs: [
          { id: 'sci-6-ch9-q1', question: 'Living things can?', options: ['Grow', 'Move', 'Reproduce', 'All'], correctAnswer: 3, explanation: 'Growth, movement, and reproduction are all characteristics of living organisms.', difficulty: 'easy' },
          { id: 'sci-6-ch9-q2', question: 'Non-living things?', options: ['Grow', 'Do not grow', 'Breathe', 'Eat'], correctAnswer: 1, explanation: 'Non-living things do not have biological processes like growth or breathing.', difficulty: 'easy' },
        ]
      },
      {
        id: 'sci-6-ch10',
        subjectId: 'science-6',
        name: 'Motion and Measurement of Distances',
        description: 'Basics of motion and standard units of measurement.',
        order: 10,
        content: `## Chapter 10: Motion and Measurement of Distances`,
        mcqs: []
      },
      {
        id: 'sci-6-ch11',
        subjectId: 'science-6',
        name: 'Light, Shadows and Reflections',
        description: 'Properties of light and how shadows are formed.',
        order: 11,
        content: `## Chapter 11: Light, Shadows and Reflections`,
        mcqs: []
      },
      {
        id: 'sci-6-ch12',
        subjectId: 'science-6',
        name: 'Electricity and Circuits',
        description: 'Electric cells, bulbs, and basic circuits.',
        order: 12,
        content: `## Chapter 12: Electricity and Circuits`,
        mcqs: []
      },
      {
        id: 'sci-6-ch13',
        subjectId: 'science-6',
        name: 'Fun with Magnets',
        description: 'Discovery of magnets and their properties.',
        order: 13,
        content: `## Chapter 13: Fun with Magnets`,
        mcqs: []
      },
      {
        id: 'sci-6-ch14',
        subjectId: 'science-6',
        name: 'Water',
        description: 'Importance of water and the water cycle.',
        order: 14,
        content: `## Chapter 14: Water`,
        mcqs: []
      },
      {
        id: 'sci-6-ch15',
        subjectId: 'science-6',
        name: 'Air Around Us',
        description: 'Composition and importance of air.',
        order: 15,
        content: `## Chapter 15: Air Around Us`,
        mcqs: []
      },
      {
        id: 'sci-6-ch16',
        subjectId: 'science-6',
        name: 'Garbage In Garbage Out',
        description: 'Waste management and vermicomposting.',
        order: 16,
        content: `## Chapter 16: Garbage In Garbage Out`,
        mcqs: []
      }
    ]
  }
];
