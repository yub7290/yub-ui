<template>
  <div class="relation-page">
    <el-card class="search-card" shadow="never">
      <div class="card-accent"></div>
      <div class="search-bar">
        <el-input v-model="searchTitle" placeholder="搜索知识点" clearable style="width: 250px" @keyup.enter="handleSearch" />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </el-card>

    <div class="relation-layout">
      <div class="knowledge-list-panel">
        <div class="panel-header">
          <h3>知识点分类</h3>
          <span class="count">{{ currentCategoryName || '全部' }}</span>
        </div>
        <div class="knowledge-scroll">
          <el-tree
            ref="categoryTreeRef"
            :data="knowledgeTree"
            :props="treeProps"
            node-key="id"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick">
            <template #default="{ node, data }">
              <span class="tree-node" :class="{ selected: data.isKnowledge && selectedKnowledgeIds.includes(data.id) }">
                <el-icon v-if="data.isCategory">
                  <FolderOpened v-if="node.expanded" />
                  <Folder v-else />
                </el-icon>
                <el-icon v-else><Document /></el-icon>
                <span>{{ data.name }}</span>
                <span class="node-count" v-if="data.isCategory && getCategoryKnowledgeCount(data.id) > 0">
                  ({{ getCategoryKnowledgeCount(data.id) }})
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <div class="graph-panel">
        <div class="panel-header">
          <h3>知识关系图谱</h3>
          <div class="panel-actions">
            <el-button type="primary" size="small" :disabled="selectedKnowledgeIds.length !== 2" @click="showAddRelationDialog">
              <el-icon><Plus /></el-icon>添加关系
            </el-button>
            <el-button size="small" @click="resetGraph">重置视图</el-button>
          </div>
        </div>

        <div ref="graphContainer" class="graph-container"
          @wheel.prevent="onWheel"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp">
          <svg class="graph-svg"
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
            :style="{ cursor: isDragging ? 'grabbing' : 'grab' }">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
              <marker id="arrowhead-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
              </marker>
            </defs>

            <g v-for="(relation, index) in displayRelations" :key="'rel-' + relation.id"
            :class="{ active: activeRelationId === relation.id }">
              <line :x1="getNodePosition(relation.sourceId).x" :y1="getNodePosition(relation.sourceId).y"
                :x2="getNodePosition(relation.targetId).x" :y2="getNodePosition(relation.targetId).y"
                :stroke="getRelationColor(relation.relationType)"
                stroke-width="2" marker-end="url(#arrowhead)" />
              <text :x="(getNodePosition(relation.sourceId).x + getNodePosition(relation.targetId).x) / 2"
                :y="(getNodePosition(relation.sourceId).y + getNodePosition(relation.targetId).y) / 2 - 8"
                class="relation-label" :fill="getRelationColor(relation.relationType)">
                {{ getRelationTypeName(relation.relationType) }}
              </text>
            </g>

            <g v-for="node in displayNodes" :key="'node-' + node.id"
              :class="{ selected: selectedKnowledgeIds.includes(node.id), active: activeNodeId === node.id }"
              @click.stop="onNodeClick(node)">
              <circle :cx="node.x" :cy="node.y" r="35"
                :fill="selectedKnowledgeIds.includes(node.id) ? '#e8f4ff' : '#fff'"
                :stroke="getNodeColor(node.categoryId)"
                stroke-width="2" cursor="pointer" />
              <text :x="node.x" :y="node.y - 5" class="node-title" text-anchor="middle">{{ node.title }}</text>
              <text :x="node.x" :y="node.y + 15" class="node-id" text-anchor="middle">#{{ node.id }}</text>
            </g>
          </svg>

          <div class="zoom-controls">
            <el-button size="small" @click="zoomIn"><el-icon><Plus /></el-icon></el-button>
            <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
            <el-button size="small" @click="zoomOut"><el-icon><Minus /></el-icon></el-button>
          </div>
        </div>

        <div class="relation-list">
          <div class="relation-list-header">
            <h4>关系列表</h4>
            <span class="relation-count">共 {{ relationTotal }} 条</span>
          </div>
          <div class="relation-table-wrapper">
            <el-table :data="pagedRelationList" border stripe size="small" :height="tableHeight">
              <el-table-column prop="sourceTitle" label="源知识点" min-width="150" />
              <el-table-column prop="targetTitle" label="目标知识点" min-width="150" />
              <el-table-column prop="relationTypeName" label="关系类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="getRelationTagType(row.relationType)">{{ row.relationTypeName }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="showEditRelationDialog(row)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="handleDeleteRelation(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="relation-pagination">
            <el-pagination
              v-model:current-page="relationPage"
              v-model:page-size="relationPageSize"
              :total="relationTotal"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadRelationList"
              @current-change="loadRelationList"
            />
          </div>
        </div>
      </div>
    </div>

    <YubDialog v-model="relationDialogVisible" :title="editingRelationId ? '编辑关系' : '添加关系'" width="500px"
      destroy-on-close>
      <el-form ref="relationFormRef" :model="relationForm" :rules="relationRules" label-width="100px">
        <el-form-item label="源知识点" prop="sourceId">
          <el-select v-model="relationForm.sourceId" placeholder="请选择源知识点" filterable>
            <el-option v-for="item in filteredKnowledgeList" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标知识点" prop="targetId">
          <el-select v-model="relationForm.targetId" placeholder="请选择目标知识点" filterable>
            <el-option v-for="item in filteredKnowledgeList" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关系类型" prop="relationType">
          <el-select v-model="relationForm.relationType" placeholder="请选择关系类型">
            <el-option label="前置依赖" :value="1" />
            <el-option label="进阶延伸" :value="2" />
            <el-option label="关联参考" :value="3" />
            <el-option label="对比对照" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="关系描述">
          <el-input v-model="relationForm.description" type="textarea" :rows="3" placeholder="请输入关系描述（可选）" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="relationDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRelation">确定</el-button>
      </template>
    </YubDialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { getKnowledgeList, getCategoryTree } from '@/api/edu/knowledgePoint'
