/**
 * Chapter 1 Data: 新的开始 (工作篇)
 * CAINIAO farewell → 100km drive → DJI arrival → pillow & blanket
 */
export const chapterData = {
  scenes: [
    // --- Scene 1: 告别菜鸟 (IT归还 + 欢送会) ---
    {
      background: {
        image: 'ch1-s1-farewell.webp',
        gradient: 'linear-gradient(to bottom, rgba(61,42,26,0.45) 0%, rgba(42,26,18,0.5) 50%, rgba(26,15,10,0.6) 100%)',
        atmosphere: 'warm'
      },
      particles: 'dust',
      hotspots: [
        {
          id: 'ch1-computer',
          type: 'dialog',
          label: '电脑',
          bounds: { x: 20, y: 35, width: 18, height: 15 },
          dialogNodes: [
            { type: 'narrator', text: '最后一次合上笔记本电脑的盖子。', speed: 55 },
            { type: 'narrator', text: '这台电脑陪了我四年，键盘上有些字母已经磨得看不清了。', speed: 50 }
          ],
          required: true,
          delay: 0.3
        },
        {
          id: 'ch1-badge',
          type: 'dialog',
          label: '工牌',
          bounds: { x: 55, y: 30, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '从脖子上摘下工牌，放在柜台上。', speed: 55 },
            { type: 'narrator', text: '照片里的自己看起来好年轻，那时候刚来，什么都不懂。', speed: 50 }
          ],
          required: true,
          delay: 0.5
        },
        {
          id: 'ch1-asset-list',
          type: 'fragment',
          label: '资产清单',
          fragmentId: 'ch1-asset-list',
          bounds: { x: 70, y: 45, width: 12, height: 10 },
          dialogNodes: [
            { type: 'narrator', text: '每一项打勾的时候，像在和一段时光逐条告别。', speed: 50 }
          ],
          hidden: true,
          delay: 0.7
        }
      ],
      introDialog: [
        { type: 'narrator', text: 'CAINIAO 菜鸟，IT 部门的柜台前。', speed: 55 },
        { type: 'narrator', text: '归还设备，交出工牌。四年的光阴，浓缩成一张资产清单。', speed: 50 }
      ]
    },

    // --- Scene 1b: 欢送会 ---
    {
      background: {
        image: 'ch1-s2-party.webp',
        gradient: 'linear-gradient(to bottom, rgba(61,42,26,0.45) 0%, rgba(42,26,18,0.5) 60%, rgba(26,15,10,0.6) 100%)',
        atmosphere: 'warm'
      },
      hotspots: [
        {
          id: 'ch1-cake',
          type: 'dialog',
          label: '蛋糕',
          bounds: { x: 30, y: 40, width: 20, height: 15 },
          dialogNodes: [
            { type: 'narrator', text: '大家抢着要角上那块奶油最多的，和平时开会抢零食一样。', speed: 50 }
          ],
          required: true,
          delay: 0.2
        },
        {
          id: 'ch1-photo',
          type: 'dialog',
          label: '合照',
          bounds: { x: 55, y: 25, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '笑得最大声的人，其实眼睛有点湿。', speed: 55 }
          ],
          delay: 0.4
        },
        {
          id: 'ch1-cards',
          type: 'dialog',
          label: '留言卡',
          bounds: { x: 15, y: 55, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '"下次骑行叫上我啊" / "以后谁帮我修 bug" / "去了大疆记得给我们打折"', speed: 45 }
          ],
          delay: 0.6
        }
      ],
      introDialog: [
        { type: 'narrator', text: '茶歇区，同事们围在一起。蛋糕上写着"一路顺风"。', speed: 50 }
      ],
      dialog: [
        { type: 'silence', duration: 1000 },
        { type: 'choice', id: 'farewell', chapter: 'chapter1', options: [
          { text: '和大家挥挥手' },
          { text: '再多看一眼这些人' }
        ]},
        { type: 'silence', duration: 1500 },
        { type: 'narrator', text: '走向电梯，经过熟悉的走廊。', speed: 55 },
        { type: 'narrator', text: '转身回望——工位、白板上还没擦的字、窗外的城市天际线。', speed: 50 },
        { type: 'narrator', text: '四年。从什么都不会，到可以独当一面。', speed: 55 },
        { type: 'narrator', text: '谢谢你，菜鸟。', speed: 70 },
        { type: 'silence', duration: 4000 }
      ]
    },

    // --- Scene 2: 一百公里 ---
    {
      background: {
        image: 'ch1-s3-highway.webp',
        gradient: 'linear-gradient(to right, rgba(42,58,74,0.4) 0%, rgba(74,90,106,0.35) 40%, rgba(106,122,90,0.35) 70%, rgba(138,154,106,0.4) 100%)',
        atmosphere: 'cool'
      },
      particles: 'dust',
      hotspots: [
        {
          id: 'ch1-tollgate',
          type: 'dialog',
          label: '收费站',
          bounds: { x: 15, y: 30, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '离开一座城市，原来只需要一张通行卡的距离。', speed: 50 }
          ],
          required: true,
          delay: 0.3
        },
        {
          id: 'ch1-gas-station',
          type: 'dialog',
          label: '加油站',
          bounds: { x: 45, y: 35, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '加满油，给手机充上电。导航说还有60公里。', speed: 50 },
            { type: 'narrator', text: '前面的路，还没走过。', speed: 55 }
          ],
          delay: 0.5
        },
        {
          id: 'ch1-breakfast',
          type: 'fragment',
          label: '早餐',
          fragmentId: 'ch1-breakfast',
          bounds: { x: 70, y: 40, width: 12, height: 10 },
          dialogNodes: [
            { type: 'narrator', text: '出发太早没吃早饭，你前一晚悄悄在车里放了面包和牛奶。', speed: 50 }
          ],
          hidden: true,
          delay: 0.7
        }
      ],
      introDialog: [
        { type: 'narrator', text: '清晨。一辆车驶出城市。', speed: 60 },
        { type: 'narrator', text: '里程计数器从0开始跳动……', speed: 55 },
        { type: 'silence', duration: 2000 }
      ]
    },

    // --- Scene 2b: 抵达大疆 ---
    {
      background: {
        image: 'ch1-s4-arrival.webp',
        gradient: 'linear-gradient(to bottom, rgba(74,106,138,0.4) 0%, rgba(106,138,170,0.35) 40%, rgba(90,122,154,0.4) 100%)',
        atmosphere: 'cool'
      },
      hotspots: [
        {
          id: 'ch1-building',
          type: 'dialog',
          label: '建筑',
          bounds: { x: 25, y: 15, width: 50, height: 30 },
          dialogNodes: [
            { type: 'narrator', text: '比想象中还要大。', speed: 60 }
          ],
          delay: 0.3
        },
        {
          id: 'ch1-entrance',
          type: 'dialog',
          label: '大门',
          bounds: { x: 35, y: 55, width: 30, height: 15 },
          dialogNodes: [
            { type: 'narrator', text: '深呼吸。新的冒险，开始了。', speed: 55 }
          ],
          required: true,
          delay: 0.5
        }
      ],
      introDialog: [
        { type: 'narrator', text: '100 公里。从菜鸟到天空之城。', speed: 60 },
        { type: 'narrator', text: 'DJI 大疆天空之城。传说中的地方，终于站在了面前。', speed: 50 }
      ]
    },

    // --- Scene 3 & 4: 新工位 + 午休的温度 ---
    {
      background: {
        image: 'ch1-s5-desk.webp',
        gradient: 'linear-gradient(to bottom, rgba(232,224,208,0.35) 0%, rgba(212,203,184,0.4) 50%, rgba(200,191,168,0.45) 100%)',
        atmosphere: 'warm'
      },
      hotspots: [
        {
          id: 'ch1-mug',
          type: 'dialog',
          label: '马克杯',
          bounds: { x: 60, y: 45, width: 12, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '这个杯子跟了我四年，到哪儿都带着。', speed: 50 }
          ],
          delay: 0.2
        },
        {
          id: 'ch1-family-photo',
          type: 'dialog',
          label: '照片',
          bounds: { x: 30, y: 35, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '家里那两张笑脸，看一眼就不紧张了。', speed: 50 }
          ],
          delay: 0.4
        },
        {
          id: 'ch1-bag',
          type: 'dialog',
          label: '收纳袋',
          bounds: { x: 45, y: 55, width: 15, height: 12 },
          dialogNodes: [
            { type: 'narrator', text: '一个鼓鼓囊囊的收纳袋，拉开拉链……', speed: 50 }
          ],
          required: true,
          delay: 0.6
        }
      ],
      introDialog: [
        { type: 'narrator', text: '崭新的工位。显示器还没开机，桌面空空的。', speed: 55 },
        { type: 'narrator', text: '从背包里取出随身物品，一件件摆好。', speed: 50 }
      ],
      dialog: [
        { type: 'silence', duration: 1500 },
        { type: 'narrator', text: '打开收纳袋才发现——你偷偷塞了抱枕和毯子进来。', speed: 50 },
        { type: 'silence', duration: 2000 },
        { type: 'narrator', text: '中午躺在椅子上午休的时候，', speed: 55 },
        { type: 'narrator', text: '抱着它们，有了一点家的感觉。', speed: 60 },
        { type: 'silence', duration: 5000 }
      ]
    }
  ]
};

export default chapterData;
