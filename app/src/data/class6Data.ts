import type { Subject } from '@/types';

export const class6Subjects: Subject[] = [
  {
    id: 'sci-6',
    name: {
      CBSE: 'Science',
      STATE: 'General Science'
    },
    description: {
      CBSE: 'Explore the world of science with CBSE curriculum',
      STATE: 'General Science for Maharashtra State Board'
    },
    icon: '🔬',
    color: 'bg-green-500',
    grade: 6,
    boards_supported: ['CBSE', 'STATE'],
    chapters: [
      {
        id: 'sci-6-ch1',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Food: Where Does It Come From',
          STATE: 'Food and Nutrition'
        },
        description: {
          CBSE: 'Food: Where Does It Come From - CBSE focus on sources',
          STATE: 'Food and Nutrition - State Board focus on health'
        },
        order: 1,
        content: {
          CBSE: {
            explanation: "## Food: Where Does It Come From (CBSE)\n\nFood is essential for all living beings. It provides energy, helps in growth and protects from diseases. Food mainly comes from two sources: plants and animals. Plants provide cereals, fruits, vegetables while animals provide milk, eggs, meat and honey.",
            mcq: [
              { id: 'sci-6-ch1-q1-cbse', question: 'Food is needed for?', options: ['Energy', 'Growth', 'Protection', 'All'], correctAnswer: 3, explanation: 'Food provides energy, growth, and protection.', difficulty: 'easy' },
              { id: 'sci-6-ch1-q2-cbse', question: 'Main sources of food?', options: ['Plants', 'Animals', 'Both', 'None'], correctAnswer: 2, explanation: 'We get food from both plants and animals.', difficulty: 'easy' },
              { id: 'sci-6-ch1-q3-cbse', question: 'Carrot is?', options: ['Root', 'Stem', 'Leaf', 'Fruit'], correctAnswer: 0, explanation: 'Carrot is the root part of the plant.', difficulty: 'easy' },
              { id: 'sci-6-ch1-q4-cbse', question: 'Lion eats?', options: ['Plants', 'Animals', 'Both', 'None'], correctAnswer: 1, explanation: 'Lion is a carnivore and eats other animals.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "Why do we need food?", answer: "For energy, growth and protection" },
              { question: "Name two sources of food", answer: "Plants and animals" }
            ],
            extra_questions: [
              { question: "Explain sources of food with examples", answer: "Plants (cereals) and animals (milk)" },
              { question: "Describe different plant parts used as food", answer: "Roots, stems, leaves, fruits" },
              { question: "Explain types of animals based on food habits", answer: "Herbivores, carnivores, omnivores" }
            ]
          },
          STATE: {
            explanation: "## Food and Nutrition (State Board)\n\nNutrition is the process of providing or obtaining the food necessary for health and growth. Food is essential for all living beings. It provides energy, helps in growth and protects from diseases.",
            mcq: [
              { id: 'sci-6-ch1-q1-state', question: 'Food is needed for?', options: ['Energy', 'Growth', 'Protection', 'All'], correctAnswer: 3, explanation: 'Food provides energy, growth, and protection.', difficulty: 'easy' },
              { id: 'sci-6-ch1-q2-state', question: 'Main sources of food?', options: ['Plants', 'Animals', 'Both', 'None'], correctAnswer: 2, explanation: 'We get food from both plants and animals.', difficulty: 'easy' },
              { id: 'sci-6-ch1-q3-state', question: 'Potato is?', options: ['Root', 'Stem', 'Leaf', 'Fruit'], correctAnswer: 1, explanation: 'Potato is an underground stem.', difficulty: 'easy' },
              { id: 'sci-6-ch1-q4-state', question: 'Cow is?', options: ['Carnivore', 'Herbivore', 'Omnivore', 'None'], correctAnswer: 1, explanation: 'Cow is a herbivore and eats plants.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "Why do we need food?", answer: "For energy, growth and protection" },
              { question: "Name two sources of food", answer: "Plants and animals" }
            ],
            extra_questions: [
              { question: "Explain sources of food with examples", answer: "Plants (cereals) and animals (milk)" },
              { question: "Describe different plant parts used as food", answer: "Roots, stems, leaves, fruits" }
            ]
          }
        },
        topics: [
          {
            id: 'T1',
            name: 'Need and Sources of Food',
            content: {
              CBSE: {
                explanation: "Food is essential for all living beings. It provides energy, helps in growth and protects from diseases. Food mainly comes from two sources: plants and animals. Plants provide cereals, fruits, vegetables while animals provide milk, eggs, meat and honey.",
                mcq: [
                  { id: 'T1-Q1', question: 'Food is needed for?', options: ['Energy', 'Growth', 'Protection', 'All'], correctAnswer: 3, explanation: 'Food gives everything needed.', difficulty: 'easy' },
                  { id: 'T1-Q2', question: 'Main sources of food?', options: ['Plants', 'Animals', 'Both', 'None'], correctAnswer: 2, explanation: 'Both plants and animals.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Why do we need food?', answer: 'For energy, growth and protection' }
                ]
              },
              STATE: {
                explanation: "Food is essential for all living beings. It provides energy, helps in growth and protects from diseases. Food mainly comes from two sources: plants and animals. Plants provide cereals, fruits, vegetables while animals provide milk, eggs, meat and honey.",
                mcq: [
                  { id: 'T1-Q1-S', question: 'Food is needed for?', options: ['Energy', 'Growth', 'Protection', 'All'], correctAnswer: 3, explanation: 'Food gives everything needed.', difficulty: 'easy' },
                  { id: 'T1-Q2-S', question: 'Main sources of food?', options: ['Plants', 'Animals', 'Both', 'None'], correctAnswer: 2, explanation: 'Both plants and animals.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Why do we need food?', answer: 'For energy, growth and protection' }
                ]
              }
            }
          },
          {
            id: 'T2',
            name: 'Plant Parts as Food',
            content: {
              CBSE: {
                explanation: "We eat different parts of plants such as roots, stems, leaves, fruits, flowers and seeds. For example, carrot is root, potato is stem, spinach is leaf, and wheat is seed.",
                mcq: [
                  { id: 'T2-Q1', question: 'Carrot is?', options: ['Root', 'Stem', 'Leaf', 'Fruit'], correctAnswer: 0, explanation: 'Carrot is a root.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Name two roots we eat', answer: 'Carrot and radish' }
                ]
              },
              STATE: {
                explanation: "We eat different parts of plants such as roots, stems, leaves, fruits, flowers and seeds. For example, carrot is root, potato is stem, spinach is leaf, and wheat is seed.",
                mcq: [
                  { id: 'T2-Q1-S', question: 'Carrot is?', options: ['Root', 'Stem', 'Leaf', 'Fruit'], correctAnswer: 0, explanation: 'Carrot is a root.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Name two roots we eat', answer: 'Carrot and radish' }
                ]
              }
            }
          },
          {
            id: 'T3',
            name: 'Animal Products as Food',
            content: {
              CBSE: {
                explanation: "Animals also provide food products such as milk, eggs, meat and honey. Milk from cow, buffalo and goat is used to make butter, curd and cheese.",
                mcq: [
                  { id: 'T3-Q1', question: 'Milk is?', options: ['Plant product', 'Animal product', 'Mineral', 'None'], correctAnswer: 1, explanation: 'Milk comes from animals.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Name two animal food items', answer: 'Milk and eggs' }
                ]
              },
              STATE: {
                explanation: "Animals also provide food products such as milk, eggs, meat and honey. Milk from cow, buffalo and goat is used to make butter, curd and cheese.",
                mcq: [
                  { id: 'T3-Q1-S', question: 'Milk is?', options: ['Plant product', 'Animal product', 'Mineral', 'None'], correctAnswer: 1, explanation: 'Milk comes from animals.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Name two animal food items', answer: 'Milk and eggs' }
                ]
              }
            }
          },
          {
            id: 'T4',
            name: 'Food Habits of Animals',
            content: {
              CBSE: {
                explanation: "Animals are classified based on their eating habits. Herbivores eat plants, carnivores eat animals, and omnivores eat both plants and animals.",
                mcq: [
                  { id: 'T4-Q1', question: 'Cow is?', options: ['Carnivore', 'Herbivore', 'Omnivore', 'None'], correctAnswer: 1, explanation: 'Cow eats plants.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Define herbivores', answer: 'Animals that eat only plants' }
                ]
              },
              STATE: {
                explanation: "Animals are classified based on their eating habits. Herbivores eat plants, carnivores eat animals, and omnivores eat both plants and animals.",
                mcq: [
                  { id: 'T4-Q1-S', question: 'Cow is?', options: ['Carnivore', 'Herbivore', 'Omnivore', 'None'], correctAnswer: 1, explanation: 'Cow eats plants.', difficulty: 'easy' }
                ],
                short_questions: [
                  { question: 'Define herbivores', answer: 'Animals that eat only plants' }
                ]
              }
            }
          }
        ],
        mcqs: []
      },
      {
        id: 'sci-6-ch2',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Components of Food',
          STATE: 'Nutrition and Food'
        },
        description: {
          CBSE: 'Components of Food - CBSE coverage of basic nutrients',
          STATE: 'Nutrition and Food - State Board focus on nutrition'
        },
        order: 2,
        content: {
          CBSE: {
            explanation: "## Components of Food (CBSE)\n\nNutrients are the important substances present in food that help our body grow, get energy and stay healthy. The main nutrients are carbohydrates, proteins, fats, vitamins and minerals.",
            mcq: [
              { id: 'sci-6-ch2-q1-cbse', question: 'Energy giving nutrient?', options: ['Protein', 'Carbohydrate', 'Vitamin', 'Mineral'], correctAnswer: 1, explanation: 'Carbohydrates are the primary source of energy.', difficulty: 'easy' },
              { id: 'sci-6-ch2-q2-cbse', question: 'Growth nutrient?', options: ['Protein', 'Fat', 'Vitamin', 'Water'], correctAnswer: 0, explanation: 'Proteins are body-building nutrients.', difficulty: 'easy' },
              { id: 'sci-6-ch2-q3-cbse', question: 'Night blindness is due to?', options: ['Vitamin A', 'Vitamin C', 'Protein', 'Fat'], correctAnswer: 0, explanation: 'Vitamin A deficiency causes night blindness.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What are nutrients?", answer: "Substances in food needed for growth and energy" },
              { question: "What is balanced diet?", answer: "Diet with all nutrients in correct amount" }
            ]
          },
          STATE: {
            explanation: "## Nutrition and Food (State Board)\n\nNutrients are the important substances present in food that help our body grow, get energy and stay healthy. The main nutrients are carbohydrates, proteins, fats, vitamins and minerals.",
            mcq: [
              { id: 'sci-6-ch2-q1-state', question: 'Energy giving nutrient?', options: ['Protein', 'Carbohydrate', 'Vitamin', 'Mineral'], correctAnswer: 1, explanation: 'Carbohydrates provide energy.', difficulty: 'easy' },
              { id: 'sci-6-ch2-q2-state', question: 'Growth nutrient?', options: ['Protein', 'Fat', 'Vitamin', 'Water'], correctAnswer: 0, explanation: 'Proteins help in growth and repair.', difficulty: 'easy' },
              { id: 'sci-6-ch2-q3-state', question: 'Scurvy is due to?', options: ['Vitamin C', 'Vitamin D', 'Protein', 'Iron'], correctAnswer: 0, explanation: 'Vitamin C deficiency causes scurvy.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What are nutrients?", answer: "Substances in food needed for growth and energy" },
              { question: "Name five nutrients", answer: "Carbohydrates, proteins, fats, vitamins, minerals" }
            ]
          }
        },
        topics: [
          {
            id: 'T1',
            name: 'What are Nutrients',
            content: {
              CBSE: {
                explanation: "Nutrients are the important substances present in food that help our body grow, get energy and stay healthy. The main nutrients are carbohydrates, proteins, fats, vitamins and minerals.",
                mcq: [
                  { id: 'sci-6-ch2-T1-Q1-cbse', question: "Nutrients are?", options: ["Waste", "Useful substances", "Water only", "None"], correctAnswer: 1, explanation: "Nutrients are essential substances for the body.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T1-Q2-cbse', question: "Main nutrients are?", options: ["Carbs, proteins", "Fruits only", "Water only", "None"], correctAnswer: 0, explanation: "Carbohydrates, proteins, fats, vitamins, and minerals are the main nutrients.", difficulty: 'easy' }
                ],
                short_questions: [
                  { question: "What are nutrients?", answer: "Substances in food needed for growth and energy" }
                ]
              },
              STATE: {
                explanation: "Nutrients are the important substances present in food that help our body grow, get energy and stay healthy. The main nutrients are carbohydrates, proteins, fats, vitamins and minerals.",
                mcq: [
                  { id: 'sci-6-ch2-T1-Q1-state', question: "Nutrients are?", options: ["Waste", "Useful substances", "Water only", "None"], correctAnswer: 1, explanation: "Nutrients are essential substances for the body.", difficulty: 'easy' }
                ],
                short_questions: [
                  { question: "What are nutrients?", answer: "Substances in food needed for growth and energy" }
                ]
              }
            }
          },
          {
            id: 'T2',
            name: 'Types of Nutrients',
            content: {
              CBSE: {
                explanation: "There are five main nutrients: carbohydrates, proteins, fats, vitamins and minerals. Carbohydrates and fats give energy, proteins help in growth, and vitamins and minerals protect the body.",
                mcq: [
                  { id: 'sci-6-ch2-T2-Q1-cbse', question: "Energy giving nutrient?", options: ["Protein", "Carbohydrate", "Vitamin", "Mineral"], correctAnswer: 1, explanation: "Carbohydrates provide energy.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T2-Q2-cbse', question: "Growth nutrient?", options: ["Protein", "Fat", "Vitamin", "Water"], correctAnswer: 0, explanation: "Proteins are for growth.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T2-Q3-cbse', question: "Protective nutrient?", options: ["Vitamins", "Carbs", "Fats", "None"], correctAnswer: 0, explanation: "Vitamins and minerals protect the body.", difficulty: 'easy' }
                ],
                short_questions: [
                  { question: "Name five nutrients", answer: "Carbohydrates, proteins, fats, vitamins, minerals" }
                ]
              },
              STATE: {
                explanation: "There are five main nutrients: carbohydrates, proteins, fats, vitamins and minerals. Carbohydrates and fats give energy, proteins help in growth, and vitamins and minerals protect the body.",
                mcq: [
                  { id: 'sci-6-ch2-T2-Q1-state', question: "Energy giving nutrient?", options: ["Protein", "Carbohydrate", "Vitamin", "Mineral"], correctAnswer: 1, explanation: "Carbohydrates provide energy.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T2-Q2-state', question: "Growth nutrient?", options: ["Protein", "Fat", "Vitamin", "Water"], correctAnswer: 0, explanation: "Proteins are for growth.", difficulty: 'easy' }
                ],
                short_questions: [
                  { question: "Name five nutrients", answer: "Carbohydrates, proteins, fats, vitamins, minerals" }
                ]
              }
            }
          },
          {
            id: 'T3',
            name: 'Carbohydrates and Fats',
            content: {
              CBSE: {
                explanation: "Carbohydrates and fats are energy giving nutrients. Carbohydrates are found in rice, wheat and sugar, while fats are found in butter, oil and ghee.",
                mcq: [
                  { id: 'sci-6-ch2-T3-Q1-cbse', question: "Carbohydrates give?", options: ["Energy", "Growth", "Protection", "None"], correctAnswer: 0, explanation: "Carbs are energy giving nutrients.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T3-Q2-cbse', question: "Fat is found in?", options: ["Oil", "Water", "Air", "Soil"], correctAnswer: 0, explanation: "Oil is a source of fat.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T3-Q3-cbse', question: "Starch is?", options: ["Carbohydrate", "Protein", "Vitamin", "Mineral"], correctAnswer: 0, explanation: "Starch is a type of carbohydrate.", difficulty: 'easy' }
                ]
              },
              STATE: {
                explanation: "Carbohydrates and fats are energy giving nutrients. Carbohydrates are found in rice, wheat and sugar, while fats are found in butter, oil and ghee.",
                mcq: [
                  { id: 'sci-6-ch2-T3-Q1-state', question: "Carbohydrates give?", options: ["Energy", "Growth", "Protection", "None"], correctAnswer: 0, explanation: "Carbs are energy giving nutrients.", difficulty: 'easy' }
                ]
              }
            }
          },
          {
            id: 'T4',
            name: 'Proteins',
            content: {
              CBSE: {
                explanation: "Proteins are body-building nutrients. They help in growth and repair of damaged body tissues. Foods like eggs, milk, pulses and meat are rich in proteins.",
                mcq: [
                  { id: 'sci-6-ch2-T4-Q1-cbse', question: "Protein helps in?", options: ["Growth", "Energy", "Heat", "None"], correctAnswer: 0, explanation: "Proteins are for growth and repair.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T4-Q2-cbse', question: "Protein rich food?", options: ["Rice", "Milk", "Water", "Salt"], correctAnswer: 1, explanation: "Milk is a good source of protein.", difficulty: 'easy' }
                ]
              },
              STATE: {
                explanation: "Proteins are body-building nutrients. They help in growth and repair of damaged body tissues. Foods like eggs, milk, pulses and meat are rich in proteins.",
                mcq: [
                  { id: 'sci-6-ch2-T4-Q1-state', question: "Protein helps in?", options: ["Growth", "Energy", "Heat", "None"], correctAnswer: 0, explanation: "Proteins are for growth and repair.", difficulty: 'easy' }
                ]
              }
            }
          },
          {
            id: 'T5',
            name: 'Vitamins and Minerals',
            content: {
              CBSE: {
                explanation: "Vitamins and minerals protect the body from diseases and keep it healthy. For example, Vitamin A helps eyesight and calcium strengthens bones.",
                mcq: [
                  { id: 'sci-6-ch2-T5-Q1-cbse', question: "Vitamin A helps?", options: ["Eyes", "Heart", "Skin", "None"], correctAnswer: 0, explanation: "Vitamin A is essential for healthy eyesight.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T5-Q2-cbse', question: "Calcium is for?", options: ["Bones", "Hair", "Eyes", "None"], correctAnswer: 0, explanation: "Calcium is needed for strong bones.", difficulty: 'easy' }
                ]
              },
              STATE: {
                explanation: "Vitamins and minerals protect the body from diseases and keep it healthy. For example, Vitamin A helps eyesight and calcium strengthens bones.",
                mcq: [
                  { id: 'sci-6-ch2-T5-Q1-state', question: "Vitamin A helps?", options: ["Eyes", "Heart", "Skin", "None"], correctAnswer: 0, explanation: "Vitamin A is essential for healthy eyesight.", difficulty: 'easy' }
                ]
              }
            }
          },
          {
            id: 'T6',
            name: 'Balanced Diet',
            content: {
              CBSE: {
                explanation: "A balanced diet is a diet that contains all nutrients in the right proportion along with water and roughage. It keeps our body healthy and prevents diseases.",
                mcq: [
                  { id: 'sci-6-ch2-T6-Q1-cbse', question: "Balanced diet contains?", options: ["Only carbs", "All nutrients", "Only protein", "None"], correctAnswer: 1, explanation: "Balanced diet has all required nutrients.", difficulty: 'easy' },
                  { id: 'sci-6-ch2-T6-Q2-cbse', question: "Balanced diet prevents?", options: ["Disease", "Sleep", "Growth", "None"], correctAnswer: 0, explanation: "Balanced diet keeps you healthy and prevents disease.", difficulty: 'easy' }
                ],
                short_questions: [
                  { question: "What is balanced diet?", answer: "Diet with all nutrients in correct amount" }
                ]
              },
              STATE: {
                explanation: "A balanced diet is a diet that contains all nutrients in the right proportion along with water and roughage. It keeps our body healthy and prevents diseases.",
                mcq: [
                  { id: 'sci-6-ch2-T6-Q1-state', question: "Balanced diet contains?", options: ["Only carbs", "All nutrients", "Only protein", "None"], correctAnswer: 1, explanation: "Balanced diet has all required nutrients.", difficulty: 'easy' }
                ],
                short_questions: [
                  { question: "What is balanced diet?", answer: "Diet with all nutrients in correct amount" }
                ]
              }
            }
          },
          {
            id: 'T7',
            name: 'Deficiency Diseases',
            content: {
              CBSE: {
                explanation: "If our body does not get proper nutrients for a long time, it leads to deficiency diseases. Example: Night blindness (Vitamin A), scurvy (Vitamin C), rickets (Vitamin D).",
                mcq: [
                  { id: 'sci-6-ch2-T7-Q1-cbse', question: "Night blindness is due to?", options: ["Vitamin A", "Vitamin C", "Protein", "Fat"], correctAnswer: 0, explanation: "Lack of Vitamin A causes night blindness.", difficulty: 'medium' },
                  { id: 'sci-6-ch2-T7-Q2-cbse', question: "Scurvy is due to?", options: ["Vitamin C", "Vitamin D", "Protein", "Iron"], correctAnswer: 0, explanation: "Lack of Vitamin C causes scurvy.", difficulty: 'medium' },
                  { id: 'sci-6-ch2-T7-Q3-cbse', question: "Rickets is due to?", options: ["Vitamin D", "Vitamin A", "Fat", "None"], correctAnswer: 0, explanation: "Lack of Vitamin D causes rickets.", difficulty: 'medium' }
                ],
                extra_questions: [
                  { question: "Explain deficiency diseases with examples", answer: "Diseases caused by lack of nutrients, e.g., Scurvy (Vit C)" },
                  { question: "Why balanced diet is important?", answer: "It prevents deficiency diseases and maintains health." }
                ]
              },
              STATE: {
                explanation: "If our body does not get proper nutrients for a long time, it leads to deficiency diseases. Example: Night blindness (Vitamin A), scurvy (Vitamin C), rickets (Vitamin D).",
                mcq: [
                  { id: 'sci-6-ch2-T7-Q1-state', question: "Night blindness is due to?", options: ["Vitamin A", "Vitamin C", "Protein", "Fat"], correctAnswer: 0, explanation: "Lack of Vitamin A causes night blindness.", difficulty: 'medium' }
                ]
              }
            }
          },
          {
            id: 'T8',
            name: 'Extra Practice (Exam Level)',
            content: {
              CBSE: {
                explanation: "Review the key topics to prepare for your exams.",
                mcq: [
                  { id: 'sci-6-ch2-T8-Q1-cbse', question: "Energy giving nutrients?", options: ["Carbs & fats", "Proteins", "Vitamins", "None"], correctAnswer: 0, explanation: "Carbs and fats provide energy.", difficulty: 'medium' },
                  { id: 'sci-6-ch2-T8-Q2-cbse', question: "Growth nutrient?", options: ["Protein", "Fat", "Water", "None"], correctAnswer: 0, explanation: "Proteins are the body-building nutrients.", difficulty: 'medium' },
                  { id: 'sci-6-ch2-T8-Q3-cbse', question: "Protective nutrients?", options: ["Vitamins & minerals", "Carbs", "Fats", "None"], correctAnswer: 0, explanation: "Vitamins and minerals protect the body from disease.", difficulty: 'medium' }
                ],
                extra_questions: [
                  { question: "Explain types of nutrients", answer: "Carbohydrates, fats, proteins, vitamins, minerals" },
                  { question: "Write functions of proteins", answer: "Growth and repair of body tissues" },
                  { question: "Explain balanced diet", answer: "A diet containing all nutrients in right proportion" }
                ]
              },
              STATE: {
                explanation: "Review the key topics to prepare for your exams.",
                mcq: [
                  { id: 'sci-6-ch2-T8-Q1-state', question: "Energy giving nutrients?", options: ["Carbs & fats", "Proteins", "Vitamins", "None"], correctAnswer: 0, explanation: "Carbs and fats provide energy.", difficulty: 'medium' }
                ]
              }
            }
          }
        ],
        mcqs: []
      },
      {
        id: 'sci-6-ch3',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Fibre to Fabric',
          STATE: 'Clothing and Fibres'
        },
        description: {
          CBSE: 'Fibre to Fabric - CBSE focus on basic process',
          STATE: 'Clothing and Fibres - State Board focus on materials'
        },
        order: 3,
        content: {
          CBSE: {
            explanation: "## Fibre to Fabric (CBSE)\n\nClothes are made from fabrics, and fabrics are made from yarn. Yarn is made from fibres. Fibre is a thin thread-like structure. Thus, the sequence is Fibre → Yarn → Fabric.",
            mcq: [
              { id: 'sci-6-ch3-q1-cbse', question: 'Fabric is made from?', options: ['Fibres', 'Yarn', 'Plastic', 'Water'], correctAnswer: 1, explanation: 'Yarn is the intermediate stage between fiber and fabric.', difficulty: 'easy' },
              { id: 'sci-6-ch3-q2-cbse', question: 'Cotton is?', options: ['Natural', 'Synthetic', 'Metal', 'None'], correctAnswer: 0, explanation: 'Cotton is a natural fiber obtained from plants.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What is fibre?", answer: "A thin thread-like structure" },
              { question: "Name two plant fibres", answer: "Cotton and jute" }
            ]
          },
          STATE: {
            explanation: "## Clothing and Fibres (State Board)\n\nClothes are made from fabrics, and fabrics are made from yarn. Yarn is made from fibres. Fibre is a thin thread-like structure. Thus, the sequence is Fibre → Yarn → Fabric.",
            mcq: [
              { id: 'sci-6-ch3-q1-state', question: 'Yarn is made from?', options: ['Fabric', 'Fibres', 'Cloth', 'None'], correctAnswer: 1, explanation: 'Fibres are twisted together to make yarn.', difficulty: 'easy' },
              { id: 'sci-6-ch3-q2-state', question: 'Nylon is?', options: ['Natural', 'Synthetic', 'Plant', 'None'], correctAnswer: 1, explanation: 'Nylon is a man-made or synthetic fiber.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What is fibre?", answer: "A thin thread-like structure" },
              { question: "What is spinning?", answer: "Making yarn from fibres" }
            ]
          }
        },
        topics: [
          {
            id: 'T1',
            name: 'Introduction to Fibre and Fabric',
            content: {
              CBSE: {
                explanation: "Clothes are made from fabrics, and fabrics are made from yarn. Yarn is made from fibres.",
                mcq: [{ id: 'T3-Q1', question: 'Fabric is made from?', options: ['Fibres', 'Yarn', 'Plastic', 'Water'], correctAnswer: 1, explanation: 'Yarn makes fabric.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Clothes are made from fabrics, and fabrics are made from yarn. Yarn is made from fibres.",
                mcq: [{ id: 'T3-Q1-S', question: 'Fabric is made from?', options: ['Fibres', 'Yarn', 'Plastic', 'Water'], correctAnswer: 1, explanation: 'Yarn makes fabric.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T2',
            name: 'Types of Fibres',
            content: {
              CBSE: {
                explanation: "Fibres are of two types: natural and synthetic. Natural fibres come from plants and animals.",
                mcq: [{ id: 'T3-Q2', question: 'Nylon is?', options: ['Natural', 'Synthetic', 'Plant', 'None'], correctAnswer: 1, explanation: 'Nylon is man-made.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Fibres are of two types: natural and synthetic. Natural fibres come from plants and animals.",
                mcq: [{ id: 'T3-Q2-S', question: 'Nylon is?', options: ['Natural', 'Synthetic', 'Plant', 'None'], correctAnswer: 1, explanation: 'Nylon is man-made.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T3',
            name: 'Plant Fibres (Cotton and Jute)',
            content: {
              CBSE: {
                explanation: "Cotton is obtained from cotton plant fruits while jute is obtained from the stem.",
                mcq: [{ id: 'T3-Q3', question: 'Cotton is obtained from?', options: ['Stem', 'Fruit', 'Leaf', 'Root'], correctAnswer: 1, explanation: 'Cotton from fruits.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Cotton is obtained from cotton plant fruits while jute is obtained from the stem.",
                mcq: [{ id: 'T3-Q3-S', question: 'Cotton is obtained from?', options: ['Stem', 'Fruit', 'Leaf', 'Root'], correctAnswer: 1, explanation: 'Cotton from fruits.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T4',
            name: 'Spinning of Yarn',
            content: {
              CBSE: {
                explanation: "Spinning is the process of making yarn from fibres. Tools like charkha are used.",
                mcq: [{ id: 'T3-Q4', question: 'Tool used for spinning?', options: ['Charkha', 'Knife', 'Hammer', 'None'], correctAnswer: 0, explanation: 'Charkha for spinning.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Spinning is the process of making yarn from fibres. Tools like charkha are used.",
                mcq: [{ id: 'T3-Q4-S', question: 'Tool used for spinning?', options: ['Charkha', 'Knife', 'Hammer', 'None'], correctAnswer: 0, explanation: 'Charkha for spinning.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T5',
            name: 'Yarn to Fabric (Weaving and Knitting)',
            content: {
              CBSE: {
                explanation: "Fabric is made from yarn by weaving or knitting. Weaving uses two sets of yarn.",
                mcq: [{ id: 'T3-Q5', question: 'Weaving uses?', options: ['One yarn', 'Two yarns', 'Water', 'None'], correctAnswer: 1, explanation: 'Two yarns for weaving.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Fabric is made from yarn by weaving or knitting. Weaving uses two sets of yarn.",
                mcq: [{ id: 'T3-Q5-S', question: 'Weaving uses?', options: ['One yarn', 'Two yarns', 'Water', 'None'], correctAnswer: 1, explanation: 'Two yarns for weaving.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T6',
            name: 'History of Clothing Material',
            content: {
              CBSE: {
                explanation: "Earlier people used leaves and animal skins. Now synthetic fibres are also used.",
                mcq: [{ id: 'T3-Q6', question: 'Early humans used?', options: ['Leaves', 'Plastic', 'Metal', 'None'], correctAnswer: 0, explanation: 'No clothes then.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Earlier people used leaves and animal skins. Now synthetic fibres are also used.",
                mcq: [{ id: 'T3-Q6-S', question: 'Early humans used?', options: ['Leaves', 'Plastic', 'Metal', 'None'], correctAnswer: 0, explanation: 'No clothes then.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T7',
            name: 'Extra Practice',
            content: {
              CBSE: {
                explanation: "Master the journey from fibre to fabric.",
                mcq: [{ id: 'T3-Q7', question: 'Natural fibre?', options: ['Cotton', 'Nylon', 'Plastic', 'None'], correctAnswer: 0, explanation: 'Cotton is natural.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Master the clothing and fibres topics.",
                mcq: [{ id: 'T3-Q7-S', question: 'Natural fibre?', options: ['Cotton', 'Nylon', 'Plastic', 'None'], correctAnswer: 0, explanation: 'Cotton is natural.', difficulty: 'easy' }]
              }
            }
          }
        ],
        mcqs: []
      },
      {
        id: 'sci-6-ch4',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Sorting Materials into Groups',
          STATE: 'Materials Around Us'
        },
        description: {
          CBSE: 'Sorting Materials into Groups - CBSE focus on classification',
          STATE: 'Materials Around Us - State Board focus on properties'
        },
        order: 4,
        content: {
          CBSE: {
            explanation: "## Sorting Materials into Groups (CBSE)\n\nThere are many objects around us. All objects are made from one or more materials such as wood, metal, plastic, glass or cloth. We group materials to make it easier to study and use them.",
            mcq: [
              { id: 'sci-6-ch4-q1-cbse', question: 'Objects around us are made from?', options: ['Materials', 'Water', 'Air', 'None'], correctAnswer: 0, explanation: 'Materials are the substances used to make objects.', difficulty: 'easy' },
              { id: 'sci-6-ch4-q2-cbse', question: 'Which of the following is lustrous?', options: ['Wood', 'Iron', 'Plastic', 'Paper'], correctAnswer: 1, explanation: 'Metals like iron are generally lustrous (shiny).', difficulty: 'easy' },
              { id: 'sci-6-ch4-q3-cbse', question: 'Which is soluble in water?', options: ['Sugar', 'Sand', 'Stone', 'Wood'], correctAnswer: 0, explanation: 'Sugar dissolves completely in water.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "Why do we group materials?", answer: "To make study and use easier" },
              { question: "What is lustre?", answer: "The shine on materials like metals" }
            ]
          },
          STATE: {
            explanation: "## Materials Around Us (State Board)\n\nThere are many objects around us. All objects are made from materials. Materials are grouped based on their properties such as appearance, hardness, and transparency.",
            mcq: [
              { id: 'sci-6-ch4-q1-state', question: 'Materials are grouped based on?', options: ['Color', 'Properties', 'Size', 'None'], correctAnswer: 1, explanation: 'Properties help in systematic classification.', difficulty: 'easy' },
              { id: 'sci-6-ch4-q2-state', question: 'Stone is?', options: ['Soft', 'Hard', 'Liquid', 'None'], correctAnswer: 1, explanation: 'Stone cannot be easily compressed or scratched.', difficulty: 'easy' },
              { id: 'sci-6-ch4-q3-state', question: 'Glass is?', options: ['Opaque', 'Transparent', 'Translucent', 'None'], correctAnswer: 1, explanation: 'We can see clearly through glass.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What are objects?", answer: "Things around us like table, chair, book" },
              { question: "Why grouping is important?", answer: "To make study and use easier" }
            ],
            extra_questions: [
              { question: "List properties of materials", answer: "Lustre, hardness, solubility, etc." }
            ]
          }
        },
        topics: [
          {
            id: 'T1',
            name: 'Objects Around Us',
            content: {
              CBSE: {
                explanation: "Objects around us have different shapes, colours and uses. All objects are made from materials.",
                mcq: [{ id: 'T4-Q1', question: 'Objects are made from?', options: ['Materials', 'Water', 'Air', 'None'], correctAnswer: 0, explanation: 'Everything is material.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Objects around us have different shapes, colours and uses. All objects are made from materials.",
                mcq: [{ id: 'T4-Q1-S', question: 'Objects are made from?', options: ['Materials', 'Water', 'Air', 'None'], correctAnswer: 0, explanation: 'Everything is material.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T2',
            name: 'Why Do We Group Materials',
            content: {
              CBSE: {
                explanation: "We group materials to make it easier to study and use them.",
                mcq: [{ id: 'T4-Q2', question: 'Why do we group materials?', options: ['For fun', 'For study', 'For confusion', 'None'], correctAnswer: 1, explanation: 'To study easily.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "We group materials to make it easier to study and use them.",
                mcq: [{ id: 'T4-Q2-S', question: 'Why do we group materials?', options: ['For fun', 'For study', 'For confusion', 'None'], correctAnswer: 1, explanation: 'To study easily.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T3',
            name: 'Properties of Materials',
            content: {
              CBSE: {
                explanation: "Materials are grouped based on their properties such as appearance, hardness, solubility, floating and transparency.",
                mcq: [{ id: 'T4-Q3', question: 'Materials are grouped based on?', options: ['Colour', 'Properties', 'Size', 'None'], correctAnswer: 1, explanation: 'Properties for sorting.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Materials are grouped based on their properties such as appearance, hardness, solubility, floating and transparency.",
                mcq: [{ id: 'T4-Q3-S', question: 'Materials are grouped based on?', options: ['Colour', 'Properties', 'Size', 'None'], correctAnswer: 1, explanation: 'Properties for sorting.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T4',
            name: 'Appearance (Lustre)',
            content: {
              CBSE: {
                explanation: "Lustrous materials are shiny (like metals), while others are dull (like wood).",
                mcq: [{ id: 'T4-Q4', question: 'Lustrous means?', options: ['Dull', 'Shiny', 'Soft', 'None'], correctAnswer: 1, explanation: 'Lustre is shine.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Lustrous materials are shiny (like metals), while others are dull (like wood).",
                mcq: [{ id: 'T4-Q4-S', question: 'Lustrous means?', options: ['Dull', 'Shiny', 'Soft', 'None'], correctAnswer: 1, explanation: 'Lustre is shine.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T5',
            name: 'Hardness',
            content: {
              CBSE: {
                explanation: "Hard materials cannot be easily compressed, while soft materials can be easily pressed.",
                mcq: [{ id: 'T4-Q5', question: 'Stone is?', options: ['Soft', 'Hard', 'Liquid', 'None'], correctAnswer: 1, explanation: 'Stone is hard.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Hard materials cannot be easily compressed, while soft materials can be easily pressed.",
                mcq: [{ id: 'T4-Q5-S', question: 'Stone is?', options: ['Soft', 'Hard', 'Liquid', 'None'], correctAnswer: 1, explanation: 'Stone is hard.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T6',
            name: 'Soluble and Insoluble',
            content: {
              CBSE: {
                explanation: "Materials that dissolve in water are soluble, while those that do not are insoluble.",
                mcq: [{ id: 'T4-Q6', question: 'Sugar is?', options: ['Soluble', 'Insoluble', 'Hard', 'None'], correctAnswer: 0, explanation: 'Sugar dissolves.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Materials that dissolve in water are soluble, while those that do not are insoluble.",
                mcq: [{ id: 'T4-Q6-S', question: 'Sugar is?', options: ['Soluble', 'Insoluble', 'Hard', 'None'], correctAnswer: 0, explanation: 'Sugar dissolves.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T7',
            name: 'Floating and Sinking',
            content: {
              CBSE: {
                explanation: "Some materials float on water (like wood) while others sink (like stone).",
                mcq: [{ id: 'T4-Q7', question: 'Wood in water?', options: ['Sink', 'Float', 'Dissolve', 'None'], correctAnswer: 1, explanation: 'Wood floats.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Some materials float on water (like wood) while others sink (like stone).",
                mcq: [{ id: 'T4-Q7-S', question: 'Wood in water?', options: ['Sink', 'Float', 'Dissolve', 'None'], correctAnswer: 1, explanation: 'Wood floats.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T8',
            name: 'Transparency',
            content: {
              CBSE: {
                explanation: "Transparent materials are see-through, translucent are partial, and opaque cannot be seen through.",
                mcq: [{ id: 'T4-Q8', question: 'Glass is?', options: ['Opaque', 'Transparent', 'Translucent', 'None'], correctAnswer: 1, explanation: 'We can see through glass.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Transparent materials are see-through, translucent are partial, and opaque cannot be seen through.",
                mcq: [{ id: 'T4-Q8-S', question: 'Glass is?', options: ['Opaque', 'Transparent', 'Translucent', 'None'], correctAnswer: 1, explanation: 'We can see through glass.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T9',
            name: 'Extra Practice',
            content: {
              CBSE: {
                explanation: "Practice grouping materials based on properties.",
                mcq: [{ id: 'T4-Q9', question: 'Which dissolves in water?', options: ['Salt', 'Sand', 'Stone', 'Wood'], correctAnswer: 0, explanation: 'Salt is soluble.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Review materials and their properties.",
                mcq: [{ id: 'T4-Q9-S', question: 'Which dissolves in water?', options: ['Salt', 'Sand', 'Stone', 'Wood'], correctAnswer: 0, explanation: 'Salt is soluble.', difficulty: 'easy' }]
              }
            }
          }
        ],
        mcqs: []
      },
      {
        id: 'sci-6-ch5',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Separation of Substances',
          STATE: 'Separation Methods'
        },
        description: {
          CBSE: 'Separation of Substances - CBSE focus on basic methods',
          STATE: 'Separation Methods - State Board focus on techniques'
        },
        order: 5,
        content: {
          CBSE: {
            explanation: "## Separation of Substances (CBSE)\n\nWe separate substances to remove unwanted materials, to obtain useful components and to make substances pure. Common methods include handpicking, winnowing, sieving, sedimentation, decantation and filtration.",
            mcq: [
              { id: 'sci-6-ch5-q1-cbse', question: 'Why do we separate substances?', options: ['For fun', 'To remove impurities', 'To waste time', 'None'], correctAnswer: 1, explanation: 'Separation is essential to remove unwanted or harmful materials.', difficulty: 'easy' },
              { id: 'sci-6-ch5-q2-cbse', question: 'Which method uses wind?', options: ['Winnowing', 'Filtration', 'Sieving', 'None'], correctAnswer: 0, explanation: 'Winnowing uses the power of wind to separate lighter husk from heavier grains.', difficulty: 'easy' },
              { id: 'sci-6-ch5-q3-cbse', question: 'Salt is obtained by?', options: ['Evaporation', 'Filtration', 'Sieving', 'None'], correctAnswer: 0, explanation: 'Evaporation is used to separate dissolved solids from liquids.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "Why is separation important?", answer: "To remove unwanted substances and get useful ones" },
              { question: "What is handpicking?", answer: "Separating large impurities by hand" }
            ]
          },
          STATE: {
            explanation: "## Separation Methods (State Board)\n\nWe use various methods like filtration, evaporation, and decantation to separate mixtures into their components. These methods are based on the physical properties of the substances.",
            mcq: [
              { id: 'sci-6-ch5-q1-state', question: 'Tea leaves are separated by?', options: ['Filtration', 'Winnowing', 'Handpicking', 'None'], correctAnswer: 0, explanation: 'Filtration is used to separate solid tea leaves from liquid tea.', difficulty: 'easy' },
              { id: 'sci-6-ch5-q2-state', question: 'Sieving is based on?', options: ['Weight', 'Size', 'Colour', 'None'], correctAnswer: 1, explanation: 'Sieves have holes of a specific size to filter out larger particles.', difficulty: 'easy' },
              { id: 'sci-6-ch5-q3-state', question: 'Water purification uses?', options: ['Sedimentation', 'Decantation', 'Filtration', 'All'], correctAnswer: 3, explanation: 'All these methods are used in complex water treatment.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What is threshing?", answer: "Separating grains from stalks" },
              { question: "Define evaporation", answer: "Liquid turning into vapor by heating" }
            ],
            extra_questions: [
              { question: "Explain winnowing", answer: "Method to separate lighter husk from heavier grains using wind" }
            ]
          }
        },
        topics: [
          {
            id: 'T1',
            name: 'Need for Separation',
            content: {
              CBSE: {
                explanation: "We separate substances to remove unwanted materials, to obtain useful components and to make substances pure.",
                mcq: [{ id: 'T5-Q1', question: 'Why do we separate substances?', options: ['For fun', 'To remove impurities', 'To waste time', 'None'], correctAnswer: 1, explanation: 'To get pure stuff.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "We separate substances to remove unwanted materials, to obtain useful components and to make substances pure.",
                mcq: [{ id: 'T5-Q1-S', question: 'Why do we separate substances?', options: ['For fun', 'To remove impurities', 'To waste time', 'None'], correctAnswer: 1, explanation: 'To get pure stuff.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T2',
            name: 'Handpicking',
            content: {
              CBSE: {
                explanation: "Handpicking is used when impurities are few and large, like removing stones from rice.",
                mcq: [{ id: 'T5-Q2', question: 'Handpicking is used for?', options: ['Small particles', 'Large impurities', 'Liquids', 'None'], correctAnswer: 1, explanation: 'Hand for large bits.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Handpicking is used when impurities are few and large, like removing stones from rice.",
                mcq: [{ id: 'T5-Q2-S', question: 'Handpicking is used for?', options: ['Small particles', 'Large impurities', 'Liquids', 'None'], correctAnswer: 1, explanation: 'Hand for large bits.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T3',
            name: 'Threshing',
            content: {
              CBSE: {
                explanation: "Threshing is the process of separating grains from stalks.",
                mcq: [{ id: 'T5-Q3', question: 'Threshing separates?', options: ['Grain and stalk', 'Water and sand', 'Milk and cream', 'None'], correctAnswer: 0, explanation: 'Threshing for grain.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Threshing is the process of separating grains from stalks.",
                mcq: [{ id: 'T5-Q3-S', question: 'Threshing separates?', options: ['Grain and stalk', 'Water and sand', 'Milk and cream', 'None'], correctAnswer: 0, explanation: 'Threshing for grain.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T4',
            name: 'Winnowing',
            content: {
              CBSE: {
                explanation: "Winnowing is used to separate lighter components like husk from heavier grains using wind.",
                mcq: [{ id: 'T5-Q4', question: 'Winnowing separates?', options: ['Heavy from light', 'Liquid', 'Gas', 'None'], correctAnswer: 0, explanation: 'Wind for light bits.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Winnowing is used to separate lighter components like husk from heavier grains using wind.",
                mcq: [{ id: 'T5-Q4-S', question: 'Winnowing separates?', options: ['Heavy from light', 'Liquid', 'Gas', 'None'], correctAnswer: 0, explanation: 'Wind for light bits.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T5',
            name: 'Sieving',
            content: {
              CBSE: {
                explanation: "Sieving is used to separate particles of different sizes using a sieve.",
                mcq: [{ id: 'T5-Q5', question: 'Sieving is based on?', options: ['Weight', 'Size', 'Colour', 'None'], correctAnswer: 1, explanation: 'Sieve for size.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Sieving is used to separate particles of different sizes using a sieve.",
                mcq: [{ id: 'T5-Q5-S', question: 'Sieving is based on?', options: ['Weight', 'Size', 'Colour', 'None'], correctAnswer: 1, explanation: 'Sieve for size.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T6',
            name: 'Sedimentation and Decantation',
            content: {
              CBSE: {
                explanation: "Heavier particles settle down (sedimentation), then clear liquid is poured off (decantation).",
                mcq: [{ id: 'T5-Q6', question: 'Sedimentation means?', options: ['Mixing', 'Settling down', 'Heating', 'None'], correctAnswer: 1, explanation: 'Settling at bottom.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Heavier particles settle down (sedimentation), then clear liquid is poured off (decantation).",
                mcq: [{ id: 'T5-Q6-S', question: 'Sedimentation means?', options: ['Mixing', 'Settling down', 'Heating', 'None'], correctAnswer: 1, explanation: 'Settling at bottom.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T7',
            name: 'Filtration',
            content: {
              CBSE: {
                explanation: "Filtration separates insoluble solids from liquids using filter paper or cloth.",
                mcq: [{ id: 'T5-Q7', question: 'Filtration separates?', options: ['Solid-liquid', 'Gas', 'Heat', 'None'], correctAnswer: 0, explanation: 'Filter for solids.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Filtration separates insoluble solids from liquids using filter paper or cloth.",
                mcq: [{ id: 'T5-Q7-S', question: 'Filtration separates?', options: ['Solid-liquid', 'Gas', 'Heat', 'None'], correctAnswer: 0, explanation: 'Filter for solids.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T8',
            name: 'Evaporation',
            content: {
              CBSE: {
                explanation: "Evaporation is used to obtain solids from liquids by heating.",
                mcq: [{ id: 'T5-Q8', question: 'Salt is obtained by?', options: ['Evaporation', 'Filtration', 'Sieving', 'None'], correctAnswer: 0, explanation: 'Heat removes water.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Evaporation is used to obtain solids from liquids by heating.",
                mcq: [{ id: 'T5-Q8-S', question: 'Salt is obtained by?', options: ['Evaporation', 'Filtration', 'Sieving', 'None'], correctAnswer: 0, explanation: 'Heat removes water.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T9',
            name: 'Extra Practice',
            content: {
              CBSE: {
                explanation: "Practice more to master separation methods.",
                mcq: [{ id: 'T5-Q9', question: 'Water purification uses?', options: ['Sedimentation', 'Decantation', 'Filtration', 'All'], correctAnswer: 3, explanation: 'All methods help.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Master the methods of separating substances.",
                mcq: [{ id: 'T5-Q9-S', question: 'Water purification uses?', options: ['Sedimentation', 'Decantation', 'Filtration', 'All'], correctAnswer: 3, explanation: 'All methods help.', difficulty: 'easy' }]
              }
            }
          }
        ],
        mcqs: []
      },
      {
        id: 'sci-6-ch6',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Changes Around Us',
          STATE: 'Physical Changes'
        },
        description: {
          CBSE: 'Changes Around Us - CBSE focus on irreversible and reversible changes',
          STATE: 'Physical Changes - State Board focus on types of changes'
        },
        order: 6,
        content: {
          CBSE: {
            explanation: "## Changes Around Us (CBSE)\n\nA change is any alteration in the shape, size, colour, state or position of an object. Some changes can be reversed (like melting ice), while others cannot be reversed (like burning paper).",
            mcq: [
              { id: 'sci-6-ch6-q1-cbse', question: 'Melting ice is?', options: ['Reversible', 'Irreversible', 'Chemical', 'None'], correctAnswer: 0, explanation: 'Ice can be frozen back into water, so it is reversible.', difficulty: 'easy' },
              { id: 'sci-6-ch6-q2-cbse', question: 'Burning paper is?', options: ['Reversible', 'Irreversible', 'Both', 'None'], correctAnswer: 1, explanation: 'Once paper is burnt, it cannot be turned back into paper.', difficulty: 'easy' },
              { id: 'sci-6-ch6-q3-cbse', question: 'Heating causes?', options: ['Expansion', 'Contraction', 'No change', 'None'], correctAnswer: 0, explanation: 'Most materials expand when heated.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What is a reversible change?", answer: "A change that can be undone to get back the original substance" },
              { question: "Give example of fast change", answer: "Burning of matchstick" }
            ]
          },
          STATE: {
            explanation: "## Physical Changes (State Board)\n\nA change is any alteration in an object. Physical changes usually do not form new substances and are often reversible. Chemical changes form new substances and are usually permanent.",
            mcq: [
              { id: 'sci-6-ch6-q1-state', question: 'Physical change example?', options: ['Melting wax', 'Burning paper', 'Cooking', 'None'], correctAnswer: 0, explanation: 'Melting wax does not create a new chemical substance.', difficulty: 'easy' },
              { id: 'sci-6-ch6-q2-state', question: 'Chemical change example?', options: ['Burning paper', 'Melting ice', 'Cutting wood', 'None'], correctAnswer: 0, explanation: 'Burning creates ash and smoke, which are new substances.', difficulty: 'easy' },
              { id: 'sci-6-ch6-q3-state', question: 'Rusting is?', options: ['Fast', 'Slow', 'Both', 'None'], correctAnswer: 1, explanation: 'Rusting takes a long time to happen.', difficulty: 'easy' }
            ],
            short_questions: [
              { question: "What is chemical change?", answer: "Change where new substance is formed" },
              { question: "Expansion occurs due to?", answer: "Heat" }
            ],
            extra_questions: [
              { question: "Is melting of wax reversible?", answer: "Yes" }
            ]
          }
        },
        topics: [
          {
            id: 'T1',
            name: 'What is a Change',
            content: {
              CBSE: {
                explanation: "A change is any alteration in the shape, size, colour, state or position of an object.",
                mcq: [{ id: 'T6-Q1', question: 'Change means?', options: ["No difference", "Difference in object", "Same thing", "None"], correctAnswer: 1, explanation: 'Change = different.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "A change is any alteration in the shape, size, colour, state or position of an object.",
                mcq: [{ id: 'T6-Q1-S', question: 'Change means?', options: ["No difference", "Difference in object", "Same thing", "None"], correctAnswer: 1, explanation: 'Change = different.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T2',
            name: 'Reversible and Irreversible Changes',
            content: {
              CBSE: {
                explanation: "Reversible changes can return to original state, but irreversible changes are permanent.",
                mcq: [{ id: 'T6-Q2', question: 'Melting ice is?', options: ["Reversible", "Irreversible", "Chemical", "None"], correctAnswer: 0, explanation: 'Water to ice again.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Reversible changes can return to original state, but irreversible changes are permanent.",
                mcq: [{ id: 'T6-Q2-S', question: 'Melting ice is?', options: ["Reversible", "Irreversible", "Chemical", "None"], correctAnswer: 0, explanation: 'Water to ice again.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T3',
            name: 'Physical and Chemical Changes',
            content: {
              CBSE: {
                explanation: "In a physical change, no new substance is formed. In a chemical change, a new substance is formed.",
                mcq: [{ id: 'T6-Q3', question: 'Physical change example?', options: ["Melting wax", "Burning paper", "Cooking", "None"], correctAnswer: 0, explanation: 'No new stuff.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "In a physical change, no new substance is formed. In a chemical change, a new substance is formed.",
                mcq: [{ id: 'T6-Q3-S', question: 'Physical change example?', options: ["Melting wax", "Burning paper", "Cooking", "None"], correctAnswer: 0, explanation: 'No new stuff.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T4',
            name: 'Changes Caused by Heating and Cooling',
            content: {
              CBSE: {
                explanation: "Heat can bring changes like melting and expansion. Cooling can cause contraction and freezing.",
                mcq: [{ id: 'T6-Q4', question: 'Ice becomes water by?', options: ["Cooling", "Heating", "Mixing", "None"], correctAnswer: 1, explanation: 'Heat melts ice.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Heat can bring changes like melting and expansion. Cooling can cause contraction and freezing.",
                mcq: [{ id: 'T6-Q4-S', question: 'Ice becomes water by?', options: ["Cooling", "Heating", "Mixing", "None"], correctAnswer: 1, explanation: 'Heat melts ice.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T5',
            name: 'Changes Caused by Force',
            content: {
              CBSE: {
                explanation: "Force (push or pull) can change the shape, size or motion of objects.",
                mcq: [{ id: 'T6-Q5', question: 'Force means?', options: ["Push or pull", "Heat", "Light", "None"], correctAnswer: 0, explanation: 'Force = push/pull.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Force (push or pull) can change the shape, size or motion of objects.",
                mcq: [{ id: 'T6-Q5-S', question: 'Force means?', options: ["Push or pull", "Heat", "Light", "None"], correctAnswer: 0, explanation: 'Force = push/pull.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T6',
            name: 'Expansion and Contraction',
            content: {
              CBSE: {
                explanation: "Materials expand when heated and contract when cooled.",
                mcq: [{ id: 'T6-Q6', question: 'Heating causes?', options: ["Expansion", "Contraction", "No change", "None"], correctAnswer: 0, explanation: 'Heat makes bigger.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Materials expand when heated and contract when cooled.",
                mcq: [{ id: 'T6-Q6-S', question: 'Heating causes?', options: ["Expansion", "Contraction", "No change", "None"], correctAnswer: 0, explanation: 'Heat makes bigger.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T7',
            name: 'Slow and Fast Changes',
            content: {
              CBSE: {
                explanation: "Slow changes take time (like rusting), while fast changes happen quickly (like burning).",
                mcq: [{ id: 'T6-Q7', question: 'Rusting is?', options: ["Fast", "Slow", "Both", "None"], correctAnswer: 1, explanation: 'Takes days/months.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Slow changes take time (like rusting), while fast changes happen quickly (like burning).",
                mcq: [{ id: 'T6-Q7-S', question: 'Rusting is?', options: ["Fast", "Slow", "Both", "None"], correctAnswer: 1, explanation: 'Takes days/months.', difficulty: 'easy' }]
              }
            }
          },
          {
            id: 'T8',
            name: 'Extra Practice',
            content: {
              CBSE: {
                explanation: "Practice more to master the concepts of changes around us.",
                mcq: [{ id: 'T6-Q8', question: 'Which is reversible?', options: ["Melting wax", "Burning paper", "Cooking food", "None"], correctAnswer: 0, explanation: 'Wax can freeze.', difficulty: 'easy' }]
              },
              STATE: {
                explanation: "Master the physical and chemical changes topics.",
                mcq: [{ id: 'T6-Q8-S', question: 'Which is reversible?', options: ["Melting wax", "Burning paper", "Cooking food", "None"], correctAnswer: 0, explanation: 'Wax can freeze.', difficulty: 'easy' }]
              }
            }
          }
        ],
        mcqs: []
      },
      {
        id: 'sci-6-ch7',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Getting to Know Plants',
          STATE: 'Plants and Environment'
        },
        description: {
          CBSE: 'Structure and functions of plant parts',
          STATE: 'Plants and their surroundings'
        },
        order: 7,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch8',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Body Movements',
          STATE: 'Human Body Movement'
        },
        description: {
          CBSE: 'How humans and animals move',
          STATE: 'Body structure and movement'
        },
        order: 8,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch9',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Living Organisms and Their Surroundings',
          STATE: 'Living Things and Habitat'
        },
        description: {
          CBSE: 'Habitats and adaptations',
          STATE: 'Living world and its variety'
        },
        order: 9,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch10',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Motion and Measurement of Distances',
          STATE: 'Measurement and Motion'
        },
        description: {
          CBSE: 'History of transport and measurement units',
          STATE: 'Motion and types of motion'
        },
        order: 10,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch11',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Light, Shadows and Reflections',
          STATE: 'Light and Shadow'
        },
        description: {
          CBSE: 'Properties of light and shadow formation',
          STATE: 'Light and transparency'
        },
        order: 11,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch12',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Electricity and Circuits',
          STATE: 'Basic Electricity'
        },
        description: {
          CBSE: 'Electric cells, bulbs, and circuits',
          STATE: 'Electricity in daily life'
        },
        order: 12,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch13',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Fun with Magnets',
          STATE: 'Magnetism'
        },
        description: {
          CBSE: 'Discovery and properties of magnets',
          STATE: 'Introduction to magnetism'
        },
        order: 13,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch14',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Water',
          STATE: 'Water Resources'
        },
        description: {
          CBSE: 'Importance of water and water cycle',
          STATE: 'Water as a natural resource'
        },
        order: 14,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch15',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Air Around Us',
          STATE: 'Air and Atmosphere'
        },
        description: {
          CBSE: 'Composition and importance of air',
          STATE: 'Air and its properties'
        },
        order: 15,
        content: '',
        mcqs: [],
        topics: []
      },
      {
        id: 'sci-6-ch16',
        subjectId: 'sci-6',
        name: {
          CBSE: 'Garbage In Garbage Out',
          STATE: 'Waste Management'
        },
        description: {
          CBSE: 'Waste disposal and recycling',
          STATE: 'Keeping our surroundings clean'
        },
        order: 16,
        content: '',
        mcqs: [],
        topics: []
      }
    ]
  },
  {
    id: 'math-6',
    name: 'Mathematics',
    description: 'Master Class 6 Mathematics with interactive solutions',
    icon: '🔢',
    color: 'bg-blue-500',
    grade: 6,
    boards_supported: ['CBSE', 'STATE'],
    chapters: [
      { id: 'math-6-ch1', subjectId: 'math-6', name: 'Knowing Our Numbers', description: '', order: 1, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch2', subjectId: 'math-6', name: 'Whole Numbers', description: '', order: 2, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch3', subjectId: 'math-6', name: 'Playing with Numbers', description: '', order: 3, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch4', subjectId: 'math-6', name: 'Basic Geometry', description: '', order: 4, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch5', subjectId: 'math-6', name: 'Shapes', description: '', order: 5, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch6', subjectId: 'math-6', name: 'Integers', description: '', order: 6, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch7', subjectId: 'math-6', name: 'Fractions', description: '', order: 7, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch8', subjectId: 'math-6', name: 'Decimals', description: '', order: 8, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch9', subjectId: 'math-6', name: 'Data Handling', description: '', order: 9, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch10', subjectId: 'math-6', name: 'Mensuration', description: '', order: 10, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch11', subjectId: 'math-6', name: 'Algebra', description: '', order: 11, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch12', subjectId: 'math-6', name: 'Ratio and Proportion', description: '', order: 12, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch13', subjectId: 'math-6', name: 'Symmetry', description: '', order: 13, content: '', mcqs: [], topics: [] },
      { id: 'math-6-ch14', subjectId: 'math-6', name: 'Practical Geometry', description: '', order: 14, content: '', mcqs: [], topics: [] }
    ]
  },
  {
    id: 'eng-6',
    name: 'English',
    description: 'Literature, Grammar, Reading and Writing for Class 6',
    icon: '📖',
    color: 'bg-purple-500',
    grade: 6,
    boards_supported: ['CBSE', 'STATE'],
    chapters: [
      { id: 'eng-6-mod1', subjectId: 'eng-6', name: 'Grammar', description: '', order: 1, content: '', mcqs: [], topics: [] },
      { id: 'eng-6-mod2', subjectId: 'eng-6', name: 'Reading', description: '', order: 2, content: '', mcqs: [], topics: [] },
      { id: 'eng-6-mod3', subjectId: 'eng-6', name: 'Writing', description: '', order: 3, content: '', mcqs: [], topics: [] },
      { id: 'eng-6-mod4', subjectId: 'eng-6', name: 'Literature', description: '', order: 4, content: '', mcqs: [], topics: [] }
    ]
  }
];