import { getAllRelations, createRelation, updateRelation, deleteRelation } from '@/api/edu/knowledgeRelation'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus, Folder, FolderOpened, Document } from '@element-plus/icons-vue'
import YubDialog from '@/components/YubDialog.vue'

const svgWidth = 800
const svgHeight = 400

const searchTitle = ref('')
const categoryTree = ref([])
const knowledgeTree = ref([])
const allKnowledgeList = ref([])
const relationList = ref([])
const selectedKnowledgeIds = ref([])
const activeNodeId = ref(null)
const activeRelationId = ref(null)
const currentCategoryId = ref(null)
const categoryTreeRef = ref(null)

const relationPage = ref(1)
const relationPageSize = ref(10)
const relationTotal = ref(0)

const relationDialogVisible = ref(false)
const editingRelationId = ref(null)
const submitting = ref(false)
const relationFormRef = ref(null)
const relationForm = reactive({ sourceId: null, targetId: null, relationType: 1, description: '' })
const relationRules = {
  sourceId: [{ required: true, message: '请选择源知识点', trigger: 'change' }],
  targetId: [{ required: true, message: '请选择目标知识点', trigger: 'change' }],
  relationType: [{ required: true, message: '请选择关系类型', trigger: 'change' }]
}

const treeProps = {
  children: 'children',
  label: 'name'
}

const RELATION_TYPE_NAMES = {
  1: '前置依赖',
  2: '进阶延伸',
  3: '关联参考',
  4: '对比对照'
}

const RELATION_COLORS = {
  1: '#f56c6c',
  2: '#67c23a',
  3: '#409eff',
  4: '#e6a23c'
}

const RELATION_TAG_TYPES = {
  1: 'danger',
  2: 'success',
  3: 'primary',
  4: 'warning'
}

const CATEGORY_COLORS = [
  '#409eff',
  '#67c23a',
  '#f56c6c',
  '#e6a23c',
  '#909399',
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#eb2f96',
  '#722ed1'
]

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)
const tableHeight = ref(200)

