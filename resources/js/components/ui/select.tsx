import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Search, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

function getNodeText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return ""
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node).trim()
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).filter(Boolean).join(" ").trim()
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    if (props && props.children) {
      return getNodeText(props.children)
    }
  }
  return ""
}

function countSelectItems(nodes: React.ReactNode): number {
  let count = 0
  React.Children.forEach(nodes, (child) => {
    if (!React.isValidElement(child)) {
      return
    }
    const p = child.props as { value?: unknown; children?: React.ReactNode }
    if (p && "value" in p && p.value !== undefined) {
      count++
    } else if (p && p.children) {
      count += countSelectItems(p.children)
    }
  })
  return count
}

function filterSelectItems(
  nodes: React.ReactNode,
  query: string
): { filtered: React.ReactNode[]; matchCount: number } {
  if (!query.trim()) {
    return {
      filtered: React.Children.toArray(nodes),
      matchCount: countSelectItems(nodes),
    }
  }
  const q = query.toLowerCase().trim()
  let matchCount = 0

  const process = (items: React.ReactNode): React.ReactNode[] => {
    return React.Children.toArray(items).flatMap((child) => {
      if (!React.isValidElement(child)) {
        return []
      }
      const p = child.props as {
        value?: unknown
        children?: React.ReactNode
      }
      if (p && "value" in p && p.value !== undefined) {
        const text = (getNodeText(p.children) + " " + String(p.value)).toLowerCase()
        if (text.includes(q)) {
          matchCount++
          return [child]
        }
        return []
      }
      if (p && p.children) {
        const nested = process(p.children)
        if (nested.length > 0) {
          return [
            React.cloneElement(child as React.ReactElement<any>, {
              ...p,
              children: nested,
            }),
          ]
        }
        return []
      }
      return []
    })
  }

  const filtered = process(nodes)
  return { filtered, matchCount }
}

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export type SelectContentProps = React.ComponentProps<
  typeof SelectPrimitive.Content
> & {
  searchable?: boolean
  searchPlaceholder?: string
}

function SelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  sideOffset = 4,
  align = "center",
  searchable = true,
  searchPlaceholder = "Search...",
  ...props
}: SelectContentProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const totalItems = React.useMemo(() => countSelectItems(children), [children])
  const showSearch = searchable && totalItems > 2

  const { filtered: filteredChildren, matchCount } = React.useMemo(
    () => (showSearch ? filterSelectItems(children, searchQuery) : { filtered: React.Children.toArray(children), matchCount: totalItems }),
    [children, searchQuery, showSearch, totalItems]
  )

  React.useEffect(() => {
    if (showSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 40)
      return () => clearTimeout(timer)
    }
  }, [showSearch])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        side={side}
        sideOffset={sideOffset}
        avoidCollisions={false}
        align={align}
        {...props}
      >
        {showSearch ? (
          <div
            className="sticky top-0 z-10 flex items-center gap-2 border-b bg-popover/95 px-2.5 py-1.5 backdrop-blur-xs"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Search className="size-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  const container = searchInputRef.current?.closest(
                    '[data-slot="select-content"]'
                  )
                  const firstItem = container?.querySelector<HTMLElement>(
                    '[data-slot="select-item"]:not([data-disabled])'
                  )
                  firstItem?.focus()
                }
              }}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            ) : null}
          </div>
        ) : null}

        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {showSearch && matchCount === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No options found
            </div>
          ) : (
            filteredChildren
          )}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
