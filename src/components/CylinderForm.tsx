import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText,
  Slider,
  Typography,
  Alert,
} from '@mui/material';
import { useCylinderStore } from '../store/useCylinderStore';
import { validateCylinder, isHighNoise } from '../utils/validators';
import type {
  Cylinder,
  MaterialStatus,
  NoiseLevel,
  CylinderStatus,
} from '../types';

interface CylinderFormProps {
  cylinder?: Cylinder;
  isEdit: boolean;
  formData: Partial<Cylinder>;
  setFormData: (data: Partial<Cylinder>) => void;
}

const CylinderForm: React.FC<CylinderFormProps> = ({
  cylinder,
  isEdit,
  formData,
  setFormData,
}) => {
  const { cylinders } = useCylinderStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const result = validateCylinder(formData, cylinders, isEdit);
    setErrors(result.errors);
  }, [formData, cylinders, isEdit]);

  const handleChange = (field: keyof Cylinder, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleProgressChange = (_event: Event, value: number | number[]) => {
    setFormData({ ...formData, transcriptionProgress: value as number });
  };

  const noiseLevelValue = formData.noiseLevel || '低';
  const showRepairWarning = isHighNoise(noiseLevelValue as NoiseLevel) && !formData.repairSuggestion?.trim();

  return (
    <Box>
      {showRepairWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          高噪声等级需要填写修复建议
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="蜡筒编号"
            size="small"
            fullWidth
            value={formData.id || ''}
            onChange={(e) => handleChange('id', e.target.value)}
            error={!!errors.id}
            helperText={errors.id}
            disabled={isEdit}
            required
            placeholder="如：CYL-001"
            InputProps={{
              sx: { fontFamily: 'monospace' },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="录音标题"
            size="small"
            fullWidth
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="年代"
            type="number"
            size="small"
            fullWidth
            value={formData.year || ''}
            onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
            error={!!errors.year}
            helperText={errors.year || '录制或制作年份'}
            required
            InputProps={{
              inputProps: { min: 1800, max: 2025 },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl size="small" fullWidth error={!!errors.materialStatus}>
            <InputLabel>材质状态</InputLabel>
            <Select
              value={formData.materialStatus || ''}
              label="材质状态"
              onChange={(e) =>
                handleChange('materialStatus', e.target.value as MaterialStatus)
              }
            >
              <MenuItem value="完好">完好</MenuItem>
              <MenuItem value="轻微磨损">轻微磨损</MenuItem>
              <MenuItem value="严重磨损">严重磨损</MenuItem>
              <MenuItem value="破损">破损</MenuItem>
            </Select>
            {errors.materialStatus && (
              <FormHelperText>{errors.materialStatus}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="保存位置"
            size="small"
            fullWidth
            value={formData.storageLocation || ''}
            onChange={(e) => handleChange('storageLocation', e.target.value)}
            placeholder="如：A区-01-023"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ px: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              转录进度：{formData.transcriptionProgress ?? 0}%
            </Typography>
            <Slider
              value={formData.transcriptionProgress ?? 0}
              onChange={handleProgressChange}
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
              sx={{
                color: '#5D4037',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#5D4037',
                },
              }}
            />
            {errors.transcriptionProgress && (
              <FormHelperText error>
                {errors.transcriptionProgress}
              </FormHelperText>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl size="small" fullWidth error={!!errors.noiseLevel}>
            <InputLabel>噪声等级</InputLabel>
            <Select
              value={formData.noiseLevel || ''}
              label="噪声等级"
              onChange={(e) =>
                handleChange('noiseLevel', e.target.value as NoiseLevel)
              }
            >
              <MenuItem value="低">低</MenuItem>
              <MenuItem value="中">中</MenuItem>
              <MenuItem value="高">高</MenuItem>
              <MenuItem value="严重">严重</MenuItem>
            </Select>
            {errors.noiseLevel && (
              <FormHelperText>{errors.noiseLevel}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl size="small" fullWidth error={!!errors.currentStatus}>
            <InputLabel>当前状态</InputLabel>
            <Select
              value={formData.currentStatus || ''}
              label="当前状态"
              onChange={(e) =>
                handleChange('currentStatus', e.target.value as CylinderStatus)
              }
            >
              <MenuItem value="待转录">待转录</MenuItem>
              <MenuItem value="转录中">转录中</MenuItem>
              <MenuItem value="已完成">已完成</MenuItem>
              <MenuItem value="已归档">已归档</MenuItem>
              <MenuItem value="待修复">待修复</MenuItem>
            </Select>
            {errors.currentStatus && (
              <FormHelperText>{errors.currentStatus}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="创建日期"
            type="date"
            size="small"
            fullWidth
            value={formData.createdAt || ''}
            onChange={(e) => handleChange('createdAt', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="修复建议"
            size="small"
            fullWidth
            multiline
            rows={3}
            value={formData.repairSuggestion || ''}
            onChange={(e) => handleChange('repairSuggestion', e.target.value)}
            error={!!errors.repairSuggestion}
            helperText={
              errors.repairSuggestion ||
              '高噪声或损坏蜡筒建议填写修复方案'
            }
            placeholder="描述修复方法、使用工具、注意事项等"
            required={isHighNoise(noiseLevelValue as NoiseLevel)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CylinderForm;
