// 导入所有表情图片
import moodOverjoyed from '@/assets/Solid mood overjoyed.svg'
import moodHappy from '@/assets/Solid mood happy.svg'
import moodNeutral from '@/assets/Solid mood neutral.svg'
import moodSad from '@/assets/Solid mood sad.svg'
import moodDepressed from '@/assets/Solid mood depressed.svg'
import moodKule from '@/assets/kule.svg'

// 导出表情图片映射
export const MOOD_IMAGES = {
  OVERJOYED: moodOverjoyed,
  HAPPY: moodHappy,
  NEUTRAL: moodNeutral,
  SAD: moodSad,
  DEPRESSED: moodDepressed,
  KULE: moodKule
}

// 导出心情类型常量
export const MOOD_TYPES = {
  OVERJOYED: 'OVERJOYED',
  HAPPY: 'HAPPY',
  NEUTRAL: 'NEUTRAL',
  SAD: 'SAD',
  DEPRESSED: 'DEPRESSED',
  KULE: 'KULE'
}

// 心情配置列表
export const MOOD_CONFIG = [
  { 
    id: 1, 
    type: MOOD_TYPES.OVERJOYED,
    mood: '快乐', 
    img: MOOD_IMAGES.OVERJOYED 
  },
  { 
    id: 2, 
    type: MOOD_TYPES.HAPPY,
    mood: '开心', 
    img: MOOD_IMAGES.HAPPY 
  },
  { 
    id: 3, 
    type: MOOD_TYPES.NEUTRAL,
    mood: '平静', 
    img: MOOD_IMAGES.NEUTRAL 
  },
  { 
    id: 4, 
    type: MOOD_TYPES.SAD,
    mood: '伤心', 
    img: MOOD_IMAGES.SAD 
  },
  { 
    id: 5, 
    type: MOOD_TYPES.DEPRESSED,
    mood: '抑郁', 
    img: MOOD_IMAGES.DEPRESSED 
  },
  { 
    id: 6, 
    type: MOOD_TYPES.KULE,
    mood: '委屈', 
    img: MOOD_IMAGES.KULE 
  }
] 