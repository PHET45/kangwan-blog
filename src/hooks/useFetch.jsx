import { useState, useEffect, useCallback } from 'react'
import { getBlogs } from '../services/blogService'

export const useFetch = () => {
  const [blogs, setBlogs] = useState([])
  const [filteredBlogs, setFilteredBlogs] = useState([])
  const [text, setText] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(4)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 📌 ดึงข้อมูลจาก backend
  const fetchBlog = useCallback(
    async (query, { append = false } = {}) => {
      try {
        setIsLoading(true)
        const params = query || {}

        const effectiveCategory = category === 'Highlight' ? '' : category
        if (effectiveCategory) params.category = effectiveCategory

        params.page = params.page ?? 1
        params.limit = params.limit ?? limit

        const items = await getBlogs(params)

        setBlogs((prev) => (append ? [...prev, ...items] : items))
        setHasMore(Array.isArray(items) ? items.length === limit : false)
      } catch (err) {
        console.error('Error fetching blog:', err)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    },
    [category, limit]
  )

  // 📌 ดึงข้อมูลเมื่อ category เปลี่ยน
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchBlog({ page: 1 })
  }, [category, fetchBlog])

  // 📌 ดึงข้อมูลเพิ่มเมื่อ page เปลี่ยน
  useEffect(() => {
    if (page === 1) return
    fetchBlog({ page }, { append: true })
  }, [page, fetchBlog])

  // 📌 Filter frontend ตาม text + tags
  useEffect(() => {
    let result = [...blogs]

    if (text) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(text.toLowerCase())
      )
    }

    if (selectedTags.length > 0) {
      result = result.filter((b) =>
        selectedTags.every((tag) => b.tags?.includes(tag))
      )
    }

    setFilteredBlogs(result)
  }, [text, selectedTags, blogs])

  const handleTagClick = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  const loadMore = () => {
    if (isLoading || !hasMore) return
    setPage((prevPage) => prevPage + 1)
  }

  return {
    blogs: filteredBlogs, // ✅ ส่งออกเป็นข้อมูลที่ถูกกรองแล้ว
    text,
    setText,
    selectedTags,
    handleTagClick,
    category,
    setCategory,
    page,
    limit,
    isLoading,
    hasMore,
    loadMore,
  }
}
export default useFetch