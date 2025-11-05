'use client'

import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchProps {
  index?: 'knowledge_base' | 'leads' | 'customers' | 'all'
  placeholder?: string
  onSelect?: (result: any) => void
  className?: string
}

export default function Search({
  index = 'knowledge_base',
  placeholder = 'Search...',
  onSelect,
  className
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&index=${index}&limit=10`
        )
        const data = await response.json()

        if (data.success) {
          setResults(data.hits || [])
          setIsOpen(true)
          setSelectedIndex(0)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, index])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (result: any) => {
    if (onSelect) {
      onSelect(result)
    } else {
      // Default behavior: navigate to result
      if (result.slug) {
        window.location.href = `/knowledge-base/${result.slug}`
      }
    }
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const highlightMatch = (text: string, formatted: any) => {
    if (!formatted) return text
    // Use Meilisearch's formatted highlighting
    return formatted
  }

  return (
    <div ref={searchRef} className={cn('relative w-full max-w-2xl', className)}>
      {/* Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-[400px] overflow-y-auto z-50 shadow-lg">
          <div className="p-2">
            {results.map((result, resultIdx) => (
              <div
                key={result.id}
                className={cn(
                  'p-3 rounded-md cursor-pointer transition-colors',
                  resultIdx === selectedIndex
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                )}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(resultIdx)}
              >
                {/* Knowledge Base Result */}
                {index === 'knowledge_base' && (
                  <div>
                    <h4
                      className="font-semibold text-sm mb-1"
                      dangerouslySetInnerHTML={{
                        __html: result._formatted?.title || result.title
                      }}
                    />
                    {result._formatted?.content && (
                      <p
                        className="text-xs text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: result._formatted.content
                        }}
                      />
                    )}
                    {result.category && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {result.category}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Lead Result */}
                {index === 'leads' && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      {result.first_name} {result.last_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {result.email} {result.company && `• ${result.company}`}
                    </p>
                    {result.stage && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {result.stage}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Customer Result */}
                {index === 'customers' && (
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{result.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {result.email} {result.company && `• ${result.company}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded text-xs">↑↓</kbd> Navigate •{' '}
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> Select •{' '}
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> Close
          </div>
        </Card>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <Card className="absolute top-full mt-2 w-full p-4 z-50 shadow-lg">
          <p className="text-sm text-muted-foreground text-center">
            No results found for "{query}"
          </p>
        </Card>
      )}
    </div>
  )
}