const viewBox = computed(() => ({
  x: translateX.value,
  y: translateY.value,
  width: svgWidth * scale.value,
  height: svgHeight * scale.value
}))

const filteredRelationList = computed(() => {
  if (!currentCategoryId.value) return relationList.value
  
  const categoryIds = getAllCategoryIds(currentCategoryId.value)
  const knowledgeIds = new Set(allKnowledgeList.value.filter(k => categoryIds.includes(k.categoryId)).map(k => k.id))
  
  return relationList.value.filter(r => knowledgeIds.has(r.sourceId) || knowledgeIds.has(r.targetId))
})

const pagedRelationList = computed(() => {
  const start = (relationPage.value - 1) * relationPageSize.value
  const end = start + relationPageSize.value
  return filteredRelationList.value.slice(start, end)
})

const currentCategoryName = computed(() => {
  if (!currentCategoryId.value) return '全部'
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === currentCategoryId.value) return node.name
      if (node.children && node.children.length > 0) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findNode(categoryTree.value) || '未知分类'
})

const filteredKnowledgeList = computed(() => {
  let list = allKnowledgeList.value
  if (currentCategoryId.value) {
    const categoryIds = getAllCategoryIds(currentCategoryId.value)
    list = list.filter(k => categoryIds.includes(k.categoryId))
  }
  if (searchTitle.value) {
    const keyword = searchTitle.value.toLowerCase()
    list = list.filter(k => k.title.toLowerCase().includes(keyword))
  }
  return list
})

function calculateNodeDegrees(nodes, relations) {
  const degrees = new Map()
  nodes.forEach(node => degrees.set(node.id, 0))
  relations.forEach(r => {
    if (degrees.has(r.sourceId)) degrees.set(r.sourceId, degrees.get(r.sourceId) + 1)
    if (degrees.has(r.targetId)) degrees.set(r.targetId, degrees.get(r.targetId) + 1)
  })
  return degrees
}

function findCentralNode(nodes, degrees) {
  let centralId = null
  let maxDegree = -1
  nodes.forEach(node => {
    const degree = degrees.get(node.id) || 0
    if (degree > maxDegree) {
      maxDegree = degree
      centralId = node.id
    }
  })
  return centralId
}

