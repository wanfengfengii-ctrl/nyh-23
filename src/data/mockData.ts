import type { Cylinder } from '../types';

export const mockCylinders: Cylinder[] = [
  {
    id: 'CYL-001',
    title: '贝多芬第五交响曲',
    year: 1905,
    materialStatus: '轻微磨损',
    storageLocation: 'A区-01-023',
    transcriptionProgress: 100,
    noiseLevel: '中',
    currentStatus: '已归档',
    repairSuggestion: '',
    createdAt: '2024-01-15',
    cracks: [
      {
        id: 'CRK-001',
        cylinderId: 'CYL-001',
        severity: '轻微',
        location: '底部边缘',
        description: '细小裂纹，不影响播放',
        discoveredAt: '2024-02-10'
      }
    ]
  },
  {
    id: 'CYL-002',
    title: '莫扎特钢琴协奏曲',
    year: 1910,
    materialStatus: '完好',
    storageLocation: 'A区-02-015',
    transcriptionProgress: 75,
    noiseLevel: '低',
    currentStatus: '转录中',
    repairSuggestion: '',
    createdAt: '2024-01-20',
    cracks: []
  },
  {
    id: 'CYL-003',
    title: '传统民间音乐合集',
    year: 1898,
    materialStatus: '严重磨损',
    storageLocation: 'B区-03-008',
    transcriptionProgress: 0,
    noiseLevel: '严重',
    currentStatus: '待修复',
    repairSuggestion: '建议先进行表面清洁和物理修复，再尝试转录；使用降噪软件进行后期处理',
    createdAt: '2024-02-01',
    cracks: [
      {
        id: 'CRK-002',
        cylinderId: 'CYL-003',
        severity: '严重',
        location: '中部螺旋纹',
        description: '长约2cm的纵向裂纹，影响录音轨道',
        discoveredAt: '2024-02-15'
      },
      {
        id: 'CRK-003',
        cylinderId: 'CYL-003',
        severity: '中等',
        location: '顶部',
        description: '边缘裂纹，不影响录音区域',
        discoveredAt: '2024-02-15'
      }
    ]
  },
  {
    id: 'CYL-004',
    title: '早期爵士乐录音',
    year: 1915,
    materialStatus: '轻微磨损',
    storageLocation: 'A区-01-045',
    transcriptionProgress: 50,
    noiseLevel: '高',
    currentStatus: '转录中',
    repairSuggestion: '建议使用专业降噪插件，保留原始音质前提下降低底噪',
    createdAt: '2024-02-10',
    cracks: []
  },
  {
    id: 'CYL-005',
    title: '歌剧选段 - 茶花女',
    year: 1902,
    materialStatus: '完好',
    storageLocation: 'C区-02-012',
    transcriptionProgress: 100,
    noiseLevel: '低',
    currentStatus: '已完成',
    repairSuggestion: '',
    createdAt: '2024-01-05',
    cracks: []
  },
  {
    id: 'CYL-006',
    title: '演讲录音 - 历史名人',
    year: 1920,
    materialStatus: '轻微磨损',
    storageLocation: 'B区-01-033',
    transcriptionProgress: 30,
    noiseLevel: '中',
    currentStatus: '转录中',
    repairSuggestion: '',
    createdAt: '2024-03-01',
    cracks: [
      {
        id: 'CRK-004',
        cylinderId: 'CYL-006',
        severity: '严重',
        location: '底部端面',
        description: '放射状裂纹，需谨慎处理',
        discoveredAt: '2024-03-10'
      }
    ]
  },
  {
    id: 'CYL-007',
    title: '民族器乐独奏',
    year: 1908,
    materialStatus: '破损',
    storageLocation: 'D区-01-002',
    transcriptionProgress: 0,
    noiseLevel: '高',
    currentStatus: '待修复',
    repairSuggestion: '蜡筒有缺损，需先进行物理修复评估；高噪声需要专业修复处理',
    createdAt: '2024-03-15',
    cracks: [
      {
        id: 'CRK-005',
        cylinderId: 'CYL-007',
        severity: '严重',
        location: '侧面大面积',
        description: '多处裂纹伴随材质剥落，破损严重',
        discoveredAt: '2024-03-15'
      }
    ]
  },
  {
    id: 'CYL-008',
    title: '儿童歌谣合集',
    year: 1925,
    materialStatus: '完好',
    storageLocation: 'C区-03-028',
    transcriptionProgress: 100,
    noiseLevel: '低',
    currentStatus: '已归档',
    repairSuggestion: '',
    createdAt: '2024-02-20',
    cracks: []
  },
  {
    id: 'CYL-009',
    title: '军乐进行曲',
    year: 1912,
    materialStatus: '严重磨损',
    storageLocation: 'B区-02-019',
    transcriptionProgress: 0,
    noiseLevel: '高',
    currentStatus: '待转录',
    repairSuggestion: '',
    createdAt: '2024-04-01',
    cracks: []
  },
  {
    id: 'CYL-010',
    title: '古典吉他演奏',
    year: 1918,
    materialStatus: '轻微磨损',
    storageLocation: 'A区-03-007',
    transcriptionProgress: 60,
    noiseLevel: '中',
    currentStatus: '转录中',
    repairSuggestion: '',
    createdAt: '2024-03-20',
    cracks: [
      {
        id: 'CRK-006',
        cylinderId: 'CYL-010',
        severity: '轻微',
        location: '顶部边缘',
        description: '细小发丝纹，无影响',
        discoveredAt: '2024-04-05'
      }
    ]
  },
  {
    id: 'CYL-011',
    title: '地方戏曲选段',
    year: 1900,
    materialStatus: '严重磨损',
    storageLocation: 'D区-02-014',
    transcriptionProgress: 15,
    noiseLevel: '严重',
    currentStatus: '待修复',
    repairSuggestion: '年代久远，磨损严重；建议采用激光扫描方式进行数字化采集',
    createdAt: '2024-01-25',
    cracks: [
      {
        id: 'CRK-007',
        cylinderId: 'CYL-011',
        severity: '中等',
        location: '中部',
        description: '环向裂纹，约占周长1/3',
        discoveredAt: '2024-02-01'
      }
    ]
  },
  {
    id: 'CYL-012',
    title: '男声独唱艺术歌曲',
    year: 1922,
    materialStatus: '完好',
    storageLocation: 'C区-01-005',
    transcriptionProgress: 100,
    noiseLevel: '低',
    currentStatus: '已完成',
    repairSuggestion: '',
    createdAt: '2024-02-28',
    cracks: []
  }
];
