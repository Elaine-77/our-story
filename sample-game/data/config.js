/**
 * Game Configuration — Personalization & Fragment Registry
 */
export const gameConfig = {
  // Personalization
  partner: {
    nickname: '亲爱的',
    birthday: ''
  },
  child: {
    nickname: '小家伙',
    parentTitle: '爸爸'
  },
  memories: {
    chapter1: {
      oldCompanyName: 'CAINIAO 菜鸟',
      newCompanyName: 'DJI 大疆天空之城',
      commuteDistance: '100',
      lunchPillow: '抱枕和毯子'
    },
    chapter2: {
      bedtimeStoryOptions: ['小红和小黑', '鼹鼠的故事', '波西和皮普'],
      childQuote: '再玩一会儿嘛！',
      hideAndSeekSpot: '窗帘后面'
    },
    chapter3: {
      ridingRoute: '海鸥岛',
      vehicles: '滑板车 + 自行车',
      childSeat: '前座',
      childDrink: '水'
    },
    chapter4: {
      restaurantName: '',
      finalMessage: '生日快乐，谢谢你一直在我身边。\n未来的每一天，都想和你一起走下去。'
    }
  },

  // All collectible fragment IDs
  allFragmentIds: [
    // Chapter 1
    'ch1-asset-list',
    'ch1-breakfast',
    // Chapter 2
    'ch2-first-shoes',
    // Chapter 3
    'ch3-convenience-store',
    'ch3-daisy-field',
    // Chapter 4
    'ch4-letter-clue'
  ],

  // Chapter metadata
  chapters: [
    {
      id: 'chapter1',
      title: '第一章',
      subtitle: '新的开始',
      stampText: '启程',
      accent: '#D4A556',
      bgm: 'ch1-bgm'
    },
    {
      id: 'chapter2',
      title: '第二章',
      subtitle: '小小的你',
      stampText: '守护',
      accent: '#E8C55A',
      bgm: 'ch2-bgm'
    },
    {
      id: 'chapter3',
      title: '第三章',
      subtitle: '追风的路',
      stampText: '同行',
      accent: '#5B9A8B',
      bgm: 'ch3-bgm'
    },
    {
      id: 'chapter4',
      title: '第四章',
      subtitle: '此刻的你',
      stampText: '珍惜',
      accent: '#B76E79',
      bgm: 'ch4-bgm'
    }
  ]
};