function radialLayout(nodes, relations) {
  if (nodes.length === 0) return nodes
  if (nodes.length === 1) {
    nodes[0].x = svgWidth / 2
    nodes[0].y = svgHeight / 2
    return nodes
  }

  if (relations.length === 0) {
    const categories = {}
    nodes.forEach(node => {
      if (!categories[node.categoryId]) {
        categories[node.categoryId] = []
      }
      categories[node.categoryId].push(node)
    })

    const categoryIds = Object.keys(categories)
    const sectorAngle = (Math.PI * 2) / categoryIds.length

    categoryIds.forEach((catId, catIdx) => {
      const catNodes = categories[catId]
      const startAngle = catIdx * sectorAngle - Math.PI / 2
      const angleStep = sectorAngle / (catNodes.length + 1)

      catNodes.forEach((node, idx) => {
        const radius = 100 + Math.random() * 50
        const angle = startAngle + angleStep * (idx + 1)
        node.x = svgWidth / 2 + radius * Math.cos(angle)
        node.y = svgHeight / 2 + radius * Math.sin(angle)
      })
    })
    return nodes
  }

  const degrees = calculateNodeDegrees(nodes, relations)
  const centralId = findCentralNode(nodes, degrees)
  const centralNode = nodes.find(n => n.id === centralId)

  if (centralNode) {
    centralNode.x = svgWidth / 2
    centralNode.y = svgHeight / 2
  }

  const nodePositions = new Map()
  if (centralNode) nodePositions.set(centralId, { x: centralNode.x, y: centralNode.y })

  const categories = {}
  nodes.forEach(node => {
    if (!categories[node.categoryId]) {
      categories[node.categoryId] = []
    }
    categories[node.categoryId].push(node)
  })
  const categoryIds = Object.keys(categories)

  const layers = buildLayers(nodes, relations, centralId)
  
  let layerIndex = 1
  const placedNodeIds = new Set(centralId ? [centralId] : [])
  
  if (categoryIds.length > 1) {
    const sectorAngle = (Math.PI * 2) / categoryIds.length
    
    layers.forEach((layerNodes) => {
      let radius = 100 + layerIndex * 90
      const count = layerNodes.length
      if (count === 0) {
        layerIndex++
        return
      }

      const nodesByCategory = {}
      layerNodes.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return
        if (!nodesByCategory[node.categoryId]) {
          nodesByCategory[node.categoryId] = []
        }
        nodesByCategory[node.categoryId].push(node)
      })

      categoryIds.forEach((catId, catIdx) => {
        const catNodes = nodesByCategory[catId] || []
        if (catNodes.length === 0) return

        const startAngle = catIdx * sectorAngle - Math.PI / 2
        const angleStep = sectorAngle / (catNodes.length + 1)

        catNodes.forEach((node, idx) => {
          let angle = startAngle + angleStep * (idx + 1)
          
          let x = svgWidth / 2 + radius * Math.cos(angle)
          let y = svgHeight / 2 + radius * Math.sin(angle)

          while (checkCollision(x, y, nodePositions, 80)) {
            radius += 15
            x = svgWidth / 2 + radius * Math.cos(angle)
            y = svgHeight / 2 + radius * Math.sin(angle)
          }

          node.x = x
          node.y = y
          nodePositions.set(node.id, { x, y })
          placedNodeIds.add(node.id)
        })
      })
      layerIndex++
    })
  } else {
    layers.forEach((layerNodes) => {
      let radius = 100 + layerIndex * 80
      const count = layerNodes.length
      if (count === 0) {
        layerIndex++
        return
      }

      const angleStep = (Math.PI * 2) / count
      layerNodes.forEach((nodeId, idx) => {
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return

        let angle = idx * angleStep - Math.PI / 2
        
        let x = svgWidth / 2 + radius * Math.cos(angle)
        let y = svgHeight / 2 + radius * Math.sin(angle)

        while (checkCollision(x, y, nodePositions, 70)) {
          radius += 10
          x = svgWidth / 2 + radius * Math.cos(angle)
          y = svgHeight / 2 + radius * Math.sin(angle)
        }

        node.x = x
        node.y = y
        nodePositions.set(nodeId, { x, y })
        placedNodeIds.add(nodeId)
      })
      layerIndex++
    })
  }

  const unplacedNodes = nodes.filter(n => !placedNodeIds.has(n.id))
  if (unplacedNodes.length > 0) {
    const maxRadius = 100 + layerIndex * 90 + 80
    const sectorAngle = (Math.PI * 2) / categoryIds.length

    const nodesByCategory = {}
    unplacedNodes.forEach(node => {
      if (!nodesByCategory[node.categoryId]) {
        nodesByCategory[node.categoryId] = []
      }
      nodesByCategory[node.categoryId].push(node)
    })

    categoryIds.forEach((catId, catIdx) => {
      const catNodes = nodesByCategory[catId] || []
      if (catNodes.length === 0) return

      const startAngle = catIdx * sectorAngle - Math.PI / 2
      const angleStep = sectorAngle / (catNodes.length + 1)

      catNodes.forEach((node, idx) => {
        let radius = maxRadius
        let angle = startAngle + angleStep * (idx + 1)
        
        let x = svgWidth / 2 + radius * Math.cos(angle)
        let y = svgHeight / 2 + radius * Math.sin(angle)

        while (checkCollision(x, y, nodePositions, 80)) {
          radius += 20
          x = svgWidth / 2 + radius * Math.cos(angle)
          y = svgHeight / 2 + radius * Math.sin(angle)
        }

        node.x = x
        node.y = y
        nodePositions.set(node.id, { x, y })
      })
    })
  }

  applyCollisionAvoidance(nodes, 80)

  return nodes
}

