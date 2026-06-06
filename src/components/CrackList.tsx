import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCylinderStore } from '../store/useCylinderStore';
import { getCrackSeverityColor } from '../utils/formatters';
import type { Crack, CrackSeverity } from '../types';

interface CrackListProps {
  cylinderId: string;
  editable?: boolean;
}

const emptyCrack: Omit<Crack, 'id' | 'cylinderId'> = {
  severity: '轻微',
  location: '',
  description: '',
  discoveredAt: new Date().toISOString().split('T')[0],
};

const CrackList: React.FC<CrackListProps> = ({ cylinderId, editable = true }) => {
  const { getCylinderById, addCrack, updateCrack, deleteCrack } = useCylinderStore();
  const cylinder = getCylinderById(cylinderId);
  const cracks = cylinder?.cracks || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrack, setEditingCrack] = useState<Crack | null>(null);
  const [formData, setFormData] = useState(emptyCrack);

  const handleAdd = () => {
    setEditingCrack(null);
    setFormData(emptyCrack);
    setDialogOpen(true);
  };

  const handleEdit = (crack: Crack) => {
    setEditingCrack(crack);
    setFormData({
      severity: crack.severity,
      location: crack.location,
      description: crack.description,
      discoveredAt: crack.discoveredAt,
    });
    setDialogOpen(true);
  };

  const handleDelete = (crackId: string) => {
    if (window.confirm('确定要删除这条裂纹记录吗？')) {
      deleteCrack(cylinderId, crackId);
    }
  };

  const handleSave = () => {
    if (!formData.location.trim()) {
      alert('请填写裂纹位置');
      return;
    }

    if (editingCrack) {
      updateCrack(cylinderId, editingCrack.id, formData);
    } else {
      const newCrack: Crack = {
        ...formData,
        id: `CRK-${Date.now()}`,
        cylinderId,
      };
      addCrack(cylinderId, newCrack);
    }
    setDialogOpen(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCrack(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          裂纹记录 ({cracks.length})
        </Typography>
        {editable && (
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            color="primary"
          >
            添加裂纹
          </Button>
        )}
      </Box>

      {cracks.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">暂无裂纹记录</Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {cracks.map((crack, index) => (
            <React.Fragment key={crack.id}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <ListItem
                sx={{
                  px: 1,
                  py: 1.5,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                secondaryAction={
                  editable ? (
                    <Box>
                      <Tooltip title="编辑">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleEdit(crack)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          edge="end"
                          size="small"
                          color="error"
                          onClick={() => handleDelete(crack.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : null
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip
                        label={crack.severity}
                        size="small"
                        color={getCrackSeverityColor(crack.severity)}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {crack.location}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {crack.description || '无详细描述'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        发现日期：{crack.discoveredAt}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCrack ? '编辑裂纹记录' : '添加裂纹记录'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>严重程度</InputLabel>
              <Select
                value={formData.severity}
                label="严重程度"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    severity: e.target.value as CrackSeverity,
                  })
                }
              >
                <MenuItem value="轻微">轻微</MenuItem>
                <MenuItem value="中等">中等</MenuItem>
                <MenuItem value="严重">严重</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="裂纹位置"
              size="small"
              fullWidth
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="如：底部边缘、中部螺旋纹等"
              required
            />

            <TextField
              label="详细描述"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="描述裂纹的长度、方向、影响等"
            />

            <TextField
              label="发现日期"
              type="date"
              size="small"
              fullWidth
              value={formData.discoveredAt}
              onChange={(e) =>
                setFormData({ ...formData, discoveredAt: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>取消</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrackList;
