import { Instagram, Facebook, Youtube, Music, Home } from 'lucide-react';
import { ProfileData, SocialLink } from './types';
import React from 'react';

export const MUSIC_PLAYLIST_URL = "https://cloudreve.barian.moe/f/jddcb/music.txt";

export const PROFILE_DATA: ProfileData = {
  displayName: "༺❀幽༒幽❀༻",
  quote: "\"與其追風去,不如等風來\"",
  avatarUrl: "http://cloudreve.barian.moe/f/44ir/avator.jpg",
  
  // Darker, moody cherry blossom background to match the "Sakura GIF" vibe
  backgroundUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=2076&auto=format&fit=crop",
  backgroundType: 'image', // Set to 'video' if you want to use an MP4 file
  
  popupMessage: {
    title: "歡迎",
    text: "歡迎來到幽影櫻的自介版\n\n本網站供由幽影櫻製作。"
  },

  about: {
    name: "幽影桜",
    nicknames: "小幽、幽幽",
    age: "18 大學",
    location: "台北、新北、彰化",
    dislikes: "不禮貌 其他都還好",
    habits: [
      "常態關通知",
      "顏文字",
      "貼圖",
      "概率放置",
      "忘記回",
      "已讀忘了",
      "還有可能一些說話習慣之類的"
    ]
  },

  activity: {
    socialPriority: "messenger > FB > DC",
    hours: [
      "週一到週五 早上8.~ 凌晨2.",
      "假日 早上12.~ 凌晨2.、3."
    ],
    note: "通常我在線都會回 沒回的話可以多傳幾遍 可能是忘了"
  },

  games: [
    {
      title: "-深坑-",
      items: [
        "Apex",
        { name: "原神", description: "主推: 少女、神里綾華" },
        { name: "遊戲王duel link", description: "主推: 星杯神子夏娃" },
        { name: "世界計畫（日）", description: "主推: 宵崎奏" }
      ]
    },
    {
      title: "-淺坑-",
      items: [
        { name: "鳴潮", description: "主推: 椿" },
        { name: "崩壞3rd", description: "主推: 希兒" },
        { name: "崩壞:星穹鐵道", description: "主推: 遐蝶" },
        "遊戲王master duel"
      ]
    },
    {
      title: "-雲玩家-",
      items: ["荒野行動", "Phirgos", "Cytus ii", "光遇"]
    }
  ],

  anime: [
    {
      title: "-深坑-",
      items: [
        { name: "從零開始的異世界生活 123季", description: "推> 愛蜜莉雅" },
        { name: "刀劍神域 123季", description: "推> 愛麗絲" },
        { name: "約會大作戰 12345", description: "推> 時崎狂三" }
      ]
    },
    {
      title: "-淺坑-",
      items: [
        "東京復仇者 123季",
        "咒術迴戰 12季",
        "百武裝戰記",
        "鬼滅之刃 1234季",
        "地下城尋求邂逅 12345季",
        "莉可麗絲",
        "間諜家家酒 1季",
        "鏈鋸人",
        "地獄樂",
        "遊戲王系列 {Gx上半, Zexal, ARC-V, Vrains}",
        "未來日記",
        "終結的熾天使",
        "DARLING in the FRANXX"
      ]
    }
  ],

  music: [
    {
      title: "壞女孩",
      artist: "徐良/小淩",
      url: "https://cloudreve.barian.moe/f/5LFj/%E5%A3%9E%E5%A5%B3%E5%AD%A9.mp3"
    },
    {
      title: "咬舌釘",
      artist: "魚骨妹", 
      url: "https://cloudreve.barian.moe/f/2dvUQ/%E5%92%AC%E8%88%8C%E9%92%89.mp3"
    },    
    {
      title: "愛哎唉",
      artist: "魚骨妹",
      url: "https://cloudreve.barian.moe/f/BdDfl/%E7%88%B1%E5%93%8E%E5%94%89.mp3"
    },
    {
      title: "怎麼辦 我還是愛你",
      artist: "魚骨妹",
      url: "https://cloudreve.barian.moe/f/mg4hB/%E6%80%8E%E9%BA%BC%E8%BE%A6%20%E6%88%91%E9%82%84%E6%98%AF%E6%84%9B%E4%BD%A0.mp3"
    },
  ]
};

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "Instagram", url: "https://www.instagram.com/barian_yyy/", icon: Instagram, color: "hover:text-pink-500" },
  { platform: "Facebook", url: "https://www.facebook.com/barian0517/", icon: Facebook, color: "hover:text-blue-500" },
  { platform: "YouTube", url: "https://www.youtube.com/@barian0517", icon: Youtube, color: "hover:text-red-500" },
  { platform: "Home", url: "https://home.barian.moe", icon: Home, color: "hover:text-cyan-400" },
];

// Placeholder images to use between sections
export const SECTION_IMAGES = [
  "https://cloudreve.barian.moe/f/QDI2/Kanade.jpg", // 0: Kanade (User provided)
  "https://cloudreve.barian.moe/f/1LSd/seele.jpg", // 1: Seele (User provided)
  "https://cloudreve.barian.moe/f/pbCb/YGO.jpg", // 2: YGO (User provided)
  "https://cloudreve.barian.moe/f/Natz/ayaka.jpg", // 3: Ayaka (User provided)
  "https://cloudreve.barian.moe/f/AJsq/emilia.jpg", // 4: Emilia (User provided)
  "https://cloudreve.barian.moe/f/3XTj/Kurumi.jpg", // 5: Kurumi (User provided)
];