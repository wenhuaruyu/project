const { queryGuides } = require("../../services/guide.service")

const CATEGORY_OPTIONS = [
  { value: "", label: "全部" },
  { value: "spot", label: "景点" },
  { value: "food", label: "美食" },
  { value: "photo", label: "拍照" },
  { value: "night", label: "夜游" }
]

const SORT_OPTIONS = [
  { value: "", label: "推荐" },
  { value: "distance", label: "距离优先" },
  { value: "popular", label: "热度优先" }
]

const CATEGORY_LABEL_MAP = CATEGORY_OPTIONS.reduce((map, item) => {
  map[item.value] = item.label
  return map
}, {})

function resolveHeatLevel(popularity) {
  const score = Number(popularity || 0)
  if (score >= 90) {
    return { text: "高热", className: "heat-high" }
  }
  if (score >= 80) {
    return { text: "热门", className: "heat-mid" }
  }
  return { text: "小众", className: "heat-low" }
}

Page({
  data: {
    storeId: "store_001",
    list: [],
    filteredList: [],
    keyword: "",
    category: "",
    sortBy: "",
    categoryOptions: CATEGORY_OPTIONS,
    sortOptions: SORT_OPTIONS,
    loading: false
  },

  async onLoad(query) {
    this.setData({ storeId: query.storeId || "store_001" })
    await this.loadList()
  },

  async loadList() {
    this.setData({ loading: true })
    try {
      const res = await queryGuides({
        storeId: this.data.storeId,
        category: this.data.category,
        sortBy: this.data.sortBy,
        pageNo: 1,
        pageSize: 20
      })
      const list = (res.data.list || []).map((item) => {
        const heat = resolveHeatLevel(item.popularity)
        return {
          ...item,
          categoryLabel: CATEGORY_LABEL_MAP[item.category] || "其他",
          displayDistance: Number(item.distanceKm || 0).toFixed(1),
          popularityText: Number(item.popularity || 0),
          heatText: heat.text,
          heatClass: heat.className
        }
      })
      this.setData({ list })
      this.applyKeywordFilter()
    } catch (error) {
      wx.showToast({ title: error.message || "加载失败", icon: "none" })
    } finally {
      this.setData({ loading: false })
    }
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value || "" })
  },

  onKeywordSearch() {
    this.applyKeywordFilter()
  },

  clearKeyword() {
    this.setData({ keyword: "" })
    this.applyKeywordFilter()
  },

  applyKeywordFilter() {
    const keyword = (this.data.keyword || "").trim().toLowerCase()
    const filteredList = keyword
      ? this.data.list.filter((item) => {
          const title = String(item.title || "").toLowerCase()
          const content = String(item.content || "").toLowerCase()
          return title.includes(keyword) || content.includes(keyword)
        })
      : this.data.list
    this.setData({ filteredList })
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category || ""
    this.setData({ category })
    this.loadList()
  },

  onSortChange(e) {
    const sortBy = e.currentTarget.dataset.sort || ""
    this.setData({ sortBy })
    this.loadList()
  },

  onPullDownRefresh() {
    this.loadList().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onGoDetail(e) {
    const guideId = e.currentTarget.dataset.guideId
    if (!guideId) {
      return
    }
    wx.navigateTo({
      url: `/pages/guide-detail/index?guideId=${guideId}`
    })
  },

  goHome() {
    wx.switchTab({
      url: "/pages/home/index"
    })
  }
})