function buildLayers(nodes, relations, centralId) {
  if (!centralId) return []
  
  const layers = []
  const visited = new Set([centralId])
  let currentLayer = [centralId]

  while (currentLayer.length > 0) {
    const nextLayer = new Set()
    currentLayer.forEach(nodeId => {
      relations.forEach(r => {
        if (r.sourceId === nodeId && !visited.has(r.targetId)) {
          nextLayer.add(r.targetId)
        }
        if (r.targetId === nodeId && !visited.has(r.sourceId)) {
          nextLayer.add(r.sourceId)
        }
      })
    })
    const nextLayerArray = Array.from(nextLayer).filter(id => 
      nodes.some(n => n.id === id)
    )
    if (nextLayerArray.length > 0) {
      layers.push(nextLayerArray)
      nextLayer.forEach(id => visited.add(id))
    }
    currentLayer = nextLayerArray
  }

  return layers
}

function checkCollision(x, y, positions, minDistance) {
  for (const [, pos] of positions) {
    const dx = x - pos.x
    const dy = y - pos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < minDistance) return true
  }
  return false
}

function applyCollisionAvoidance(nodes, minDistance) {
  let iterations = 0
  const maxIterations = 50
  let moved = true

  while (moved && iterations < maxIterations) {
    moved = false
    iterations++

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i]
        const n2 = nodes[j]
        const dx = n2.x - n1.x
        const dy = n2.y - n1.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance
          const separation = overlap / 2
          const nx = dx / distance
          const ny = dy / distance

          n1.x -= nx * separation
          n1.y -= ny * separation
          n2.x += nx * separation
          n2.y += ny * separation

          n1.x = Math.max(50, Math.min(svgWidth - 50, n1.x))
          n1.y = Math.max(50, Math.min(svgHeight - 50, n1.y))
          n2.x = Math.max(50, Math.min(svgWidth - 50, n2.x))
          n2.y = Math.max(50, Math.min(svgHeight - 50, n2.y))

          moved = true
        }
      }
    }
  }
}

const displayRelations = computed(() => {
  if (!currentCategoryId.value) return relationList.value
  
  const categoryIds = getAllCategoryIds(currentCategoryId.value)
  const knowledgeIds = new Set(allKnowledgeList.value.filter(k => categoryIds.includes(k.categoryId)).map(k => k.id))
  
  return relationList.value.filter(r => knowledgeIds.has(r.sourceId) && knowledgeIds.has(r.targetId))
})

const displayNodes = computed(() => {
  const nodeMap = new Map()
  const validRelations = displayRelations.value
  
  const relatedKnowledgeIds = new Set()
  validRelations.forEach(r => {
    relatedKnowledgeIds.add(r.sourceId)
    relatedKnowledgeIds.add(r.targetId)
  })
  
  if (!currentCategoryId.value) {
    allKnowledgeList.value.forEach(k => {
      if (relatedKnowledgeIds.has(k.id)) {
        nodeMap.set(k.id, { id: k.id, title: k.title, categoryId: k.categoryId, x: 0, y: 0 })
      }
    })
  } else {
    const categoryIds = getAllCategoryIds(currentCategoryId.value)
    allKnowledgeList.value.forEach(k => {
      if (categoryIds.includes(k.categoryId) && relatedKnowledgeIds.has(k.id)) {
        nodeMap.set(k.id, { id: k.id, title: k.title, categoryId: k.categoryId, x: 0, y: 0 })
      }
    })
  }

  let nodes = Array.from(nodeMap.values())

  nodes = radialLayout(nodes, validRelations)

  return nodes
})

function getAllCategoryIds(categoryId) {
  const ids = [categoryId]
  const findChildren = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          ids.push(child.id)
          findChildren([child])
        })
      }
    })
  }
  const findNode = (nodes) => {
    for (const node of nodes) {
      if (node.id === categoryId) {
        findChildren([node])
        return
      }
      if (node.children && node.children.length > 0) {
        findNode(node.children)
      }
    }
  }
  findNode(categoryTree.value)
  return ids
}

function getCategoryKnowledgeCount(categoryId) {
  const categoryIds = getAllCategoryIds(categoryId)
  return allKnowledgeList.value.filter(k => categoryIds.includes(k.categoryId)).length
}

function getNodePosition(id) {
  const node = displayNodes.value.find(n => n.id === id)
  return node || { x: svgWidth / 2, y: svgHeight / 2 }
}

