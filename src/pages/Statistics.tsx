import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveRadar } from '@nivo/radar';
import StatCard from '../components/StatCard';
import { useCylinderStore } from '../store/useCylinderStore';
import { useRepairStore } from '../store/useRepairStore';
import { hasSevereCrack } from '../utils/validators';
import AlbumIcon from '@mui/icons-material/Album';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ErrorIcon from '@mui/icons-material/Error';

const COLORS = ['#5D4037', '#8D6E63', '#B8860B', '#DAA520', '#A1887F'];

const StatisticsPage: React.FC = () => {
  const { cylinders } = useCylinderStore();
  const { repairTasks } = useRepairStore();

  const stats = useMemo(() => {
    const total = cylinders.length;
    const archived = cylinders.filter((c) => c.currentStatus === '已归档').length;
    const completed = cylinders.filter(
      (c) => c.currentStatus === '已完成' || c.currentStatus === '已归档'
    ).length;
    const toRepair = cylinders.filter((c) => c.currentStatus === '待修复').length;
    const severeCracks = cylinders.filter(hasSevereCrack).length;
    const avgProgress =
      total > 0
        ? Math.round(
            cylinders.reduce((sum, c) => sum + c.transcriptionProgress, 0) / total
          )
        : 0;

    return { total, archived, completed, toRepair, severeCracks, avgProgress };
  }, [cylinders]);

  const repairStats = useMemo(() => {
    const total = repairTasks.length;
    const pendingAssign = repairTasks.filter((t) => t.status === '待指派').length;
    const inProgress = repairTasks.filter((t) => t.status === '修复中').length;
    const pendingQC = repairTasks.filter((t) => t.status === '待质检').length;
    const qcPassed = repairTasks.filter(
      (t) => t.status === '质检通过' || t.status === '已完成'
    ).length;
    const qcFailed = repairTasks.filter((t) => t.status === '质检未通过').length;
    const completionRate = total > 0 ? Math.round((qcPassed / total) * 100) : 0;
    const qcTotal = qcPassed + qcFailed;
    const qcPassRate = qcTotal > 0 ? Math.round((qcPassed / qcTotal) * 100) : 0;
    const avgRework =
      total > 0
        ? (
            repairTasks.reduce((sum, t) => sum + t.reworkCount, 0) / total
          ).toFixed(1)
        : '0';

    return {
      total,
      pendingAssign,
      inProgress,
      pendingQC,
      qcPassed,
      qcFailed,
      completionRate,
      qcPassRate,
      avgRework,
    };
  }, [repairTasks]);

  const repairStatusDistribution = useMemo(() => {
    const statuses = ['待指派', '修复中', '待质检', '质检通过', '质检未通过', '已完成'];
    return statuses.map((status) => ({
      status,
      数量: repairTasks.filter((t) => t.status === status).length,
    }));
  }, [repairTasks]);

  const problemTypeDistribution = useMemo(() => {
    const typeMap: Record<string, number> = {};
    repairTasks.forEach((task) => {
      task.problemTypes.forEach((type) => {
        typeMap[type] = (typeMap[type] || 0) + 1;
      });
    });
    return Object.entries(typeMap).map(([type, count]) => ({
      type,
      count,
    }));
  }, [repairTasks]);

  const repairCompletionRate = useMemo(() => {
    const completed = repairTasks.filter(
      (t) => t.status === '质检通过' || t.status === '已完成'
    ).length;
    const notCompleted = repairTasks.length - completed;
    return [
      {
        id: '已完成',
        label: '已完成',
        value: completed,
        color: '#2E7D32',
      },
      {
        id: '进行中',
        label: '进行中',
        value: notCompleted,
        color: '#9E9E9E',
      },
    ];
  }, [repairTasks]);

  const qualityCheckPassRate = useMemo(() => {
    const passed = repairTasks.filter(
      (t) => t.status === '质检通过' || t.status === '已完成'
    ).length;
    const failed = repairTasks.filter((t) => t.status === '质检未通过').length;
    const pending = repairTasks.filter(
      (t) => t.status === '待质检' || t.status === '修复中' || t.status === '待指派'
    ).length;
    return [
      {
        id: '质检通过',
        label: '质检通过',
        value: passed,
        color: '#2E7D32',
      },
      {
        id: '质检未通过',
        label: '质检未通过',
        value: failed,
        color: '#C62828',
      },
      {
        id: '待质检',
        label: '待质检',
        value: pending,
        color: '#F57C00',
      },
    ];
  }, [repairTasks]);

  const yearDistribution = useMemo(() => {
    const decadeMap: Record<string, number> = {};
    cylinders.forEach((c) => {
      const decade = `${Math.floor(c.year / 10) * 10}s`;
      decadeMap[decade] = (decadeMap[decade] || 0) + 1;
    });
    return Object.entries(decadeMap)
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade));
  }, [cylinders]);

  const completionRate = useMemo(() => {
    const completed = cylinders.filter(
      (c) => c.transcriptionProgress === 100
    ).length;
    const notCompleted = cylinders.length - completed;
    return [
      {
        id: '已完成',
        label: '已完成',
        value: completed,
        color: '#2E7D32',
      },
      {
        id: '未完成',
        label: '未完成',
        value: notCompleted,
        color: '#9E9E9E',
      },
    ];
  }, [cylinders]);

  const noiseDistribution = useMemo(() => {
    const levels = ['低', '中', '高', '严重'];
    return levels.map((level) => ({
      level,
      数量: cylinders.filter((c) => c.noiseLevel === level).length,
    }));
  }, [cylinders]);

  const progressDistribution = useMemo(() => {
    const ranges = [
      { name: '未开始', min: 0, max: 0 },
      { name: '1-25%', min: 1, max: 25 },
      { name: '26-50%', min: 26, max: 50 },
      { name: '51-75%', min: 51, max: 75 },
      { name: '76-99%', min: 76, max: 99 },
      { name: '已完成', min: 100, max: 100 },
    ];
    return ranges.map((r) => ({
      阶段: r.name,
      数量: cylinders.filter(
        (c) => c.transcriptionProgress >= r.min && c.transcriptionProgress <= r.max
      ).length,
    }));
  }, [cylinders]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
          统计分析
        </Typography>
        <Typography variant="body2" color="text.secondary">
          蜡筒录音档案数据概览
        </Typography>
      </Box>

      <Box sx={{ px: 3, pb: 3, flex: 1, overflow: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          档案概览
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="蜡筒总数"
              value={stats.total}
              icon={<AlbumIcon />}
              color="primary.main"
              subtitle="件藏品"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="已转录完成"
              value={stats.completed}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle={`占比 ${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="平均进度"
              value={`${stats.avgProgress}%`}
              icon={<TrendingUpIcon />}
              color="secondary.main"
              subtitle="整体转录进度"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="待修复"
              value={stats.toRepair}
              icon={<BuildIcon />}
              color="warning.main"
              subtitle="需要修复处理"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="严重裂纹"
              value={stats.severeCracks}
              icon={<WarningIcon />}
              color="error.main"
              subtitle="需重点关注"
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          修复与质检
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="修复任务总数"
              value={repairStats.total}
              icon={<AssignmentIcon />}
              color="primary.main"
              subtitle="全部任务"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="修复中"
              value={repairStats.inProgress}
              icon={<BuildIcon />}
              color="primary.main"
              subtitle="正在处理"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="修复完成率"
              value={`${repairStats.completionRate}%`}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle="已完成占比"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="质检通过率"
              value={`${repairStats.qcPassRate}%`}
              icon={<CheckCircleIcon />}
              color="success.main"
              subtitle="质检达标率"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="待质检"
              value={repairStats.pendingQC}
              icon={<WarningIcon />}
              color="warning.main"
              subtitle="等待审核"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <StatCard
              title="质检未通过"
              value={repairStats.qcFailed}
              icon={<ErrorIcon />}
              color="error.main"
              subtitle={`平均返工${repairStats.avgRework}次`}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="年代分布"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="各年代蜡筒数量统计"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveBar
                    data={yearDistribution}
                    keys={['count']}
                    indexBy="decade"
                    margin={{ top: 20, right: 30, bottom: 40, left: 60 }}
                    padding={0.3}
                    layout="horizontal"
                    colors={['#5D4037']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '数量',
                      legendPosition: 'middle',
                      legendOffset: 32,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '年代',
                      legendPosition: 'middle',
                      legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="转录完成率"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="已完成与未完成转录占比"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsivePie
                    data={completionRate}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={2}
                    cornerRadius={4}
                    activeOuterRadiusOffset={8}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    defs={[
                      {
                        id: 'dots',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true,
                      },
                    ]}
                    fill={completionRate.map((d) => ({
                      match: { id: d.id },
                      id: 'dots',
                    }))}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 60,
                        translateY: 0,
                        itemsSpacing: 4,
                        itemWidth: 80,
                        itemHeight: 18,
                        itemTextColor: '#333',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 12,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemTextColor: '#000',
                            },
                          },
                        ],
                      },
                    ]}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="噪声等级占比"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="各噪声等级蜡筒分布"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveRadar
                    data={noiseDistribution}
                    keys={['数量']}
                    indexBy="level"
                    margin={{ top: 20, right: 60, bottom: 40, left: 60 }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1]] }}
                    gridLabelOffset={20}
                    dotSize={10}
                    dotColor={{ theme: 'background' }}
                    dotBorderWidth={2}
                    colors={['#B8860B']}
                    blendMode="multiply"
                    motionConfig="wobbly"
                    isInteractive
                    animate
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="转录进度分布"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="各进度区间蜡筒数量"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveBar
                    data={progressDistribution}
                    keys={['数量']}
                    indexBy="阶段"
                    margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                    padding={0.3}
                    colors={['#8D6E63']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '进度阶段',
                      legendPosition: 'middle',
                      legendOffset: 32,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '数量',
                      legendPosition: 'middle',
                      legendOffset: -30,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ fontWeight: 600, my: 3, color: 'primary.main' }}>
          修复工作流分析
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="修复任务状态分布"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="各状态修复任务数量统计"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveBar
                    data={repairStatusDistribution}
                    keys={['数量']}
                    indexBy="status"
                    margin={{ top: 20, right: 30, bottom: 40, left: 60 }}
                    padding={0.3}
                    layout="horizontal"
                    colors={['#B8860B']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '数量',
                      legendPosition: 'middle',
                      legendOffset: 32,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '状态',
                      legendPosition: 'middle',
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="修复完成率"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="已完成与进行中修复任务占比"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsivePie
                    data={repairCompletionRate}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={2}
                    cornerRadius={4}
                    activeOuterRadiusOffset={8}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    defs={[
                      {
                        id: 'dots-repair',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true,
                      },
                    ]}
                    fill={repairCompletionRate.map((d) => ({
                      match: { id: d.id },
                      id: 'dots-repair',
                    }))}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 60,
                        translateY: 0,
                        itemsSpacing: 4,
                        itemWidth: 80,
                        itemHeight: 18,
                        itemTextColor: '#333',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 12,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemTextColor: '#000',
                            },
                          },
                        ],
                      },
                    ]}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="质检通过率"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="质检通过、未通过与待质检占比"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsivePie
                    data={qualityCheckPassRate}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={2}
                    cornerRadius={4}
                    activeOuterRadiusOffset={8}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    defs={[
                      {
                        id: 'dots-qc',
                        type: 'patternDots',
                        background: 'inherit',
                        color: 'rgba(255, 255, 255, 0.3)',
                        size: 4,
                        padding: 1,
                        stagger: true,
                      },
                    ]}
                    fill={qualityCheckPassRate.map((d) => ({
                      match: { id: d.id },
                      id: 'dots-qc',
                    }))}
                    legends={[
                      {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 60,
                        translateY: 0,
                        itemsSpacing: 4,
                        itemWidth: 80,
                        itemHeight: 18,
                        itemTextColor: '#333',
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 12,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemTextColor: '#000',
                            },
                          },
                        ],
                      },
                    ]}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title="问题类型分布"
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                subheader="各问题类型出现次数统计"
              />
              <Divider />
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ height: 320, width: '100%' }}>
                  <ResponsiveBar
                    data={problemTypeDistribution}
                    keys={['count']}
                    indexBy="type"
                    margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
                    padding={0.3}
                    colors={['#8D6E63']}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '问题类型',
                      legendPosition: 'middle',
                      legendOffset: 32,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: '出现次数',
                      legendPosition: 'middle',
                      legendOffset: -40,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate
                    motionConfig="gentle"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StatisticsPage;