function getRelationTypeName(type) {
  return RELATION_TYPE_NAMES[type] || '未知'
}

function getRelationColor(type) {
  return RELATION_COLORS[type] || '#94a3b8'
}

function getRelationTagType(type) {
  return RELATION_TAG_TYPES[type] || 'info'
}

function getNodeColor(categoryId) {
  if (!categoryId) return '#909399'
  return CATEGORY_COLORS[categoryId % CATEGORY_COLORS.length]
}

async function loadAllKnowledgeList() {
  try {
    const res = await getKnowledgeList({})
    const data = res.data || {}
    allKnowledgeList.value = data.records || []
    buildKnowledgeTree()
  } catch {
    allKnowledgeList.value = []
  }
}

async function loadCategoryTree() {
  try {
    const res = await getCategoryTree()
    categoryTree.value = res.data || []
    buildKnowledgeTree()
  } catch {
    categoryTree.value = []
    knowledgeTree.value = []
  }
}

function buildKnowledgeTree() {
  const tree = JSON.parse(JSON.stringify(categoryTree.value))
  const categoryMap = new Map()
  
  function markCategories(nodes) {
    nodes.forEach(node => {
      node.isCategory = true
      categoryMap.set(node.id, node)
      if (!node.children) {
        node.children = []
      }
      if (node.children && node.children.length > 0) {
        markCategories(node.children)
      }
    })
  }
  
  markCategories(tree)
  
  allKnowledgeList.value.forEach(k => {
    const category = categoryMap.get(k.categoryId)
    if (category) {
      if (!category.children) {
        category.children = []
      }
      category.children.push({
        id: k.id,
        name: k.title,
        isKnowledge: true,
        isCategory: false,
        categoryId: k.categoryId,
        children: []
      })
    }
  })
  
  knowledgeTree.value = tree
}

async function loadRelationList() {
  try {
    const res = await getAllRelations()
    relationList.value = res.data || []
    relationTotal.value = filteredRelationList.value.length
  } catch {
    relationList.value = []
    relationTotal.value = 0
  }
}

watch(currentCategoryId, () => {
  relationPage.value = 1
})

function handleNodeClick(data) {
  if (data.isKnowledge) {
    const idx = selectedKnowledgeIds.value.indexOf(data.id)
    if (idx > -1) {
      selectedKnowledgeIds.value.splice(idx, 1)
    } else if (selectedKnowledgeIds.value.length < 2) {
      selectedKnowledgeIds.value.push(data.id)
    } else {
      ElMessage.warning('最多选择2个知识点建立关系')
    }
  } else {
    currentCategoryId.value = data.id
    selectedKnowledgeIds.value = []
  }
}

function handleSearch() {
  selectedKnowledgeIds.value = []
}

function handleReset() {
  searchTitle.value = ''
  selectedKnowledgeIds.value = []
}

function toggleKnowledge(item) {
  const idx = selectedKnowledgeIds.value.indexOf(item.id)
  if (idx > -1) {
    selectedKnowledgeIds.value.splice(idx, 1)
  } else if (selectedKnowledgeIds.value.length < 2) {
    selectedKnowledgeIds.value.push(item.id)
  } else {
    ElMessage.warning('最多选择2个知识点建立关系')
  }
}

function onNodeClick(node) {
  activeNodeId.value = node.id
}

function onGraphClick() {
  activeNodeId.value = null
  activeRelationId.value = null
}

function onWheel(e) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(0.5, Math.min(2, scale.value + delta))
  scale.value = newScale
}

function onMouseDown(e) {
  isDragging.value = true
  lastMouseX.value = e.clientX
  lastMouseY.value = e.clientY
}

function onMouseMove(e) {
  if (!isDragging.value) return
  const deltaX = e.clientX - lastMouseX.value
  const deltaY = e.clientY - lastMouseY.value
  translateX.value += deltaX
  translateY.value += deltaY
  lastMouseX.value = e.clientX
  lastMouseY.value = e.clientY
}

function onMouseUp() {
  isDragging.value = false
}

function zoomIn() {
  scale.value = Math.min(2, scale.value + 0.1)
}

function zoomOut() {
  scale.value = Math.max(0.5, scale.value - 0.1)
}

function resetGraph() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function showAddRelationDialog() {
  editingRelationId.value = null
  if (selectedKnowledgeIds.value.length === 2) {
    relationForm.sourceId = selectedKnowledgeIds.value[0]
    relationForm.targetId = selectedKnowledgeIds.value[1]
  } else {
    relationForm.sourceId = null
    relationForm.targetId = null
  }
  relationForm.relationType = 1
  relationForm.description = ''
  relationDialogVisible.value = true
}

function showEditRelationDialog(row) {
  editingRelationId.value = row.id
  relationForm.sourceId = row.sourceId
  relationForm.targetId = row.targetId
  relationForm.relationType = row.relationType
  relationForm.description = row.description || ''
  relationDialogVisible.value = true
}

async function submitRelation() {
  if (!relationFormRef.value) return
  try { await relationFormRef.value.validate() } catch { return }

  if (relationForm.sourceId === relationForm.targetId) {
    ElMessage.warning('不能创建知识点自关联')
    return
  }

  submitting.value = true
  try {
    if (editingRelationId.value) {
      await updateRelation({ id: editingRelationId.value, ...relationForm })
      ElMessage.success('编辑成功')
    } else {
      await createRelation(relationForm)
      ElMessage.success('新增成功')
    }
    relationDialogVisible.value = false
    await loadRelationList()
  } catch { /* 错误已处理 */ }
  finally { submitting.value = false }
}

async function handleDeleteRelation(id) {
  try {
    await ElMessageBox.confirm('确定要删除该关系吗？', '删除确认', { type: 'warning' })
    await deleteRelation(id)
    ElMessage.success('删除成功')
    await loadRelationList()
  } catch { /* 取消 */ }
}

function updateTableHeight() {
  const totalHeight = window.innerHeight
  const headerHeight = 180
  const panelHeaderHeight = 56
  const graphMinHeight = 300
  const paginationHeight = 60
  const relationListHeaderHeight = 48
  
  const availableHeight = totalHeight - headerHeight - panelHeaderHeight - graphMinHeight - paginationHeight - relationListHeaderHeight - 20
  tableHeight.value = Math.max(150, Math.floor(availableHeight))
}

onMounted(() => {
  loadCategoryTree()
  loadAllKnowledgeList()
  loadRelationList()
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)
})
</script>

<style scoped>
.relation-page {
  padding: 0 24px 24px;
}

.search-card {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.relation-layout {
  display: flex;
  gap: 20px;
  height: calc(100vh - 180px);
}

.knowledge-list-panel {
  width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
}

.panel-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a2332;
}

.count {
  font-size: 13px;
  color: #409eff;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.knowledge-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #334155;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tree-node:hover {
  background: #f1f5f9;
}

.tree-node.selected {
  background: #e8f4ff;
  color: #409eff;
  font-weight: 500;
}

.tree-node .el-icon {
  font-size: 14px;
  color: #94a3b8;
}

.tree-node.selected .el-icon {
  color: #409eff;
}

.node-count {
  font-size: 12px;
  color: #94a3b8;
  margin-left: auto;
}

.graph-panel {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.graph-container {
  flex: 1;
  min-height: 300px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.graph-svg {
  width: 100%;
  height: 100%;
}

.zoom-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.zoom-level {
  font-size: 12px;
  color: #64748b;
  min-width: 45px;
  text-align: center;
}

.node-title {
  font-size: 12px;
  font-weight: 500;
  fill: #1e293b;
}

.node-id {
  font-size: 10px;
  fill: #94a3b8;
}

.relation-label {
  font-size: 11px;
  font-weight: 500;
}

.relation-list {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
  max-height: 40%;
  display: flex;
  flex-direction: column;
}

.relation-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.relation-list-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.relation-count {
  font-size: 13px;
  color: #64748b;
}

.relation-table-wrapper {
  flex: 1;
  overflow: hidden;
}

.relation-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  flex-shrink: 0;
}
</style>